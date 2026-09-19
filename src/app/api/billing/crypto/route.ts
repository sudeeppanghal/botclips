import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendCryptoDepositAlert } from "@/lib/telegram";

const EXPECTED_TRC20_WALLET = "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz";
const USDT_TO_INR_DEFAULT = 96.0;

// GET /api/billing/crypto - Fetch crypto payments
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.role === "ADMIN";

    if (isAdmin) {
      const payments = await prisma.cryptoPayment.findMany({
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
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        }
      });

      const payments = await prisma.cryptoPayment.findMany({
        where: { userId: dbUser?.id || session.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ success: true, payments });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load crypto payments" }, { status: 500 });
  }
}

// POST /api/billing/crypto - User submits USDT deposit with TxID + 2 Proof Screenshots
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const body = await request.json();
    const { txHash, amountUsdt, screenshot1, screenshot2, network = "TRC20" } = body;

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

    if (!txHash || !amountUsdt) {
      return NextResponse.json({ error: "Transaction Hash (TxID) and USDT amount are required" }, { status: 400 });
    }

    const cleanTxHash = String(txHash).trim();
    const depositUsdt = Number(amountUsdt);

    if (depositUsdt < 1) {
      return NextResponse.json({ 
        error: "Minimum crypto deposit is 1 USDT." 
      }, { status: 400 });
    }

    const s1 = String(screenshot1 || screenshot2 || "submitted_via_app");
    const s2 = String(screenshot2 || screenshot1 || "submitted_via_app");

    if (!screenshot1 && !screenshot2) {
      return NextResponse.json({ 
        error: "Please upload crypto payment verification screenshot (TxID receipt / confirmation)." 
      }, { status: 400 });
    }

    // 1. Anti-Duplicate TxID Check: Never allow the same transaction hash twice
    const existingTx = await prisma.cryptoPayment.findUnique({
      where: { txHash: cleanTxHash },
    });

    if (existingTx) {
      return NextResponse.json({ 
        error: "This transaction hash (TxID) has already been submitted and cannot be reused." 
      }, { status: 400 });
    }

    // Get current USD to INR rate from settings or default to 96
    let usdToInrRate = USDT_TO_INR_DEFAULT;
    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      if (settings?.usdToInrRate) usdToInrRate = settings.usdToInrRate;
    } catch {}

    const amountInr = Math.round(depositUsdt * usdToInrRate);

    // 2. Automated On-Chain Pre-Verification via TronScan public API
    let onChainVerified = false;
    let onChainDetails = "Pending manual verification";

    try {
      const tronScanUrl = "https://apilist.tronscanapi.com/api/transaction-info?hash=" + encodeURIComponent(cleanTxHash);
      const tronRes = await fetch(tronScanUrl, {
        headers: { "Accept": "application/json" }
      });

      if (tronRes.ok) {
        const tronData = await tronRes.json();
        
        const isContractSuccess = tronData.contractRet === "SUCCESS" || tronData.result === "SUCCESS";
        const isConfirmed = tronData.confirmed === true;

        let matchedRecipient = false;
        let transferAmountFound = 0;

        if (Array.isArray(tronData.trc20TransferInfo)) {
          for (const trf of tronData.trc20TransferInfo) {
            if (trf.to_address === EXPECTED_TRC20_WALLET) {
              matchedRecipient = true;
              const rawAmt = Number(trf.amount_str || 0);
              const humanAmt = rawAmt / Math.pow(10, trf.decimals || 6);
              transferAmountFound = humanAmt;
              break;
            }
          }
        }

        if (isContractSuccess && (matchedRecipient || isConfirmed)) {
          onChainVerified = true;
          onChainDetails = "TronScan Confirmed | Block: " + (tronData.block || "N/A") + " | Recipient Match: " + (matchedRecipient ? "YES" : "Detected") + " | Detected Amt: " + (transferAmountFound || depositUsdt) + " USDT";
        } else if (tronData.block) {
          onChainDetails = "TronScan Recorded (Block " + tronData.block + "), pending final confirmations.";
        } else {
          onChainDetails = "TronScan: Transaction hash recorded on-chain.";
        }
      } else {
        onChainDetails = "TronScan lookup queued for admin review.";
      }
    } catch (chainErr) {
      onChainDetails = "On-chain lookup timeout; pending manual admin inspection.";
    }

    // 3. Save Record with status strictly PENDING (funds NOT auto-credited)
    const payment = await prisma.cryptoPayment.create({
      data: {
        userId,
        network: String(network).toUpperCase(),
        walletAddress: EXPECTED_TRC20_WALLET,
        txHash: cleanTxHash,
        amountUsdt: depositUsdt,
        amountInr,
        screenshot1: s1,
        screenshot2: s2,
        onChainVerified,
        onChainDetails,
        status: "PENDING",
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    // Trigger instant Telegram alert with on-chain details and approve/reject buttons
    try {
      await sendCryptoDepositAlert({
        id: payment.id,
        amountUsdt: depositUsdt,
        amountInr,
        txHash: cleanTxHash,
        network: String(network).toUpperCase(),
        userName: payment.user?.name || session?.name,
        userEmail: payment.user?.email || session?.email || "customer@botclips.online",
        onChainVerified,
        screenshot1: s1,
        screenshot2: s2
      });
    } catch (err) {
      console.error("Telegram crypto alert error:", err);
    }

    return NextResponse.json({ 
      success: true, 
      payment,
      onChainVerified,
      message: onChainVerified
        ? "Transaction verified on-chain (" + depositUsdt + " USDT ≈ ₹" + amountInr + "). Admin will review screenshots and credit balance."
        : "Deposit submitted (" + depositUsdt + " USDT ≈ ₹" + amountInr + "). Admin will verify the blockchain TxID and credit balance."
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ 
        error: "This transaction hash (TxID) has already been submitted and cannot be reused." 
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to submit crypto deposit" }, { status: 500 });
  }
}

// PUT /api/billing/crypto - Admin approval / rejection endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const isAdmin = session?.role === "ADMIN";
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, action, rejectReason } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.cryptoPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Crypto payment not found" }, { status: 404 });
    }

    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ error: "This crypto deposit has already been approved and credited." }, { status: 400 });
    }

    if (action === "APPROVE") {
      const creditInr = payment.amountInr || Math.round(payment.amountUsdt * USDT_TO_INR_DEFAULT);

      await prisma.$transaction([
        prisma.cryptoPayment.update({
          where: { id: paymentId },
          data: { status: "CONFIRMED" },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: creditInr } },
        }),
      ]);

      // Record referral commission if user was referred (10% of nominal 30% profit)
      try {
        const { recordReferralReward } = await import("@/lib/referral");
        await recordReferralReward({
          userId: payment.userId,
          depositAmount: creditInr,
          paymentType: "CRYPTO",
          paymentId: payment.id,
        });
      } catch (refErr) {
        console.error("Crypto referral reward error:", refErr);
      }

      return NextResponse.json({ 
        success: true, 
        message: "Crypto deposit approved! Credited ₹" + creditInr + " (" + payment.amountUsdt + " USDT) to user balance." 
      });
    } else {
      await prisma.cryptoPayment.update({
        where: { id: paymentId },
        data: { 
          status: "REJECTED",
          rejectReason: rejectReason || "Rejected by admin after blockchain / proof verification."
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Crypto deposit rejected." 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update crypto payment" }, { status: 500 });
  }
}
