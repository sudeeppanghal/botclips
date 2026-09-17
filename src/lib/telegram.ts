import { prisma } from "@/lib/prisma";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export async function getTelegramConfig(): Promise<TelegramConfig | null> {
  let botToken = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    try {
      const settings = await prisma.adminSettings.findUnique({
        where: { id: "global" }
      });
      if (settings && settings.supportTelegram) {
        if (settings.supportTelegram.startsWith("tg_config_")) {
          try {
            const parsed = JSON.parse(settings.supportTelegram.replace("tg_config_", ""));
            if (!botToken && parsed.botToken) botToken = parsed.botToken;
            if (!chatId && parsed.chatId) chatId = parsed.chatId;
          } catch {}
        } else if (settings.supportTelegram.startsWith("bot_token_")) {
          if (!botToken) botToken = settings.supportTelegram.replace("bot_token_", "");
        }
      }
    } catch {}
  }

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
}

export async function sendTelegramMessage(text: string, options: {
  chatId?: string;
  replyMarkup?: any;
  parseMode?: "HTML" | "MarkdownV2" | "Markdown";
  disableWebPagePreview?: boolean;
} = {}): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const config = await getTelegramConfig();
    const targetChatId = options.chatId || config?.chatId;
    const token = config?.botToken;

    if (!token || !targetChatId) {
      return { success: false, error: "Telegram Bot Token or Chat ID not configured" };
    }

    const payload: any = {
      chat_id: targetChatId,
      text,
      parse_mode: options.parseMode || "HTML",
      disable_web_page_preview: options.disableWebPagePreview ?? false
    };

    if (options.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || "Telegram API call failed" };
    }

    return { success: true, result: data.result };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send Telegram message" };
  }
}

export async function editTelegramMessage(chatId: string | number, messageId: number, newText: string, replyMarkup?: any): Promise<boolean> {
  try {
    const config = await getTelegramConfig();
    if (!config?.botToken) return false;

    const payload: any = {
      chat_id: chatId,
      message_id: messageId,
      text: newText,
      parse_mode: "HTML",
      disable_web_page_preview: false
    };

    if (replyMarkup !== undefined) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string, showAlert = false): Promise<boolean> {
  try {
    const config = await getTelegramConfig();
    if (!config?.botToken) return false;

    await fetch(`https://api.telegram.org/bot${config.botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert
      })
    });
    return true;
  } catch {
    return false;
  }
}

// ──────────────── 1. SEND UPI DEPOSIT ALERT ────────────────
export async function sendUpiDepositAlert(deposit: {
  id: string;
  amount: number;
  utr: string;
  userName?: string;
  userEmail: string;
  screenshot1?: string;
  screenshot2?: string;
}) {
  const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  
  let proofLinks = "";
  if (deposit.screenshot1 && deposit.screenshot1.startsWith("http")) {
    proofLinks += `• <a href="${deposit.screenshot1}">Receipt Proof 1</a>\n`;
  }
  if (deposit.screenshot2 && deposit.screenshot2.startsWith("http") && deposit.screenshot2 !== deposit.screenshot1) {
    proofLinks += `• <a href="${deposit.screenshot2}">Receipt Proof 2</a>\n`;
  }
  if (!proofLinks) {
    proofLinks = "• <i>Attached via app/portal</i>\n";
  }

  const text = 
`🔔 <b>NEW UPI DEPOSIT SUBMITTED</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${deposit.userName || "Customer"} (<code>${deposit.userEmail}</code>)
💵 <b>Amount:</b> <b>₹${deposit.amount.toLocaleString("en-IN")} INR</b>
🔢 <b>12-Digit UTR:</b> <code>${deposit.utr}</code>
⏰ <b>Time:</b> ${timeStr} IST

🖼️ <b>Proof Screenshots:</b>
${proofLinks}━━━━━━━━━━━━━━━━━━━━━━
<i>Tap below to approve or reject with 1 click:</i>`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: `✅ Approve (₹${deposit.amount})`,
          callback_data: `approve:upi:${deposit.id}`
        },
        {
          text: `❌ Reject`,
          callback_data: `reject:upi:${deposit.id}`
        }
      ],
      [
        {
          text: `🔍 View in Admin Portal`,
          url: `https://botclips.online/admin/billing`
        }
      ]
    ]
  };

  return sendTelegramMessage(text, { replyMarkup: inlineKeyboard });
}

// ──────────────── 2. SEND CRYPTO DEPOSIT ALERT ────────────────
export async function sendCryptoDepositAlert(deposit: {
  id: string;
  amountUsdt: number;
  amountInr: number;
  txHash: string;
  network: string;
  userName?: string;
  userEmail: string;
  onChainVerified: boolean;
  screenshot1?: string;
  screenshot2?: string;
}) {
  const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const explorerUrl = deposit.network === "TRC20" 
    ? `https://tronscan.org/#/transaction/${deposit.txHash}`
    : `https://bscscan.com/tx/${deposit.txHash}`;

  const text = 
`💎 <b>NEW USDT CRYPTO DEPOSIT</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>User:</b> ${deposit.userName || "Customer"} (<code>${deposit.userEmail}</code>)
🪙 <b>Amount:</b> <b>${deposit.amountUsdt} USDT</b> (≈ ₹${deposit.amountInr.toLocaleString("en-IN")})
🌐 <b>Network:</b> ${deposit.network}
🔗 <b>TxID Hash:</b> <a href="${explorerUrl}">${deposit.txHash.slice(0, 16)}...</a>
🛡️ <b>On-Chain Check:</b> ${deposit.onChainVerified ? "✅ Verified on Blockchain" : "⏳ Pending Inspection"}
⏰ <b>Time:</b> ${timeStr} IST
━━━━━━━━━━━━━━━━━━━━━━
<i>Tap below to approve or reject with 1 click:</i>`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: `✅ Approve (${deposit.amountUsdt} USDT ≈ ₹${deposit.amountInr})`,
          callback_data: `approve:crypto:${deposit.id}`
        },
        {
          text: `❌ Reject`,
          callback_data: `reject:crypto:${deposit.id}`
        }
      ],
      [
        {
          text: `🔗 Open Blockchain Explorer`,
          url: explorerUrl
        }
      ]
    ]
  };

  return sendTelegramMessage(text, { replyMarkup: inlineKeyboard });
}

// ──────────────── 3. SEND DAILY MIDNIGHT REPORT ────────────────
export async function sendDailyMidnightReport(report: {
  dateStr: string;
  totalUpiDeposits: number;
  totalUpiAmount: number;
  totalCryptoDeposits: number;
  totalCryptoAmountUsdt: number;
  totalCryptoAmountInr: number;
  totalRevenue: number;
  totalOrdersCount: number;
  totalOrdersSpend: number;
  newUsersCount: number;
  activeUsersCount: number;
}) {
  const text =
`📊 <b>BOTCLIPS DAILY MIDNIGHT EXECUTIVE REPORT</b>
📅 <b>Date:</b> ${report.dateStr}
━━━━━━━━━━━━━━━━━━━━━━
💰 <b>TOTAL FUNDS DEPOSITED:</b>
• <b>UPI Deposits:</b> ₹${report.totalUpiAmount.toLocaleString("en-IN")} (${report.totalUpiDeposits} approved)
• <b>Crypto Deposits:</b> ${report.totalCryptoAmountUsdt} USDT (≈ ₹${report.totalCryptoAmountInr.toLocaleString("en-IN")}) (${report.totalCryptoDeposits} approved)
• 💎 <b>Total Deposits Credited:</b> <b>₹${report.totalRevenue.toLocaleString("en-IN")} INR</b>

📦 <b>ORDERS & ENGAGEMENT:</b>
• <b>Total Orders Dispatched:</b> <b>${report.totalOrdersCount} orders</b>
• <b>Total Order Volume:</b> ₹${report.totalOrdersSpend.toLocaleString("en-IN")} INR

👥 <b>USER METRICS:</b>
• <b>New Registrations Today:</b> +${report.newUsersCount} users
• <b>Active Transacting Users:</b> ${report.activeUsersCount} users
━━━━━━━━━━━━━━━━━━━━━━
🚀 <i>Platform Status: 100% Operational • Standalone APK Active</i>`;

  return sendTelegramMessage(text, {
    replyMarkup: {
      inline_keyboard: [
        [
          { text: "📊 Open Admin Analytics", url: "https://botclips.online/admin" },
          { text: "👥 Manage Users", url: "https://botclips.online/admin/users" }
        ]
      ]
    }
  });
}
