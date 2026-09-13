"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [orders, setOrders] = useState([
    {
      id: "1024",
      service: "Instagram Real HQ Followers [Instant]",
      link: "https://instagram.com/roonie_creator",
      quantity: 1000,
      charge: 180,
      startCount: 4210,
      remains: 0,
      status: "Completed",
      date: "Sep 11, 2026, 02:45 PM"
    },
    {
      id: "1023",
      service: "YouTube High Retention Monetizable Views",
      link: "https://youtube.com/watch?v=k38x92aL",
      quantity: 5000,
      charge: 1200,
      startCount: 840,
      remains: 1240,
      status: "Processing",
      date: "Sep 11, 2026, 11:15 AM"
    },
    {
      id: "1022",
      service: "TikTok Real Followers [Guaranteed]",
      link: "https://tiktok.com/@roonie.official",
      quantity: 2000,
      charge: 380,
      startCount: 15200,
      remains: 0,
      status: "Completed",
      date: "Sep 10, 2026, 06:10 PM"
    },
    {
      id: "1021",
      service: "Telegram Channel Members [Non-Drop]",
      link: "https://t.me/channel_alpha",
      quantity: 500,
      charge: 60,
      startCount: 120,
      remains: 500,
      status: "Pending",
      date: "Sep 10, 2026, 09:30 AM"
    },
    {
      id: "1020",
      service: "Twitter (X) Active Likes & Retweets",
      link: "https://x.com/roonie/status/18342",
      quantity: 1000,
      charge: 110,
      startCount: 45,
      remains: 0,
      status: "Completed",
      date: "Sep 09, 2026, 04:20 PM"
    }
  ]);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "ALL" || o.status.toUpperCase() === filter;
    const matchSearch = o.id.includes(search) || o.service.toLowerCase().includes(search.toLowerCase()) || o.link.toLowerCase().includes(search.toLowerCase());
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
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-2 font-mono font-bold text-slate-900 dark:text-white">
                    #{o.id}
                  </td>
                  <td className="py-4 px-2 font-semibold text-slate-800 dark:text-slate-200 max-w-[220px]">
                    {o.service}
                  </td>
                  <td className="py-4 px-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-[160px] truncate">
                    <a href={o.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                      <span>{o.link}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-4 px-2 font-bold text-slate-700 dark:text-slate-300">
                    {o.quantity.toLocaleString()}
                  </td>
                  <td className="py-4 px-2 text-slate-500 font-mono">
                    {o.startCount} / {o.remains}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      o.status === "Completed"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        : o.status === "Processing"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-slate-400 whitespace-nowrap text-[11px]">
                    {o.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
