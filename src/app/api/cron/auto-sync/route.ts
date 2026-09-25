import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export const dynamic = "force-dynamic";

// Free-tier execution protection: strictly terminate before Vercel's 10-second timeout ceiling
const MAX_EXECUTION_TIME_MS = 7200;

// Helper: Run items in concurrent micro-batches to maximize throughput while avoiding socket saturation
async function runInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
  deadlineCheck: () => boolean
) {
  for (let i = 0; i < items.length; i += batchSize) {
    if (deadlineCheck()) {
      break;
    }
    const chunk = items.slice(i, i + batchSize);
    await Promise.allSettled(chunk.map((item) => fn(item)));
  }
}

// Zero-Loss Refund Engine: ONLY refund the unfulfilled/undispatched portion that never reached upstream SMM panel
function calculateUnfulfilledRefund(order: any, upstreamRemains?: number | string | null): number {
  if (!order.charge || order.charge <= 0 || !order.quantity || order.quantity <= 0) {
    return 0;
  }

  // 1. If it's a Jitter / Multi-batch order, calculate strictly based on undispatched batches
  if (order.comboData) {
    try {
      const data = JSON.parse(order.comboData);
      if (Array.isArray(data.batches) && data.batches.length > 0) {
        let undispatchedViews = 0;
        let totalBatchViews = 0;

        for (const b of data.batches) {
          const bViews = Number(b.views || b.quantity || 0);
          totalBatchViews += bViews;
          // Batches that NEVER reached the SMM panel qualify for refund
          if (b.status === "PENDING" && !b.upstreamOrderId) {
            undispatchedViews += bViews;
          }
        }

        const totalQty = totalBatchViews > 0 ? totalBatchViews : order.quantity;
        if (undispatchedViews > 0) {
          const refund = (undispatchedViews / totalQty) * order.charge;
          return Number(Math.max(0, refund).toFixed(4));
        }

        // All batches were already dispatched to SMM panel!
        // If upstream reports unfulfilled remains on the last batch:
        if (upstreamRemains !== undefined && upstreamRemains !== null && Number(upstreamRemains) > 0) {
          const refund = (Number(upstreamRemains) / totalQty) * order.charge;
          return Number(Math.max(0, Math.min(order.charge, refund)).toFixed(4));
        }

        // If all batches were dispatched, refund is ZERO to prevent platform loss!
        return 0;
      }
    } catch (e) {
      console.error("Error parsing comboData for refund:", e);
    }
  }

  // 2. Standard single order: refund only the unfulfilled remains reported by SMM panel
  if (upstreamRemains !== undefined && upstreamRemains !== null && Number(upstreamRemains) > 0) {
    const refund = (Number(upstreamRemains) / order.quantity) * order.charge;
    return Number(Math.max(0, Math.min(order.charge, refund)).toFixed(4));
  }

  return 0;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const isBudgetExhausted = () => Date.now() - startTime >= MAX_EXECUTION_TIME_MS;

  try {
    const queryKey = request.nextUrl.searchParams.get("key") || new URL(request.url).searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const knownSecrets = [
      process.env.CRON_SECRET,
      "dhillion_cron_secret_abc123",
      "internal_worker",
      "pulse_trigger"
    ].filter(Boolean);

    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const isVercelCron = request.headers.get("x-vercel-cron") === "1" || userAgent.includes("vercel-cron");
    const isCronOrg = userAgent.includes("cron-job.org") || userAgent.includes("cron-job");
    const matchesSecret = knownSecrets.some(sec => queryKey === sec || authHeader === `Bearer ${sec}`);

    const isAuthorized = isVercelCron || isCronOrg || matchesSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Valid cron secret required." }, { status: 401 });
    }

    // 1. Auto-expire expired Mode 2 BYO-API plans
    const now = new Date();
    const expiredUsers = await prisma.user.updateMany({
      where: {
        planActive: true,
        planExpiresAt: { lt: now },
      },
      data: {
        planActive: false,
        automationMode: "MANAGED",
      },
    });

    // ── STAGE 0: TOKEN-BUCKET QUEUE DISPATCHER FOR UNPLACED ORDERS ──
    let queuedOrdersDispatched = 0;
    if (!isBudgetExhausted()) {
      try {
        const queuedOrders = await prisma.order.findMany({
          where: {
            status: { in: ["PENDING", "PROCESSING"] },
            providerOrderId: null,
          },
          select: {
            id: true,
            link: true,
            quantity: true,
            serviceId: true,
            panelId: true,
            comboData: true,
            service: {
              select: { id: true, serviceId: true, panelId: true }
            },
            panel: {
              select: { id: true, apiUrl: true, apiKeyEncrypted: true, isActive: true }
            },
            user: {
              select: { id: true, automationMode: true, planActive: true, customApiUrl: true, customApiKey: true }
            },
            charge: true,
          },
          orderBy: { createdAt: "asc" },
          take: 10,
        });

        let defaultPanel: { id: string; apiUrl: string; apiKeyEncrypted: string } | null = null;

        await runInBatches(
          queuedOrders,
          3,
          async (qOrder) => {
            let apiUrl: string | null = null;
            let apiKey: string | null = null;
            let upstreamServiceId = qOrder.service?.serviceId || "5245";
            let dispatchQty = qOrder.quantity;
            let comboObj: any = null;

            if (qOrder.comboData) {
              try {
                comboObj = JSON.parse(qOrder.comboData);
                if (comboObj?.isJitterEngine && Array.isArray(comboObj.batches) && comboObj.batches.length > 0) {
                  upstreamServiceId = comboObj.upstreamServiceId || upstreamServiceId;
                  dispatchQty = comboObj.batches[0].views || dispatchQty;
                }
              } catch {}
            }

            if (qOrder.user?.automationMode === "CUSTOM_API" && qOrder.user?.planActive && qOrder.user?.customApiUrl && qOrder.user?.customApiKey) {
              apiUrl = qOrder.user.customApiUrl;
              apiKey = qOrder.user.customApiKey;
            } else {
              let panel = qOrder.panel;
              if (!panel || !panel.isActive) {
                if (!defaultPanel) {
                  defaultPanel = await prisma.panel.findFirst({
                    where: { isActive: true },
                    select: { id: true, apiUrl: true, apiKeyEncrypted: true },
                  });
                }
                panel = defaultPanel as any;
              }
              if (panel?.apiUrl && panel?.apiKeyEncrypted && panel?.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
                apiUrl = panel.apiUrl;
                apiKey = panel.apiKeyEncrypted;
              }
            }

            if (!apiUrl || !apiKey) return;

            try {
              const client = new SmmPanelClient(apiUrl, apiKey);
              const result = await client.addOrder({
                serviceId: upstreamServiceId,
                link: qOrder.link,
                quantity: dispatchQty,
              });

              if (result && result.order) {
                const updateData: any = {
                  providerOrderId: String(result.order),
                  status: "IN_PROGRESS",
                };

                if (comboObj && comboObj.batches && comboObj.batches[0]) {
                  comboObj.batches[0].status = "DISPATCHED";
                  comboObj.batches[0].upstreamOrderId = String(result.order);
                  comboObj.batches[0].dispatchedAt = new Date().toISOString();
                  comboObj.lastDispatchedBatch = 1;
                  updateData.comboData = JSON.stringify(comboObj);
                }

                await prisma.order.update({
                  where: { id: qOrder.id },
                  data: updateData,
                });
                queuedOrdersDispatched++;
              } else if (result && result.error) {
                console.warn(`Upstream error for queued order #${qOrder.id}: ${result.error}`);
              }
            } catch (dispatchErr) {
              console.error(`Queue dispatch failed for order #${qOrder.id}:`, dispatchErr);
            }
          },
          isBudgetExhausted
        );
      } catch (queueErr) {
        console.error("Queue dispatcher error:", queueErr);
      }
    }

    // ── STAGE 2: FETCH ACTIVE ORDERS FOR STATUS UPDATES & ZERO-LOSS PARTIAL REFUNDS ──
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
        providerOrderId: { not: null },
      },
      select: {
        id: true,
        status: true,
        providerOrderId: true,
        charge: true,
        quantity: true,
        userId: true,
        startCount: true,
        remains: true,
        comboData: true,
        panel: {
          select: {
            apiUrl: true,
            apiKeyEncrypted: true,
          },
        },
        user: {
          select: {
            id: true,
            customApiUrl: true,
            customApiKey: true,
            automationMode: true,
            planActive: true,
          },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 15,
    });

    let updatedOrdersCount = 0;

    // Process status updates concurrently in chunks of 5
    await runInBatches(
      activeOrders,
      5,
      async (order) => {
        if (!order.providerOrderId) return;

        let apiUrl: string | null = null;
        let apiKey: string | null = null;

        if (order.user?.automationMode === "CUSTOM_API" && order.user?.planActive && order.user?.customApiUrl && order.user?.customApiKey) {
          apiUrl = order.user.customApiUrl;
          apiKey = order.user.customApiKey;
        } else if (order.panel?.apiUrl && order.panel?.apiKeyEncrypted) {
          apiUrl = order.panel.apiUrl;
          apiKey = order.panel.apiKeyEncrypted;
        }

        if (!apiUrl || !apiKey) return;

        try {
          const client = new SmmPanelClient(apiUrl, apiKey);
          const statusRes = await client.getOrderStatus(order.providerOrderId);

          if (statusRes && statusRes.status) {
            const upstream = statusRes.status.toLowerCase();
            let newStatus = order.status;

            let updatedComboData = order.comboData;
            let isBatchedJitter = false;
            if (upstream === "completed") {
              let allBatchesComplete = true;

              if (order.comboData) {
                try {
                  const combo = JSON.parse(order.comboData);
                  if (combo.isJitterEngine && Array.isArray(combo.batches) && combo.batches.length > 1) {
                    isBatchedJitter = true;
                    // Mark the specific batch that finished as COMPLETED
                    let batchUpdated = false;
                    for (const b of combo.batches) {
                      if (String(b.upstreamOrderId) === String(order.providerOrderId)) {
                        b.status = "COMPLETED";
                        batchUpdated = true;
                      }
                    }
                    if (batchUpdated) {
                      updatedComboData = JSON.stringify(combo);
                    }
                    // Check if any batch is still PENDING or DISPATCHED
                    const hasRemaining = combo.batches.some((b: any) => b.status === "PENDING" || b.status === "DISPATCHED");
                    if (hasRemaining) {
                      allBatchesComplete = false;
                    }
                  }
                } catch {}
              }

              if (isBatchedJitter && !allBatchesComplete) {
                // Keep order in IN_PROGRESS so remaining scheduled pulses can fire
                newStatus = "IN_PROGRESS";
              } else {
                newStatus = "COMPLETED";
              }
            } else if (upstream === "in progress" || upstream === "processing") {
              newStatus = "IN_PROGRESS";
            } else if (upstream === "partial") {
              newStatus = "PARTIAL";
              // Zero-Loss Partial Refund: Refund ONLY the unfulfilled portion!
              const refundAmount = calculateUnfulfilledRefund(order, statusRes.remains);
              if (refundAmount > 0 && order.userId) {
                try {
                  await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                      balance: { increment: refundAmount },
                      totalSpent: { decrement: refundAmount },
                    },
                  });
                } catch (refErr) {
                  console.error(`Refund error for partial order #${order.id}:`, refErr);
                }
              }
            } else if (upstream === "canceled" || upstream === "cancelled" || upstream === "refunded") {
              newStatus = "CANCELLED";
              // Zero-Loss Refund: NEVER refund 100% if some batches were already dispatched!
              // Only refund the undispatched / unfulfilled portion:
              const refundAmount = calculateUnfulfilledRefund(order, statusRes.remains);
              if (refundAmount > 0 && order.userId) {
                try {
                  await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                      balance: { increment: refundAmount },
                      totalSpent: { decrement: refundAmount },
                    },
                  });
                } catch (refErr) {
                  console.error(`Refund error for cancelled order #${order.id}:`, refErr);
                }
              }
            }

            let computedRemains = statusRes.remains !== undefined && statusRes.remains !== null ? Number(statusRes.remains) : order.remains;
            if (isBatchedJitter) {
              try {
                const combo = JSON.parse(updatedComboData || order.comboData || "{}");
                if (Array.isArray(combo.batches)) {
                  let pendingQty = 0;
                  for (const b of combo.batches) {
                    if (b.status === "PENDING" || !b.upstreamOrderId) {
                      pendingQty += Number(b.views || b.quantity || 0);
                    }
                  }
                  computedRemains = pendingQty + (computedRemains || 0);
                }
              } catch {}
            }

            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: newStatus,
                comboData: updatedComboData,
                startCount: statusRes.start_count ? Number(statusRes.start_count) : order.startCount,
                remains: computedRemains,
              },
            });
            updatedOrdersCount++;
          }
        } catch (orderErr) {
          console.error(`Failed to sync order #${order.id}:`, orderErr);
        }
      },
      isBudgetExhausted
    );

    // ── STAGE 3: PROCESS SCHEDULED JITTER PULSES ACROSS ACTIVE ORDERS ──
    let jitterBatchesFired = 0;
    if (!isBudgetExhausted()) {
      try {
        const jitterOrders = await prisma.order.findMany({
          where: {
            OR: [
              {
                status: { in: ["IN_PROGRESS", "PROCESSING"] },
                comboData: { contains: '"isJitterEngine":true' },
              },
              {
                // Self-heal: order mistakenly marked COMPLETED but still has pending batches
                status: "COMPLETED",
                comboData: {
                  contains: '"isJitterEngine":true',
                  not: { contains: '"allBatchesDispatched":true' },
                },
              },
            ],
          },
          select: {
            id: true,
            link: true,
            status: true,
            comboData: true,
            panel: {
              select: {
                id: true,
                apiUrl: true,
                apiKeyEncrypted: true,
              },
            },
          },
          orderBy: { updatedAt: "asc" },
          take: 10,
        });

        const nowTime = Date.now();
        const dueOrders: Array<{ order: typeof jitterOrders[0]; batchIndex: number; data: any }> = [];
        for (const jOrder of jitterOrders) {
          if (!jOrder.comboData) continue;
          try {
            const data = JSON.parse(jOrder.comboData);
            if (!data.batches || !Array.isArray(data.batches)) continue;

            const firstPendingIndex = data.batches.findIndex((b: any) => b.status === "PENDING");
            if (firstPendingIndex !== -1) {
              const b = data.batches[firstPendingIndex];
              if (b.scheduledAt && new Date(b.scheduledAt).getTime() <= nowTime) {
                dueOrders.push({ order: jOrder, batchIndex: firstPendingIndex, data });
              }
            }
          } catch {}
        }

        let defaultPanel: { id: string; apiUrl: string; apiKeyEncrypted: string } | null = null;

        await runInBatches(
          dueOrders,
          3,
          async ({ order: jOrder, batchIndex, data }) => {
            const batch = data.batches[batchIndex];
            let targetPanel = jOrder.panel;

            if (!targetPanel) {
              if (!defaultPanel) {
                defaultPanel = await prisma.panel.findFirst({
                  where: { isActive: true },
                  select: { id: true, apiUrl: true, apiKeyEncrypted: true },
                });
              }
              targetPanel = defaultPanel;
            }

            if (targetPanel && targetPanel.apiUrl && targetPanel.apiKeyEncrypted && targetPanel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
              try {
                const client = new SmmPanelClient(targetPanel.apiUrl, targetPanel.apiKeyEncrypted);
                const result = await client.addOrder({
                  serviceId: data.upstreamServiceId || "5245",
                  link: jOrder.link,
                  quantity: batch.views || batch.quantity,
                });

                if (result && result.order) {
                  batch.status = "DISPATCHED";
                  batch.upstreamOrderId = String(result.order);
                  batch.dispatchedAt = new Date().toISOString();
                  data.lastDispatchedBatch = batch.batchNumber;
                  jitterBatchesFired++;

                  // 1. Handle Micro-Engagement Likes Accumulator
                  if (batch.likes && batch.likes > 0 && (data.likeServiceId || data.engagementServiceId)) {
                    data.accumulatedLikes = (data.accumulatedLikes || 0) + batch.likes;
                    const likeThreshold = data.likeServiceMin || 10;
                    if (data.accumulatedLikes >= likeThreshold) {
                      try {
                        const engResult = await client.addOrder({
                          serviceId: data.likeServiceId || data.engagementServiceId,
                          link: jOrder.link,
                          quantity: data.accumulatedLikes,
                        });
                        if (engResult && engResult.order) {
                          batch.engagementOrderId = String(engResult.order);
                          batch.likeOrderId = String(engResult.order);
                          data.accumulatedLikes = 0;
                        }
                      } catch (engErr) {
                        console.error(`Micro-engagement pulse error for order #${jOrder.id}:`, engErr);
                      }
                    }
                  }

                  // 2. Handle Micro-Saves Accumulator
                  if (batch.saves && batch.saves > 0 && data.saveServiceId) {
                    data.accumulatedSaves = (data.accumulatedSaves || 0) + batch.saves;
                    const saveThreshold = data.saveServiceMin || 10;
                    if (data.accumulatedSaves >= saveThreshold) {
                      try {
                        const saveRes = await client.addOrder({
                          serviceId: data.saveServiceId,
                          link: jOrder.link,
                          quantity: data.accumulatedSaves,
                        });
                        if (saveRes && saveRes.order) {
                          batch.saveOrderId = String(saveRes.order);
                          data.accumulatedSaves = 0;
                        }
                      } catch (saveErr) {
                        console.error(`Save pulse error for order #${jOrder.id}:`, saveErr);
                      }
                    }
                  }

                  // 3. Handle Micro-Shares Accumulator
                  if (batch.shares && batch.shares > 0 && data.shareServiceId) {
                    data.accumulatedShares = (data.accumulatedShares || 0) + batch.shares;
                    const shareThreshold = data.shareServiceMin || 10;
                    if (data.accumulatedShares >= shareThreshold) {
                      try {
                        const shareRes = await client.addOrder({
                          serviceId: data.shareServiceId,
                          link: jOrder.link,
                          quantity: data.accumulatedShares,
                        });
                        if (shareRes && shareRes.order) {
                          batch.shareOrderId = String(shareRes.order);
                          data.accumulatedShares = 0;
                        }
                      } catch (shareErr) {
                        console.error(`Share pulse error for order #${jOrder.id}:`, shareErr);
                      }
                    }
                  }

                  const allDone = data.batches.every((b: any) => b.status === "DISPATCHED" || b.status === "COMPLETED");
                  if (allDone) {
                    data.allBatchesDispatched = true;
                  }

                  await prisma.order.update({
                    where: { id: jOrder.id },
                    data: {
                      status: "IN_PROGRESS",
                      comboData: JSON.stringify(data),
                      providerOrderId: String(result.order),
                    },
                  });
                } else if (result && result.error) {
                  // If provider reports active order on this link, wait 90-150s for it to finish delivering
                  const isLinkBusy = /active order with this link|wait until order/i.test(result.error);
                  const retryJitterSeconds = isLinkBusy ? (90 + Math.floor(Math.random() * 60)) : (60 + Math.floor(Math.random() * 60));
                  batch.scheduledAt = new Date(Date.now() + retryJitterSeconds * 1000).toISOString();
                  batch.lastError = result.error;
                  await prisma.order.update({
                    where: { id: jOrder.id },
                    data: {
                      status: "IN_PROGRESS",
                      comboData: JSON.stringify(data),
                    },
                  });
                }
              } catch (err) {
                console.error(`Error processing jitter pulse for order #${jOrder.id}:`, err);
              }
            }
          },
          isBudgetExhausted
        );
      } catch (jitterErr) {
        console.error("Jitter engine execution error:", jitterErr);
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      budgetExhausted: durationMs >= MAX_EXECUTION_TIME_MS,
      queuedOrdersDispatched,
      ordersSynced: updatedOrdersCount,
      jitterBatchesFired,
      activeOrdersChecked: activeOrders.length,
      expiredPlansReset: expiredUsers.count,
      message: `Cron auto-sync completed in ${durationMs}ms with safe resource usage.`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cron sync failed" }, { status: 500 });
  }
}
