"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, 
  Crown, 
  Server, 
  Key, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Wallet,
  ExternalLink,
  Cpu
} from "lucide-react";
import EngagementTaskLauncher from "@/components/EngagementTaskLauncher";

export default function MAutomationPage() {
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mode 2 Subscription & BYO API state
  const [planLoading, setPlanLoading] = useState(false);
  const [planActive, setPlanActive] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  // Custom SMM Panel API Configuration
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [apiBalance, setApiBalance] = useState<number | null>(null);
  const [apiCurrency, setApiCurrency] = useState("INR");
  const [panelStatus, setPanelStatus] = useState("DISCONNECTED");

  // Batch-fetched services from subscriber's SMM panel
  const [fetchingServices, setFetchingServices] = useState(false);
  const [upstreamServices, setUpstreamServices] = useState<any[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("TIKTOK");
  const [defaultServices, setDefaultServices] = useState<Record<string, string>>({
    TIKTOK: "",
    INSTAGRAM: "",
    YOUTUBE: "",
    DEFAULT: "",
  });

  useEffect(() => {
    loadPlanAndApiStatus();
  }, []);

  async function loadPlanAndApiStatus() {
    try {
      const res = await fetch("/api/automation/byo-api");
      const data = await res.json();
      if (data.success) {
        setPlanActive(data.planActive);
        setPlanType(data.planType);
        setPlanExpiresAt(data.planExpiresAt);
        setCustomApiUrl(data.customApiUrl || "");
        setHasSavedKey(data.hasApiKey);
        setApiBalance(data.connectedPanelBalance);
        setApiCurrency(data.connectedPanelCurrency || "INR");
        setPanelStatus(data.panelStatus || "DISCONNECTED");
        if (data.defaultServices) {
          setDefaultServices(prev => ({ ...prev, ...data.defaultServices }));
        }
      }

      // Also get wallet balance
      const planRes = await fetch("/api/automation/plan");
      const planData = await planRes.json();
      if (planData.success && planData.plan) {
        setUserBalance(Number(planData.plan.balance || 0));
      }
    } catch {}
  }

  // Subscribe to Weekly ($10 / ₹960) or Monthly ($25 / ₹2,400) Plan
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
      await loadPlanAndApiStatus();
    } catch (err: any) {
      setError(err.message || "Subscription failed");
    } finally {
      setPlanLoading(false);
    }
  };

  // Test connection & auto-fetch live balance from connected SMM panel
  const handleFetchBalance = async () => {
    if (!customApiUrl || (!customApiKey && !hasSavedKey)) {
      setError("Please enter your SMM Panel API URL and API Key.");
      return;
    }

    setTestingApi(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/byo-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "balance",
          apiUrl: customApiUrl,
          apiKey: customApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reach SMM Panel API");
      }

      setApiBalance(data.balance);
      setApiCurrency(data.currency || "USD");
      setPanelStatus("CONNECTED");
      setSavedSuccess(`Connected! Live Balance: ${data.currency === "INR" ? "₹" : "$"}${data.balance.toFixed(2)}`);
    } catch (err: any) {
      setError(err.message);
      setPanelStatus("ERROR");
    } finally {
      setTestingApi(false);
    }
  };

  // Auto-batch and fetch all services from subscriber's SMM panel
  const handleFetchBatchServices = async () => {
    if (!customApiUrl || (!customApiKey && !hasSavedKey)) {
      setError("Please enter your SMM Panel API URL and API Key first.");
      return;
    }

    setFetchingServices(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/byo-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "services",
          apiUrl: customApiUrl,
          apiKey: customApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch services from SMM panel");
      }

      if (Array.isArray(data.services)) {
        setUpstreamServices(data.services);
        setSavedSuccess(`Auto-batched ${data.services.length} services from your SMM Panel! You can now set your default service IDs below.`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetchingServices(false);
    }
  };

  // Save SMM Panel API credentials & default service IDs
  const handleSaveApiAndDefaults = async () => {
    if (!customApiUrl) {
      setError("Please provide your SMM Panel API URL.");
      return;
    }

    setTestingApi(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/byo-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          apiUrl: customApiUrl,
          apiKey: customApiKey,
          defaultServices,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save SMM panel configuration");
      }

      setSavedSuccess("SMM Panel credentials & default service IDs saved successfully!");
      if (data.balance !== null && data.balance !== undefined) {
        setApiBalance(data.balance);
        setApiCurrency(data.currency || "INR");
        setPanelStatus("CONNECTED");
      }
      setHasSavedKey(true);
      await loadPlanAndApiStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTestingApi(false);
    }
  };

  const filteredUpstream = upstreamServices.filter(s => {
    const q = serviceSearch.toLowerCase();
    return String(s.service || s.id || "").includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                M-Automation
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                BYO-API
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect your own external SMM provider API. Deploy automated non-linear pacing directly through your provider account at 0% platform markup.
          </p>
        </div>

        {/* Live Status & Wallet Balance */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Wallet Balance</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">₹{userBalance.toFixed(2)}</span>
            </div>
            <Link
              href="/dashboard/wallet"
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors"
            >
              + Deposit
            </Link>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── SUBSCRIPTION PAYWALL (When plan is inactive) ── */}
      {!planActive && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-slate-900 border border-purple-500/30 text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Crown className="w-3.5 h-3.5" />
                <span>M-Automation Subscription Required</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock Direct Provider API Automation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect ANY standard v2 SMM panel API. Execute high-volume video campaigns, auto-sync balances, batch service IDs, and launch non-linear pacing with 0% platform markup on views.
              </p>
            </div>

            {/* Plan Action Cards */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => handleSubscribe("WEEKLY")}
                disabled={planLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span>{planLoading ? "Processing..." : "Weekly Access Pass"}</span>
                <span className="text-[10px] text-purple-200 font-mono">$10 / ₹960</span>
              </button>
              <button
                onClick={() => handleSubscribe("MONTHLY")}
                disabled={planLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
              >
                <span>{planLoading ? "Processing..." : "Monthly Pro Pass"}</span>
                <span className="text-[10px] text-slate-500 font-mono">$25 / ₹2,400</span>
              </button>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">0% Platform Markup</strong>
                <span>You pay wholesale prices directly to your connected provider.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Auto-Sync & Live Balance</strong>
                <span>Real-time balance lookup and batch catalog mapping for all platforms.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Proprietary Jitter Engine</strong>
                <span>Use our advanced Poisson pacing with views billed to your panel.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE PLAN DETAILS & API CONFIGURATION ── */}
      {planActive && (
        <div className="space-y-6">
          {/* Active Plan Header Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-900/20 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">M-Automation Subscription Active</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {planType || "Active"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {planExpiresAt 
                    ? `Pass active until ${new Date(planExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` 
                    : "Active access"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubscribe("MONTHLY")}
                disabled={planLoading}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                {planLoading ? "Updating..." : "Extend Pass"}
              </button>
            </div>
          </div>

          {/* API Connection & Live Balance Card */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Connected Provider API Credentials</h2>
                  <p className="text-xs text-slate-400">Enter your provider API URL & Key. We auto-fetch remaining balance and service IDs.</p>
                </div>
              </div>

              {/* Live Panel Balance Display */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Panel Balance</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    {apiBalance !== null ? `${apiCurrency === "INR" ? "₹" : "$"}${apiBalance.toFixed(2)}` : "Click Test"}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  panelStatus === "CONNECTED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {panelStatus === "CONNECTED" ? "● CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  SMM Panel API URL (Standard v2 API)
                </label>
                <input
                  type="url"
                  placeholder="https://your-panel-provider.com/api/v2"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder={hasSavedKey ? "•••••••••••••••••••••••• (Saved)" : "Enter API Key from your provider"}
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFetchBalance}
                  disabled={testingApi}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingApi ? "animate-spin" : ""}`} />
                  <span>{testingApi ? "Checking..." : "Auto-Fetch Panel Balance"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchBatchServices}
                  disabled={fetchingServices}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 cursor-pointer"
                >
                  <Database className={`w-3.5 h-3.5 ${fetchingServices ? "animate-spin" : ""}`} />
                  <span>{fetchingServices ? "Batching Services..." : "Auto-Batch All Services from Panel"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveApiAndDefaults}
                disabled={testingApi}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save Panel Credentials
              </button>
            </div>
          </div>

          {/* Default Service IDs Mapping Card */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Default Service ID Mappings</h3>
                <p className="text-xs text-slate-400">Map which service ID from your connected panel should be triggered for each platform.</p>
              </div>
              <button
                type="button"
                onClick={handleSaveApiAndDefaults}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Save Default IDs
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">TikTok Service ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1024"
                  value={defaultServices.TIKTOK || ""}
                  onChange={(e) => setDefaultServices(prev => ({ ...prev, TIKTOK: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Instagram Service ID</label>
                <input
                  type="text"
                  placeholder="e.g. 5245"
                  value={defaultServices.INSTAGRAM || ""}
                  onChange={(e) => setDefaultServices(prev => ({ ...prev, INSTAGRAM: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">YouTube Service ID</label>
                <input
                  type="text"
                  placeholder="e.g. 2011"
                  value={defaultServices.YOUTUBE || ""}
                  onChange={(e) => setDefaultServices(prev => ({ ...prev, YOUTUBE: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Fallback Default ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={defaultServices.DEFAULT || ""}
                  onChange={(e) => setDefaultServices(prev => ({ ...prev, DEFAULT: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* If services were fetched from subscriber's panel, show fast search & assign table */}
            {upstreamServices.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Fetched Services from your Connected Panel ({upstreamServices.length} loaded)
                  </span>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {filteredUpstream.slice(0, 50).map((srv, idx) => {
                    const sId = String(srv.service || srv.id);
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="font-mono font-bold text-purple-600 mr-2">#{sId}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{srv.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({srv.category})</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                            {srv.rate ? `Cost: ${srv.rate}` : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDefaultServices(prev => ({ ...prev, [selectedPlatform]: sId }));
                              setSavedSuccess(`Set Service #${sId} as default for ${selectedPlatform}! Click 'Save Default IDs' to apply.`);
                            }}
                            className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Use as {selectedPlatform}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Connected API Task Launcher */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Launch Tasks on Connected Provider API
              </h2>
            </div>
            <EngagementTaskLauncher walletBalance={userBalance} />
          </div>
        </div>
      )}
    </div>
  );
}
