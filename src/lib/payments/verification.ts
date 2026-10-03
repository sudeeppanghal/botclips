import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface IngestPaymentInput {
  utr: string;
  amountPaise: number;
  currency?: string;
  paidAt: string | Date;
  source?: string;
  sourceMessageId: string;
  senderInfo?: string | null;
  rawSubject?: string | null;
  dryRun?: boolean;
}

export interface ReconcileResult {
  success: boolean;
  status: "MATCHED_AND_CREDITED" | "MATCHED_PENDING_APPROVAL" | "WAITING_FOR_DEPOSIT" | "FLAGGED_MISMATCH" | "ALREADY_PROCESSED" | "ERROR";
  depositId?: string;
  receivedPaymentId?: string;
  amount?: number;
  reason?: string;
}

/**
 * Normalizes UTR to a clean uppercase alphanumeric string (typically 12 digits).
 */
export function normalizeUtr(raw: string): string {
  if (!raw) return "";
  // Strip non-alphanumeric characters like spaces, dashes, colons
  return String(raw).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Validates whether the webhook secret provided matches the configured secret using constant-time comparison.
 */
export async function verifyWebhookSecret(providedSecret: string | null): Promise<boolean> {
  if (!providedSecret) return false;

  // Check from environment or AdminSettings
  let expectedSecret = process.env.FAMPAY_WEBHOOK_SECRET;

  if (!expectedSecret) {
    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      expectedSecret = settings?.fampayWebhookSecret || undefined;
    } catch {}
  }

  // Fallback to default if not configured yet (for testing safety)
  if (!expectedSecret) {
    expectedSecret = "fampay_secret_default_change_in_prod";
  }

  try {
    const bufA = Buffer.from(providedSecret);
    const bufB = Buffer.from(expectedSecret);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Checks if auto-approval is enabled in environment or database settings.
 */
export async function isAutoApproveEnabled(): Promise<boolean> {
  if (process.env.FAMPAY_AUTO_APPROVE_ENABLED === "true") return true;

  try {
    const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
    return Boolean(settings?.fampayAutoApprove);
  } catch {
    return false;
  }
}

/**
 * Ingests a validated payment notification into received_payments table idempotently.
 */
export async function ingestReceivedPayment(input: IngestPaymentInput): Promise<{
  receivedPayment: any;
  isDuplicate: boolean;
  reconcileResult?: ReconcileResult;
}> {
  const cleanUtr = normalizeUtr(input.utr);
  const amountInr = Number((input.amountPaise / 100).toFixed(2));
  const paidAtDate = new Date(input.paidAt);
  const currency = input.currency || "INR";
  const source = input.source || "fampay";
  const sourceMessageId = String(input.sourceMessageId).trim();

  // If dry-run mode, do not persist to database or credit wallet
  if (input.dryRun) {
    return {
      receivedPayment: {
        id: "dry_run_" + Date.now(),
        utr: cleanUtr,
        amountPaise: input.amountPaise,
        amountInr,
        currency,
        paidAt: paidAtDate,
        source,
        sourceMessageId,
        status: "dry_run",
      },
      isDuplicate: false,
      reconcileResult: {
        success: true,
        status: "ALREADY_PROCESSED",
        reason: "Dry-run execution. No database modification.",
      },
    };
  }

  // Check for existing received payment by sourceMessageId or utr
  const existingByMessageId = await prisma.receivedPayment.findUnique({
    where: { sourceMessageId },
  });

  if (existingByMessageId) {
    await prisma.paymentProcessingEvent.create({
      data: {
        eventType: "INGESTION",
        utr: cleanUtr,
        amount: amountInr,
        receivedPaymentId: existingByMessageId.id,
        result: "PENDING",
        details: `Duplicate ingestion attempt ignored for Gmail Message ID: ${sourceMessageId}`,
      },
    });

    return { receivedPayment: existingByMessageId, isDuplicate: true };
  }

  // Check for existing received payment by UTR
  const existingByUtr = await prisma.receivedPayment.findUnique({
    where: { utr: cleanUtr },
  });

  if (existingByUtr) {
    await prisma.paymentProcessingEvent.create({
      data: {
        eventType: "INGESTION",
        utr: cleanUtr,
        amount: amountInr,
        receivedPaymentId: existingByUtr.id,
        result: "PENDING",
        details: `Duplicate UTR ${cleanUtr} arrived with different Message ID: ${sourceMessageId}`,
      },
    });

    return { receivedPayment: existingByUtr, isDuplicate: true };
  }

  // Create new ReceivedPayment record
  const receivedPayment = await prisma.receivedPayment.create({
    data: {
      utr: cleanUtr,
      amountPaise: input.amountPaise,
      amountInr,
      currency,
      paidAt: paidAtDate,
      source,
      sourceMessageId,
      senderInfo: input.senderInfo || null,
      rawSubject: input.rawSubject || null,
      status: "received",
    },
  });

  // Log Ingestion Event
  await prisma.paymentProcessingEvent.create({
    data: {
      eventType: "INGESTION",
      utr: cleanUtr,
      amount: amountInr,
      receivedPaymentId: receivedPayment.id,
      result: "SUCCESS",
      details: `Received genuine FamPay notification for ₹${amountInr} (UTR: ${cleanUtr})`,
    },
  });

  // Immediately attempt reconciliation against pending user deposit requests
  const reconcileResult = await reconcileIncomingPayment(receivedPayment.id);

  return { receivedPayment, isDuplicate: false, reconcileResult };
}

/**
 * Matches an incoming payment against pending customer deposit requests.
 */
export async function reconcileIncomingPayment(receivedPaymentId: string): Promise<ReconcileResult> {
  const received = await prisma.receivedPayment.findUnique({
    where: { id: receivedPaymentId },
  });

  if (!received || received.status === "matched") {
    return {
      success: false,
      status: "ALREADY_PROCESSED",
      reason: "Payment does not exist or has already been matched.",
    };
  }

  // Search for an active customer deposit request with the exact same normalized UTR
  const pendingDeposits = await prisma.upiPayment.findMany({
    where: {
      utr: received.utr,
      status: { in: ["PENDING", "VERIFYING"] },
      matchedPaymentId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (pendingDeposits.length === 0) {
    return {
      success: true,
      status: "WAITING_FOR_DEPOSIT",
      receivedPaymentId: received.id,
      reason: "No pending customer deposit claim found for this UTR yet. Stored for reconciliation.",
    };
  }

  // Check if multiple claims exist for the exact same UTR
  if (pendingDeposits.length > 1) {
    // Flag all conflicting claims for manual review
    for (const dep of pendingDeposits) {
      await prisma.upiPayment.update({
        where: { id: dep.id },
        data: {
          status: "MANUAL_REVIEW",
          verificationReason: "Conflict: Multiple users claimed the same UTR transaction.",
        },
      });
    }

    await prisma.receivedPayment.update({
      where: { id: received.id },
      data: { status: "flagged" },
    });

    await prisma.paymentProcessingEvent.create({
      data: {
        eventType: "MANUAL_REVIEW",
        utr: received.utr,
        amount: received.amountInr,
        receivedPaymentId: received.id,
        result: "FAILED",
        details: `Multiple customer deposit claims detected for UTR ${received.utr}. Flagged for manual review.`,
      },
    });

    return {
      success: false,
      status: "FLAGGED_MISMATCH",
      receivedPaymentId: received.id,
      reason: "Multiple claims detected for the same UTR. Flagged for manual review.",
    };
  }

  const deposit = pendingDeposits[0];
  const depositPaise = Math.round(deposit.amount * 100);

  // Validate exact amount match
  if (depositPaise !== received.amountPaise) {
    await prisma.upiPayment.update({
      where: { id: deposit.id },
      data: {
        status: "MANUAL_REVIEW",
        verificationReason: `Amount mismatch: Customer requested ₹${deposit.amount}, but FamPay received ₹${received.amountInr}.`,
      },
    });

    await prisma.paymentProcessingEvent.create({
      data: {
        eventType: "MATCH_FAILED",
        utr: received.utr,
        amount: received.amountInr,
        receivedPaymentId: received.id,
        upiPaymentId: deposit.id,
        result: "FAILED",
        details: `Amount mismatch: Submitted ₹${deposit.amount} vs Received ₹${received.amountInr}`,
      },
    });

    return {
      success: false,
      status: "FLAGGED_MISMATCH",
      depositId: deposit.id,
      receivedPaymentId: received.id,
      reason: `Amount mismatch: Submitted ₹${deposit.amount} vs Received ₹${received.amountInr}`,
    };
  }

  // Amount matches and UTR matches! Check if Auto-Approval is enabled
  const autoApprove = await isAutoApproveEnabled();

  if (!autoApprove) {
    // Auto-approval disabled: Link match and move to VERIFYING with match indicator for Admin 1-click approval
    await prisma.upiPayment.update({
      where: { id: deposit.id },
      data: {
        status: "VERIFYING",
        matchedPaymentId: received.id,
        verificationReason: `FamPay payment verified (₹${received.amountInr}). Auto-approval is disabled; ready for admin approval.`,
      },
    });

    await prisma.paymentProcessingEvent.create({
      data: {
        eventType: "MATCH_SUCCESS",
        utr: received.utr,
        amount: received.amountInr,
        receivedPaymentId: received.id,
        upiPaymentId: deposit.id,
        result: "PENDING",
        details: `Matched UTR ${received.utr} for ₹${received.amountInr}. Awaiting admin confirmation (auto-approval disabled).`,
      },
    });

    return {
      success: true,
      status: "MATCHED_PENDING_APPROVAL",
      depositId: deposit.id,
      receivedPaymentId: received.id,
      amount: received.amountInr,
      reason: "Payment matched successfully! Pending admin approval because auto-approval is disabled.",
    };
  }

  // ──────────────── ATOMIC CONCURRENCY-SAFE WALLET CREDITING ────────────────
  return await executeAtomicWalletCredit({
    depositId: deposit.id,
    receivedPaymentId: received.id,
    userId: deposit.userId,
    amount: deposit.amount,
    utr: received.utr,
  });
}

/**
 * Reconciles a customer's deposit request when submitted from AddFundsModal.
 */
export async function reconcileDepositRequest(depositId: string): Promise<ReconcileResult> {
  const deposit = await prisma.upiPayment.findUnique({
    where: { id: depositId },
  });

  if (!deposit || deposit.status === "CONFIRMED") {
    return {
      success: false,
      status: "ALREADY_PROCESSED",
      reason: "Deposit not found or already confirmed.",
    };
  }

  const cleanUtr = normalizeUtr(deposit.utr);

  // Check if genuine incoming payment was already received in received_payments
  const received = await prisma.receivedPayment.findUnique({
    where: { utr: cleanUtr },
  });

  if (!received) {
    // Gmail email has not arrived yet: Keep in VERIFYING state
    await prisma.upiPayment.update({
      where: { id: deposit.id },
      data: { status: "VERIFYING" },
    });

    return {
      success: true,
      status: "WAITING_FOR_DEPOSIT",
      depositId: deposit.id,
      reason: "Payment submitted. Waiting for FamPay Gmail notification to arrive.",
    };
  }

  // Incoming payment is already in database, trigger reconciliation
  return await reconcileIncomingPayment(received.id);
}

/**
 * Executes atomic wallet credit within a single Prisma transaction.
 */
export async function executeAtomicWalletCredit({
  depositId,
  receivedPaymentId,
  userId,
  amount,
  utr,
}: {
  depositId: string;
  receivedPaymentId: string;
  userId: string;
  amount: number;
  utr: string;
}): Promise<ReconcileResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and re-verify deposit request
      const currentDeposit = await tx.upiPayment.findUnique({
        where: { id: depositId },
      });

      if (!currentDeposit || currentDeposit.status === "CONFIRMED") {
        throw new Error("Deposit request is already confirmed or deleted.");
      }

      // 2. Lock and re-verify received payment
      const currentReceived = await tx.receivedPayment.findUnique({
        where: { id: receivedPaymentId },
      });

      if (!currentReceived || currentReceived.status === "matched") {
        throw new Error("Received payment has already been matched or consumed.");
      }

      // 3. Fetch current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User ${userId} not found.`);
      }

      const balanceBefore = Number(user.balance || 0);
      const balanceAfter = Number((balanceBefore + amount).toFixed(2));

      // 4. Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });

      // 5. Insert WalletLedger entry
      await tx.walletLedger.create({
        data: {
          userId,
          amount,
          balanceBefore,
          balanceAfter,
          type: "DEPOSIT_UPI",
          referenceId: depositId,
          description: `Automated FamPay UTR ${utr} credit`,
        },
      });

      // 6. Update UpiPayment to CONFIRMED
      const updatedDeposit = await tx.upiPayment.update({
        where: { id: depositId },
        data: {
          status: "CONFIRMED",
          matchedPaymentId: receivedPaymentId,
          verifiedAt: new Date(),
          verificationReason: `Auto-verified via FamPay Gmail payment notification (UTR: ${utr})`,
        },
      });

      // 7. Update ReceivedPayment to matched
      await tx.receivedPayment.update({
        where: { id: receivedPaymentId },
        data: { status: "matched" },
      });

      // 8. Log PaymentProcessingEvent
      await tx.paymentProcessingEvent.create({
        data: {
          eventType: "AUTO_CREDIT",
          utr,
          amount,
          receivedPaymentId,
          upiPaymentId: depositId,
          result: "SUCCESS",
          details: `Credited ₹${amount} to user ${user.email} (Balance: ₹${balanceBefore} -> ₹${balanceAfter})`,
        },
      });

      return { updatedDeposit, balanceAfter };
    });

    // 9. Asynchronously record partner profit split & referral rewards outside tx
    try {
      const { recordReferralReward } = await import("@/lib/referral");
      await recordReferralReward({
        userId,
        depositAmount: amount,
        paymentType: "UPI",
        paymentId: depositId,
      });
    } catch (refErr) {
      console.error("Referral reward error:", refErr);
    }

    return {
      success: true,
      status: "MATCHED_AND_CREDITED",
      depositId,
      receivedPaymentId,
      amount,
      reason: `Successfully credited ₹${amount} to customer wallet!`,
    };
  } catch (err: any) {
    console.error("Atomic wallet crediting failed:", err);
    return {
      success: false,
      status: "ERROR",
      depositId,
      receivedPaymentId,
      reason: err.message || "Atomic transaction failed",
    };
  }
}
