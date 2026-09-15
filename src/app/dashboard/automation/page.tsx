"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Wallet, Sparkles } from "lucide-react";
import EngagementTaskLauncher from "@/components/EngagementTaskLauncher";

export default function AutomationPage() {
  const [userBalance, setUserBalance] = useState(0);

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

      {/* ── ENGAGEMENT TASK LAUNCHER ── */}
      <EngagementTaskLauncher walletBalance={userBalance} />
    </div>
  );
}
