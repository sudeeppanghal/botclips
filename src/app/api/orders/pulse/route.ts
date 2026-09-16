import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handlePulseDispatch();
}

export async function POST(req: NextRequest) {
  return handlePulseDispatch();
}

async function handlePulseDispatch() {
  const startTime = Date.now();
  let batchesDispatched = 0;
  let nextDueTimeMs: number | null = null;

  try {
    const nowTime = Date.now();

    // 1. Fetch active orders with multi-batch jitter engine
    const activeJitterOrders = await prisma.order.findMany({
      where: {
        status: { in: ["IN_PROGRESS", "PROCESSING"] },
        comboData: { contains: '"isJitterEngine":true' },
      },
      select: {
        id: true,
        link: true,
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
      take: 20,
    });

    let defaultPanel: { id: string; apiUrl: string; apiKeyEncrypted: string } | null = null;

    for (const jOrder of activeJitterOrders) {
      if (!jOrder.comboData) continue;
      try {
        const data = JSON.parse(jOrder.comboData);
        if (!data.batches || !Array.isArray(data.batches)) continue;

        // Check each batch
        for (let i = 0; i < data.batches.length; i++) {
          const batch = data.batches[i];
          if (batch.status === "PENDING" && batch.scheduledAt) {
            const batchTime = new Date(batch.scheduledAt).getTime();
            if (batchTime <= nowTime) {
              // This batch is due! Dispatch to upstream SMM panel
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
                    batchesDispatched++;

                    // 1. Handle Micro-Likes Accumulator
                    if (batch.likes && batch.likes > 0 && (data.likeServiceId || data.engagementServiceId)) {
                      data.accumulatedLikes = (data.accumulatedLikes || 0) + batch.likes;
                      const likeThreshold = data.likeServiceMin || 10;
                      if (data.accumulatedLikes >= likeThreshold) {
                        try {
                          const engRes = await client.addOrder({
                            serviceId: data.likeServiceId || data.engagementServiceId,
                            link: jOrder.link,
                            quantity: data.accumulatedLikes,
                          });
                          if (engRes && engRes.order) {
                            batch.likeOrderId = String(engRes.order);
                            batch.engagementOrderId = String(engRes.order);
                            data.accumulatedLikes = 0;
                          }
                        } catch (engErr) {
                          console.error('Like pulse error for order #' + jOrder.id + ':', engErr);
                        }
                      }
                    }

                    // 2. Handle Micro-Saves (Bookmarks) Accumulator
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
                          console.error('Save pulse error for order #' + jOrder.id + ':', saveErr);
                        }
                      }
                    }

                    // 3. Handle Micro-Shares (Reposts) Accumulator
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
                          console.error('Share pulse error for order #' + jOrder.id + ':', shareErr);
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
                        comboData: JSON.stringify(data),
                        providerOrderId: String(result.order),
                      },
                    });
                  } else if (result && result.error) {
                    // Reschedule with 60-120 seconds organic delay if provider busy
                    const retrySec = 60 + Math.floor(Math.random() * 60);
                    batch.scheduledAt = new Date(Date.now() + retrySec * 1000).toISOString();
                    batch.lastError = result.error;
                    await prisma.order.update({
                      where: { id: jOrder.id },
                      data: { comboData: JSON.stringify(data) },
                    });
                  }
                } catch (dispatchErr) {
                  console.error('Error sending batch #' + batch.batchNumber + ' for order #' + jOrder.id + ':', dispatchErr);
                }
              }
            } else {
              // Future batch
              if (nextDueTimeMs === null || batchTime < nextDueTimeMs) {
                nextDueTimeMs = batchTime;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error inspecting order #' + jOrder.id + ':', err);
      }
    }

    const nextDueInSeconds = nextDueTimeMs !== null ? Math.max(0, Math.round((nextDueTimeMs - Date.now()) / 1000)) : null;

    return NextResponse.json({
      success: true,
      batchesDispatched,
      nextDueInSeconds,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
