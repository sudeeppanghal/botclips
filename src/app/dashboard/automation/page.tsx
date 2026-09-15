"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Wallet, Sparkles } from "lucide-react";
import EngagementTaskLauncher from "@/components/EngagementTaskLauncher";
import NewOrderModal from "@/components/NewOrderModal";

export default function AutomationPage() {
  const [userBalance, setUserBalance] = useState(0);
  const [whopModalOpen, setWhopModalOpen] = useState(false);

  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUserBalance(Number(data.user.balance || 0));
        }
      } catch {}
    }
    loadBalance();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Viral Engagement Automation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Launch high-retention, organically paced engagement tasks powered by our non-linear algorithmic pacing engine.
          </p>
        </div>

        {/* Live Wallet Balance Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Wallet Balance</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">₹{userBalance.toFixed(2)}</span>
            </div>
            <Link
              href="/dashboard/wallet"
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors"
            >
              + Deposit
            </Link>
          </div>
        </div>
      </div>

      {/* ── WHOP CLIPPERS PRE-CONFIGURED PACKAGES BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 p-5 sm:p-6 shadow-xl backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Whop Clippers Special Packages</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Whop Clippers FYP Algorithmic Sync
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Pre-configured multi-signal packages created by admins for Instagram & TikTok clippers. Automatically bundles organic <strong className="text-amber-500">Views + High-Retention Likes + Shares + Saves</strong> with non-linear time jitter to trigger platform recommendation algorithms.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">🎯 Micro (5k Views + 500 Likes + 100 Shares)</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold">🔥 Viral (10k Views + 950 Likes + 180 Shares)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">🚀 Mega (50k Views + 4.5k Likes + 800 Shares)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWhopModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Order Whop Viral Combo</span>
          </button>
        </div>
      </div>

      {/* ── ENGAGEMENT TASK LAUNCHER & ACTIVE QUEUE ── */}
      <EngagementTaskLauncher walletBalance={userBalance} />

      {/* Whop Viral Combo Modal */}
      {whopModalOpen && (
        <NewOrderModal
          isOpen={whopModalOpen}
          onClose={() => setWhopModalOpen(false)}
        />
      )}
    </div>
  );
}
