import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/admin/users - List all registered users
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
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

// PUT /api/admin/users - Adjust balance or update user role/status/canChat
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, balanceAdjust, setBalance, role, status, name, canChat } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
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

    const updated = await prisma.user.update({
      where: { id: userId },
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
    const session = await getSessionUser();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === session.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
