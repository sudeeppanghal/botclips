"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, 
  ShoppingCart, 
  Users, 
  Clock, 
  Star, 
  ArrowUpRight, 
  ChevronRight, 
  Zap, 
  Quote,
  Plus,
  Search,
  CreditCard,
  Code,
  Crown,
  ExternalLink
} from "lucide-react";
import NewOrderModal from "@/components/NewOrderModal";
import AddFundsModal from "@/components/AddFundsModal";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { PlatformType } from "@/lib/types";

export default function DashboardPage() {
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [userName, setUserName] = useState("User");
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("INSTAGRAM");
  
  // Real orders & loading state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Plan info
  const [planActive, setPlanActive] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      // 1. User details
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userData.authenticated && userData.user) {
        setWalletBalance(Number(userData.user.balance || 0));
        setUserName(userData.user.name || userData.user.email?.split("@")[0] || "User");
      }

      // 2. Real Orders
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();
      if (ordersData.success && Array.isArray(ordersData.orders)) {
        setRecentOrders(ordersData.orders);
      }

      // 3. Automation Plan Info
      const planRes = await fetch("/api/automation/plan");
      const planData = await planRes.json();
      if (planData.success && planData.plan) {
        setPlanActive(Boolean(planData.plan.planActive));
        setPlanType(planData.plan.planType || null);
        setPlanExpiresAt(planData.plan.planExpiresAt || null);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOrderCreated = (order: any) => {
    setRecentOrders(prev => [
      {
        id: order.id || "ord_" + Math.random().toString(36).substring(2, 8),
        service: { name: order.serviceName || "Social Campaign", platform: order.platform || "INSTAGRAM" },
        link: order.link || "https://social.media/link",
        quantity: Number(order.quantity || 1000),
        status: "PROCESSING",
        createdAt: new Date().toISOString(),
      },
      ...prev
    ]);
    if (order.charge) {
      setWalletBalance(b => Math.max(0, b - order.charge));
    }
  };

  const handleFundsAdded = (amt: number) => {
    setWalletBalance(b => b + amt);
  };

  const openNewOrderWithPlatform = (plat: PlatformType) => {
    setSelectedPlatform(plat);
    setNewOrderModalOpen(true);
  };

  // Metrics derived from real user orders
  const totalOrders = recentOrders.length;
  const activeOrders = recentOrders.filter(o => {
    const st = (o.status || "").toUpperCase();
    return st === "PROCESSING" || st === "PENDING" || st === "IN_PROGRESS";
  }).length;
  const completedOrders = recentOrders.filter(o => (o.status || "").toUpperCase() === "COMPLETED").length;
  const servicesUsed = new Set(recentOrders.map(o => o.serviceId || o.service?.name)).size;

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            Completed
          </span>
        );
      case "processing":
      case "in progress":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  // Platform Icon Helper
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case "INSTAGRAM":
        return (
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
            📸
          </div>
        );
      case "YOUTUBE":
        return (
          <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
            ▶
          </div>
        );
      case "TIKTOK":
        return (
          <div className="w-6 h-6 rounded-lg bg-black dark:bg-slate-900 flex items-center justify-center text-cyan-400 text-[11px] font-bold shadow-xs">
            🎵
          </div>
        );
      case "TELEGRAM":
        return (
          <div className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
            ✈
          </div>
        );
      case "TWITTER":
        return (
          <div className="w-6 h-6 rounded-lg bg-black dark:bg-slate-800 flex items-center justify-center text-white text-[10px] font-black shadow-xs">
            𝕏
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
            ★
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ──────────────── 1. Welcome Greeting & Top Wallet Card ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your SMM services, automations and more — all in one place.
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Wallet Balance</div>
            <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{walletBalance.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => setAddFundsModalOpen(true)}
            className="ml-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      {/* ──────────────── VIP Upgrade / Active Plan Banner ──────────────── */}
      {planActive ? (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  👑 Premium BYO-API Automation Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase">
                  {planType || "VIP"} PASS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Campaigns run directly on your own SMM panel API at 0% markup. {planExpiresAt ? `Active until ${new Date(planExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/dashboard/m-automation"
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Manage SMM API</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Extend Pass
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-300">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>Mode 2 • Premium Automation (BYO-API)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Connect Your Own SMM Panel API (0% Platform Markup)
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Use your own provider endpoint. Automatically sync balance and execute orders through your API credentials. Weekly: $10 (₹960) • Monthly: $25 (₹2,400).
            </p>
          </div>
          <div className="flex items-center gap-2.5 z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Crown className="w-4 h-4 fill-slate-900" />
              <span>Upgrade to Premium</span>
            </button>
            <Link
              href="/dashboard/m-automation"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>Learn More</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ──────────────── 2. 4 Real Dynamic Metric Cards ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-400">
              Live
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalOrders}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Total Orders ({completedOrders} delivered)
            </div>
          </div>
        </div>

        {/* Services Used */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-400">
              Catalog
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {servicesUsed}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Services Used
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            {activeOrders > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 animate-pulse">
                Running
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400">Idle</span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeOrders}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Active Orders
            </div>
          </div>
        </div>

        {/* Automation Mode Status */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              planActive ? "bg-amber-50 dark:bg-amber-900/30 text-amber-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              <Crown className={`w-5 h-5 ${planActive ? "fill-amber-500 text-amber-500" : ""}`} />
            </div>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
            >
              {planActive ? "Manage" : "Upgrade"}
            </button>
          </div>
          <div className="mt-4">
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {planActive ? `${planType || "VIP"} Active` : "Standard Mode"}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {planActive ? "Own SMM API (0% Fee)" : "Managed Wholesale API"}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. Popular Services & Quick Actions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Popular Services (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Popular Services</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quick access to our most used services.
              </p>
            </div>
            <Link
              href="/dashboard/services"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 5 Service Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            
            {/* Instagram */}
            <div
              onClick={() => openNewOrderWithPlatform("INSTAGRAM")}
              className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-xs group-hover:scale-105 transition-transform">
                📸
              </div>
              <div className="mt-3 font-bold text-xs text-slate-900 dark:text-white">
                Instagram
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Followers, Likes, Views
              </div>
            </div>

            {/* YouTube */}
            <div
              onClick={() => openNewOrderWithPlatform("YOUTUBE")}
              className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-lg shadow-xs group-hover:scale-105 transition-transform">
                ▶
              </div>
              <div className="mt-3 font-bold text-xs text-slate-900 dark:text-white">
                YouTube
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Subscribers, Views
              </div>
            </div>

            {/* TikTok */}
            <div
              onClick={() => openNewOrderWithPlatform("TIKTOK")}
              className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-slate-900 flex items-center justify-center text-cyan-400 text-lg shadow-xs group-hover:scale-105 transition-transform">
                🎵
              </div>
              <div className="mt-3 font-bold text-xs text-slate-900 dark:text-white">
                TikTok
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Followers, Likes
              </div>
            </div>

            {/* Telegram */}
            <div
              onClick={() => openNewOrderWithPlatform("TELEGRAM")}
              className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white text-lg shadow-xs group-hover:scale-105 transition-transform">
                ✈
              </div>
              <div className="mt-3 font-bold text-xs text-slate-900 dark:text-white">
                Telegram
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Members, Views
              </div>
            </div>

            {/* Twitter (X) */}
            <div
              onClick={() => openNewOrderWithPlatform("TWITTER")}
              className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-slate-800 flex items-center justify-center text-white font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                𝕏
              </div>
              <div className="mt-3 font-bold text-xs text-slate-900 dark:text-white">
                Twitter (X)
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Followers, Likes
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <button
              onClick={() => setNewOrderModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">New Order</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setAddFundsModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Funds</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/40 hover:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {planActive ? "VIP BYO-API Plan" : "Upgrade to Premium ($5 / $25)"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              href="/dashboard/orders"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Track Order</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/dashboard/m-automation"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Connect SMM API</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ──────────────── 4. Recent Orders & Side Promo Cards ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">#ID</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Link</th>
                  <th className="py-3 px-2">Quantity</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No campaigns placed yet
                        </div>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                          Get started by launching your first social media growth campaign!
                        </p>
                        <button
                          onClick={() => setNewOrderModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          ⚡ Place Your First Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 5).map((order, i) => {
                    const sName = order.service?.name || order.serviceId || "Social Campaign";
                    const platform = (order.service?.platform || "INSTAGRAM") as PlatformType;
                    const dateStr = order.createdAt 
                      ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
                      : "Today";

                    return (
                      <tr key={order.id || i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{String(order.id).slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(platform)}
                            <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap max-w-[170px] truncate">
                              {sName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-[140px] truncate">
                          <a href={order.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                            <span>{order.link}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3.5 px-2 font-bold text-slate-700 dark:text-slate-300">
                          {Number(order.quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-2">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-3.5 px-2 text-slate-400 whitespace-nowrap text-[11px]">
                          {dateStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Widgets (Right 4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Automate Growth Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-[#131b2e] border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  Mode 2: BYO SMM Panel API
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[180px]">
                  Hook your own SMM panel API key to bypass all platform markups.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                <Crown className="w-6 h-6 fill-white" />
              </div>
            </div>

            <Link
              href="/dashboard/m-automation"
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Mode 2 Settings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inspirational Quote Card */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 rotate-180" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "Speed, consistency, and automated execution make the difference."
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-2">
                  — BotClips Platform
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Popups & Modals */}
      <NewOrderModal
        isOpen={newOrderModalOpen}
        onClose={() => setNewOrderModalOpen(false)}
        defaultPlatform={selectedPlatform}
        walletBalance={walletBalance}
        currencySymbol="₹"
        onOrderSuccess={handleOrderCreated}
      />

      <AddFundsModal
        isOpen={addFundsModalOpen}
        onClose={() => setAddFundsModalOpen(false)}
        currencySymbol="₹"
        onFundsAdded={handleFundsAdded}
      />

      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        walletBalance={walletBalance}
        onUpgradeSuccess={loadDashboardData}
        onOpenAddFunds={() => setAddFundsModalOpen(true)}
      />

    </div>
  );
}
