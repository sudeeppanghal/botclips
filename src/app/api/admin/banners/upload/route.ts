import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate mime type: JPG, PNG, WebP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP images are supported." },
        { status: 400 }
      );
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size exceeds 8MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/banners directory exists
    const uploadDir = path.join(process.cwd(), "public", "banners");
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize filename and create unique name
    const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const fileName = `banner_${Date.now()}_${cleanBase}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/banners/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
    });
  } catch (err: any) {
    console.error("Banner image upload failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
