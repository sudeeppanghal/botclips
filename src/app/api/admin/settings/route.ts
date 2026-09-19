import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword, signJwt, COOKIE_NAME } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.adminSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: { id: "global" }
      });
    }

    // Parse stored telegram info if encoded
    let telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
    let telegramChatId = process.env.TELEGRAM_CHAT_ID || "";

    if (settings.supportTelegram && settings.supportTelegram.startsWith("tg_config_")) {
      try {
        const parsed = JSON.parse(settings.supportTelegram.replace("tg_config_", ""));
        telegramBotToken = parsed.botToken || telegramBotToken;
        telegramChatId = parsed.chatId || telegramChatId;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      currentAdminEmail: session.email,
      settings: {
        ...settings,
        telegramBotToken,
        telegramChatId,
        isTelegramConfigured: !!(telegramBotToken && telegramChatId)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      telegramBotToken, 
      telegramChatId, 
      sendTestMessage,
      upiId,
      trc20Address,
      bep20Address,
      minDeposit,
      newAdminEmail,
      newAdminPassword
    } = body;

    // Handle Admin Master Credentials Change
    let credentialsChanged = false;
    let newSessionToken: string | null = null;

    if (newAdminEmail || newAdminPassword) {
      const updateData: any = {};
      if (newAdminEmail && newAdminEmail.trim()) {
        const cleanEmail = newAdminEmail.trim().toLowerCase();
        // Ensure email isn't taken by another user
        const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing && existing.id !== session.id) {
          return NextResponse.json({ error: "This email is already registered." }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
      if (newAdminPassword && newAdminPassword.trim()) {
        if (newAdminPassword.trim().length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }
        updateData.passwordHash = await hashPassword(newAdminPassword.trim());
      }

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: session.id },
          data: updateData
        });
        credentialsChanged = true;
        newSessionToken = signJwt({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name || "Master Admin",
          role: "ADMIN"
        });
      }
    }

    // Handle Send Test Message action
    if (sendTestMessage) {
      const testToken = telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      const testChatId = telegramChatId || process.env.TELEGRAM_CHAT_ID;

      if (!testToken || !testChatId) {
        return NextResponse.json({ 
          error: "Please enter both Telegram Bot Token and Chat ID to send a test message." 
        }, { status: 400 });
      }

      const res = await fetch(`https://api.telegram.org/bot${testToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: testChatId,
          text: 
`🚀 <b>TELEGRAM INTEGRATION VERIFIED!</b>
━━━━━━━━━━━━━━━━━━━━━━
✅ Your BotClips platform is now successfully connected to this channel.
• <b>Instant Deposit Alerts:</b> Active with 1-Click Approve / Reject
• <b>Midnight Business Reports:</b> Scheduled at 00:00 IST
• <b>Slash Commands:</b> /today, /pending, /credit, /balance

━━━━━━━━━━━━━━━━━━━━━━
🎉 <i>Admin: ${session.name || session.email} verified connection.</i>`,
          parse_mode: "HTML"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return NextResponse.json({ 
          error: `Telegram API Error: ${data.description || "Invalid Bot Token or Chat ID"}` 
        }, { status: 400 });
      }

      // Automatically register the webhook so Telegram sends button clicks and commands to our site
      try {
        const webhookUrl = "https://botclips.online/api/telegram/webhook";
        await fetch(`https://api.telegram.org/bot${testToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Test message sent to Telegram successfully! Webhook registered."
      });
    }

    // Save settings to database
    let tgEncoded = undefined;
    if (telegramBotToken || telegramChatId) {
      tgEncoded = "tg_config_" + JSON.stringify({
        botToken: telegramBotToken || "",
        chatId: telegramChatId || ""
      });

      // Auto-set Telegram webhook
      if (telegramBotToken) {
        try {
          const webhookUrl = "https://botclips.online/api/telegram/webhook";
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        } catch {}
      }
    }

    const updated = await prisma.adminSettings.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        supportTelegram: tgEncoded,
        upiId: upiId || undefined,
        trc20Address: trc20Address || undefined,
        bep20Address: bep20Address || undefined,
        minDeposit: minDeposit ? Number(minDeposit) : 100,
      },
      update: {
        supportTelegram: tgEncoded !== undefined ? tgEncoded : undefined,
        upiId: upiId !== undefined ? upiId : undefined,
        trc20Address: trc20Address !== undefined ? trc20Address : undefined,
        bep20Address: bep20Address !== undefined ? bep20Address : undefined,
        minDeposit: minDeposit !== undefined ? Number(minDeposit) : undefined,
      }
    });

    const response = NextResponse.json({
      success: true,
      message: credentialsChanged 
        ? "Admin credentials updated successfully! New login details are active."
        : "Settings saved successfully! Telegram bot is active.",
      settings: updated,
      credentialsChanged
    });

    if (newSessionToken) {
      response.cookies.set({
        name: COOKIE_NAME,
        value: newSessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
