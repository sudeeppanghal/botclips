import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendUpiDepositAlert } from "@/lib/telegram";
import { normalizeUtr } from "@/lib/payments/verification";

// GET /api/billing/upi - Fetch all UPI payments (Admin only or user's own)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
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
          },
          matchedPayment: true,
        },
        take: 100,
      });

      return NextResponse.json({ success: true, payments });
    } else {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        }
      });

      const payments = await prisma.upiPayment.findMany({
        where: { userId: dbUser?.id || session.id },
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

    const cleanUtr = normalizeUtr(utr);
    const depositAmount = Number(amount);

    let minDepositLimit = 50;
    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      if (settings?.minDeposit !== null && settings?.minDeposit !== undefined && !isNaN(Number(settings.minDeposit))) {
        minDepositLimit = Math.max(1, Number(settings.minDeposit));
      }
    } catch {}

    // Enforce dynamic minimum deposit configured by admin
    if (depositAmount < minDepositLimit) {
      return NextResponse.json({ 
        error: `Minimum deposit amount is strictly ₹${minDepositLimit} INR. Please enter ₹${minDepositLimit} or more.` 
      }, { status: 400 });
    }

    const isImg1 = Boolean(screenshot1 && typeof screenshot1 === "string" && (screenshot1.startsWith("http") || screenshot1.startsWith("data:image")));
    const isImg2 = Boolean(screenshot2 && typeof screenshot2 === "string" && (screenshot2.startsWith("http") || screenshot2.startsWith("data:image")));
    const s1 = isImg1 ? screenshot1 : (isImg2 ? screenshot2 : null);
    const s2 = isImg2 ? screenshot2 : s1;

    // Check for duplicate UTR submission
    const existing = await prisma.upiPayment.findUnique({
      where: { utr: cleanUtr },
    });

    if (existing) {
      return NextResponse.json({ 
        error: "This UTR transaction ID has already been submitted." 
      }, { status: 400 });
    }

    // Record payment into database with screenshots in VERIFYING state
    const payment = await prisma.upiPayment.create({
      data: {
        userId,
        utr: cleanUtr,
        amount: depositAmount,
        screenshot1: s1,
        screenshot2: s2,
        status: "VERIFYING",
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    // Attempt instant reconciliation against already ingested FamPay notifications
    let reconcileMessage = "Payment submitted. Verifying transaction with FamPay...";
    let finalStatus: any = "VERIFYING";

    try {
      const { reconcileDepositRequest } = await import("@/lib/payments/verification");
      const recResult = await reconcileDepositRequest(payment.id);
      if (recResult.status === "MATCHED_AND_CREDITED") {
        reconcileMessage = `Payment verified instantly! ₹${depositAmount} has been credited to your wallet balance.`;
        finalStatus = "CONFIRMED";
      } else if (recResult.status === "MATCHED_PENDING_APPROVAL") {
        reconcileMessage = `Payment verified with FamPay (₹${depositAmount}). Awaiting final confirmation.`;
        finalStatus = "VERIFYING";
      } else if (recResult.status === "FLAGGED_MISMATCH") {
        reconcileMessage = `Payment flagged for manual review: ${recResult.reason}`;
        finalStatus = "MANUAL_REVIEW";
      }
    } catch (recErr) {
      console.error("Instant reconciliation error:", recErr);
    }

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
      payment: { ...payment, status: finalStatus },
      message: reconcileMessage
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit payment" }, { status: 500 });
  }
}

// PUT /api/billing/upi - Admin approval / rejection endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
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
      include: { user: true }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ error: "This payment has already been approved and credited." }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Concurrency-safe atomic transaction with wallet ledger
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: payment.userId } });
        const balanceBefore = Number(user?.balance || 0);
        const balanceAfter = Number((balanceBefore + payment.amount).toFixed(2));

        // Credit user balance
        await tx.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: payment.amount } },
        });

        // Insert wallet ledger record
        await tx.walletLedger.create({
          data: {
            userId: payment.userId,
            amount: payment.amount,
            balanceBefore,
            balanceAfter,
            type: "DEPOSIT_UPI",
            referenceId: payment.id,
            description: `Manual admin approval of UPI payment (UTR: ${payment.utr})`,
          },
        });

        // Link matching received payment if exists
        const matchingReceived = await tx.receivedPayment.findUnique({
          where: { utr: payment.utr }
        });

        if (matchingReceived && matchingReceived.status !== "matched") {
          await tx.receivedPayment.update({
            where: { id: matchingReceived.id },
            data: { status: "matched" }
          });
        }

        // Update UPI payment
        await tx.upiPayment.update({
          where: { id: paymentId },
          data: { 
            status: "CONFIRMED",
            matchedPaymentId: matchingReceived?.id || undefined,
            verifiedAt: new Date(),
            verificationReason: "Manual admin approval",
          },
        });

        // Log audit event
        await tx.paymentProcessingEvent.create({
          data: {
            eventType: "ADMIN_ACTION",
            utr: payment.utr,
            amount: payment.amount,
            upiPaymentId: payment.id,
            receivedPaymentId: matchingReceived?.id || null,
            result: "SUCCESS",
            details: `Approved by admin ${session.email}. Balance credited ₹${payment.amount} (₹${balanceBefore} -> ₹${balanceAfter})`,
          }
        });
      });

      // Record referral commission if user was referred (10% of nominal 30% profit)
      try {
        const { recordReferralReward } = await import("@/lib/referral");
        await recordReferralReward({
          userId: payment.userId,
          depositAmount: payment.amount,
          paymentType: "UPI",
          paymentId: payment.id,
        });
      } catch (refErr) {
        console.error("Referral reward error:", refErr);
      }

      return NextResponse.json({ 
        success: true, 
        message: `Payment approved! Credited ₹${payment.amount} to user balance.` 
      });
    } else {
      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: { 
          status: "REJECTED",
          rejectReason: rejectReason || "Invalid UTR or screenshots mismatch",
          verificationReason: `Rejected by admin: ${rejectReason || "Invalid details"}`,
        },
      });

      await prisma.paymentProcessingEvent.create({
        data: {
          eventType: "ADMIN_ACTION",
          utr: payment.utr,
          amount: payment.amount,
          upiPaymentId: payment.id,
          result: "FAILED",
          details: `Rejected by admin ${session.email}: ${rejectReason || "Invalid details"}`,
        }
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
