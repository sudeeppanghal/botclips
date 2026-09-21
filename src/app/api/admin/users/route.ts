import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/users - List all registered users
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: { select: { id: true, charge: true, status: true } },
        upiPayments: { select: { id: true, amount: true, status: true } },
        cryptoPayments: { select: { id: true, amountInr: true, amountUsdt: true, status: true } }
      }
    });

    const users = rawUsers.map((u) => {
      const totalSpent = u.orders
        .filter((o) => o.status !== "CANCELLED" && o.status !== "FAILED")
        .reduce((sum, o) => sum + Number(o.charge || 0), 0);

      const totalDeposited = 
        u.upiPayments.filter((p) => p.status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amount || 0), 0) +
        u.cryptoPayments.filter((p) => p.status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amountInr || 0), 0);

      return {
        id: u.id,
        email: u.email,
        name: u.name || u.email.split("@")[0],
        role: u.role,
        balance: Number(u.balance || 0),
        status: u.status || "ACTIVE",
        phone: u.phone || null,
        avatarUrl: u.avatarUrl || null,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalDeposited: Math.round(totalDeposited * 100) / 100,
        canChat: Boolean(u.canChat),
        isPromoter: Boolean(u.isPromoter),
        referralCode: u.referralCode || null,
        referralCommissionRate: u.referralCommissionRate ?? 5.0,
        influencerChannel: u.influencerChannel || null,
        orderCount: u.orders.length,
        depositCount: u.upiPayments.length + u.cryptoPayments.length,
        createdAt: u.createdAt
      };
    });

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}

// PUT /api/admin/users - Adjust balance or update user role/status/canChat/affiliate
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, balanceAdjust, setBalance, role, status, name, canChat, isPromoter, referralCode, influencerChannel } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID or Email is required" }, { status: 400 });
    }

    const cleanId = String(userId).trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { email: cleanId.toLowerCase() }
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (setBalance !== undefined) {
      updateData.balance = Number(setBalance);
    } else if (balanceAdjust !== undefined) {
      updateData.balance = { increment: Number(balanceAdjust) };
    }

    if (role && (role === "ADMIN" || role === "USER")) {
      updateData.role = role;
    }

    if (status && ["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      updateData.status = status;
    }

    if (canChat !== undefined) {
      updateData.canChat = Boolean(canChat);
    }

    if (name) {
      updateData.name = name;
    }

    if (isPromoter !== undefined) {
      const boolPromoter = Boolean(isPromoter);
      updateData.isPromoter = boolPromoter;
      if (boolPromoter) {
        updateData.isInfluencer = true;
        // If user has no referral code yet, auto-generate one
        if (!existing.referralCode && !referralCode) {
          const { generateUniqueReferralCode } = await import("@/lib/referral");
          updateData.referralCode = await generateUniqueReferralCode(existing.name || existing.email.split("@")[0]);
        }
      }
    }

    if (referralCode !== undefined) {
      const cleanCode = String(referralCode).trim().toUpperCase();
      if (cleanCode) {
        if (!/^[A-Z0-9_-]{3,25}$/.test(cleanCode)) {
          return NextResponse.json({ error: "Referral code must be 3-25 characters (letters, numbers, underscores/dashes)" }, { status: 400 });
        }
        const conflict = await prisma.user.findFirst({
          where: {
            referralCode: cleanCode,
            NOT: { id: existing.id }
          }
        });
        if (conflict) {
          return NextResponse.json({ error: `Referral code "${cleanCode}" is already taken by another user.` }, { status: 400 });
        }
        updateData.referralCode = cleanCode;
      }
    }

    if (influencerChannel !== undefined) {
      updateData.influencerChannel = String(influencerChannel).trim();
    }

    if (body.referralCommissionRate !== undefined) {
      const rateNum = Number(body.referralCommissionRate);
      if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
        return NextResponse.json({ error: "Commission rate must be a valid percentage between 0% and 100%" }, { status: 400 });
      }
      updateData.referralCommissionRate = rateNum;
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const cleanId = String(userId).trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { email: cleanId.toLowerCase() }
        ]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existing.id === session.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
