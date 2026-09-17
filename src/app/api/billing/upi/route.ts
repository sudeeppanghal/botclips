import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendUpiDepositAlert } from "@/lib/telegram";

// GET /api/billing/upi - Fetch all UPI payments (Admin only or user's own)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.role === "ADMIN";

    if (isAdmin) {
      const payments = await prisma.upiPayment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        },
        take: 100,
      });

      return NextResponse.json({ success: true, payments });
    } else {
      const payments = await prisma.upiPayment.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ success: true, payments });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load payments" }, { status: 500 });
  }
}

// POST /api/billing/upi - User submits deposit with UTR + 2 Screenshots
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { utr, amount, screenshot1, screenshot2 } = body;

    if (!utr || !amount) {
      return NextResponse.json({ error: "12-digit UTR and deposit amount are required" }, { status: 400 });
    }

    const cleanUtr = String(utr).trim();
    const depositAmount = Number(amount);

    // Enforce strict minimum deposit of 100 INR
    if (depositAmount < 100) {
      return NextResponse.json({ 
        error: "Minimum deposit amount is strictly ₹100 INR." 
      }, { status: 400 });
    }

    const s1 = String(screenshot1 || screenshot2 || "uploaded_via_app");
    const s2 = String(screenshot2 || screenshot1 || "uploaded_via_app");

    if (!screenshot1 && !screenshot2) {
      return NextResponse.json({ 
        error: "Please upload at least one payment verification screenshot (Receipt or Success Confirmation)." 
      }, { status: 400 });
    }

    let userId = session?.id;
    if (!userId) {
      // Find default user or guest
      const u = await prisma.user.findFirst({ select: { id: true } });
      userId = u?.id || "guest_user";
    }

    // Check for duplicate UTR submission
    const existing = await prisma.upiPayment.findUnique({
      where: { utr: cleanUtr },
    });

    if (existing) {
      return NextResponse.json({ 
        error: "This UTR transaction ID has already been submitted." 
      }, { status: 400 });
    }

    // Record payment into database with screenshots
    const payment = await prisma.upiPayment.create({
      data: {
        userId,
        utr: cleanUtr,
        amount: depositAmount,
        screenshot1: s1,
        screenshot2: s2,
        status: "PENDING",
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    // Fire-and-forget Telegram channel alert with 1-click inline approval buttons
    sendUpiDepositAlert({
      id: payment.id,
      amount: depositAmount,
      utr: cleanUtr,
      userName: payment.user?.name || session?.name,
      userEmail: payment.user?.email || session?.email || "customer@botclips.online",
      screenshot1: s1,
      screenshot2: s2
    }).catch((err) => console.error("Telegram alert error:", err));

    return NextResponse.json({ 
      success: true, 
      payment,
      message: "Payment submitted successfully. Admin will verify screenshots and credit balance." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit payment" }, { status: 500 });
  }
}

// PUT /api/billing/upi - Admin approval / rejection endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const isAdmin = session?.role === "ADMIN";
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, action, rejectReason } = body; // action: "APPROVE" or "REJECT"

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.upiPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ error: "This payment has already been approved and credited." }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Credit user's wallet balance
      await prisma.$transaction([
        prisma.upiPayment.update({
          where: { id: paymentId },
          data: { status: "CONFIRMED" },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: payment.amount } },
        }),
      ]);

      return NextResponse.json({ 
        success: true, 
        message: `Payment approved! Credited ₹${payment.amount} to user balance.` 
      });
    } else {
      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: { 
          status: "REJECTED",
          rejectReason: rejectReason || "Invalid UTR or screenshots mismatch"
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Payment rejected." 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Approval action failed" }, { status: 500 });
  }
}
