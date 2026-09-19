import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  answerCallbackQuery, 
  editTelegramMessage, 
  sendTelegramMessage, 
  sendDailyMidnightReport 
} from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // ──────────────── 1. HANDLE INLINE BUTTON APPROVALS / REJECTIONS ────────────────
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = String(cq.data || "");
      const callbackQueryId = cq.id;
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const fromUser = cq.from?.username ? `@${cq.from.username}` : (cq.from?.first_name || "Admin");

      // A. Handle UPI Approvals
      if (data.startsWith("approve:upi:")) {
        const paymentId = data.replace("approve:upi:", "");
        const payment = await prisma.upiPayment.findUnique({
          where: { id: paymentId },
          include: { user: { select: { id: true, email: true, name: true, balance: true } } }
        });

        if (!payment) {
          await answerCallbackQuery(callbackQueryId, "Payment not found in database", true);
          return NextResponse.json({ ok: true });
        }

        if (payment.status === "CONFIRMED") {
          await answerCallbackQuery(callbackQueryId, "This payment is already approved and credited!", true);
          return NextResponse.json({ ok: true });
        }

        // Atomic Balance Increment
        await prisma.$transaction([
          prisma.upiPayment.update({
            where: { id: paymentId },
            data: { status: "CONFIRMED" }
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: { balance: { increment: payment.amount } }
          })
        ]);

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
          console.error("Telegram UPI referral reward error:", refErr);
        }

        const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await answerCallbackQuery(callbackQueryId, `Approved! ₹${payment.amount} credited to user.`);

        const updatedText = 
`✅ <b>UPI DEPOSIT APPROVED</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${payment.user?.name || "Customer"} (<code>${payment.user?.email}</code>)
💵 <b>Credited Amount:</b> <b>₹${payment.amount.toLocaleString("en-IN")} INR</b>
🔢 <b>UTR:</b> <code>${payment.utr}</code>
👮 <b>Approved By:</b> ${fromUser}
⏰ <b>Approved At:</b> ${timeStr} IST
━━━━━━━━━━━━━━━━━━━━━━
🎉 <i>Balance credited to user wallet instantly.</i>`;

        if (chatId && messageId) {
          await editTelegramMessage(chatId, messageId, updatedText, {
            inline_keyboard: [
              [{ text: "🔍 View in Admin Portal", url: "https://botclips.online/admin/billing" }]
            ]
          });
        }

        return NextResponse.json({ ok: true });
      }

      // B. Handle UPI Rejections
      if (data.startsWith("reject:upi:")) {
        const paymentId = data.replace("reject:upi:", "");
        const payment = await prisma.upiPayment.findUnique({
          where: { id: paymentId },
          include: { user: { select: { email: true, name: true } } }
        });

        if (!payment) {
          await answerCallbackQuery(callbackQueryId, "Payment not found", true);
          return NextResponse.json({ ok: true });
        }

        await prisma.upiPayment.update({
          where: { id: paymentId },
          data: { status: "REJECTED", rejectReason: `Rejected via Telegram by ${fromUser}` }
        });

        const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await answerCallbackQuery(callbackQueryId, "Payment rejected.");

        const updatedText = 
`❌ <b>UPI DEPOSIT REJECTED</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${payment.user?.name || "Customer"} (<code>${payment.user?.email}</code>)
💵 <b>Amount:</b> ₹${payment.amount} INR
🔢 <b>UTR:</b> <code>${payment.utr}</code>
👮 <b>Rejected By:</b> ${fromUser}
⏰ <b>Time:</b> ${timeStr} IST
━━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>Deposit marked as rejected.</i>`;

        if (chatId && messageId) {
          await editTelegramMessage(chatId, messageId, updatedText);
        }

        return NextResponse.json({ ok: true });
      }

      // C. Handle Crypto Approvals
      if (data.startsWith("approve:crypto:")) {
        const paymentId = data.replace("approve:crypto:", "");
        const payment = await prisma.cryptoPayment.findUnique({
          where: { id: paymentId },
          include: { user: { select: { email: true, name: true } } }
        });

        if (!payment) {
          await answerCallbackQuery(callbackQueryId, "Crypto payment not found", true);
          return NextResponse.json({ ok: true });
        }

        if (payment.status === "CONFIRMED") {
          await answerCallbackQuery(callbackQueryId, "Already approved!", true);
          return NextResponse.json({ ok: true });
        }

        const creditInr = payment.amountInr || Math.round(payment.amountUsdt * 96);

        await prisma.$transaction([
          prisma.cryptoPayment.update({
            where: { id: paymentId },
            data: { status: "CONFIRMED" }
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: { balance: { increment: creditInr } }
          })
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
          console.error("Telegram Crypto referral reward error:", refErr);
        }

        const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await answerCallbackQuery(callbackQueryId, `Approved! ₹${creditInr} credited.`);

        const updatedText = 
`✅ <b>CRYPTO USDT DEPOSIT APPROVED</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${payment.user?.name || "Customer"} (<code>${payment.user?.email}</code>)
🪙 <b>Amount:</b> ${payment.amountUsdt} USDT (<b>₹${creditInr.toLocaleString("en-IN")} INR credited</b>)
🌐 <b>Network:</b> ${payment.network}
🔗 <b>TxHash:</b> <code>${payment.txHash}</code>
👮 <b>Approved By:</b> ${fromUser}
⏰ <b>Time:</b> ${timeStr} IST
━━━━━━━━━━━━━━━━━━━━━━
🎉 <i>Balance credited to user wallet instantly.</i>`;

        if (chatId && messageId) {
          await editTelegramMessage(chatId, messageId, updatedText);
        }

        return NextResponse.json({ ok: true });
      }

      // D. Handle Crypto Rejections
      if (data.startsWith("reject:crypto:")) {
        const paymentId = data.replace("reject:crypto:", "");
        await prisma.cryptoPayment.update({
          where: { id: paymentId },
          data: { status: "REJECTED", rejectReason: `Rejected via Telegram by ${fromUser}` }
        });

        await answerCallbackQuery(callbackQueryId, "Crypto deposit rejected.");
        return NextResponse.json({ ok: true });
      }
    }

    // ──────────────── 2. HANDLE TELEGRAM TEXT COMMANDS ────────────────
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = String(update.message.chat.id);
      const parts = text.split(/\s+/);
      const command = parts[0].toLowerCase().split("@")[0];

      // A. /start or /help
      if (command === "/start" || command === "/help") {
        const helpMsg = 
`🤖 <b>BotClips Admin Control Center</b>
━━━━━━━━━━━━━━━━━━━━━━
Welcome! You can manage deposits, view real-time statistics, and control user balances directly here:

📊 <b>Reporting Commands:</b>
• <code>/today</code> or <code>/stats</code> — Today's deposits, orders & metrics
• <code>/report</code> — Generate full executive midnight report now
• <code>/pending</code> — Show all unapproved deposits queue

👤 <b>User Management:</b>
• <code>/credit email@gmail.com 500</code> — Add balance to any user
• <code>/balance email@gmail.com</code> — Lookup user balance & orders

━━━━━━━━━━━━━━━━━━━━━━
💡 <i>Interactive 1-click buttons will automatically appear when new deposits are submitted!</i>`;
        await sendTelegramMessage(helpMsg, { chatId });
        return NextResponse.json({ ok: true });
      }

      // B. /today or /stats
      if (command === "/today" || command === "/stats") {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [confirmedUpi, confirmedCrypto, ordersToday, newUsers] = await Promise.all([
          prisma.upiPayment.findMany({
            where: { status: "CONFIRMED", createdAt: { gte: startOfDay } }
          }),
          prisma.cryptoPayment.findMany({
            where: { status: "CONFIRMED", createdAt: { gte: startOfDay } }
          }),
          prisma.order.findMany({
            where: { createdAt: { gte: startOfDay } }
          }),
          prisma.user.count({
            where: { createdAt: { gte: startOfDay } }
          })
        ]);

        const upiTotal = confirmedUpi.reduce((acc, curr) => acc + curr.amount, 0);
        const cryptoTotalInr = confirmedCrypto.reduce((acc, curr) => acc + (curr.amountInr || curr.amountUsdt * 96), 0);
        const cryptoTotalUsdt = confirmedCrypto.reduce((acc, curr) => acc + curr.amountUsdt, 0);
        const totalDeposits = upiTotal + cryptoTotalInr;
        const totalOrdersSpend = ordersToday.reduce((acc, curr) => acc + curr.charge, 0);

        const statsMsg = 
`📊 <b>BOTCLIPS REAL-TIME STATS (TODAY)</b>
━━━━━━━━━━━━━━━━━━━━━━
💰 <b>Total Deposits Credited:</b> <b>₹${totalDeposits.toLocaleString("en-IN")} INR</b>
• <b>UPI:</b> ₹${upiTotal.toLocaleString("en-IN")} (${confirmedUpi.length} deposits)
• <b>Crypto:</b> ${cryptoTotalUsdt} USDT ≈ ₹${cryptoTotalInr.toLocaleString("en-IN")} (${confirmedCrypto.length} deposits)

📦 <b>Orders Today:</b> <b>${ordersToday.length} orders</b>
• <b>Total Order Spend:</b> ₹${totalOrdersSpend.toLocaleString("en-IN")} INR

👥 <b>New Signups Today:</b> +${newUsers} users
━━━━━━━━━━━━━━━━━━━━━━
⏱️ <i>Updated in real-time from PostgreSQL database.</i>`;

        await sendTelegramMessage(statsMsg, { chatId });
        return NextResponse.json({ ok: true });
      }

      // C. /pending
      if (command === "/pending") {
        const [pendingUpi, pendingCrypto] = await Promise.all([
          prisma.upiPayment.findMany({
            where: { status: "PENDING" },
            include: { user: { select: { email: true, name: true } } },
            take: 10
          }),
          prisma.cryptoPayment.findMany({
            where: { status: "PENDING" },
            include: { user: { select: { email: true, name: true } } },
            take: 10
          })
        ]);

        if (pendingUpi.length === 0 && pendingCrypto.length === 0) {
          await sendTelegramMessage("✅ <b>No pending deposits!</b> All transactions have been approved.", { chatId });
          return NextResponse.json({ ok: true });
        }

        let msg = `⏳ <b>PENDING DEPOSITS QUEUE (${pendingUpi.length + pendingCrypto.length})</b>\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        for (const p of pendingUpi) {
          msg += `• <b>UPI:</b> ₹${p.amount} | UTR: <code>${p.utr}</code> | ${p.user?.email || "User"}\n`;
        }
        for (const c of pendingCrypto) {
          msg += `• <b>USDT:</b> ${c.amountUsdt} USDT | Tx: <code>${c.txHash.slice(0, 10)}...</code> | ${c.user?.email || "User"}\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n👉 <a href="https://botclips.online/admin/billing">Open Admin Portal to approve all</a>`;

        await sendTelegramMessage(msg, { chatId });
        return NextResponse.json({ ok: true });
      }

      // D. /credit <email> <amount>
      if (command === "/credit") {
        const targetEmail = parts[1]?.toLowerCase();
        const creditAmt = Number(parts[2]);

        if (!targetEmail || isNaN(creditAmt) || creditAmt <= 0) {
          await sendTelegramMessage("⚠️ <b>Usage:</b> <code>/credit user@example.com 500</code>", { chatId });
          return NextResponse.json({ ok: true });
        }

        const user = await prisma.user.findUnique({
          where: { email: targetEmail }
        });

        if (!user) {
          await sendTelegramMessage(`❌ User not found with email: <code>${targetEmail}</code>`, { chatId });
          return NextResponse.json({ ok: true });
        }

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: creditAmt } }
        });

        await sendTelegramMessage(
`✅ <b>FUNDS CREDITED MANUALLY</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${user.name || "Customer"} (<code>${user.email}</code>)
💵 <b>Amount Added:</b> <b>₹${creditAmt.toLocaleString("en-IN")} INR</b>
💰 <b>New Wallet Balance:</b> <b>₹${updated.balance.toFixed(2)} INR</b>
━━━━━━━━━━━━━━━━━━━━━━`,
          { chatId }
        );
        return NextResponse.json({ ok: true });
      }

      // E. /balance <email>
      if (command === "/balance") {
        const targetEmail = parts[1]?.toLowerCase();
        if (!targetEmail) {
          await sendTelegramMessage("⚠️ <b>Usage:</b> <code>/balance user@example.com</code>", { chatId });
          return NextResponse.json({ ok: true });
        }

        const user = await prisma.user.findUnique({
          where: { email: targetEmail },
          include: { _count: { select: { orders: true } } }
        });

        if (!user) {
          await sendTelegramMessage(`❌ No user found with email: <code>${targetEmail}</code>`, { chatId });
          return NextResponse.json({ ok: true });
        }

        await sendTelegramMessage(
`👤 <b>USER ACCOUNT OVERVIEW</b>
━━━━━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> <code>${user.email}</code>
🏷️ <b>Name:</b> ${user.name || "Not set"}
💰 <b>Available Balance:</b> <b>₹${user.balance.toFixed(2)} INR</b>
📦 <b>Total Orders Placed:</b> ${user._count.orders} orders
💸 <b>Total Spent:</b> ₹${user.totalSpent.toFixed(2)}
🔑 <b>Role:</b> ${user.role}
━━━━━━━━━━━━━━━━━━━━━━`,
          { chatId }
        );
        return NextResponse.json({ ok: true });
      }

      // F. /report
      if (command === "/report") {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [confirmedUpi, confirmedCrypto, ordersToday, newUsers, activeUsers] = await Promise.all([
          prisma.upiPayment.findMany({ where: { status: "CONFIRMED", createdAt: { gte: startOfDay } } }),
          prisma.cryptoPayment.findMany({ where: { status: "CONFIRMED", createdAt: { gte: startOfDay } } }),
          prisma.order.findMany({ where: { createdAt: { gte: startOfDay } } }),
          prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
          prisma.user.count({ where: { orders: { some: { createdAt: { gte: startOfDay } } } } })
        ]);

        const upiTotal = confirmedUpi.reduce((acc, curr) => acc + curr.amount, 0);
        const cryptoTotalInr = confirmedCrypto.reduce((acc, curr) => acc + (curr.amountInr || curr.amountUsdt * 96), 0);
        const cryptoTotalUsdt = confirmedCrypto.reduce((acc, curr) => acc + curr.amountUsdt, 0);
        const totalRevenue = upiTotal + cryptoTotalInr;
        const totalOrdersSpend = ordersToday.reduce((acc, curr) => acc + curr.charge, 0);

        const dateStr = new Date().toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "numeric",
          month: "short",
          year: "numeric"
        });

        await sendDailyMidnightReport({
          dateStr,
          totalUpiDeposits: confirmedUpi.length,
          totalUpiAmount: upiTotal,
          totalCryptoDeposits: confirmedCrypto.length,
          totalCryptoAmountUsdt: cryptoTotalUsdt,
          totalCryptoAmountInr: cryptoTotalInr,
          totalRevenue,
          totalOrdersCount: ordersToday.length,
          totalOrdersSpend,
          newUsersCount: newUsers,
          activeUsersCount: activeUsers
        });

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
