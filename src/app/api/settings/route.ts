import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.adminSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          id: "global",
          upiId: "Jaatdhillon@fam",
          trc20Address: "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz",
          minDeposit: 100,
          currency: "INR",
          currencySymbol: "₹",
          usdToInrRate: 96,
          supportEmail: "support@botclips.online",
          supportTelegram: "@botclipscn_bot",
          supportWhatsapp: "+919999999999"
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        siteName: settings.siteName || "BotClips",
        currency: settings.currency || "INR",
        currencySymbol: settings.currencySymbol || "₹",
        usdToInrRate: settings.usdToInrRate || 96,
        upiId: settings.upiId || "Jaatdhillon@fam",
        trc20Address: settings.trc20Address || "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz",
        bep20Address: settings.bep20Address || "0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410",
        minDeposit: Number(settings.minDeposit) || 100,
        supportEmail: settings.supportEmail || "support@botclips.online",
        supportTelegram: settings.supportTelegram?.startsWith("tg_config_") 
          ? "@botclipscn_bot" 
          : (settings.supportTelegram || "@botclipscn_bot"),
        supportWhatsapp: settings.supportWhatsapp || "+919999999999",
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || ""
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      settings: {
        siteName: "BotClips",
        currency: "INR",
        currencySymbol: "₹",
        usdToInrRate: 96,
        upiId: "Jaatdhillon@fam",
        trc20Address: "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz",
        bep20Address: "0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410",
        minDeposit: 100,
        supportEmail: "support@botclips.online",
        supportTelegram: "@botclipscn_bot",
        supportWhatsapp: "+919999999999",
        maintenanceMode: false
      }
    });
  }
}
