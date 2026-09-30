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

    // 1. All Users & Wallet Balances
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        role: true,
        status: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            charge: true,
            status: true,
          }
        },
        upiPayments: {
          select: {
            id: true,
            amount: true,
            status: true,
            utr: true,
            createdAt: true,
          }
        },
        cryptoPayments: {
          select: {
            id: true,
            amountInr: true,
            amountUsdt: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });

    const totalUsers = allUsers.length;
    let totalWalletBalancesInr = 0;

    const activeUsersList: any[] = [];

    for (const u of allUsers) {
      const userBal = Number(u.balance || 0);
      totalWalletBalancesInr += userBal;

      const confirmedDeposited = 
        u.upiPayments.filter(p => p.status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amount || 0), 0) +
        u.cryptoPayments.filter(p => p.status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amountInr || 0), 0);

      const pendingDeposited = 
        u.upiPayments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount || 0), 0) +
        u.cryptoPayments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amountInr || 0), 0);

      const validOrders = u.orders.filter(o => o.status !== "CANCELLED" && o.status !== "FAILED");
      const userSpent = validOrders.reduce((sum, o) => sum + Number(o.charge || 0), 0);

      if (userBal > 0 || confirmedDeposited > 0 || pendingDeposited > 0 || u.orders.length > 0) {
        activeUsersList.push({
          id: u.id,
          email: u.email,
          name: u.name || u.email.split("@")[0],
          balance: Math.round(userBal * 100) / 100,
          totalDeposited: Math.round(confirmedDeposited * 100) / 100,
          pendingDeposited: Math.round(pendingDeposited * 100) / 100,
          totalSpent: Math.round(userSpent * 100) / 100,
          orderCount: u.orders.length,
          validOrderCount: validOrders.length,
          pendingPaymentsCount: u.upiPayments.filter(p => p.status === "PENDING").length + u.cryptoPayments.filter(p => p.status === "PENDING").length,
          createdAt: u.createdAt,
        });
      }
    }

    // Sort active users: highest deposits first, then highest balance
    activeUsersList.sort((a, b) => (b.totalDeposited + b.balance) - (a.totalDeposited + a.balance));

    // 2. UPI Payments Breakdown
    const confirmedUpi = await prisma.upiPayment.findMany({
      where: { status: "CONFIRMED" },
      select: { amount: true }
    });
    const pendingUpi = await prisma.upiPayment.findMany({
      where: { status: "PENDING" },
      select: { amount: true }
    });
    const totalUpiAmount = confirmedUpi.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const pendingUpiAmount = pendingUpi.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const confirmedUpiCount = confirmedUpi.length;
    const pendingUpiCount = pendingUpi.length;

    // 3. Crypto (USDT) Payments Breakdown
    const confirmedCrypto = await prisma.cryptoPayment.findMany({
      where: { status: "CONFIRMED" },
      select: { amountUsdt: true, amountInr: true }
    });
    const pendingCrypto = await prisma.cryptoPayment.findMany({
      where: { status: "PENDING" },
      select: { amountUsdt: true, amountInr: true }
    });
    const totalCryptoUsdt = confirmedCrypto.reduce((acc, p) => acc + (Number(p.amountUsdt) || 0), 0);
    const totalCryptoInr = confirmedCrypto.reduce((acc, p) => acc + (Number(p.amountInr) || Math.round((Number(p.amountUsdt) || 0) * 96)), 0);
    const pendingCryptoInr = pendingCrypto.reduce((acc, p) => acc + (Number(p.amountInr) || Math.round((Number(p.amountUsdt) || 0) * 96)), 0);
    const confirmedCryptoCount = confirmedCrypto.length;
    const pendingCryptoCount = pendingCrypto.length;

    // 4. Combined Confirmed Deposits & Pending Deposits
    const totalDepositInr = totalUpiAmount + totalCryptoInr;
    const totalPendingInr = pendingUpiAmount + pendingCryptoInr;

    // 5. Real Upstream Cost & Client Spending (Filter out CANCELLED / FAILED orders)
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        quantity: true,
        charge: true,
        status: true,
        service: {
          select: {
            originalRate: true,
            customRate: true
          }
        }
      }
    });

    let realCostInr = 0;
    let totalClientSpentInr = 0;
    let validOrdersCount = 0;

    for (const ord of orders) {
      if (ord.status !== "CANCELLED" && ord.status !== "FAILED") {
        validOrdersCount++;
        totalClientSpentInr += Number(ord.charge) || 0;
        const ratePerThousand = Number(ord.service?.originalRate) || 0;
        const ordCost = (ord.quantity / 1000) * ratePerThousand;
        realCostInr += ordCost;
      }
    }

    // 6. Net Profit Calculation:
    // Profit is revenue earned on delivered services minus wholesale provider costs
    const netProfit = Math.max(0, totalClientSpentInr - realCostInr);

    // 7. Partner Profit Distribution: 50% Jack, 50% Daniel 🍾🍷
    const jackShare = Number((netProfit * 0.50).toFixed(2));
    const danielShare = Number((netProfit * 0.50).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsersCount: activeUsersList.length,
        walletBalances: {
          totalInr: Math.round(totalWalletBalancesInr * 100) / 100,
        },
        deposits: {
          totalCombinedInr: totalDepositInr,
          totalPendingInr: totalPendingInr,
          pendingTotalCount: pendingUpiCount + pendingCryptoCount,
          upi: {
            totalInr: totalUpiAmount,
            confirmedCount: confirmedUpiCount,
            pendingCount: pendingUpiCount,
            pendingAmount: pendingUpiAmount,
          },
          crypto: {
            totalUsdt: totalCryptoUsdt,
            totalInr: totalCryptoInr,
            confirmedCount: confirmedCryptoCount,
            pendingCount: pendingCryptoCount,
            pendingAmountInr: pendingCryptoInr,
          }
        },
        costs: {
          realCostInr: Number(realCostInr.toFixed(2)),
          totalOrdersCount: orders.length,
          validOrdersCount,
          totalClientBilled: Number(totalClientSpentInr.toFixed(2)),
          totalClientSpent: Number(totalClientSpentInr.toFixed(2)),
        },
        profit: {
          netProfit: Number(netProfit.toFixed(2)),
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
        },
        activeUsers: activeUsersList
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate financials" }, { status: 500 });
  }
}
