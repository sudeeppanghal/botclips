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
  Crown,
  Search,
  Check,
  Sliders,
  Database
} from "lucide-react";

export default function AutomationPage() {
  const [activeMode, setActiveMode] = useState<"MANAGED" | "CUSTOM_API">("MANAGED");
  const [profileLink, setProfileLink] = useState("");
  const [curveStyle, setCurveStyle] = useState("ORGANIC_VIRAL");
  const [targetViews, setTargetViews] = useState(10000);
  const [selectedPlatform, setSelectedPlatform] = useState("TIKTOK");
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
        setActiveMode(data.automationMode || (data.planActive ? "CUSTOM_API" : "MANAGED"));
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

  // Launch Automated Campaign
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(null);

    try {
      const activeServiceId = defaultServices[selectedPlatform] || defaultServices.DEFAULT || "1";

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: profileLink,
          quantity: targetViews,
          category: selectedPlatform,
          serviceId: activeServiceId,
          service: `Automated ${selectedPlatform} Campaign (${curveStyle})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to launch automated campaign");
      }

      setSavedSuccess(data.message || "Automated campaign launched successfully!");
      setProfileLink("");
      await loadPlanAndApiStatus();
    } catch (err: any) {
      setError(err.message || "Campaign launch failed");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-600/10 text-blue-600">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Pacing & API Automation
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose between BotClips Managed Viewfarm or Connect Your Own SMM Panel API (BYO-API).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 font-semibold block">BotClips Wallet Balance</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">₹{userBalance.toFixed(2)}</span>
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

      {/* ── MODE SELECTOR CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1: BotClips Managed Delivery */}
        <div 
          onClick={() => setActiveMode("MANAGED")}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
            activeMode === "MANAGED"
              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                M1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">BotClips Managed Viewfarm</h3>
                <span className="text-[10px] text-slate-400">Zero-Config • Deducts from Wallet Balance</span>
              </div>
            </div>
            {activeMode === "MANAGED" && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Uses our private hardware viewfarm with 20,000+ smartphones. Simply deposit via UPI or USDT and orders auto-deduct according to catalog pricing.
          </p>
        </div>

        {/* Mode 2: Bring Your Own API */}
        <div 
          onClick={() => setActiveMode("CUSTOM_API")}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
            activeMode === "CUSTOM_API"
              ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                M2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bring Your Own SMM Panel API</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 uppercase">
                    Subscription
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Connect ANY SMM Panel • Auto-Batch Services</span>
              </div>
            </div>
            {activeMode === "CUSTOM_API" && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Connect your own external SMM panel API key. Our system auto-fetches your panel balance and batches all service IDs so orders route through your provider account.
          </p>
        </div>
      </div>

      {/* Subscription Paywall Box (if Mode 2 selected and plan NOT active) */}
      {activeMode === "CUSTOM_API" && !planActive && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/30 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2">
                <Crown className="w-3.5 h-3.5" />
                <span>Mode 2 Automation License Required</span>
              </div>
              <h2 className="text-xl font-black text-white">Unlock Custom SMM Panel Automation</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Connect your own SMM panel API, auto-fetch panel balances, batch services, and automate order dispatching with your provider.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubscribe("WEEKLY")}
                disabled={planLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                {planLoading ? "Processing..." : "Weekly Plan ($10 / ₹960)"}
              </button>
              <button
                onClick={() => handleSubscribe("MONTHLY")}
                disabled={planLoading}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-lg transition-all cursor-pointer"
              >
                {planLoading ? "Processing..." : "Monthly Plan ($25 / ₹2,400)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: CONNECTED SMM PANEL CONFIGURATION & BATCH SERVICES ── */}
      {activeMode === "CUSTOM_API" && planActive && (
        <div className="space-y-6">
          {/* API Connection & Live Balance Card */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Connected SMM Panel API</h2>
                  <p className="text-xs text-slate-400">Enter your SMM panel endpoint & API Key. We auto-fetch remaining balance and all services.</p>
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Default Service IDs for Your Campaigns</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify which Service ID on your connected panel should be triggered for each campaign type.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveApiAndDefaults}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Save Default IDs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  TikTok Views Service ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3016"
                  value={defaultServices.TIKTOK || ""}
                  onChange={(e) => setDefaultServices({ ...defaultServices, TIKTOK: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Instagram Views Service ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1026"
                  value={defaultServices.INSTAGRAM || ""}
                  onChange={(e) => setDefaultServices({ ...defaultServices, INSTAGRAM: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  YouTube Views Service ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2011"
                  value={defaultServices.YOUTUBE || ""}
                  onChange={(e) => setDefaultServices({ ...defaultServices, YOUTUBE: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  General Default Service ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1024"
                  value={defaultServices.DEFAULT || ""}
                  onChange={(e) => setDefaultServices({ ...defaultServices, DEFAULT: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* If services were batched, show interactive picker table */}
            {upstreamServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Batched Services from Your SMM Panel ({upstreamServices.length} found)
                  </span>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search batched services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredUpstream.slice(0, 50).map((srv: any) => {
                    const sId = String(srv.service || srv.id);
                    return (
                      <div key={sId} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 gap-3">
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
        </div>
      )}

      {/* Main Campaign Configuration & Waveform Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Setup & Configuration */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Launch Campaign with Real Pacing</span>
            </h3>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["TIKTOK", "INSTAGRAM", "YOUTUBE"].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSelectedPlatform(plat)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedPlatform === plat
                        ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Post / Reel / Video URL
              </label>
              <input
                type="text"
                required
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                placeholder="https://tiktok.com/@clip/... or Instagram reel link"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Views Volume
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={targetViews}
                onChange={(e) => setTargetViews(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
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
              <span>
                {activeMode === "CUSTOM_API" 
                  ? "Launch via Connected SMM Panel API" 
                  : "Launch Managed Viewfarm Campaign"}
              </span>
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
                      ? "M 10 90 C 50 85, 70 65, 110 20 C 150 10, 190 40, 240 70 C 270 85, 290 92, 300 95"
                      : curveStyle === "STEADY_DRIP"
                      ? "M 10 90 L 300 20"
                      : "M 10 90 C 20 15, 60 15, 120 35 C 180 50, 240 75, 300 85"
                  }
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Anti-Drop Algorithm:</span>
                <span className="font-bold text-emerald-600">Active (0% view loss)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Device Fingerprints:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">20k+ Physical Phones</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Retention:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">3–7 Seconds / View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
