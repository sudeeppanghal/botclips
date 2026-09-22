import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/billing/upi/intent - Generate or redirect to dynamic UPI Intent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawAmount = searchParams.get("amount") || "200";
    const app = searchParams.get("app"); // "gpay" | "phonepe" | "paytm" | "cred" | undefined
    const shouldRedirect = searchParams.get("redirect") === "true";

    let amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount < 200) {
      amount = 200;
    }

    let upiId = "Jaatdhillon@fam";
    let payeeName = "BotClips";

    try {
      const settings = await prisma.adminSettings.findUnique({ where: { id: "global" } });
      if (settings?.upiId) upiId = settings.upiId;
      if (settings?.siteName) payeeName = settings.siteName;
    } catch {}

    const note = encodeURIComponent(`BotClips Deposit ₹${amount}`);
    const pn = encodeURIComponent(payeeName);
    const pa = encodeURIComponent(upiId);
    const am = amount.toFixed(2);

    // Standard NPCI UPI URI scheme
    const standardUpiUrl = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${note}`;
    
    // App-specific intent schemes
    const gpayUrl = `tez://upi/pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${note}`;
    const phonepeUrl = `phonepe://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${note}`;
    const paytmUrl = `paytmmp://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${note}`;
    const credUrl = `cred://upi/pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${note}`;

    let targetUrl = standardUpiUrl;
    if (app === "gpay") targetUrl = gpayUrl;
    else if (app === "phonepe") targetUrl = phonepeUrl;
    else if (app === "paytm") targetUrl = paytmUrl;
    else if (app === "cred") targetUrl = credUrl;

    if (shouldRedirect) {
      return NextResponse.redirect(targetUrl, 302);
    }

    return NextResponse.json({
      success: true,
      amount,
      upiId,
      payeeName,
      intents: {
        standard: standardUpiUrl,
        gpay: gpayUrl,
        phonepe: phonepeUrl,
        paytm: paytmUrl,
        cred: credUrl,
      },
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(standardUpiUrl)}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate UPI intent" }, { status: 500 });
  }
}
