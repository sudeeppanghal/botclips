"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Filter, ArrowUpRight, Sparkles } from "lucide-react";
import NewOrderModal from "@/components/NewOrderModal";
import { PlatformType } from "@/lib/types";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState<PlatformType | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
    loadUserBalance();
    const handleBalanceUpdate = () => loadUserBalance();
    window.addEventListener("balance_updated", handleBalanceUpdate);
    return () => window.removeEventListener("balance_updated", handleBalanceUpdate);
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch {}
    setLoading(false);
  }

  async function loadUserBalance() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUserBalance(Number(data.user.balance || 0));
      }
    } catch {}
  }

  const filtered = services.filter(s => {
    const matchPlat = activePlatform === "ALL" || s.platform === activePlatform;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.cat && s.cat.toLowerCase().includes(search.toLowerCase())) || 
      String(s.id).includes(search) ||
      String(s.serviceId || "").includes(search);
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
            Browse our full catalog of high-speed clipping and social media growth services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 font-semibold block">Available Wallet Balance</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">₹{userBalance.toFixed(2)}</span>
          </div>
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
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No matching services found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #{s.serviceId || s.id}
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>{s.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          3x Wholesale Node
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                          60 Curves
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.cat}</div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        ₹{Number(s.rate).toFixed(2)}
                      </div>
                      <div className="text-[11px] font-bold text-slate-400">
                        ${(Number(s.rate) / 96).toFixed(2)} USD
                      </div>
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-mono text-[11px]">
                      {Number(s.min).toLocaleString()} / {Number(s.max).toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedService(s);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                      >
                        <span>Configure & Order</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <NewOrderModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            loadUserBalance();
          }}
          defaultPlatform={selectedService?.platform || "INSTAGRAM"}
          walletBalance={userBalance}
          onOrderSuccess={() => {
            loadUserBalance();
          }}
        />
      )}
    </div>
  );
}
