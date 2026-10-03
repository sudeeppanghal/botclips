import { NextRequest, NextResponse } from "next/server";
import { 
  verifyWebhookSecret, 
  ingestReceivedPayment, 
  normalizeUtr, 
  IngestPaymentInput 
} from "@/lib/payments/verification";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate secret from headers: X-Webhook-Secret or Authorization Bearer
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-webhook-secret");
    
    let providedSecret = customHeader;
    if (!providedSecret && authHeader?.startsWith("Bearer ")) {
      providedSecret = authHeader.replace("Bearer ", "").trim();
    }

    const isValid = await verifyWebhookSecret(providedSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing webhook secret" },
        { status: 401 }
      );
    }

    // 2. Parse and validate JSON body
    const body = await request.json();
    const {
      utr,
      amount_paise,
      amount_inr,
      currency = "INR",
      paid_at,
      source = "fampay",
      source_message_id,
      sender_info,
      raw_subject,
      dry_run = false,
    } = body;

    // Validate required fields
    if (!utr || typeof utr !== "string") {
      return NextResponse.json(
        { error: "Bad Request: Valid UTR is required" },
        { status: 400 }
      );
    }

    const cleanUtr = normalizeUtr(utr);
    if (cleanUtr.length < 8) {
      return NextResponse.json(
        { error: "Bad Request: UTR must contain at least 8 alphanumeric characters" },
        { status: 400 }
      );
    }

    // Determine amount in paise
    let paise = Number(amount_paise);
    if (isNaN(paise) || paise <= 0) {
      if (amount_inr && !isNaN(Number(amount_inr))) {
        paise = Math.round(Number(amount_inr) * 100);
      } else {
        return NextResponse.json(
          { error: "Bad Request: Positive amount_paise or amount_inr is required" },
          { status: 400 }
        );
      }
    }

    if (!source_message_id || typeof source_message_id !== "string") {
      return NextResponse.json(
        { error: "Bad Request: source_message_id (Gmail Message ID) is required for idempotency" },
        { status: 400 }
      );
    }

    const paidAtDate = paid_at ? new Date(paid_at) : new Date();
    if (isNaN(paidAtDate.getTime())) {
      return NextResponse.json(
        { error: "Bad Request: Invalid paid_at timestamp" },
        { status: 400 }
      );
    }

    // 3. Ingest into database and reconcile
    const input: IngestPaymentInput = {
      utr: cleanUtr,
      amountPaise: paise,
      currency,
      paidAt: paidAtDate,
      source,
      sourceMessageId: source_message_id.trim(),
      senderInfo: sender_info ? String(sender_info).trim() : null,
      rawSubject: raw_subject ? String(raw_subject).trim() : null,
      dryRun: Boolean(dry_run),
    };

    const result = await ingestReceivedPayment(input);

    return NextResponse.json({
      success: true,
      message: result.isDuplicate
        ? "Payment notification already processed (idempotent duplicate)"
        : "Payment ingested successfully",
      isDuplicate: result.isDuplicate,
      receivedPayment: {
        id: result.receivedPayment.id,
        utr: result.receivedPayment.utr,
        amountInr: result.receivedPayment.amountInr,
        status: result.receivedPayment.status,
      },
      reconcileResult: result.reconcileResult,
    });
  } catch (err: any) {
    console.error("FamPay webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to verify webhook health and configuration status
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const customHeader = request.headers.get("x-webhook-secret");
  
  let providedSecret = customHeader;
  if (!providedSecret && authHeader?.startsWith("Bearer ")) {
    providedSecret = authHeader.replace("Bearer ", "").trim();
  }

  const isValid = await verifyWebhookSecret(providedSecret);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "online",
    endpoint: "/api/payments/fampay/webhook",
    autoApproveEnabled: process.env.FAMPAY_AUTO_APPROVE_ENABLED === "true",
    timestamp: new Date().toISOString(),
  });
}
