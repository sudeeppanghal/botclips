"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Clock, 
  ShieldCheck 
} from "lucide-react";
import { PlatformType } from "@/lib/types";
import DeliveryGraphSelectorModal from "@/components/DeliveryGraphSelectorModal";
import { DeliveryCurve, getDeliveryGraphById } from "@/lib/delivery-graphs";

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

  // Custom Delivery Graph State
  const [selectedGraph, setSelectedGraph] = useState<DeliveryCurve>(getDeliveryGraphById("viral_exp_takeoff"));
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

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

  if (!isOpen) return null;

  const totalQuantity = isDripFeed ? quantity * runs : quantity;
  const totalCost = (totalQuantity / 1000) * ratePer1k;
  const hasSufficientBalance = walletBalance >= totalCost;

  const categoriesByPlatform: Record<PlatformType, string[]> = {
    INSTAGRAM: [
      "Instagram Followers [Instant & High Quality]",
      "Instagram Likes [High Retention]",
      "Instagram Views & Reels Growth",
      "Instagram Comments & Saves"
    ],
    YOUTUBE: [
      "YouTube Views [Monetizable]",
      "YouTube Subscribers [Non-Drop]",
      "YouTube Watch Time Hours",
      "YouTube Likes & Comments"
    ],
    TIKTOK: [
      "TikTok Followers [Guaranteed]",
      "TikTok Video Views [Viral]",
      "TikTok Likes & Shares"
    ],
    TELEGRAM: [
      "Telegram Channel Members",
      "Telegram Post Views",
      "Telegram Group Members"
    ],
    TWITTER: [
      "Twitter (X) Followers",
      "Twitter (X) Retweets & Likes",
      "Twitter (X) Impressions"
    ],
    FACEBOOK: [
      "Facebook Page Likes & Followers",
      "Facebook Post Likes",
      "Facebook Video Views"
    ],
    SPOTIFY: [
      "Spotify Track Streams",
      "Spotify Monthly Listeners",
      "Spotify Playlist Followers"
    ],
    OTHER: [
      "Website Traffic [Google Organic]",
      "Discord Members",
      "Twitch Channel Followers"
    ]
  };

  const handlePlatformChange = (p: PlatformType) => {
    setPlatform(p);
    const cats = categoriesByPlatform[p];
    if (cats && cats.length > 0) {
      setCategory(cats[0]);
      if (p === "INSTAGRAM") {
        setService("1024 - Instagram Real HQ Followers [Instant]");
        setRatePer1k(180);
      } else if (p === "YOUTUBE") {
        setService("2011 - YouTube High Retention Monetizable Views");
        setRatePer1k(240);
      } else if (p === "TIKTOK") {
        setService("3015 - TikTok Real Followers [Guaranteed]");
        setRatePer1k(190);
      } else if (p === "TELEGRAM") {
        setService("4010 - Telegram Channel Members [Non-Drop]");
        setRatePer1k(120);
      } else {
        setService("5001 - Twitter (X) Active Likes & Retweets");
        setRatePer1k(110);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!link.trim()) {
      setError("Please provide a valid URL / link for this order.");
      return;
    }

    if (quantity < 50) {
      setError("Minimum quantity is 50.");
      return;
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient balance. Cost is ${currencySymbol}${totalCost.toFixed(2)}, but you only have ${currencySymbol}${walletBalance.toFixed(2)}. Please add funds.`);
      return;
    }

    setSubmitting(true);

    try {
      // Send order to API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          category,
          service,
          link,
          quantity: totalQuantity,
          charge: totalCost,
          deliveryGraphId: selectedGraph.id,
          deliveryGraphName: selectedGraph.name,
          durationHours: selectedGraph.durationHours,
          runs: isDripFeed ? runs : 1,
          intervalMinutes: isDripFeed ? interval : 0
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit order");
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
      setError(err.message || "Failed to submit order. Please check your balance or try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Place New Order</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instant dispatch via automated SMM API</p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Order placed successfully! Dispatched to provider.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="my-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Platform Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Platform
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["INSTAGRAM", "YOUTUBE", "TIKTOK", "TELEGRAM", "TWITTER"] as PlatformType[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    platform === p
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {p === "TWITTER" ? "Twitter (X)" : p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            >
              {categoriesByPlatform[platform]?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Service Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Service
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Rate: ₹{ratePer1k.toFixed(2)} (${(ratePer1k / 96).toFixed(2)}) / 1k
              </span>
            </div>
            <select
              value={service}
              onChange={(e) => {
                const val = e.target.value;
                setService(val);
                const found = availableServices.find(s => s.name === val || `${s.serviceId || s.id} - ${s.name}` === val);
                if (found) {
                  setRatePer1k(Number(found.rate || 120));
                  if (found.cat) setCategory(found.cat);
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            >
              {availableServices.length > 0 ? (
                availableServices.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} — ₹{Number(s.rate).toFixed(2)} (${(Number(s.rate) / 96).toFixed(2)}) / 1k
                  </option>
                ))
              ) : (
                <>
                  <option value={service}>{service}</option>
                  <option value="High Speed Cluster A Node">High Speed Cluster A Node (0% Loss)</option>
                  <option value="Ultra Retention Cluster B Node">Ultra Retention Cluster B Node (Anti-Drop)</option>
                </>
              )}
            </select>
          </div>

          {/* Target Link */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Link (Profile, Video, or Channel URL)
            </label>
            <input
              type="text"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/username or post link..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Quantity
              </label>
              <span className="text-xs text-slate-400">Min: 50 | Max: 1,000,000</span>
            </div>
            <input
              type="number"
              min="50"
              max="1000000"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            />
          </div>

          {/* ──────────────── CUSTOM DELIVERY GRAPH (60 PRESETS) ──────────────── */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:to-transparent border border-blue-200/80 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Delivery Velocity Graph
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white uppercase">
                  60 Presets
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGraphModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Customize Graph</span>
                <TrendingUp className="w-3 h-3" />
              </button>
            </div>

            {/* Selected Graph Preview Card */}
            <div 
              onClick={() => setGraphModalOpen(true)}
              className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 transition-colors"
            >
              <div className="space-y-1 max-w-[270px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {selectedGraph.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Clock className="w-3 h-3" /> {selectedGraph.durationHours}h Pace
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> {selectedGraph.safetyRating}% Safe
                  </span>
                </div>
              </div>

              {/* Mini SVG curve preview */}
              <div className="w-24 h-11 bg-slate-950 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-800">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-400" preserveAspectRatio="none">
                  <path d={selectedGraph.svgPath} fill="none" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              {selectedGraph.description}
            </p>
          </div>

          {/* Drip-Feed Option */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDripFeed}
                onChange={(e) => setIsDripFeed(e.target.checked)}
                className="w-4 h-4 rounded-md accent-blue-600"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enable Multi-Run Pacing (Sub-Batch Intervals)
              </span>
            </label>

            {isDripFeed && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Runs (Batches)</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={runs}
                    onChange={(e) => setRuns(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Interval (Minutes)</label>
                  <input
                    type="number"
                    min="10"
                    max="1440"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Balance Overview with Dual Currency */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Charge:</div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                ₹{totalCost.toFixed(2)} <span className="text-xs font-bold text-slate-400">(${(totalCost / 96).toFixed(2)})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Wallet Balance:</div>
              <div className={`text-sm font-bold ${hasSufficientBalance ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                ₹{walletBalance.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">(${(walletBalance / 96).toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Processing Order..." : "Confirm & Submit Order"}
          </button>
        </form>
      </div>

      <DeliveryGraphSelectorModal
        isOpen={graphModalOpen}
        onClose={() => setGraphModalOpen(false)}
        selectedGraphId={selectedGraph.id}
        onSelectGraph={(g) => setSelectedGraph(g)}
      />
    </div>
  );
}
