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
    const session = await getSessionUser(request);
    const body = await request.json();
    const { utr, amount, screenshot1, screenshot2 } = body;

    // Find verified user in database by ID or Email
    let dbUser = null;
    if (session?.id || session?.email) {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        }
      });

      // Auto-heal: If user has valid session email but was missing from DB, ensure record exists
      if (!dbUser && session?.email) {
        try {
          dbUser = await prisma.user.upsert({
            where: { email: session.email },
            update: {},
            create: {
              email: session.email,
              name: session.name || session.email.split("@")[0],
              role: session.role || "USER",
              balance: 0.0,
              status: "ACTIVE"
            }
          });
        } catch {}
      }
    }

    if (!dbUser) {
      return NextResponse.json({ 
        error: "User session expired or not authenticated. Please log in again to add funds." 
      }, { status: 401 });
    }

    const userId = dbUser.id;

    if (!utr || !amount) {
      return NextResponse.json({ error: "12-digit UTR and deposit amount are required" }, { status: 400 });
    }

    const cleanUtr = String(utr).trim();
    const depositAmount = Number(amount);

    let minDepositLimit = 100;
    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      if (settings?.minDeposit) minDepositLimit = Math.max(100, Number(settings.minDeposit));
    } catch {}

    // Enforce dynamic minimum deposit (strictly >= 100)
    if (depositAmount < minDepositLimit) {
      return NextResponse.json({ 
        error: `Minimum deposit amount is strictly ₹${minDepositLimit} INR. Payments below ₹${minDepositLimit} cannot be processed.` 
      }, { status: 400 });
    }

    const s1 = String(screenshot1 || screenshot2 || `Submitted via UPI QR Modal • UTR: ${cleanUtr}`);
    const s2 = String(screenshot2 || screenshot1 || s1);

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

    // Trigger Telegram channel alert with 1-click inline approval buttons asynchronously
    sendUpiDepositAlert({
      id: payment.id,
      amount: depositAmount,
      utr: cleanUtr,
      userName: payment.user?.name || dbUser.name || session?.name,
      userEmail: payment.user?.email || dbUser.email || session?.email || "customer@botclips.online",
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
