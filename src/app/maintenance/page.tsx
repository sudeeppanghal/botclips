"use client";

import React, { useState } from "react";
import Link from "next/link";
import BotClipsLogo from "@/components/BotClipsLogo";
import { ShieldCheck, RefreshCw, Smartphone, Zap, Clock, ArrowRight } from "lucide-react";

export default function MaintenancePage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(36,107,254,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_bottom_right,_rgba(0,212,255,0.10),transparent_70%)] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-4">
        <BotClipsLogo size="md" href="/" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ENGINES: 100% OPERATIONAL</span>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="max-w-2xl w-full mx-auto my-auto z-10 text-center py-10">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-400 text-xs font-extrabold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(36,107,254,0.2)]">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Scheduled Infrastructure Maintenance</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          System Calibration{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            In Progress.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
          We are currently upgrading server infrastructure and fine-tuning algorithm pacing curves. The public portal is temporarily paused for routine maintenance.
        </p>

        {/* Live Assurance Grid */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Running Orders</span>
            </div>
            <div className="text-sm font-black text-white">Uninterrupted</div>
            <p className="text-[11px] text-slate-400 mt-1">All deliveries continue running at full speed.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Device Farm</span>
            </div>
            <div className="text-sm font-black text-white">20,480 Online</div>
            <p className="text-[11px] text-slate-400 mt-1">Physical hardware operating at 100% capacity.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
              <Zap className="w-4 h-4" />
              <span>Campaign Audits</span>
            </div>
            <div className="text-sm font-black text-white">Guaranteed Safe</div>
            <p className="text-[11px] text-slate-400 mt-1">0% view drop retention pacing actively maintained.</p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Checking Status..." : "Check Status & Refresh"}</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10 border-t border-slate-800/80 pt-4 gap-2">
        <div>© {new Date().getFullYear()} BotClips — High-Retention Clipping Infrastructure</div>
        <Link 
          href="/login" 
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px]"
        >
          <span>Staff Access</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </footer>
    </div>
  );
}
