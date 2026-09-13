import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Check size limit (max 5MB per screenshot)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    // Check if Cloudinary is configured in AdminSettings or env
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    let uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;

    try {
      const settings = await prisma.adminSettings.findUnique({
        where: { id: "global" }
      });
      if (settings?.cloudinaryCloudName) {
        cloudName = settings.cloudinaryCloudName;
        uploadPreset = settings.cloudinaryUploadPreset || uploadPreset;
        apiKey = settings.cloudinaryApiKey || apiKey;
        apiSecret = settings.cloudinaryApiSecret || apiSecret;
      }
    } catch {
      // fallback to env
    }

    // If Cloudinary credentials exist, upload directly to Cloudinary
    if (cloudName) {
      try {
        const cldFormData = new URLSearchParams();
        cldFormData.append("file", base64Data);

        if (uploadPreset) {
          cldFormData.append("upload_preset", uploadPreset);
        } else if (apiKey && apiSecret) {
          const timestamp = Math.round(new Date().getTime() / 1000);
          cldFormData.append("timestamp", String(timestamp));
          cldFormData.append("api_key", apiKey);
          // signature can be generated if required or unsigned preset used
        }

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cldFormData,
        });

        const cldData = await cldRes.json();
        if (cldData.secure_url) {
          return NextResponse.json({
            success: true,
            url: cldData.secure_url,
            provider: "cloudinary",
          });
        }
      } catch (cldErr) {
        console.error("Cloudinary upload failed, falling back to data URL:", cldErr);
      }
    }

    // Resilient fallback: return optimized data URL so payment is never blocked
    return NextResponse.json({
      success: true,
      url: base64Data,
      provider: "direct_data",
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
