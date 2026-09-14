import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SmmPanelClient } from "@/lib/delivery/panel-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        planActive: true,
        planType: true,
        planExpiresAt: true,
        automationMode: true,
        customApiUrl: true,
        customApiKey: true,
        defaultServices: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if subscription has expired
    let isPlanActive = user.planActive;
    if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
      isPlanActive = false;
    }

    let connectedPanelBalance: number | null = null;
    let connectedPanelCurrency = "INR";
    let panelStatus = "DISCONNECTED";

    if (user.customApiUrl && user.customApiKey) {
      try {
        const client = new SmmPanelClient(user.customApiUrl, user.customApiKey);
        const balRes = await client.getBalance();
        if (balRes && balRes.balance !== undefined && !balRes.error) {
          connectedPanelBalance = parseFloat(String(balRes.balance));
          if (balRes.currency) connectedPanelCurrency = balRes.currency;
          panelStatus = "CONNECTED";
        } else {
          panelStatus = "ERROR";
        }
      } catch {
        panelStatus = "ERROR";
      }
    }

    let parsedDefaults: Record<string, string> = {};
    if (user.defaultServices) {
      try {
        parsedDefaults = JSON.parse(user.defaultServices);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      planActive: isPlanActive,
      planType: user.planType,
      planExpiresAt: user.planExpiresAt,
      automationMode: user.automationMode,
      customApiUrl: user.customApiUrl,
      hasApiKey: Boolean(user.customApiKey),
      connectedPanelBalance,
      connectedPanelCurrency,
      panelStatus,
      defaultServices: parsedDefaults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch BYO-API status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check active plan
    const isPlanActive = user.planActive && (!user.planExpiresAt || new Date(user.planExpiresAt) > new Date());
    if (!isPlanActive && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Active automation subscription (Weekly $10 or Monthly $25) required to use custom SMM panel APIs." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, apiUrl, apiKey, defaultServices } = body;

    const targetUrl = (apiUrl || user.customApiUrl || "").trim();
    const targetKey = (apiKey || user.customApiKey || "").trim();

    // 1. Fetch live balance from custom panel
    if (action === "balance") {
      if (!targetUrl || !targetKey) {
        return NextResponse.json({ error: "Custom API URL and API Key are required" }, { status: 400 });
      }

      try {
        const client = new SmmPanelClient(targetUrl, targetKey);
        const balRes = await client.getBalance();
        if (balRes.error) {
          return NextResponse.json({ error: `Panel Error: ${balRes.error}` }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          balance: parseFloat(String(balRes.balance || 0)),
          currency: balRes.currency || "USD",
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to reach SMM panel" }, { status: 500 });
      }
    }

    // 2. Fetch and auto-batch all services from custom panel
    if (action === "services") {
      if (!targetUrl || !targetKey) {
        return NextResponse.json({ error: "Custom API URL and API Key are required" }, { status: 400 });
      }

      try {
        const client = new SmmPanelClient(targetUrl, targetKey);
        const services = await client.getServices();
        return NextResponse.json({
          success: true,
          count: services.length,
          services,
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to fetch services from SMM panel" }, { status: 500 });
      }
    }

    // 3. Save Settings & Default Service IDs
    if (action === "save") {
      if (!targetUrl || !targetKey) {
        return NextResponse.json({ error: "Please provide both API URL and API Key" }, { status: 400 });
      }

      // Verify credentials by testing getBalance
      let verifiedBalance: number | null = null;
      let detectedCurrency = "INR";
      try {
        const client = new SmmPanelClient(targetUrl, targetKey);
        const balRes = await client.getBalance();
        if (!balRes.error && balRes.balance !== undefined) {
          verifiedBalance = parseFloat(String(balRes.balance));
          if (balRes.currency) detectedCurrency = balRes.currency;
        }
      } catch (connErr: any) {
        return NextResponse.json({ error: `Connection failed: ${connErr.message}. Please check your API URL and Key.` }, { status: 400 });
      }

      const defaultServicesString = defaultServices ? JSON.stringify(defaultServices) : user.defaultServices;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          customApiUrl: targetUrl,
          customApiKey: targetKey,
          automationMode: "CUSTOM_API",
          defaultServices: defaultServicesString,
        },
      });

      return NextResponse.json({
        success: true,
        message: "SMM Panel connected successfully!",
        balance: verifiedBalance,
        currency: detectedCurrency,
      });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process BYO-API request" }, { status: 500 });
  }
}
