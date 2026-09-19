import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const isAdmin = session?.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 1. Total Registered Users
    const totalUsers = await prisma.user.count();

    // 2. UPI Payments Breakdown
    const confirmedUpi = await prisma.upiPayment.findMany({
      where: { status: "CONFIRMED" },
      select: { amount: true }
    });
    const pendingUpiCount = await prisma.upiPayment.count({
      where: { status: "PENDING" }
    });
    const totalUpiAmount = confirmedUpi.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const confirmedUpiCount = confirmedUpi.length;

    // 3. Crypto (USDT) Payments Breakdown
    const confirmedCrypto = await prisma.cryptoPayment.findMany({
      where: { status: "CONFIRMED" },
      select: { amountUsdt: true }
    });
    const pendingCryptoCount = await prisma.cryptoPayment.count({
      where: { status: "PENDING" }
    });
    const totalCryptoUsdt = confirmedCrypto.reduce((acc, p) => acc + (Number(p.amountUsdt) || 0), 0);
    const totalCryptoInr = confirmedCrypto.reduce((acc, p) => acc + Math.round((Number(p.amountUsdt) || 0) * 96), 0);
    const confirmedCryptoCount = confirmedCrypto.length;

    // 4. Combined Deposits
    const totalDepositInr = totalUpiAmount + totalCryptoInr;

    // 5. Real Upstream Cost Calculation (SMM Provider Wholesale Cost)
    const orders = await prisma.order.findMany({
      select: {
        quantity: true,
        charge: true,
        service: {
          select: {
            originalRate: true,
            customRate: true
          }
        }
      }
    });

    let realCostInr = 0;
    let totalClientBilled = 0;

    for (const ord of orders) {
      totalClientBilled += Number(ord.charge) || 0;
      const ratePerThousand = Number(ord.service?.originalRate) || 0;
      const ordCost = (ord.quantity / 1000) * ratePerThousand;
      realCostInr += ordCost;
    }

    // 6. Net Profit & Remaining
    // If deposits > 0, net profit is based on deposits - realCost.
    // Or if orders billed > 0, gross revenue minus provider cost.
    const effectiveRevenue = Math.max(totalDepositInr, totalClientBilled);
    const remainingNetProfit = Math.max(0, effectiveRevenue - realCostInr);

    // 7. Partner Profit Distribution: 50% Jack, 50% Daniel 🍾🍷
    const jackShare = Number((remainingNetProfit * 0.50).toFixed(2));
    const danielShare = Number((remainingNetProfit * 0.50).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        deposits: {
          totalCombinedInr: totalDepositInr,
          upi: {
            totalInr: totalUpiAmount,
            confirmedCount: confirmedUpiCount,
            pendingCount: pendingUpiCount,
          },
          crypto: {
            totalUsdt: totalCryptoUsdt,
            totalInr: totalCryptoInr,
            confirmedCount: confirmedCryptoCount,
            pendingCount: pendingCryptoCount,
          }
        },
        costs: {
          realCostInr: Number(realCostInr.toFixed(2)),
          totalOrdersCount: orders.length,
          totalClientBilled: Number(totalClientBilled.toFixed(2)),
        },
        profit: {
          netProfit: Number(remainingNetProfit.toFixed(2)),
          status: "ALL_SETTLED",
          partners: {
            jack: {
              name: "Jack 🍾",
              percentage: 50,
              shareInr: jackShare,
              settledStatus: "SETTLED",
            },
            daniel: {
              name: "Daniel 🍷",
              percentage: 50,
              shareInr: danielShare,
              settledStatus: "SETTLED",
            },
            ram: {
              name: "Jack 🍾",
              percentage: 50,
              shareInr: jackShare,
              settledStatus: "SETTLED",
            },
            dhillown: {
              name: "Daniel 🍷",
              percentage: 50,
              shareInr: danielShare,
              settledStatus: "SETTLED",
            }
          }
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate financials" }, { status: 500 });
  }
}
