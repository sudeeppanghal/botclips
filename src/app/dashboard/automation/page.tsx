"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Server, 
  Key, 
  Lock, 
  CreditCard, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle,
  ArrowRight,
  Crown
} from "lucide-react";

export default function AutomationPage() {
  const [activeMode, setActiveMode] = useState<"MANAGED" | "CUSTOM_API">("MANAGED");
  const [profileLink, setProfileLink] = useState("");
  const [curveStyle, setCurveStyle] = useState("ORGANIC_VIRAL");
  const [targetViews, setTargetViews] = useState(10000);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mode 2 Subscription & BYO API state
  const [planLoading, setPlanLoading] = useState(false);
  const [planActive, setPlanActive] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  // Custom API configuration
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [testingApi, setTestingApi] = useState(false);
  const [apiBalanceInfo, setApiBalanceInfo] = useState<string | null>(null);

  useEffect(() => {
    loadPlanStatus();
  }, []);

  async function loadPlanStatus() {
    try {
      const res = await fetch("/api/automation/plan");
      const data = await res.json();
      if (data.success && data.plan) {
        setPlanActive(data.plan.planActive);
        setPlanType(data.plan.planType);
        setPlanExpiresAt(data.plan.planExpiresAt);
        setActiveMode(data.plan.automationMode || "MANAGED");
        setCustomApiUrl(data.plan.customApiUrl || "");
        setUserBalance(Number(data.plan.balance || 0));
      }
    } catch {}
  }

  // Subscribe to Weekly ($5 / ₹440) or Monthly ($25 / ₹2,200) Plan
  const handleSubscribe = async (type: "WEEKLY" | "MONTHLY") => {
    setPlanLoading(true);
    setError(null);
    setSavedSuccess(null);

    try {
      const res = await fetch("/api/automation/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: type }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe to plan");
      }

      setSavedSuccess(data.message);
      await loadPlanStatus();
    } catch (err: any) {
      setError(err.message || "Subscription failed");
    } finally {
      setPlanLoading(false);
    }
  };

  // Test Custom API connection & balance
  const handleTestConnection = async () => {
    if (!customApiUrl || !customApiKey) {
      setError("Please enter both SMM Panel API URL and API Key.");
      return;
    }

    setTestingApi(true);
    setError(null);
    setApiBalanceInfo(null);

    try {
      const res = await fetch("/api/automation/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customApiUrl,
          customApiKey,
          testConnection: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "API Connection failed");
      }

      setApiBalanceInfo(`Connected! Upstream Balance: ${data.balance} ${data.currency}`);
      setSavedSuccess("API connection verified successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to test SMM API");
    } finally {
      setTestingApi(false);
    }
  };

  // Save BYO API settings
  const handleSaveApiSettings = async () => {
    setError(null);
    try {
      const res = await fetch("/api/automation/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customApiUrl,
          customApiKey,
          automationMode: activeMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSavedSuccess("Automation settings saved successfully!");
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    }
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileLink) {
      setError("Please enter target video or post URL.");
      return;
    }
    setError(null);
    setSavedSuccess(`Automation campaign queued successfully via ${activeMode === "CUSTOM_API" ? "Your Custom Connected SMM API" : "BotClips Managed High-Speed Engine"}!`);
    setTimeout(() => setSavedSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Automation & Custom SMM API
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose between BotClips Managed AI Delivery or connect your Own Upstream SMM Panel API.
          </p>
        </div>

        {/* Available Balance chip */}
        <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-xs">
          <span className="text-slate-400 font-semibold">Wallet:</span>
          <span className="font-black text-slate-900 dark:text-white">₹{userBalance.toFixed(2)}</span>
          <Link href="/dashboard/wallet" className="text-blue-600 font-bold hover:underline ml-1">+ Add Funds</Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2 Operating Modes Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mode 1 Card */}
        <div 
          onClick={() => setActiveMode("MANAGED")}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeMode === "MANAGED"
              ? "border-blue-600 bg-white dark:bg-[#131b2e] shadow-md ring-2 ring-blue-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#131b2e]/60 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Mode 1: Managed AI Automation</h3>
            </div>
            {activeMode === "MANAGED" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">Active</span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Deposit in your BotClips wallet (Min ₹50) and place orders. Our background SMM engine handles dispatch and delivery pacing automatically.
          </p>
        </div>

        {/* Mode 2 Card */}
        <div 
          onClick={() => setActiveMode("CUSTOM_API")}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeMode === "CUSTOM_API"
              ? "border-purple-600 bg-white dark:bg-[#131b2e] shadow-md ring-2 ring-purple-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#131b2e]/60 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Mode 2: Premium BYO-API Mode</h3>
            </div>
            {planActive ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Subscribed</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">$5/wk or $25/mo</span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Connect your OWN upstream SMM Panel API. All automated campaigns dispatch directly via your API key using your upstream balance at 0% markup.
          </p>
        </div>
      </div>

      {/* Mode 2 Subscription Paywall Banner if Not Active */}
      {activeMode === "CUSTOM_API" && !planActive && (
        <div className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 rounded-2xl p-6 text-white border border-purple-500/30 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Premium BYO-API Automation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Unlock Custom SMM Panel API Connection</h2>
              <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
                Run unlimited organic curves, bulk drip-feeds, and account automation directly through your own SMM panel provider with no middleman margins.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {/* Weekly Plan */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[170px]">
                <div className="text-xs font-bold text-purple-200">Weekly Pass</div>
                <div className="text-2xl font-black mt-1">$5 <span className="text-xs font-normal text-purple-200">(₹440)</span></div>
                <div className="text-[10px] text-purple-300 mt-0.5">7 Days Active Access</div>
                <button
                  onClick={() => handleSubscribe("WEEKLY")}
                  disabled={planLoading}
                  className="mt-3 w-full py-2 bg-white text-purple-900 hover:bg-purple-50 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {planLoading ? "Activating..." : "Unlock Weekly"}
                </button>
              </div>

              {/* Monthly Plan */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/40 text-center min-w-[170px] relative">
                <span className="absolute -top-2.5 right-3 bg-amber-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  POPULAR
                </span>
                <div className="text-xs font-bold text-amber-300">Monthly Pro</div>
                <div className="text-2xl font-black mt-1">$25 <span className="text-xs font-normal text-purple-200">(₹2,200)</span></div>
                <div className="text-[10px] text-purple-300 mt-0.5">30 Days Active Access</div>
                <button
                  onClick={() => handleSubscribe("MONTHLY")}
                  disabled={planLoading}
                  className="mt-3 w-full py-2 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-lg text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {planLoading ? "Activating..." : "Unlock Monthly"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Campaign Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Setup & Configuration */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          
          {/* If Mode 2 is selected and plan is active, show API connection fields */}
          {activeMode === "CUSTOM_API" && planActive && (
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Your Custom SMM Panel API</span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md">
                  Plan Expires: {planExpiresAt ? new Date(planExpiresAt).toLocaleDateString() : "Active"}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  API URL (Standard v2 endpoint)
                </label>
                <input
                  type="url"
                  placeholder="https://justanotherpanel.com/api/v2 or https://smmsocialmedia.in/api/v2"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingApi}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:border-purple-500 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingApi ? "animate-spin" : ""}`} />
                  <span>{testingApi ? "Verifying..." : "Test Connection & Balance"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveApiSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Save API Key
                </button>
              </div>

              {apiBalanceInfo && (
                <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                  {apiBalanceInfo}
                </div>
              )}
            </div>
          )}

          {/* Campaign Form */}
          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Campaign Pacing & Curve Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Post / Reel / Channel URL
              </label>
              <input
                type="text"
                required
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                placeholder="https://instagram.com/reel/C... or YouTube link"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Delivery Curve Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Algorithm Emulation Curve
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ORGANIC_VIRAL", name: "Organic Viral", desc: "Warmup → Peak → Decay" },
                  { id: "STEADY_DRIP", name: "Steady Drip", desc: "Linear equal batch pacing" },
                  { id: "BURST_PUSH", name: "Explosive Burst", desc: "Instant 1st hour surge" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurveStyle(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      curveStyle === c.id
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={activeMode === "CUSTOM_API" && !planActive}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Automated Campaign</span>
            </button>
          </form>
        </div>

        {/* Right Col: Live Waveform Visualizer & Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Algorithmic Waveform</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {curveStyle === "ORGANIC_VIRAL" ? "Natural Discovery" : curveStyle === "STEADY_DRIP" ? "Linear Drip" : "Surge Spike"}
              </span>
            </div>

            <div className="py-6">
              <svg viewBox="0 0 320 120" className="w-full h-32 overflow-visible">
                <line x1="10" y1="30" x2="310" y2="30" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="10" y1="60" x2="310" y2="60" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="10" y1="90" x2="310" y2="90" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

                <path
                  d={
                    curveStyle === "ORGANIC_VIRAL"
                      ? "M 10 95 C 50 85, 70 65, 110 25 C 150 15, 190 45, 240 70 C 270 85, 290 92, 300 95"
                      : curveStyle === "STEADY_DRIP"
                      ? "M 10 95 L 300 25"
                      : "M 10 95 C 30 15, 60 15, 120 40 C 180 60, 240 80, 300 90"
                  }
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>Warmup</span>
              <span className="text-blue-600 font-bold">Peak Engagement</span>
              <span>Organic Decay</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Shadowban Guarantee</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Platform algorithms flag abrupt spikes from flat bot panels. Our curves simulate organic human discovery to protect and boost your accounts safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
