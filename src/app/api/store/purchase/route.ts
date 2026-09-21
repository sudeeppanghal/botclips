import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to purchase products." }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...(session.email ? [{ email: session.email }] : [])
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const product = await prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product is currently unavailable." }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.storePurchase.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        message: "You already own this item!",
        alreadyOwned: true,
        product: {
          id: product.id,
          title: product.title,
          deliveryUrl: product.deliveryUrl,
          deliveryContent: product.deliveryContent,
        },
      });
    }

    // Check balance
    const cost = Math.max(0, product.price);
    if (user.balance < cost) {
      const shortage = cost - user.balance;
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. You need ₹${cost.toFixed(2)}, but your current balance is ₹${user.balance.toFixed(2)} (₹${shortage.toFixed(2)} shortage). Please add funds to continue.`,
          insufficientBalance: true,
          shortage,
          currentBalance: user.balance,
          price: cost,
        },
        { status: 400 }
      );
    }

    // Atomic transaction: deduct balance, record purchase
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: cost },
        },
        select: { id: true, balance: true },
      });

      const purchase = await tx.storePurchase.create({
        data: {
          userId: user.id,
          productId: product.id,
          amountPaid: cost,
        },
      });

      return { updatedUser, purchase };
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully purchased "${product.title}" for ₹${cost.toFixed(2)}!`,
      newBalance: result.updatedUser.balance,
      product: {
        id: product.id,
        title: product.title,
        deliveryUrl: product.deliveryUrl,
        deliveryContent: product.deliveryContent,
      },
    });
  } catch (error: any) {
    console.error("POST /api/store/purchase error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process purchase" },
      { status: 500 }
    );
  }
}
