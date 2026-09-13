"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, Filter, ArrowUpRight } from "lucide-react";
import NewOrderModal from "@/components/NewOrderModal";
import { PlatformType } from "@/lib/types";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState<PlatformType | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const mockServices = [
    { id: 1024, platform: "INSTAGRAM", cat: "Instagram Followers", name: "Instagram Real HQ Followers [Instant, 30 Days Refill]", rate: 180, min: 50, max: 100000 },
    { id: 1025, platform: "INSTAGRAM", cat: "Instagram Likes", name: "Instagram High Retention Likes [Real Active Users]", rate: 45, min: 50, max: 500000 },
    { id: 1026, platform: "INSTAGRAM", cat: "Instagram Views", name: "Instagram Reels Views [Fast Viral Algorithm Boost]", rate: 15, min: 100, max: 10000000 },
    { id: 2011, platform: "YOUTUBE", cat: "YouTube Views", name: "YouTube High Retention Views [Monetizable, Safe for Ads]", rate: 240, min: 500, max: 2000000 },
    { id: 2012, platform: "YOUTUBE", cat: "YouTube Subscribers", name: "YouTube Real Non-Drop Subscribers [Gradual Delivery]", rate: 1200, min: 50, max: 20000 },
    { id: 3015, platform: "TIKTOK", cat: "TikTok Followers", name: "TikTok Real Followers [Guaranteed No Drop]", rate: 190, min: 100, max: 50000 },
    { id: 3016, platform: "TIKTOK", cat: "TikTok Views", name: "TikTok Video Views [Instant Delivery + Viral Push]", rate: 20, min: 100, max: 5000000 },
    { id: 4010, platform: "TELEGRAM", cat: "Telegram Members", name: "Telegram Channel Members [Global Non-Drop 60D]", rate: 120, min: 100, max: 100000 },
    { id: 4011, platform: "TELEGRAM", cat: "Telegram Views", name: "Telegram Post Views [1-5 Recent Posts Autoview]", rate: 10, min: 100, max: 500000 },
    { id: 5001, platform: "TWITTER", cat: "Twitter (X) Followers", name: "Twitter (X) Followers [Real Profiles with PFP]", rate: 350, min: 50, max: 50000 },
    { id: 5002, platform: "TWITTER", cat: "Twitter (X) Likes", name: "Twitter (X) High Speed Likes & Retweets", rate: 110, min: 50, max: 100000 },
    { id: 6001, platform: "FACEBOOK", cat: "Facebook Page Likes", name: "Facebook Page Followers & Likes [Real Indian Profiles]", rate: 290, min: 100, max: 50000 },
  ];

  const filtered = mockServices.filter(s => {
    const matchPlat = activePlatform === "ALL" || s.platform === activePlatform;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search);
    return matchPlat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Services & Pricing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse our full catalog of high-speed SMM services.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name, category, or ID..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {["ALL", "INSTAGRAM", "YOUTUBE", "TIKTOK", "TELEGRAM", "TWITTER", "FACEBOOK"].map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activePlatform === p
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {p === "ALL" ? "All Platforms" : p === "TWITTER" ? "Twitter (X)" : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Service</th>
                <th className="py-3 px-2">Rate / 1k</th>
                <th className="py-3 px-2">Min / Max</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                    #{s.id}
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{s.cat}</div>
                  </td>
                  <td className="py-4 px-2 font-black text-slate-900 dark:text-white">
                    ₹{s.rate}
                  </td>
                  <td className="py-4 px-2 text-slate-500 dark:text-slate-400">
                    {s.min.toLocaleString()} / {s.max.toLocaleString()}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button
                      onClick={() => {
                        setSelectedService(s);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                    >
                      <span>Order</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <NewOrderModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultPlatform={selectedService?.platform || "INSTAGRAM"}
          walletBalance={520.00}
        />
      )}
    </div>
  );
}
