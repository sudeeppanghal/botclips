"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  HelpCircle,
  Eye,
  X,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders?limit=200");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Live Auto Refresh polling when active
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics
  const totalOrders = orders.length;
  const runningOrders = orders.filter(o => {
    const st = (o.status || "").toUpperCase();
    return st === "IN_PROGRESS" || st === "PROCESSING" || st === "PENDING";
  });
  const completedOrders = orders.filter(o => (o.status || "").toUpperCase() === "COMPLETED").length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.charge) || 0), 0);

  const filtered = orders.filter(o => {
    const status = (o.status || "").toUpperCase();
    let matchFilter = true;
    if (filter === "ALL") matchFilter = true;
    else if (filter === "RUNNING") matchFilter = status === "IN_PROGRESS" || status === "PROCESSING" || status === "PENDING";
    else matchFilter = status === filter;

    const serviceName = o.service?.name || o.serviceId || "Social Service";
    const matchSearch = 
      String(o.id).toLowerCase().includes(search.toLowerCase()) || 
      serviceName.toLowerCase().includes(search.toLowerCase()) || 
      String(o.link || "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.service?.platform || "").toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Order History & Live Tracking
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
              Live Real-Time
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track running campaigns, real-time start counts, delivered volumes, and instant refill states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              autoRefresh 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{autoRefresh ? "Live Auto-Sync ON" : "Auto-Sync OFF"}</span>
          </button>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilter("RUNNING")}
          className="bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 cursor-pointer hover:border-blue-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Running Campaigns
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {runningOrders.length}
            </span>
            {runningOrders.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 animate-pulse">
                • Active Now
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">In progress & processing delivery</p>
        </div>

        <div 
          onClick={() => setFilter("COMPLETED")}
          className="bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 cursor-pointer hover:border-emerald-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% delivered to target links</p>
        </div>

        <div 
          onClick={() => setFilter("ALL")}
          className="bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 cursor-pointer hover:border-purple-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Placed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime platform orders</p>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalSpent.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Spent across all campaigns</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              All ({orders.length})
            </button>

            <button
              onClick={() => setFilter("RUNNING")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === "RUNNING"
                  ? "bg-blue-600 text-white shadow-xs font-black"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Running ({runningOrders.length})</span>
            </button>

            {["IN_PROGRESS", "PROCESSING", "COMPLETED", "PENDING", "PARTIAL", "CANCELLED"].map((st) => {
              const count = orders.filter(o => (o.status || "").toUpperCase() === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    filter === st
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {st.replace("_", " ")} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, link, platform..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        
        {/* Mobile View: Dedicated Adaptive Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs font-semibold">Loading orders...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No orders found</div>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {search || filter !== "ALL"
                  ? "No orders match your filter criteria."
                  : "You haven't placed any campaigns yet."}
              </p>
              <Link
                href="/dashboard/services"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-block shadow-xs"
              >
                Explore Services Catalog
              </Link>
            </div>
          ) : (
            filtered.map((o) => {
              const sName = o.service?.name || o.serviceId || "Social Campaign";
              const platform = o.service?.platform || "INSTAGRAM";
              const statusUpper = (o.status || "PENDING").toUpperCase();
              const isRunning = statusUpper === "IN_PROGRESS" || statusUpper === "PROCESSING" || statusUpper === "PENDING";
              const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent";
              
              const qty = Number(o.quantity || 1);
              const remains = o.remains !== undefined && o.remains !== null ? Number(o.remains) : (statusUpper === "COMPLETED" ? 0 : qty);
              const delivered = Math.max(0, qty - remains);
              const progressPct = statusUpper === "COMPLETED" ? 100 : Math.max(0, Math.min(100, Math.round((delivered / qty) * 100)));

              return (
                <div key={o.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  {/* Top Bar: Order ID + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      <span>#{String(o.id).slice(-8)}</span>
                      <button
                        onClick={() => handleCopy(o.id, `id-${o.id}`)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                      >
                        {copiedId === `id-${o.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      statusUpper === "COMPLETED"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : isRunning
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse"
                        : statusUpper === "CANCELLED"
                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {isRunning && <Zap className="w-2.5 h-2.5" />}
                      {statusUpper === "COMPLETED" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      <span>{statusUpper.replace("_", " ")}</span>
                    </span>
                  </div>

                  {/* Service Title */}
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                      {sName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {platform}
                      </span>
                      {o.service?.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[9px] font-black">
                          {o.service.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Link */}
                  {o.link && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 font-mono text-[11px]">
                      <a href={o.link} target="_blank" rel="noreferrer" className="truncate text-slate-600 dark:text-slate-300 hover:text-blue-500 max-w-[240px]">
                        {o.link}
                      </a>
                      <a href={o.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 shrink-0 ml-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Delivery Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {delivered.toLocaleString()} / {qty.toLocaleString()} delivered
                      </span>
                      <span className={statusUpper === "COMPLETED" ? "text-emerald-600 font-bold" : "text-blue-600 font-black"}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          statusUpper === "COMPLETED"
                            ? "bg-emerald-500"
                            : statusUpper === "CANCELLED"
                            ? "bg-rose-500"
                            : "bg-linear-to-r from-blue-500 to-indigo-500 animate-pulse"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Charge</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">₹{Number(o.charge || 0).toFixed(2)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                      <button
                        onClick={() => setInspectOrder(o)}
                        className="mt-0.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Service & Platform</th>
                <th className="py-3 px-2">Target Link</th>
                <th className="py-3 px-2">Quantity</th>
                <th className="py-3 px-2 min-w-[140px]">Live Delivery Progress</th>
                <th className="py-3 px-2">Charge</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No orders found
                      </div>
                      <p className="text-xs text-slate-400 mt-1 mb-4">
                        {search || filter !== "ALL"
                          ? "No orders match your search or filter criteria."
                          : "You haven't placed any campaigns yet. Start boosting your socials now!"}
                      </p>
                      <Link
                        href="/dashboard/services"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Explore Services Catalog
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const sName = o.service?.name || o.serviceId || "Social Campaign";
                  const platform = o.service?.platform || "INSTAGRAM";
                  const statusUpper = (o.status || "PENDING").toUpperCase();
                  const isRunning = statusUpper === "IN_PROGRESS" || statusUpper === "PROCESSING" || statusUpper === "PENDING";
                  const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent";
                  
                  // Calculate progress percentage
                  const qty = Number(o.quantity || 1);
                  const remains = o.remains !== undefined && o.remains !== null ? Number(o.remains) : (statusUpper === "COMPLETED" ? 0 : qty);
                  const delivered = Math.max(0, qty - remains);
                  const progressPct = statusUpper === "COMPLETED" ? 100 : Math.max(0, Math.min(100, Math.round((delivered / qty) * 100)));

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Order # */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
                          <span>#{String(o.id).slice(-8)}</span>
                          <button
                            onClick={() => handleCopy(o.id, `id-${o.id}`)}
                            title="Copy Order ID"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          >
                            {copiedId === `id-${o.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {o.runs > 1 && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            {o.runs} batches
                          </div>
                        )}
                      </td>

                      {/* Service & Platform */}
                      <td className="py-4 px-2 max-w-[220px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={sName}>
                          {sName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {platform}
                          </span>
                          {o.service?.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[9px] font-black">
                              {o.service.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Link */}
                      <td className="py-4 px-2 max-w-[160px]">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          <a 
                            href={o.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="truncate hover:text-blue-600 hover:underline"
                            title={o.link}
                          >
                            {o.link}
                          </a>
                          <a href={o.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 shrink-0">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {Number(o.quantity || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Start: {o.startCount ?? 0}
                        </div>
                      </td>

                      {/* Live Delivery Progress */}
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-500 dark:text-slate-400">
                              {delivered.toLocaleString()} / {qty.toLocaleString()}
                            </span>
                            <span className={statusUpper === "COMPLETED" ? "text-emerald-600" : "text-blue-600 font-black"}>
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                statusUpper === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : statusUpper === "CANCELLED"
                                  ? "bg-rose-500"
                                  : "bg-linear-to-r from-blue-500 to-indigo-500 animate-pulse"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Charge */}
                      <td className="py-4 px-2 font-bold text-slate-900 dark:text-white">
                        ₹{Number(o.charge || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          statusUpper === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isRunning
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse"
                            : statusUpper === "CANCELLED"
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {isRunning && <Zap className="w-3 h-3" />}
                          {statusUpper === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                          <span>{statusUpper.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-2 text-slate-400 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={() => setInspectOrder(o)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────── ORDER INSPECTOR MODAL ──────────────── */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Order Details #{String(inspectOrder.id).slice(-8)}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {inspectOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              {/* Service Info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Campaign</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold uppercase text-[10px]">
                    {inspectOrder.service?.platform || "Social Service"}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {inspectOrder.service?.name || inspectOrder.serviceId}
                </div>
                {inspectOrder.service?.category && (
                  <div className="text-[11px] text-slate-400">
                    Category: {inspectOrder.service.category}
                  </div>
                )}
              </div>

              {/* Target Link */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Link</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-slate-700 dark:text-slate-300 break-all">
                    {inspectOrder.link}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(inspectOrder.link, "modal-link")}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 cursor-pointer"
                      title="Copy Link"
                    >
                      {copiedId === "modal-link" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={inspectOrder.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-blue-500"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Quantity</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {Number(inspectOrder.quantity).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Start Count</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {inspectOrder.startCount ?? 0}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Remaining</div>
                  <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
                    {inspectOrder.remains ?? 0}
                  </div>
                </div>
              </div>

              {/* Status & Timing */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Current Status</div>
                  <div className="font-bold text-slate-900 dark:text-white capitalize mt-0.5">
                    {inspectOrder.status?.replace("_", " ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Charge Paid</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{Number(inspectOrder.charge).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/dashboard/tickets?orderId=${inspectOrder.id}`}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Refill / Support Ticket</span>
              </Link>

              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
