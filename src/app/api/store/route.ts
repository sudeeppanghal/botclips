import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const INITIAL_SEED_PRODUCTS = [
  {
    title: "Insight Editor IG",
    category: "APPS",
    badge: "HOT",
    iconType: "instagram",
    description: "Edit Instagram insights (change country, views, reach, etc)",
    price: 999,
    originalPrice: null,
    buttonText: "Install Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Instagram Insight Editor APK/Web tool setup instructions. Change country, views, reach and engagement metrics on Instagram effortlessly.",
    sortOrder: 1,
  },
  {
    title: "TikTok Insight Editor",
    category: "APPS",
    badge: null,
    iconType: "tiktok",
    description: "Modify TikTok analytics easily",
    price: 999,
    originalPrice: null,
    buttonText: "Install Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "TikTok Insight Editor software package and setup guide for iOS & Android.",
    sortOrder: 2,
  },
  {
    title: "YouTube View Booster",
    category: "APPS",
    badge: null,
    iconType: "youtube",
    description: "Safe tools to boost your YT growth",
    price: 1499,
    originalPrice: null,
    buttonText: "Install Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "YouTube View Booster automation tool + organic pacing script.",
    sortOrder: 3,
  },
  {
    title: "Whop Clipping Guide",
    category: "COURSES",
    badge: "BESTSELLER",
    iconType: "course",
    description: "Complete step by step guide to earn from clipping",
    price: 699,
    originalPrice: null,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Access link to the complete Master Whop Clipping video modules and step-by-step roadmap.",
    sortOrder: 4,
  },
  {
    title: "Whop Hacks (2026)",
    category: "EBOOKS_PDF",
    badge: null,
    iconType: "pdf",
    description: "Latest working tricks, tips and strategies",
    price: 399,
    originalPrice: null,
    buttonText: "Read Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Download link for Whop Hacks (2026 Edition) PDF eBook.",
    sortOrder: 5,
  },
  {
    title: "Latest Whop Updates",
    category: "EBOOKS_PDF",
    badge: null,
    iconType: "pdf",
    description: "Stay updated with latest rules, features and changes",
    price: 299,
    originalPrice: null,
    buttonText: "Read Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Download link for Latest Whop Rules & Algorithm Changes document.",
    sortOrder: 6,
  },
  {
    title: "Clipping Sites List",
    category: "TOOLS",
    badge: null,
    iconType: "tools",
    description: "100+ sites where you can find clips for your content",
    price: 199,
    originalPrice: null,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Direct link to the curated directory of 100+ viral stream and podcast clipping source sites.",
    sortOrder: 7,
  },
  {
    title: "Viral Editing Course",
    category: "COURSES",
    badge: null,
    iconType: "course",
    description: "Learn viral editing for Reels, Shorts and TikTok",
    price: 799,
    originalPrice: null,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Full viral editing course download with project files, sound effects, and transitions.",
    sortOrder: 8,
  },
  {
    title: "50 Viral Hooks",
    category: "EBOOKS_PDF",
    badge: null,
    iconType: "pdf",
    description: "Ready to use hooks for any niche",
    price: 199,
    originalPrice: null,
    buttonText: "Read Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Instant download of 50 High-Converting Viral Video Hooks & Scripts (PDF).",
    sortOrder: 9,
  },
  {
    title: "Thumbnail Templates",
    category: "TEMPLATES",
    badge: null,
    iconType: "templates",
    description: "High converting thumbnails (pack)",
    price: 299,
    originalPrice: null,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Photoshop & Canva high-converting YouTube and Reel thumbnail templates pack.",
    sortOrder: 10,
  },
  {
    title: "All in One Bundle",
    category: "BUNDLES",
    badge: "HOT",
    iconType: "bundle",
    description: "Apps + Courses + PDFs + Templates (Best Value)",
    price: 2999,
    originalPrice: 5999,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Complete Mega Vault Access: All apps, editing packs, courses, hooks, and guides included in one VIP drive.",
    sortOrder: 11,
  },
  {
    title: "Automation Scripts",
    category: "TOOLS",
    badge: null,
    iconType: "tools",
    description: "Auto post, auto upload, save time",
    price: 499,
    originalPrice: null,
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "Python & Node automation scripts for scheduled auto-posting and clipping workflows.",
    sortOrder: 12,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    // 1. Auto-seed if table is empty
    const productCount = await prisma.storeProduct.count();
    if (productCount === 0) {
      await prisma.storeProduct.createMany({
        data: INITIAL_SEED_PRODUCTS,
      });
    }

    // 2. Fetch all active products
    const products = await prisma.storeProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // 3. User details & purchased product IDs
    let userBalance = 0;
    let isAdmin = false;
    let purchasedProductIds: string[] = [];
    let userPurchases: any[] = [];

    if (session) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(session.id ? [{ id: session.id }] : []),
            ...(session.email ? [{ email: session.email }] : [])
          ]
        },
        select: {
          id: true,
          balance: true,
          role: true,
          storePurchases: {
            select: {
              productId: true,
              amountPaid: true,
              createdAt: true,
            },
          },
        },
      });

      if (user) {
        userBalance = user.balance;
        isAdmin = user.role === "ADMIN";
        purchasedProductIds = user.storePurchases.map((p) => p.productId);
        userPurchases = user.storePurchases;
      }
    }

    // Sanitize deliveryUrl and deliveryContent for unpurchased products if user is not admin
    const sanitizedProducts = products.map((p) => {
      const isOwned = purchasedProductIds.includes(p.id) || isAdmin;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        badge: p.badge,
        iconType: p.iconType,
        imageUrl: p.imageUrl,
        buttonText: p.buttonText,
        deliveryUrl: isOwned ? p.deliveryUrl : null,
        deliveryContent: isOwned ? p.deliveryContent : null,
        isOwned,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      products: sanitizedProducts,
      purchasedProductIds,
      userBalance,
      isAdmin,
    });
  } catch (error: any) {
    console.error("GET /api/store error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch store products" },
      { status: 500 }
    );
  }
}
