import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const checkLiveBalance = searchParams.get("checkBalance") === "true";

    let panels = await prisma.panel.findMany({
      orderBy: { priority: "asc" },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    // If checkBalance requested or balance is 0, attempt live balance check
    if (checkLiveBalance) {
      const updatedPanels = await Promise.all(
        panels.map(async (panel) => {
          if (panel.apiUrl && panel.apiKeyEncrypted && panel.apiKeyEncrypted !== "PLACEHOLDER_KEY") {
            try {
              const client = new SmmPanelClient(panel.apiUrl, panel.apiKeyEncrypted);
              const balRes = await client.getBalance();
              if (balRes && balRes.balance !== undefined && !balRes.error) {
                const numericBal = parseFloat(String(balRes.balance)) || 0;
                const updated = await prisma.panel.update({
                  where: { id: panel.id },
                  data: {
                    balance: numericBal,
                    currency: balRes.currency || panel.currency || "INR",
                    lastCheckedAt: new Date(),
                    status: "ONLINE",
                  },
                });
                return { ...panel, balance: updated.balance, currency: updated.currency, status: updated.status };
              }
            } catch (err: any) {
              console.error(`Error checking balance for panel ${panel.id}:`, err.message);
            }
          }
          return panel;
        })
      );
      panels = updatedPanels as any;
    }

    return NextResponse.json({ success: true, panels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch panels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, panelId, name, apiUrl, apiKey, priority, isActive, currency } = body;

    // 1. Live Balance Check for a specific panel or ad-hoc credentials
    if (action === "check-balance") {
      let targetUrl = apiUrl;
      let targetKey = apiKey;

      if (panelId) {
        const existing = await prisma.panel.findUnique({ where: { id: panelId } });
        if (existing) {
          targetUrl = existing.apiUrl;
          targetKey = apiKey || existing.apiKeyEncrypted;
        }
      }

      if (!targetUrl || !targetKey || targetKey === "PLACEHOLDER_KEY") {
        return NextResponse.json({ error: "Please enter a valid API URL and API Key" }, { status: 400 });
      }

      try {
        const client = new SmmPanelClient(targetUrl, targetKey);
        const balRes = await client.getBalance();
        
        if (balRes.error) {
          return NextResponse.json({ error: `Provider error: ${balRes.error}` }, { status: 400 });
        }

        const numericBal = parseFloat(String(balRes.balance || 0));
        const detectedCurrency = balRes.currency || currency || "INR";

        if (panelId) {
          await prisma.panel.update({
            where: { id: panelId },
            data: {
              balance: numericBal,
              currency: detectedCurrency,
              lastCheckedAt: new Date(),
              status: "ONLINE",
            },
          });
        }

        return NextResponse.json({
          success: true,
          balance: numericBal,
          currency: detectedCurrency,
          formatted: `${detectedCurrency === "INR" ? "₹" : "$"}${numericBal.toFixed(2)}`,
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to connect to SMM panel" }, { status: 500 });
      }
    }

    // 2. Create or Update Panel Credentials
    if (!name || !apiUrl || !apiKey) {
      return NextResponse.json({ error: "Name, API URL, and API Key are required" }, { status: 400 });
    }

    // Test connection first
    let initialBalance = 0;
    let initialCurrency = currency || "INR";
    let panelStatus: "ONLINE" | "ERROR" = "ONLINE";

    try {
      if (apiKey !== "PLACEHOLDER_KEY") {
        const client = new SmmPanelClient(apiUrl, apiKey);
        const bal = await client.getBalance();
        if (bal && bal.balance !== undefined && !bal.error) {
          initialBalance = parseFloat(String(bal.balance)) || 0;
          if (bal.currency) initialCurrency = bal.currency;
        }
      }
    } catch {
      panelStatus = "ERROR";
    }

    const panel = await prisma.panel.upsert({
      where: { id: panelId || `panel_${Date.now()}` },
      create: {
        id: panelId || `panel_${Date.now()}`,
        name,
        apiUrl,
        apiKeyEncrypted: apiKey,
        priority: Number(priority || 1),
        isActive: isActive !== false,
        balance: initialBalance,
        currency: initialCurrency,
        status: panelStatus,
        lastCheckedAt: new Date(),
      },
      update: {
        name,
        apiUrl,
        apiKeyEncrypted: apiKey,
        priority: priority !== undefined ? Number(priority) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        balance: initialBalance || undefined,
        currency: initialCurrency,
        status: panelStatus,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, panel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save panel" }, { status: 500 });
  }
}
