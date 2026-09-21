import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      category,
      description,
      price,
      originalPrice,
      badge,
      iconType,
      imageUrl,
      buttonText,
      deliveryUrl,
      deliveryContent,
      isActive,
      sortOrder,
    } = body;

    if (!title || !description || price === undefined) {
      return NextResponse.json({ error: "Title, description, and price are required." }, { status: 400 });
    }

    const product = await prisma.storeProduct.create({
      data: {
        title: String(title).trim(),
        category: String(category || "APPS").toUpperCase().trim(),
        description: String(description).trim(),
        price: Math.max(0, Number(price) || 0),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        badge: badge ? String(badge).trim().toUpperCase() : null,
        iconType: iconType ? String(iconType).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        buttonText: buttonText ? String(buttonText).trim() : "Get Now",
        deliveryUrl: deliveryUrl ? String(deliveryUrl).trim() : null,
        deliveryContent: deliveryContent ? String(deliveryContent).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Product "${product.title}" created successfully!`,
      product,
    });
  } catch (error: any) {
    console.error("POST /api/admin/store error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      title,
      category,
      description,
      price,
      originalPrice,
      badge,
      iconType,
      imageUrl,
      buttonText,
      deliveryUrl,
      deliveryContent,
      isActive,
      sortOrder,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const existing = await prisma.storeProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updated = await prisma.storeProduct.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        category: category !== undefined ? String(category).toUpperCase().trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        price: price !== undefined ? Math.max(0, Number(price) || 0) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : undefined,
        badge: badge !== undefined ? (badge ? String(badge).trim().toUpperCase() : null) : undefined,
        iconType: iconType !== undefined ? (iconType ? String(iconType).trim() : null) : undefined,
        imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : undefined,
        buttonText: buttonText !== undefined ? String(buttonText).trim() : undefined,
        deliveryUrl: deliveryUrl !== undefined ? (deliveryUrl ? String(deliveryUrl).trim() : null) : undefined,
        deliveryContent: deliveryContent !== undefined ? (deliveryContent ? String(deliveryContent).trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Product "${updated.title}" updated successfully!`,
      product: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/store error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await prisma.storeProduct.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/store error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
