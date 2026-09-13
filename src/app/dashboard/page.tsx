"use client";

import React, { useState } from "react";
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
  Code
} from "lucide-react";
import NewOrderModal from "@/components/NewOrderModal";
import AddFundsModal from "@/components/AddFundsModal";
import { PlatformType } from "@/lib/types";

export default function DashboardPage() {
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [userName, setUserName] = useState("User");
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("INSTAGRAM");

  React.useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setWalletBalance(Number(data.user.balance || 0));
          setUserName(data.user.name || "User");
        }
      } catch {}
    }
    loadMe();
  }, []);

  // Initial recent orders matching the user's reference image
  const [recentOrders, setRecentOrders] = useState([
    {
      id: "#1024",
      service: "Instagram Followers",
      platform: "INSTAGRAM" as PlatformType,
      link: "https://instagram.com/roonie_creator",
      quantity: "1,000",
      status: "Completed",
      date: "Sep 11, 2026"
    },
    {
      id: "#1023",
      service: "YouTube Views",
      platform: "YOUTUBE" as PlatformType,
      link: "https://youtube.com/watch?v=k38x92aL",
      quantity: "5,000",
      status: "Processing",
      date: "Sep 11, 2026"
    },
    {
      id: "#1022",
      service: "TikTok Followers",
      platform: "TIKTOK" as PlatformType,
      link: "https://tiktok.com/@roonie.official",
      quantity: "2,000",
      status: "Completed",
      date: "Sep 10, 2026"
    },
    {
      id: "#1021",
      service: "Telegram Members",
      platform: "TELEGRAM" as PlatformType,
      link: "https://t.me/channel_alpha",
      quantity: "500",
      status: "Pending",
      date: "Sep 10, 2026"
    },
    {
      id: "#1020",
      service: "Twitter (X) Likes",
      platform: "TWITTER" as PlatformType,
      link: "https://x.com/roonie/status/18342",
      quantity: "1,000",
      status: "Completed",
      date: "Sep 9, 2026"
    }
  ]);

  const handleOrderCreated = (order: any) => {
    setRecentOrders(prev => [
      {
        id: order.id || "#" + Math.floor(1000 + Math.random() * 9000),
        service: order.serviceName || "Social Campaign",
        platform: order.platform || "INSTAGRAM",
        link: order.link || "https://social.media/link",
        quantity: Number(order.quantity || 1000).toLocaleString(),
        status: "Processing",
        date: "Today"
      },
      ...prev.slice(0, 4)
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

      {/* ──────────────── 2. 4 Metric Cards ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ↑ +12%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              124
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Total Orders
            </div>
          </div>
        </div>

        {/* Services Used */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ↑ +8%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              89
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
            <span className="inline-flex items-center text-xs font-bold text-slate-400">
              —
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              7
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Active Orders
            </div>
          </div>
        </div>

        {/* Your Rating */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ↑ +0.2
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              4.8
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Your Rating
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
              href="/dashboard/automation"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">API / Automation</span>
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
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(order.platform)}
                        <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {order.service}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-[140px] truncate">
                      <a href={order.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                        {order.link}
                      </a>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-700 dark:text-slate-300">
                      {order.quantity}
                    </td>
                    <td className="py-3.5 px-2">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 whitespace-nowrap text-[11px]">
                      {order.date}
                    </td>
                  </tr>
                ))}
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
                  Automate Your <br /> Social Growth
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[180px]">
                  Use automation to save time and grow faster.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Zap className="w-6 h-6 fill-white" />
              </div>
            </div>

            <Link
              href="/dashboard/automation"
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Automation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inspirational Quote Card */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 rotate-180" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "Small actions today, big growth tomorrow."
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-2">
                  — BotClips
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

    </div>
  );
}
