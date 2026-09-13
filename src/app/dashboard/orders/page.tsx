"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const status = (o.status || "").toUpperCase();
    const matchFilter = filter === "ALL" || status === filter;
    const serviceName = o.service?.name || o.serviceId || "Social Service";
    const matchSearch = 
      String(o.id).toLowerCase().includes(search.toLowerCase()) || 
      serviceName.toLowerCase().includes(search.toLowerCase()) || 
      String(o.link || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time delivery status, start count, and refill requests.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {["ALL", "PROCESSING", "COMPLETED", "PENDING", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  filter === st
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or link..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Service</th>
                <th className="py-3 px-2">Target Link</th>
                <th className="py-3 px-2">Quantity</th>
                <th className="py-3 px-2">Start / Remains</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
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
                          : "You haven't placed any campaigns yet. Get started by placing your first order!"}
                      </p>
                      <Link
                        href="/dashboard/services"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Explore Services
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const sName = o.service?.name || o.serviceId || "Social Campaign";
                  const statusUpper = (o.status || "PENDING").toUpperCase();
                  const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent";
                  
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-slate-900 dark:text-white">
                        #{String(o.id).slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-2 font-semibold text-slate-800 dark:text-slate-200 max-w-[220px]">
                        {sName}
                      </td>
                      <td className="py-4 px-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-[160px] truncate">
                        <a href={o.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                          <span>{o.link}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-4 px-2 font-bold text-slate-700 dark:text-slate-300">
                        {Number(o.quantity || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-slate-500 font-mono">
                        {o.startCount ?? 0} / {o.remains ?? 0}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          statusUpper === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                            : statusUpper === "PROCESSING" || statusUpper === "IN_PROGRESS"
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                            : statusUpper === "CANCELLED"
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-400 whitespace-nowrap text-[11px]">
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
    </div>
  );
}
