import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    let key: string | null = null;
    let action: string | null = null;
    let service: string | null = null;
    let link: string | null = null;
    let quantity: number | null = null;
    let order: string | null = null;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      key = body.key;
      action = body.action;
      service = body.service;
      link = body.link;
      quantity = body.quantity ? Number(body.quantity) : null;
      order = body.order;
    } else {
      const formData = await request.formData();
      key = formData.get("key") as string;
      action = formData.get("action") as string;
      service = formData.get("service") as string;
      link = formData.get("link") as string;
      quantity = formData.get("quantity") ? Number(formData.get("quantity")) : null;
      order = formData.get("order") as string;
    }

    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    // ── ACTION: balance ──
    if (action === "balance") {
      let userBalance = 0.00;
      try {
        const foundUser = await prisma.user.findFirst({
          where: { apiKey: key },
          select: { balance: true }
        });
        if (foundUser) userBalance = foundUser.balance;
      } catch {}

      return NextResponse.json({
        balance: userBalance.toFixed(2),
        currency: "INR",
      });
    }

    // ── ACTION: services ──
    if (action === "services") {
      return NextResponse.json([
        {
          service: 1024,
          name: "Instagram Real HQ Followers [Instant]",
          type: "Default",
          category: "Instagram Followers",
          rate: "180.00",
          min: "50",
          max: "100000",
          refill: true,
          cancel: false,
        },
        {
          service: 2011,
          name: "YouTube High Retention Monetizable Views",
          type: "Default",
          category: "YouTube Views",
          rate: "240.00",
          min: "500",
          max: "2000000",
          refill: true,
          cancel: false,
        },
        {
          service: 3015,
          name: "TikTok Real Followers [Guaranteed]",
          type: "Default",
          category: "TikTok Followers",
          rate: "190.00",
          min: "100",
          max: "50000",
          refill: true,
          cancel: false,
        }
      ]);
    }

    // ── ACTION: add ──
    if (action === "add") {
      if (!service || !link || !quantity) {
        return NextResponse.json({ error: "Missing required parameters: service, link, quantity" }, { status: 400 });
      }

      const generatedOrderId = Math.floor(1000 + Math.random() * 9000);
      return NextResponse.json({
        order: generatedOrderId,
      });
    }

    // ── ACTION: status ──
    if (action === "status") {
      if (!order) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
      }

      return NextResponse.json({
        charge: "180.00",
        start_count: "4210",
        status: "Completed",
        remains: "0",
        currency: "INR",
      });
    }

    return NextResponse.json({ error: "Incorrect request action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
