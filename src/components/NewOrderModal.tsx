"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Clock, 
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Eye,
  Heart,
  Share2,
  Bookmark,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Play
} from "lucide-react";
import { PlatformType } from "@/lib/types";
import DeliveryGraphSelectorModal from "@/components/DeliveryGraphSelectorModal";
import WhopClipperShowcaseModal from "@/components/WhopClipperShowcaseModal";
import AnimatedDeliveryCanvas from "@/components/AnimatedDeliveryCanvas";
import { 
  DeliveryCurve, 
  getDeliveryGraphById, 
  generateJitterSchedule, 
  JitterBatch 
} from "@/lib/delivery-graphs";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: PlatformType;
  walletBalance?: number;
  currencySymbol?: string;
  onOrderSuccess?: (newOrder: any) => void;
}

export default function NewOrderModal({
  isOpen,
  onClose,
  defaultPlatform = "INSTAGRAM",
  walletBalance = 0.00,
  currencySymbol = "₹",
  onOrderSuccess
}: NewOrderModalProps) {
  // Order Mode: "COMBO" (Whop Clippers Multi-Signal) vs "SINGLE"
  const [orderMode, setOrderMode] = useState<"COMBO" | "SINGLE">("COMBO");
  const [platform, setPlatform] = useState<PlatformType>(defaultPlatform);
  const [category, setCategory] = useState("Instagram Followers");
  const [service, setService] = useState("Instagram Real HQ Followers [Instant, 30 Days Refill]");
  const [ratePer1k, setRatePer1k] = useState(120);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [isDripFeed, setIsDripFeed] = useState(false);
  const [runs, setRuns] = useState(5);
  const [interval, setInterval] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Platform Curve Preset
  const [platformCurve, setPlatformCurve] = useState<"TIKTOK_REELS_S_CURVE" | "YOUTUBE_SHORTS_DRIP" | "WHOP_PAYOUT_BLITZ">("TIKTOK_REELS_S_CURVE");

  // Delivery Graph State (Default to Whop Clipper Signature)
  const [selectedGraph, setSelectedGraph] = useState<DeliveryCurve>(getDeliveryGraphById("whop_clipper_organic_signature"));
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [whopShowcaseOpen, setWhopShowcaseOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  // ── Whop Clipper Combo State ──
  const [includeViews, setIncludeViews] = useState(true);
  const [viewsCount, setViewsCount] = useState(10000);
  const [includeLikes, setIncludeLikes] = useState(true);
  const [likesCount, setLikesCount] = useState(380);
  const [includeShares, setIncludeShares] = useState(true);
  const [sharesCount, setSharesCount] = useState(80);
  const [includeSaves, setIncludeSaves] = useState(true);
  const [savesCount, setSavesCount] = useState(120);
  const [includeComments, setIncludeComments] = useState(true);
  const [commentsCount, setCommentsCount] = useState(25);
  const [durationHours, setDurationHours] = useState(24);
  const [showJitterDrawer, setShowJitterDrawer] = useState(false);

  // Catalog loading
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch(`/api/services?platform=${platform}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setAvailableServices(data.services);
          const first = data.services[0];
          setService(first.name);
          setRatePer1k(Number(first.rate || 120));
          if (first.cat) setCategory(first.cat);
        }
      } catch (e) {
        console.error("Failed to load services", e);
      }
    }
    if (isOpen) {
      loadCatalog();
    }
  }, [platform, isOpen]);

  // Rates for combo items (based on 3x wholesale node)
  const comboRates = useMemo(() => {
    switch (platform) {
      case "TIKTOK":
        return { viewsRate: 18.0, likesRate: 90.0, sharesRate: 60.0, savesRate: 60.0, commentsRate: 250.0 };
      case "YOUTUBE":
        return { viewsRate: 60.0, likesRate: 150.0, sharesRate: 80.0, savesRate: 80.0, commentsRate: 350.0 };
      default: // INSTAGRAM
        return { viewsRate: 15.0, likesRate: 45.0, sharesRate: 36.0, savesRate: 36.0, commentsRate: 360.0 };
    }
  }, [platform]);

  // Total calculation for Combo
  const totalComboCost = useMemo(() => {
    let sum = 0;
    if (includeViews) sum += (viewsCount / 1000) * comboRates.viewsRate;
    if (includeLikes) sum += (likesCount / 1000) * comboRates.likesRate;
    if (includeShares) sum += (sharesCount / 1000) * comboRates.sharesRate;
    if (includeSaves) sum += (savesCount / 1000) * comboRates.savesRate;
    if (includeComments) sum += (commentsCount / 1000) * comboRates.commentsRate;
    return Math.round(sum * 100) / 100;
  }, [includeViews, viewsCount, includeLikes, likesCount, includeShares, sharesCount, includeSaves, savesCount, includeComments, commentsCount, comboRates]);

  // Generate simulated non-linear jitter schedule with 4-signal pacing
  const jitterSchedule = useMemo(() => {
    return generateJitterSchedule({
      totalViews: includeViews ? viewsCount : 0,
      totalLikes: includeLikes ? likesCount : 0,
      totalShares: includeShares ? sharesCount : 0,
      totalSaves: includeSaves ? savesCount : 0,
      totalComments: includeComments ? commentsCount : 0,
      durationHours,
    });
  }, [includeViews, viewsCount, includeLikes, likesCount, includeShares, sharesCount, includeSaves, savesCount, includeComments, commentsCount, durationHours]);

  if (!isOpen) return null;

  // Single service calculations
  const totalSingleQuantity = isDripFeed ? quantity * runs : quantity;
  const totalSingleCost = (totalSingleQuantity / 1000) * ratePer1k;
  const activeTotalCost = orderMode === "COMBO" ? totalComboCost : totalSingleCost;
  const hasSufficientBalance = walletBalance >= activeTotalCost;

  // Presets for quick combo filling (Engineered for authentic 4-signal FYP virality)
  const applyPreset = (preset: "MICRO" | "VIRAL" | "MEGA") => {
    if (preset === "MICRO") {
      setViewsCount(5000);
      setLikesCount(190); // 3.8%
      setSharesCount(40);  // 0.8%
      setSavesCount(60);   // 1.2%
      setCommentsCount(12);
      setDurationHours(12);
      setPlatformCurve("TIKTOK_REELS_S_CURVE");
    } else if (preset === "VIRAL") {
      setViewsCount(10000);
      setLikesCount(380);  // 3.8%
      setSharesCount(80);   // 0.8%
      setSavesCount(120);  // 1.2%
      setCommentsCount(25);
      setDurationHours(24);
      setPlatformCurve("TIKTOK_REELS_S_CURVE");
    } else {
      setViewsCount(50000);
      setLikesCount(1900); // 3.8%
      setSharesCount(400);  // 0.8%
      setSavesCount(600);   // 1.2%
      setCommentsCount(120);
      setDurationHours(48);
      setPlatformCurve("TIKTOK_REELS_S_CURVE");
    }
  };

  const handlePlatformChange = (p: PlatformType) => {
    setPlatform(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!link.trim()) {
      setError("Please provide a valid video / post link for this order.");
      return;
    }

    if (orderMode === "COMBO") {
      if (includeViews && viewsCount < 100) {
        setError("Minimum views quantity is 100.");
        return;
      }
      if (includeLikes && likesCount < 50) {
        setError("Minimum likes quantity is 50.");
        return;
      }
      if (includeShares && sharesCount < 50) {
        setError("Minimum shares quantity is 50.");
        return;
      }
      if (includeSaves && savesCount < 50) {
        setError("Minimum saves quantity is 50.");
        return;
      }
      if (includeComments && commentsCount < 10) {
        setError("Minimum comments quantity is 10.");
        return;
      }
      if (!includeViews && !includeLikes && !includeShares && !includeSaves && !includeComments) {
        setError("Please select at least one metric to deliver.");
        return;
      }
    } else {
      if (quantity < 50) {
        setError("Minimum quantity is 50.");
        return;
      }
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient wallet balance. Total cost is ₹${activeTotalCost.toFixed(2)}, but you have ₹${walletBalance.toFixed(2)}. Please add funds on your Wallet page.`);
      return;
    }

    setSubmitting(true);

    try {
      const payload = orderMode === "COMBO" 
        ? {
            isCombo: true,
            platform,
            link,
            quantity: (includeViews ? viewsCount : 0) + (includeLikes ? likesCount : 0),
            charge: totalComboCost,
            durationHours,
            deliveryGraphId: selectedGraph.id,
            deliveryGraphName: selectedGraph.name,
            comboData: {
              views: includeViews ? viewsCount : 0,
              likes: includeLikes ? likesCount : 0,
              shares: includeShares ? sharesCount : 0,
              saves: includeSaves ? savesCount : 0,
              comments: includeComments ? commentsCount : 0,
              durationHours,
              platformCurve,
              batches: jitterSchedule.length,
            },
            jitterSchedule,
          }
        : {
            serviceId: availableServices.find(s => s.name === service)?.id || service,
            service,
            category,
            link,
            quantity: Number(quantity),
            runs: isDripFeed ? Number(runs) : 1,
            intervalMinutes: isDripFeed ? Number(interval) : 0,
            charge: totalSingleCost,
            deliveryGraphId: selectedGraph.id,
            deliveryGraphName: selectedGraph.name,
            durationHours: selectedGraph.durationHours,
          };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process order.");
      }

      setSuccess(true);
      if (onOrderSuccess) {
        onOrderSuccess(data.order);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to submit order. Please check balance and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative text-slate-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Mode Toggle */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Place Growth Order</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-signal algorithm pacing with non-linear time jitter
              </p>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setOrderMode("COMBO")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                orderMode === "COMBO"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Whop Clippers Viral Combo</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 uppercase">Best</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderMode("SINGLE")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                orderMode === "SINGLE"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Single Metric (Manual)</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="my-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              {orderMode === "COMBO" 
                ? "Whop Multi-Signal Combo dispatched with non-linear jitter schedule!" 
                : "Order placed successfully! Dispatched to provider node."}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="my-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Platform Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Target Platform
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["INSTAGRAM", "TIKTOK", "YOUTUBE", "TELEGRAM", "TWITTER"] as PlatformType[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    platform === p
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {p === "TWITTER" ? "Twitter (X)" : p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Target Link */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Target Video / Post Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://www.tiktok.com/@creator/video/123... or Instagram Reel URL"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
            />
          </div>

          {/* ──────────────── COMBO ENGINE UI ──────────────── */}
          {orderMode === "COMBO" ? (
            <div className="space-y-4">
              {/* Whop Clipper Explainer Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-amber-500">
                      Whop Clipper FYP Algorithmic Sync
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Synchronizes views, likes, shares, saves & comments to trigger explore recommendation.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhopShowcaseOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Explain Algorithm</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Preset Blueprint:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset("MICRO")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Micro (5k Views)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("VIRAL")}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Viral (10k Views)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("MEGA")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Mega (50k Views)
                  </button>
                </div>
              </div>

              {/* Platform FYP Curve Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Algorithmic Delivery Curve
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatformCurve("TIKTOK_REELS_S_CURVE")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      platformCurve === "TIKTOK_REELS_S_CURVE"
                        ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/30"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-500">⚡ Viral S-Curve</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Reels/TikTok</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Sigmoid warmup → viral FYP explosion → retention tail.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatformCurve("YOUTUBE_SHORTS_DRIP")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      platformCurve === "YOUTUBE_SHORTS_DRIP"
                        ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/30"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-rose-500">🌊 Steady Drip</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">YT Shorts</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Even Poisson micro-drips for search & browse index.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatformCurve("WHOP_PAYOUT_BLITZ")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      platformCurve === "WHOP_PAYOUT_BLITZ"
                        ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white shadow-xs ring-1 ring-amber-500/30"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-emerald-500">👑 Whop Blitz</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Fast 0/100</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Rapid 2-4h delivery designed to beat submission deadlines.
                    </p>
                  </button>
                </div>
              </div>

              {/* 4-Signal Live Engagement Health Ratio Card */}
              <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>4-Signal FYP Algorithm Balance</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    PASS AUDIT (0/100 BOT SCORE)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-bold">Views (100%)</div>
                    <div className="text-xs font-black text-cyan-500 mt-0.5">{includeViews ? viewsCount.toLocaleString() : 0}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-bold">Likes (~{includeViews && viewsCount > 0 ? ((likesCount / viewsCount) * 100).toFixed(1) : 0}%)</div>
                    <div className="text-xs font-black text-pink-500 mt-0.5">{includeLikes ? likesCount.toLocaleString() : 0}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-bold">Saves (~{includeViews && viewsCount > 0 ? ((savesCount / viewsCount) * 100).toFixed(1) : 0}%)</div>
                    <div className="text-xs font-black text-purple-500 mt-0.5">{includeSaves ? savesCount.toLocaleString() : 0}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-bold">Shares (~{includeViews && viewsCount > 0 ? ((sharesCount / viewsCount) * 100).toFixed(1) : 0}%)</div>
                    <div className="text-xs font-black text-amber-500 mt-0.5">{includeShares ? sharesCount.toLocaleString() : 0}</div>
                  </div>
                </div>
              </div>

              {/* Combo Metrics Customizer Cards */}
              <div className="space-y-2.5">
                {/* Views */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeViews}
                      onChange={(e) => setIncludeViews(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>Video Views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Min 100 • ₹{comboRates.viewsRate}/1k</span>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      disabled={!includeViews}
                      value={viewsCount}
                      onChange={(e) => setViewsCount(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Likes */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeLikes}
                      onChange={(e) => setIncludeLikes(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span>High Retention Likes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Min 50 • ₹{comboRates.likesRate}/1k</span>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      disabled={!includeLikes}
                      value={likesCount}
                      onChange={(e) => setLikesCount(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Shares */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeShares}
                      onChange={(e) => setIncludeShares(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>Direct Video Shares</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Min 50 • ₹{comboRates.sharesRate}/1k</span>
                    <input
                      type="number"
                      min={50}
                      step={25}
                      disabled={!includeShares}
                      value={sharesCount}
                      onChange={(e) => setSharesCount(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Saves */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeSaves}
                      onChange={(e) => setIncludeSaves(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Bookmark className="w-4 h-4 text-purple-400" />
                      <span>Post Saves / Bookmarks</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Min 50 • ₹{comboRates.savesRate}/1k</span>
                    <input
                      type="number"
                      min={50}
                      step={25}
                      disabled={!includeSaves}
                      value={savesCount}
                      onChange={(e) => setSavesCount(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Comments */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeComments}
                      onChange={(e) => setIncludeComments(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Positive Comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Min 10 • ₹{comboRates.commentsRate}/1k</span>
                    <input
                      type="number"
                      min={10}
                      step={5}
                      disabled={!includeComments}
                      value={commentsCount}
                      onChange={(e) => setCommentsCount(Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Window Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Delivery Duration Window (Non-Linear Jitter Pacing)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[
                    { hrs: 3, label: "3h (Fast)" },
                    { hrs: 6, label: "6h" },
                    { hrs: 12, label: "12h" },
                    { hrs: 24, label: "24h (Best)" },
                    { hrs: 48, label: "48h" },
                    { hrs: 72, label: "3 Days" },
                    { hrs: 168, label: "7 Days" },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.hrs}
                      onClick={() => setDurationHours(d.hrs)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        durationHours === d.hrs
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Non-Linear Jitter Schedule Drawer */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <button
                  type="button"
                  onClick={() => setShowJitterDrawer(!showJitterDrawer)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Live Non-Linear Jitter Schedule ({jitterSchedule.length} Batches Generated)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Anti-Spam Bypass
                    </span>
                  </div>
                  {showJitterDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showJitterDrawer && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] text-slate-400 mb-2">
                      Quantities and delay intervals are pseudo-randomized (e.g. 72, 63, 99, 101) to completely eliminate bot patterns.
                    </p>
                    <div className="grid grid-cols-6 gap-2 text-[10px] font-mono text-slate-400 font-bold px-2 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
                      <span>Time</span>
                      <span>Views</span>
                      <span>Likes</span>
                      <span>Shares</span>
                      <span>Saves</span>
                      <span>Comments</span>
                    </div>
                    {jitterSchedule.map((b) => (
                      <div
                        key={b.batchNumber}
                        className="grid grid-cols-6 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                      >
                        <span className="font-bold text-amber-400">{b.timeFormatted}</span>
                        <span>+{b.views}</span>
                        <span>+{b.likes}</span>
                        <span>+{b.shares}</span>
                        <span>+{b.saves}</span>
                        <span>+{b.comments}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ──────────────── SINGLE SERVICE UI ──────────────── */
            <div className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                >
                  {availableServices.map((s) => s.category || s.cat).filter((v, i, a) => a.indexOf(v) === i).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Service Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Service
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Rate: ₹{ratePer1k.toFixed(2)} (${(ratePer1k / 96).toFixed(2)}) / 1k
                  </span>
                </div>
                <select
                  value={service}
                  onChange={(e) => {
                    const sName = e.target.value;
                    setService(sName);
                    const found = availableServices.find(s => s.name === sName);
                    if (found) {
                      setRatePer1k(Number(found.rate || found.customRate || 120));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500 truncate"
                >
                  {availableServices.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} - ₹{s.rate || s.customRate} (${((s.rate || s.customRate) / 96).toFixed(2)}) / 1k
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quantity
                  </label>
                  <span className="text-[11px] text-slate-400">Min: 50 • Max: 500,000</span>
                </div>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Drip Feed Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Drip-Feed Batch Delivery</span>
                    <p className="text-[11px] text-slate-400">Evenly split delivery into multiple interval runs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDripFeed}
                    onChange={(e) => setIsDripFeed(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                {isDripFeed && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Runs</label>
                      <input
                        type="number"
                        min={2}
                        max={100}
                        value={runs}
                        onChange={(e) => setRuns(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Interval (Minutes)</label>
                      <input
                        type="number"
                        min={10}
                        max={1440}
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Velocity Graph Selector Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Active Delivery Curve
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedGraph.category.replace("_", " ")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGraphModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Customize Graph (62 Curves)</span>
              </button>
            </div>

            <AnimatedDeliveryCanvas
              curve={selectedGraph}
              height={110}
              showControls={false}
              showEngagementLayer={true}
              accentColor={selectedGraph.category === "WHOP_CLIPPERS" ? "#f59e0b" : "#06b6d4"}
              durationHours={selectedGraph.durationHours}
            />
          </div>

          {/* Price Summary & Submit Button */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Charge:</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{activeTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-500">
                Wallet Balance: ₹{walletBalance.toFixed(2)}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !hasSufficientBalance}
              className={`px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                hasSufficientBalance
                  ? orderMode === "COMBO"
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white shadow-amber-500/25"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25"
                  : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {submitting 
                  ? "Dispatched..." 
                  : hasSufficientBalance 
                    ? orderMode === "COMBO" 
                      ? "Launch Whop Clipper Combo" 
                      : "Submit Order" 
                    : "Insufficient Balance"}
              </span>
            </button>
          </div>
        </form>

        {/* Delivery Graph Selector Modal */}
        <DeliveryGraphSelectorModal
          isOpen={graphModalOpen}
          onClose={() => setGraphModalOpen(false)}
          selectedGraphId={selectedGraph.id}
          onSelectGraph={(g) => setSelectedGraph(g)}
        />

        {/* Whop Clipper Algorithmic Showcase Modal */}
        <WhopClipperShowcaseModal
          isOpen={whopShowcaseOpen}
          onClose={() => setWhopShowcaseOpen(false)}
          onApplyBlueprint={() => {
            setOrderMode("COMBO");
            applyPreset("VIRAL");
            setSelectedGraph(getDeliveryGraphById("whop_clipper_organic_signature"));
          }}
        />
      </div>
    </div>
  );
}
