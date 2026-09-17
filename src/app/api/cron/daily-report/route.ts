import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyMidnightReport } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
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

    const sendRes = await sendDailyMidnightReport({
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

    return NextResponse.json({
      success: true,
      reportSent: sendRes.success,
      data: {
        dateStr,
        totalRevenue,
        totalOrdersCount: ordersToday.length,
        newUsersCount: newUsers
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate report" }, { status: 500 });
  }
}
