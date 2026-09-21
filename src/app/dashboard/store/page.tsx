"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Wallet,
  Plus,
  Flame,
  Star,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  BookOpen,
  GraduationCap,
  FileText,
  Layers,
  Wrench,
  Package,
  Video,
  Play,
  Copy,
  Check,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowUpRight
} from "lucide-react";

interface StoreProduct {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  iconType: string | null;
  imageUrl: string | null;
  buttonText: string;
  deliveryUrl: string | null;
  deliveryContent: string | null;
  isOwned: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { key: "ALL", label: "All Products" },
  { key: "APPS", label: "Apps" },
  { key: "COURSES", label: "Courses" },
  { key: "EBOOKS_PDF", label: "Ebooks / PDF" },
  { key: "GUIDES", label: "Guides" },
  { key: "TEMPLATES", label: "Templates" },
  { key: "TOOLS", label: "Tools" },
  { key: "BUNDLES", label: "Bundles" },
];

export default function StorePage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<StoreProduct | null>(null);
  const [buying, setBuying] = useState<boolean>(false);
  const [selectedProductForAccess, setSelectedProductForAccess] = useState<StoreProduct | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Admin Modal state
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [adminSaving, setAdminSaving] = useState<boolean>(false);
  const [adminForm, setAdminForm] = useState({
    title: "",
    category: "APPS",
    description: "",
    price: 499,
    originalPrice: "",
    badge: "NONE",
    iconType: "tools",
    imageUrl: "",
    buttonText: "Get Now",
    deliveryUrl: "https://t.me/botclips_online",
    deliveryContent: "",
    sortOrder: 0,
    isActive: true,
  });

  // Notifications / Feedback
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    setLoading(true);
    try {
      const res = await fetch("/api/store");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setUserBalance(Number(data.userBalance || 0));
        setIsAdmin(Boolean(data.isAdmin));
        setPurchasedIds(data.purchasedProductIds || []);
      } else {
        setBannerNotice({ type: "error", text: data.error || "Failed to load store catalog." });
      }
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "Failed to load store." });
    } finally {
      setLoading(false);
    }
  }

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        activeCategory === "ALL" ||
        p.category.toUpperCase() === activeCategory ||
        (activeCategory === "EBOOKS_PDF" &&
          (p.category.toUpperCase() === "EBOOKS_PDF" ||
            p.category.toUpperCase() === "EBOOKS" ||
            p.category.toUpperCase() === "PDF"));

      const matchSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Handle Buy Product
  async function handleConfirmPurchase() {
    if (!selectedProductForBuy) return;
    setBuying(true);
    setBannerNotice(null);

    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductForBuy.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBannerNotice({
          type: "error",
          text: data.error || "Purchase failed. Please check your wallet balance.",
        });
        setSelectedProductForBuy(null);
        return;
      }

      // Update state locally
      if (typeof data.newBalance === "number") {
        setUserBalance(data.newBalance);
        window.dispatchEvent(new Event("balance_updated"));
      }

      setPurchasedIds((prev) => [...prev, selectedProductForBuy.id]);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === selectedProductForBuy.id
            ? {
                ...item,
                isOwned: true,
                deliveryUrl: data.product?.deliveryUrl || item.deliveryUrl,
                deliveryContent: data.product?.deliveryContent || item.deliveryContent,
              }
            : item
        )
      );

      // Open access modal
      setSelectedProductForAccess({
        ...selectedProductForBuy,
        isOwned: true,
        deliveryUrl: data.product?.deliveryUrl,
        deliveryContent: data.product?.deliveryContent,
      });

      setSelectedProductForBuy(null);
      setBannerNotice({
        type: "success",
        text: data.message || `Unlocked "${selectedProductForBuy.title}"!`,
      });
    } catch (err: any) {
      setBannerNotice({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setBuying(false);
    }
  }

  // Handle Admin Delete
  async function handleDeleteProduct(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/store?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setBannerNotice({ type: "success", text: `Product "${title}" deleted.` });
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert(err.message || "Delete error");
    }
  }

  // Open Edit Admin Modal
  function openEditModal(prod: StoreProduct) {
    setEditingProduct(prod);
    setAdminForm({
      title: prod.title,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : "",
      badge: prod.badge || "NONE",
      iconType: prod.iconType || "tools",
      imageUrl: prod.imageUrl || "",
      buttonText: prod.buttonText || "Get Now",
      deliveryUrl: prod.deliveryUrl || "https://t.me/botclips_online",
      deliveryContent: prod.deliveryContent || "",
      sortOrder: 0,
      isActive: true,
    });
    setShowAdminModal(true);
  }

  // Open Add Product Admin Modal
  function openAddModal() {
    setEditingProduct(null);
    setAdminForm({
      title: "",
      category: "APPS",
      description: "",
      price: 499,
      originalPrice: "",
      badge: "NONE",
      iconType: "tools",
      imageUrl: "",
      buttonText: "Get Now",
      deliveryUrl: "https://t.me/botclips_online",
      deliveryContent: "",
      sortOrder: products.length + 1,
      isActive: true,
    });
    setShowAdminModal(true);
  }

  // Handle Admin Form Submit
  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdminSaving(true);

    try {
      const payload: any = {
        title: adminForm.title,
        category: adminForm.category,
        description: adminForm.description,
        price: Number(adminForm.price),
        originalPrice: adminForm.originalPrice ? Number(adminForm.originalPrice) : null,
        badge: adminForm.badge === "NONE" ? null : adminForm.badge,
        iconType: adminForm.iconType,
        imageUrl: adminForm.imageUrl || null,
        buttonText: adminForm.buttonText,
        deliveryUrl: adminForm.deliveryUrl,
        deliveryContent: adminForm.deliveryContent,
        sortOrder: Number(adminForm.sortOrder) || 0,
        isActive: adminForm.isActive,
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
        const res = await fetch("/api/admin/store", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data.product } : p))
          );
          setShowAdminModal(false);
          setBannerNotice({ type: "success", text: "Product updated successfully!" });
        } else {
          alert(data.error || "Failed to update product");
        }
      } else {
        const res = await fetch("/api/admin/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [data.product, ...prev]);
          setShowAdminModal(false);
          setBannerNotice({ type: "success", text: "Product created successfully!" });
        } else {
          alert(data.error || "Failed to create product");
        }
      }
    } catch (err: any) {
      alert(err.message || "Admin save error");
    } finally {
      setAdminSaving(false);
    }
  }

  // Render Product Icon
  function renderProductIcon(iconType: string | null) {
    const type = (iconType || "").toLowerCase();

    if (type.includes("instagram") || type === "ig") {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </div>
      );
    }

    if (type.includes("tiktok")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#010101] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-pink-500/20" />
          <svg className="w-6 h-6 relative z-10 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
          </svg>
        </div>
      );
    }

    if (type.includes("youtube") || type === "yt") {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20 text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      );
    }

    if (type.includes("course") || type.includes("guide")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
      );
    }

    if (type.includes("pdf") || type.includes("ebook")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 via-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
          <FileText className="w-6 h-6" />
        </div>
      );
    }

    if (type.includes("template")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
          <Layers className="w-6 h-6" />
        </div>
      );
    }

    if (type.includes("bundle")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25 text-white animate-pulse">
          <Package className="w-6 h-6" />
        </div>
      );
    }

    // Default / Tools
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
        <Wrench className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Banner Notice */}
      {bannerNotice && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            bannerNotice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {bannerNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{bannerNotice.text}</p>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wide">
              <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Clipping Stuffs</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-blue-400">Store</span>
            </div>

            {/* Title & Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Clipping Stuffs Store
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-xs">
                👑 Premium Content
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Instant access to viral clipping software, whop guides, analytics boosters, and
              exclusive creator resources. Deducted automatically from your wallet balance.
            </p>
          </div>

          {/* Right Wallet Balance Card & Admin Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Wallet Display */}
            <div className="bg-[#111827]/90 border border-slate-700/60 rounded-xl p-3.5 px-4 flex items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Wallet Balance
                  </div>
                  <div className="text-lg font-black text-white">
                    ₹{userBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/wallet"
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-blue-500/25"
                title="Add Funds to Wallet"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Admin Add Button */}
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500"
                    : "bg-[#111827] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading store items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `No results match "${searchQuery}". Try a different keyword or reset filters.`
              : "There are no products in this category at the moment."}
          </p>
          {(searchQuery || activeCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("ALL");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const isOwned = product.isOwned || purchasedIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-[#111827] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/90 transition-all hover:shadow-xl hover:shadow-blue-500/5 group relative"
              >
                {/* Admin Quick Action Floating Buttons */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Card Top */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Platform / Product Icon */}
                    {renderProductIcon(product.iconType)}

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-1.5 pt-0.5">
                      {isOwned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <Check className="w-3 h-3 stroke-[3]" /> Owned
                        </span>
                      ) : product.badge === "HOT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                          <Flame className="w-3 h-3 fill-rose-500 text-rose-500" /> Hot
                        </span>
                      ) : product.badge === "BESTSELLER" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Bestseller
                        </span>
                      ) : null}

                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Price & Button */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-white">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs font-semibold text-slate-500 line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Instant Delivery</span>
                  </div>

                  {/* Action Button */}
                  {isOwned ? (
                    <button
                      onClick={() => setSelectedProductForAccess(product)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Access Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedProductForBuy(product)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      {product.buttonText || "Get Now"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust Banner Footer */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-center sm:text-left mt-10">
        <div className="flex items-center gap-3.5 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Access</h4>
            <p className="text-[11px] text-slate-400">Receive download links & guides immediately.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Safe</h4>
            <p className="text-[11px] text-slate-400">Tested and verified working tools & resources.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lifetime Updates</h4>
            <p className="text-[11px] text-slate-400">Access ongoing updates and Telegram support.</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Purchase Confirmation Modal */}
      {/* ========================================================================= */}
      {selectedProductForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Purchase</h3>
                  <p className="text-[11px] text-slate-400">1-Click Wallet Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForBuy(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                {renderProductIcon(selectedProductForBuy.iconType)}
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">{selectedProductForBuy.title}</h4>
                  <p className="text-xs text-slate-400">{selectedProductForBuy.description}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Product Price:</span>
                  <span className="text-white font-bold">
                    ₹{selectedProductForBuy.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Your Current Balance:</span>
                  <span className="text-white font-bold">₹{userBalance.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Remaining Balance:</span>
                  <span
                    className={
                      userBalance >= selectedProductForBuy.price
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    ₹{(userBalance - selectedProductForBuy.price).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Insufficient Balance Alert */}
              {userBalance < selectedProductForBuy.price && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3 text-rose-400 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Insufficient funds in wallet</span>
                  </div>
                  <Link
                    href="/dashboard/wallet"
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] whitespace-nowrap"
                  >
                    Add Funds
                  </Link>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProductForBuy(null)}
                disabled={buying}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={buying || userBalance < selectedProductForBuy.price}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all ${
                  userBalance < selectedProductForBuy.price
                    ? "bg-slate-700 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 cursor-pointer hover:scale-105 active:scale-95"
                }`}
              >
                {buying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Buy (₹{selectedProductForBuy.price})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Product Delivery / Access Modal */}
      {/* ========================================================================= */}
      {selectedProductForAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Product Delivery & Access</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Ready for immediate access</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForAccess(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-bold text-white">{selectedProductForAccess.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedProductForAccess.description}
                </p>
              </div>

              {/* Instructions / Content */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Access Instructions & Details:
                </span>
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedProductForAccess.deliveryContent ||
                    "Click the button below to join the channel or download the full software/document bundle."}
                </p>
              </div>

              {/* URL Access Box */}
              {selectedProductForAccess.deliveryUrl && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Direct Link:
                  </span>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedProductForAccess.deliveryUrl}
                      className="w-full bg-transparent text-xs text-blue-400 focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProductForAccess.deliveryUrl) {
                          navigator.clipboard.writeText(selectedProductForAccess.deliveryUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      title="Copy URL"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProductForAccess(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Close
              </button>

              {selectedProductForAccess.deliveryUrl && (
                <a
                  href={selectedProductForAccess.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Direct Link / Channel
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Admin Add / Edit Modal */}
      {/* ========================================================================= */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingProduct ? `Edit "${editingProduct.title}"` : "Add New Store Product"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Admin Control Panel</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.title}
                    onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                    placeholder="e.g. Insight Editor IG"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={adminForm.category}
                    onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="APPS">Apps</option>
                    <option value="COURSES">Courses</option>
                    <option value="EBOOKS_PDF">Ebooks / PDF</option>
                    <option value="GUIDES">Guides</option>
                    <option value="TEMPLATES">Templates</option>
                    <option value="TOOLS">Tools</option>
                    <option value="BUNDLES">Bundles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                  placeholder="Short description of what the user receives..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={adminForm.price}
                    onChange={(e) => setAdminForm({ ...adminForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1999"
                    value={adminForm.originalPrice}
                    onChange={(e) => setAdminForm({ ...adminForm, originalPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Badge Tag
                  </label>
                  <select
                    value={adminForm.badge}
                    onChange={(e) => setAdminForm({ ...adminForm, badge: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="NONE">None</option>
                    <option value="HOT">HOT 🔥</option>
                    <option value="BESTSELLER">BESTSELLER ⭐</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Icon Type
                  </label>
                  <select
                    value={adminForm.iconType}
                    onChange={(e) => setAdminForm({ ...adminForm, iconType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="tools">Tools (Wrench)</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="course">Course / Guide</option>
                    <option value="pdf">PDF / eBook</option>
                    <option value="templates">Templates</option>
                    <option value="bundle">Bundle Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={adminForm.buttonText}
                    onChange={(e) => setAdminForm({ ...adminForm, buttonText: e.target.value })}
                    placeholder="Install Now / Get Now / Read Now"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Delivery Access URL (Telegram link, Mega, Drive, etc.) *
                </label>
                <input
                  type="url"
                  required
                  value={adminForm.deliveryUrl}
                  onChange={(e) => setAdminForm({ ...adminForm, deliveryUrl: e.target.value })}
                  placeholder="https://t.me/your_private_channel_or_download_link"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Delivery Instructions / Setup Guide
                </label>
                <textarea
                  rows={3}
                  value={adminForm.deliveryContent}
                  onChange={(e) => setAdminForm({ ...adminForm, deliveryContent: e.target.value })}
                  placeholder="Enter setup steps or message displayed to the buyer immediately after purchase..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={adminForm.isActive}
                  onChange={(e) => setAdminForm({ ...adminForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-300">
                  Visible in Store (Active)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminSaving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  {adminSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
