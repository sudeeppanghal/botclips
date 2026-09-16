"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Zap,
  Clock,
  Wallet,
  User,
  Bell,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Link2,
  ChevronRight,
  Layers,
  QrCode,
  Copy,
  CheckCircle2,
  Share2,
  Send,
  MessageCircle,
  Eye,
  Heart,
  Bookmark,
  ArrowLeft,
  Search,
  Download
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

type TabType = "home" | "order" | "queue" | "wallet" | "profile" | "services";

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showSplash, setShowSplash] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"INSTAGRAM" | "TIKTOK" | "YOUTUBE">("INSTAGRAM");
  const [curveType, setCurveType] = useState<"S_CURVE" | "STEADY_DRIP" | "WHOP_BLITZ">("S_CURVE");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("10000");
  const [depositAmount, setDepositAmount] = useState("1000");
  const [cryptoNetwork, setCryptoNetwork] = useState<"TRC20" | "BEP20">("TRC20");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(154);
  const [walletBalance, setWalletBalance] = useState(2480.50);

  // Splash timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Live Jitter Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const numQty = parseInt(quantity, 10) || 0;
  const estLikes = Math.round(numQty * 0.038);
  const estSaves = Math.round(numQty * 0.012);
  const estShares = Math.round(numQty * 0.008);
  const estCostINR = (numQty / 1000) * 12.50;

  const cryptoAddress =
    cryptoNetwork === "TRC20"
      ? "TPw82xK9LmvZ7NqY3Wp4eF81aBC79021Zx"
      : "0x71C2B9a6E543eF98d348a1b2C54D891Ea2098b1C";

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-between p-8 text-white select-none">
        <div />
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-cyan-400/30 rounded-full blur-xl animate-pulse" />
            <img
              src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/branding/botclips-icon.png"
              alt="BotClips Mascot"
              className="w-24 h-24 relative object-contain drop-shadow-[0_0_25px_#00f2fe]"
              onError={(e) => {
                e.currentTarget.src = "/logo-icon.png";
              }}
            />
          </div>
          <div className="flex items-center text-4xl font-black tracking-tight">
            <span>Bot</span>
            <span className="text-cyan-400 ml-1">Clips</span>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2 shadow-[0_0_12px_#00f2fe] animate-ping" />
          </div>
          <span className="text-xs font-extrabold tracking-[0.25em] text-cyan-400 uppercase mt-2">
            VIRAL AUTOMATION
          </span>
          <p className="text-xs text-slate-400 mt-2">Organic Growth & Multi-Signal Engine</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-slate-500 tracking-wider">POWERED BY BOTCLIPS AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex justify-center selection:bg-cyan-500 selection:text-black">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md bg-[#070D1B] min-h-screen border-x border-cyan-950/40 flex flex-col relative shadow-2xl pb-24">
        
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-[#070D1B]/95 backdrop-blur-md px-4 py-3 border-b border-cyan-900/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-1 bg-cyan-400/40 rounded-full blur-sm" />
              <img
                src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/branding/botclips-icon.png"
                alt="BotClips Mascot"
                className="w-9 h-9 relative object-contain"
                onError={(e) => { e.currentTarget.src = "/logo-icon.png"; }}
              />
            </div>
            <div>
              <div className="flex items-center text-lg font-black tracking-tight leading-none">
                <span className="text-white">Bot</span>
                <span className="text-cyan-400 ml-0.5">Clips</span>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1.5 shadow-[0_0_8px_#00f2fe] animate-pulse" />
              </div>
              <span className="text-[8px] font-extrabold tracking-[0.2em] text-cyan-400/90 uppercase block mt-0.5">
                Viral Automation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-cyan-900/40 transition-colors"
            >
              <span>Web</span>
            </Link>
            <button className="w-8 h-8 rounded-full bg-slate-900/80 border border-cyan-500/20 flex items-center justify-center text-slate-300 relative">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
            </button>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "home" && (
            <div className="space-y-4 animate-fade-in">
              {/* User Greeting */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-white">Good Morning, Clipper</h1>
                  <p className="text-xs text-slate-400">Let's scale your organic FYP growth</p>
                </div>
                <div className="bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-300">Pro Tier</span>
                </div>
              </div>

              {/* Wallet Balance Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-blue-950/50 p-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-cyan-400">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>WALLET BALANCE</span>
                  </div>
                  <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                    INR (₹)
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-2">
                  <div className="text-3xl font-black text-white tracking-tight">
                    ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => setActiveTab("wallet")}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.3)] active:scale-95 transition-transform"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Auto-Jitter Active</span>
                  <span className="text-emerald-400 font-semibold">● Instant UPI & USDT</span>
                </div>
              </div>

              {/* Quick Actions 4-Tile Grid */}
              <div>
                <h2 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setActiveTab("order")}
                    className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-white">New Order</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("wallet")}
                    className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-white">Add Funds</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("queue")}
                    className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-white">Queue</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("profile")}
                    className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-white">Whop Payout</span>
                  </button>
                </div>
              </div>

              {/* Organic Curve Engine Graph */}
              <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-4 shadow-[0_0_15px_rgba(0,242,254,0.06)]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Organic Curve Engine</h3>
                    <p className="text-[11px] text-cyan-400 font-medium mt-0.5">
                      Sigmoid Velocity: 850 views/hr (78% FYP Ramp)
                    </p>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                </div>

                {/* SVG Curve visualization */}
                <div className="h-20 w-full my-2">
                  <svg className="w-full h-full" viewBox="0 0 320 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#1769FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 70 Q 70 65 140 40 T 230 15 T 320 12 L 320 80 L 0 80 Z"
                      fill="url(#curveGrad)"
                    />
                    <path
                      d="M 0 70 Q 70 65 140 40 T 230 15 T 320 12"
                      stroke="#00F2FE"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle cx="230" cy="15" r="4.5" fill="#FFFFFF" stroke="#00F2FE" strokeWidth="2" />
                  </svg>
                </div>

                <div className="border-t border-slate-800 pt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                    <span>0/100 Bot Index</span>
                  </div>
                  <div className="text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                    <span>4-Signal Synced</span>
                  </div>
                  <div className="text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                    <span>Audit-Proof</span>
                  </div>
                </div>
              </div>

              {/* Active Campaigns List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    Active Clip Campaigns
                  </h2>
                  <button onClick={() => setActiveTab("queue")} className="text-xs font-bold text-cyan-400">
                    View All
                  </button>
                </div>

                <div
                  onClick={() => {
                    setSelectedOrderId("#1901");
                    setActiveTab("queue");
                  }}
                  className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 p-3 rounded-xl flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center text-[10px] font-black">
                      REEL
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Instagram Reels - Viral S-Curve</h4>
                      <p className="text-[10px] text-slate-400">Order #1901 • 9,250 / 10,000 Views</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md">
                    92% Paced
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-SIGNAL NEW ORDER */}
          {activeTab === "order" && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Multi-Signal Order Studio</span>
              </h1>

              {/* Platform Selector */}
              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mb-1.5">
                  1. Select Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setPlatform("INSTAGRAM");
                      setCurveType("S_CURVE");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      platform === "INSTAGRAM"
                        ? "bg-pink-950/30 border-pink-500 text-white"
                        : "bg-slate-900/80 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-[10px] font-black text-white">
                      IG
                    </div>
                    <span className="text-[11px] font-bold">Instagram</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlatform("TIKTOK");
                      setCurveType("S_CURVE");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      platform === "TIKTOK"
                        ? "bg-cyan-950/40 border-cyan-400 text-white"
                        : "bg-slate-900/80 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-black border border-cyan-400 flex items-center justify-center text-[10px] font-black text-cyan-400">
                      TT
                    </div>
                    <span className="text-[11px] font-bold">TikTok FYP</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlatform("YOUTUBE");
                      setCurveType("STEADY_DRIP");
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      platform === "YOUTUBE"
                        ? "bg-red-950/30 border-red-500 text-white"
                        : "bg-slate-900/80 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black text-white">
                      YT
                    </div>
                    <span className="text-[11px] font-bold">YT Shorts</span>
                  </button>
                </div>
              </div>

              {/* Delivery Strategy */}
              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mb-1.5">
                  2. Delivery Strategy Curve
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setCurveType("S_CURVE")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      curveType === "S_CURVE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400"
                    }`}
                  >
                    Viral S-Curve
                  </button>
                  <button
                    onClick={() => setCurveType("STEADY_DRIP")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      curveType === "STEADY_DRIP" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400"
                    }`}
                  >
                    Steady Drip
                  </button>
                  <button
                    onClick={() => setCurveType("WHOP_BLITZ")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      curveType === "WHOP_BLITZ" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400"
                    }`}
                  >
                    Whop Blitz
                  </button>
                </div>
              </div>

              {/* 4-Signal Organic Ratio Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-3.5">
                <div className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase mb-2">
                  Synchronized 4-Signal Distribution
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-950/80 border border-cyan-500/20 p-2 rounded-xl">
                    <Eye className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-xs font-black text-white">100%</span>
                    <span className="text-[9px] text-slate-400 block">Views</span>
                    <span className="text-[9px] font-bold text-cyan-300">{numQty.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950/80 border border-pink-500/20 p-2 rounded-xl">
                    <Heart className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                    <span className="text-xs font-black text-white">~3.8%</span>
                    <span className="text-[9px] text-slate-400 block">Likes</span>
                    <span className="text-[9px] font-bold text-pink-400">+{estLikes.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950/80 border border-purple-500/20 p-2 rounded-xl">
                    <Bookmark className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <span className="text-xs font-black text-white">~1.2%</span>
                    <span className="text-[9px] text-slate-400 block">Saves</span>
                    <span className="text-[9px] font-bold text-purple-300">+{estSaves.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950/80 border border-emerald-500/20 p-2 rounded-xl">
                    <Share2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-black text-white">~0.8%</span>
                    <span className="text-[9px] text-slate-400 block">Shares</span>
                    <span className="text-[9px] font-bold text-emerald-300">+{estShares.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Target Link & Quantity */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mb-1">
                    Clip URL / Video Link
                  </label>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-cyan-400">
                    <Link2 className="w-4 h-4 text-cyan-400 mr-2" />
                    <input
                      type="url"
                      placeholder="https://instagram.com/reel/..."
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="bg-transparent flex-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mb-1">
                    Quantity (Views)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  />
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {["1000", "5000", "10000", "25000", "50000"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          quantity === q
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {parseInt(q) >= 1000 ? `${parseInt(q) / 1000}k` : q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Submit CTA */}
              <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Estimated Charge</span>
                  <span className="text-xl font-black text-cyan-400">₹{estCostINR.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    if (!link) {
                      alert("Please paste your video/clip link first.");
                      return;
                    }
                    alert(`🚀 Order BC-#${Math.floor(1000 + Math.random() * 9000)} scheduled with 4-Signal Jitter!`);
                    setActiveTab("queue");
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] active:scale-98 transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Place Organic Order</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE QUEUE & INSPECTOR */}
          {activeTab === "queue" && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Jitter Queue & Schedule</span>
              </h1>

              {/* Next Batch Countdown */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 p-4 border border-cyan-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                      Next Micro-Batch Dispatch
                    </span>
                    <div className="text-3xl font-black text-white tracking-tight mt-0.5">
                      {formatCountdown(countdown)}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold mt-2">
                  ● Pacing: Poisson Randomized Interval (2m 12s - 2m 48s)
                </p>
              </div>

              {/* Active Campaigns */}
              <div className="space-y-2.5">
                <h2 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  Active Dispatch Queue
                </h2>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-cyan-400">#1901</span>
                      <h4 className="text-xs font-bold text-white">Instagram Reels - Viral S-Curve</h4>
                    </div>
                    <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                      92% Paced
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[92%]" />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Delivered: <strong className="text-white">9,250 / 10,000</strong></span>
                    <span className="text-emerald-400 font-bold">Jitter: ±18.4%</span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px]">
                    <div className="flex gap-2">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-pink-400 font-medium">❤️ 365</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-400 font-medium">🔖 118</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-medium">🔄 79</span>
                    </div>
                    <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                      Inspector <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Milestone Flush Accumulator Card */}
                <div className="rounded-2xl bg-slate-900/80 border border-purple-500/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-black text-white">Multi-Signal Milestone Flush</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sub-orders (Likes/Saves/Shares) accumulate in micro-fractions and automatically flush to upstream network upon reaching milestone threshold (≥ 10).
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-xs font-black text-cyan-400">8,450</div>
                      <div className="text-[9px] text-slate-400">Signals Flushed</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-xs font-black text-emerald-400">0/100</div>
                      <div className="text-[9px] text-slate-400">Bot Index</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-xs font-black text-purple-400">12 Batches</div>
                      <div className="text-[9px] text-slate-400">Next Flush</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WALLET / ADD FUNDS */}
          {activeTab === "wallet" && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Instant Deposit Gateway</span>
              </h1>

              {/* UPI vs Crypto toggle */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCryptoNetwork("TRC20")}
                  className="py-2 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                >
                  Instant UPI (Zero Fee)
                </button>
                <button
                  onClick={() => setCryptoNetwork("BEP20")}
                  className="py-2 rounded-lg text-xs font-bold text-slate-400"
                >
                  Crypto (USDT)
                </button>
              </div>

              {/* High Contrast UPI QR Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 text-center space-y-3">
                <h3 className="text-xs font-extrabold text-white">Scan QR Code with Any UPI App</h3>
                <p className="text-[10px] text-slate-400">PhonePe • Google Pay • Paytm • CRED</p>

                {/* High Contrast QR Code Canvas */}
                <div className="inline-block p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                  <svg className="w-40 h-40" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#FFFFFF" rx="8" />
                    <rect x="10" y="10" width="24" height="24" fill="#030712" rx="4" />
                    <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
                    <rect x="18" y="18" width="8" height="8" fill="#1769FF" />

                    <rect x="66" y="10" width="24" height="24" fill="#030712" rx="4" />
                    <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
                    <rect x="74" y="18" width="8" height="8" fill="#1769FF" />

                    <rect x="10" y="66" width="24" height="24" fill="#030712" rx="4" />
                    <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" rx="2" />
                    <rect x="18" y="74" width="8" height="8" fill="#1769FF" />

                    <rect x="42" y="12" width="6" height="6" fill="#030712" />
                    <rect x="52" y="12" width="6" height="6" fill="#030712" />
                    <rect x="42" y="24" width="6" height="6" fill="#030712" />
                    <rect x="12" y="42" width="6" height="6" fill="#030712" />
                    <rect x="24" y="48" width="6" height="6" fill="#030712" />
                    <rect x="46" y="46" width="8" height="8" fill="#00F2FE" />
                    <rect x="62" y="42" width="6" height="6" fill="#030712" />
                    <rect x="76" y="46" width="6" height="6" fill="#030712" />
                    <rect x="42" y="64" width="6" height="6" fill="#030712" />
                    <rect x="54" y="72" width="6" height="6" fill="#030712" />
                    <rect x="68" y="66" width="6" height="6" fill="#030712" />
                  </svg>
                </div>

                <div className="text-xs text-slate-300">
                  UPI ID: <span className="font-mono text-cyan-400 font-bold">botclips@paytm</span>
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block mb-1.5">
                  Select Deposit Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["500", "1000", "2500", "5000"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        depositAmount === amt
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crypto Deposit Box */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-2.5">
                <div className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                  USDT Deposit Address (TRC-20)
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 break-all">
                  {cryptoAddress}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Address Copied!" : "Copy USDT Address"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE & WHOP PAYOUTS */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-fade-in">
              {/* Profile Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">Alex Rivera</h3>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">alex.clipper@botclips.online</p>
                  <p className="text-[10px] font-bold text-cyan-400 mt-0.5">Diamond Clipper Tier #77</p>
                </div>
              </div>

              {/* Whop Clipper Payouts */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 p-4 border border-cyan-500/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                      Total Clipper Revenue
                    </span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5">$338.4K</div>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    +$38.4K this mo
                  </span>
                </div>

                {/* Earnings Curve */}
                <div className="h-16 w-full">
                  <svg className="w-full h-full" viewBox="0 0 320 60" preserveAspectRatio="none">
                    <path
                      d="M 0 50 Q 80 40 160 25 T 320 8"
                      stroke="#00F2FE"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle cx="320" cy="8" r="4" fill="#FFFFFF" stroke="#00F2FE" strokeWidth="2" />
                  </svg>
                </div>

                <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400">
                  Next Goal: $500K • 76% to Grandmaster Bounty
                </div>
              </div>

              {/* Referral Program */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                <h3 className="text-xs font-black text-white">Invite Fellow Clippers (Earn 10%)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Earn 10% instant lifetime commission on all deposits made by your invited clippers.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert("Referral link copied to WhatsApp share intent!")}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => alert("Referral link copied to Telegram share intent!")}
                    className="py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Glowing Navigation Bar */}
        <nav className="fixed bottom-0 max-w-md w-full bg-[#070D1B]/95 backdrop-blur-xl border-t border-cyan-900/30 px-2 py-2 grid grid-cols-5 gap-1 z-30">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
              activeTab === "home" ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Home</span>
            {activeTab === "home" && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f2fe]" />}
          </button>

          <button
            onClick={() => setActiveTab("order")}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
              activeTab === "order" ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Order</span>
            {activeTab === "order" && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f2fe]" />}
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
              activeTab === "queue" ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Queue</span>
            {activeTab === "queue" && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f2fe]" />}
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
              activeTab === "wallet" ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Wallet</span>
            {activeTab === "wallet" && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f2fe]" />}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
              activeTab === "profile" ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Profile</span>
            {activeTab === "profile" && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_#00f2fe]" />}
          </button>
        </nav>
      </div>
    </div>
  );
}
