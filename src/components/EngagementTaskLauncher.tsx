"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Zap, 
  Sliders, 
  ChevronDown, 
  ChevronUp,
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Trash2, 
  Wallet,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Award,
  Search,
  Sparkles,
  Layers,
  Crown
} from "lucide-react";
import { generateOrganicPacedBatches } from "@/lib/delivery-graphs";

interface AdminCatalogService {
  id: string;
  serviceId: string;
  name: string;
  cat?: string;
  category?: string;
  platform?: string;
  rate: number;
  min?: number;
  max?: number;
  badge?: string;
  isFarm?: boolean;
}

interface ActiveTask {
  id: string;
  serviceId: string;
  serviceName: string;
  link: string;
  minQty: number;
  maxQty: number;
  goal: number;
  cost: number;
  currentCount: number;
  intervalMinutes: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  createdAt: string;
}

export default function EngagementTaskLauncher({
  walletBalance = 0,
  onTaskCreated
}: {
  walletBalance?: number;
  onTaskCreated?: (task: any) => void;
}) {
  // ── Mode Switcher: "FARM" vs "PREMIUM" ──
  const [activeMode, setActiveMode] = useState<"FARM" | "PREMIUM">("FARM");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Default Farm packages fallback
  const defaultFarmServices: AdminCatalogService[] = [
    { id: "srv_1789388608016", serviceId: "5245", name: "Special Instagram VIEWS [Real Farm Organic]", rate: 20.50, min: 100, max: 2000000, platform: "INSTAGRAM", badge: "ALGORITHM FAVORITE", isFarm: true },
    { id: "srv_1026", serviceId: "1026", name: "Instagram Reels Views [Fast Viral Boost]", rate: 6.00, min: 100, max: 10000000, platform: "INSTAGRAM", badge: "PUSH ALGORITHM", isFarm: true },
    { id: "srv_ig_106", serviceId: "106", name: "Instagram Reels Views [Push Algorithm Farm]", rate: 28.00, min: 100, max: 5000000, platform: "INSTAGRAM", badge: "HIGH RETENTION", isFarm: true },
    { id: "srv_ig_107", serviceId: "107", name: "Instagram High Retention Reels Views", rate: 35.00, min: 100, max: 5000000, platform: "INSTAGRAM", badge: "SMARTPHONE FARM", isFarm: true },
    { id: "srv_1025", serviceId: "1025", name: "Instagram High Retention Likes [Real Active]", rate: 11.00, min: 50, max: 500000, platform: "INSTAGRAM", badge: "REAL ACTIVE", isFarm: true },
    { id: "srv_1789388890825", serviceId: "4806", name: "Instagram Likes [Main Provider]", rate: 14.00, min: 50, max: 500000, platform: "INSTAGRAM", badge: "INSTANT DISPATCH", isFarm: true },
    { id: "srv_1789388730338", serviceId: "4897", name: "Special Instagram Likes [Smartphone Farm]", rate: 18.00, min: 50, max: 200000, platform: "INSTAGRAM", badge: "SMARTPHONE FARM", isFarm: true },
    { id: "srv_ig_104", serviceId: "104", name: "Instagram High Quality Likes", rate: 45.00, min: 50, max: 100000, platform: "INSTAGRAM", badge: "VIP NON-DROP", isFarm: true },
    { id: "srv_ig_110", serviceId: "110", name: "Instagram Saves & Shares Combo", rate: 39.00, min: 100, max: 50000, platform: "INSTAGRAM", badge: "VIRAL SIGNAL", isFarm: true },
  ];

  const [farmServices, setFarmServices] = useState<AdminCatalogService[]>(defaultFarmServices);
  const [premiumServices, setPremiumServices] = useState<AdminCatalogService[]>([]);
  const [loadingPremium, setLoadingPremium] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("5245");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form State
  const [postLink, setPostLink] = useState("");
  const [minQty, setMinQty] = useState(100);
  const [maxQty, setMaxQty] = useState(150);
  const [goal, setGoal] = useState(1000);
  const [intervalMinutes, setIntervalMinutes] = useState(20);
  const [showJitterPreview, setShowJitterPreview] = useState(false);

  // Live Jitter Schedule Simulation
  const previewBatches = useMemo(() => {
    try {
      const cleanG = Math.max(1, Number(goal) || 1000);
      const cleanMin = Math.max(10, Number(minQty) || 100);
      const cleanMax = Math.max(cleanMin, Number(maxQty) || 150);
      const cleanInt = Math.max(1, Number(intervalMinutes) || 20);
      return generateOrganicPacedBatches({
        goal: cleanG,
        minQty: cleanMin,
        maxQty: cleanMax,
        avgIntervalMinutes: cleanInt,
        startTime: new Date()
      });
    } catch {
      return [];
    }
  }, [goal, minQty, maxQty, intervalMinutes]);

  // Live Wallet & Feedback State
  const [currentBalance, setCurrentBalance] = useState<number>(walletBalance);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Queue State
  const [activeQueue, setActiveQueue] = useState<ActiveTask[]>([]);

  // 1. Fetch live user balance
  useEffect(() => {
    async function fetchUserBalance() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentBalance(Number(data.user.balance || 0));
        }
      } catch {}
    }
    fetchUserBalance();
  }, [walletBalance]);

  // 2. Fetch Farm Services on load
  useEffect(() => {
    async function loadFarmServices() {
      try {
        const res = await fetch("/api/services?mode=FARM");
        const data = await res.json();
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          const list: AdminCatalogService[] = data.services.map((s: any) => ({
            id: String(s.id),
            serviceId: String(s.serviceId || s.id),
            name: s.name,
            cat: s.cat || s.category,
            platform: s.platform,
            rate: Number(s.rate || s.customRate || 0),
            min: s.min,
            max: s.max,
            badge: s.badge || "FARM NODE",
            isFarm: true,
          }));

          setFarmServices(list);
          if (activeMode === "FARM") {
            if (list.some(s => s.serviceId === "5245")) {
              setSelectedServiceId("5245");
            } else if (list.length > 0) {
              setSelectedServiceId(list[0].serviceId);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load farm services:", err);
      }
    }
    loadFarmServices();
  }, []);

  // 3. Fetch Premium 3x Services when user switches to PREMIUM mode
  const loadPremiumServices = async () => {
    if (premiumServices.length > 0) return;
    setLoadingPremium(true);
    try {
      const res = await fetch("/api/services?mode=PREMIUM");
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        const list: AdminCatalogService[] = data.services.map((s: any) => ({
          id: String(s.id),
          serviceId: String(s.serviceId || s.id),
          name: s.name,
          cat: s.cat || s.category,
          platform: s.platform,
          rate: Number(s.rate || 0), // 3x price from API
          min: s.min,
          max: s.max,
          badge: s.badge || "PREMIUM DIRECT",
          isFarm: false,
        }));
        setPremiumServices(list);
        if (list.length > 0 && activeMode === "PREMIUM") {
          setSelectedServiceId(list[0].serviceId);
        }
      }
    } catch (err) {
      console.error("Failed to load premium services:", err);
    } finally {
      setLoadingPremium(false);
    }
  };

  const handleSwitchMode = (mode: "FARM" | "PREMIUM") => {
    setActiveMode(mode);
    setIsDropdownOpen(false);
    if (mode === "PREMIUM") {
      loadPremiumServices();
      if (premiumServices.length > 0) {
        setSelectedServiceId(premiumServices[0].serviceId);
      }
    } else {
      if (farmServices.length > 0) {
        setSelectedServiceId(farmServices[0].serviceId);
      }
    }
  };

  // 4. Load active tasks from localStorage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("botclips_active_queue");
      if (savedTasks) {
        setActiveQueue(JSON.parse(savedTasks));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveQueue = (queue: ActiveTask[]) => {
    setActiveQueue(queue);
    try {
      localStorage.setItem("botclips_active_queue", JSON.stringify(queue));
    } catch {}
  };

  // Filter current active catalog
  const currentCatalog = activeMode === "FARM" ? farmServices : premiumServices;
  const filteredCatalog = useMemo(() => {
    return currentCatalog.filter((s) => {
      const matchesPlatform = platformFilter === "ALL" || (s.platform && s.platform.toUpperCase() === platformFilter.toUpperCase());
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.cat && s.cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.serviceId.includes(searchQuery);
      return matchesPlatform && matchesSearch;
    });
  }, [currentCatalog, platformFilter, searchQuery]);

  // Find currently selected service
  const selectedService = 
    filteredCatalog.find(s => s.serviceId === selectedServiceId || s.id === selectedServiceId) || 
    currentCatalog.find(s => s.serviceId === selectedServiceId || s.id === selectedServiceId) ||
    currentCatalog[0] ||
    defaultFarmServices[0];

  const serviceRate = Number(selectedService?.rate || 20.50);
  const cleanGoal = Math.max(1, Number(goal) || 1);
  const estimatedCost = Number(((cleanGoal / 1000) * serviceRate).toFixed(2));
  const hasSufficientBalance = currentBalance >= estimatedCost;
  const remainingBalance = Math.max(0, currentBalance - estimatedCost);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleActivateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isValidUrl(postLink)) {
      setError("Valid URL required (must start with https://)");
      return;
    }

    if (minQty <= 0 || maxQty < minQty || cleanGoal < maxQty) {
      setError("Check quantities: Min Qty must be ≤ Max Qty, and Goal must be ≥ Max Qty.");
      return;
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient wallet balance. Available: ₹${currentBalance.toFixed(2)}, Required: ₹${estimatedCost.toFixed(2)}. Please add funds on your Wallet page.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.serviceId || selectedService.id,
          serviceName: selectedService.name,
          link: postLink,
          quantity: cleanGoal,
          minQty,
          maxQty,
          intervalMinutes,
          isAutomatedTask: true,
          mode: activeMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to launch task");
      }

      if (data.balance !== undefined) {
        setCurrentBalance(Number(data.balance));
      } else {
        setCurrentBalance(prev => Math.max(0, prev - estimatedCost));
      }

      const newTask: ActiveTask = {
        id: data.order?.id || "task_" + Math.random().toString(36).substring(2, 9),
        serviceId: selectedService.serviceId,
        serviceName: selectedService.name,
        link: postLink,
        minQty,
        maxQty,
        goal: cleanGoal,
        cost: estimatedCost,
        currentCount: 0,
        intervalMinutes,
        status: "ACTIVE",
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      saveQueue([newTask, ...activeQueue]);
      setSuccessMessage(`Automated task for ${selectedService.name} activated! ₹${estimatedCost.toFixed(2)} deducted.`);
      setPostLink("");
      if (onTaskCreated) onTaskCreated(newTask);
    } catch (err: any) {
      setError(err.message || "Failed to launch automated task");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const updated = activeQueue.map(t => {
      if (t.id === taskId) {
        return { ...t, status: (t.status === "ACTIVE" ? "PAUSED" : "ACTIVE") as "ACTIVE" | "PAUSED" };
      }
      return t;
    });
    saveQueue(updated);
  };

  const removeTask = (taskId: string) => {
    saveQueue(activeQueue.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ── CARD 1: NEW ENGAGEMENT TASK ── */}
      <div className="bg-[#0b0505] text-white rounded-3xl p-6 sm:p-8 border border-red-950/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header with Live Wallet Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
                <Zap className="w-6 h-6 text-red-500 fill-red-500 shrink-0" />
                <span>New Engagement Task</span>
              </h2>
              <p className="text-sm text-neutral-400 mt-1 font-medium">
                Select your service, view live rates per 1,000, and launch drip-fed automated tasks.
              </p>
            </div>

            {/* Wallet pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#140808] border border-red-900/60 text-xs self-start sm:self-auto">
              <Wallet className="w-4 h-4 text-red-400" />
              <span className="text-neutral-400 font-medium">Wallet:</span>
              <span className="font-mono font-bold text-white text-sm">₹{currentBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* ── MODE SWITCHER: BOTCLIPS FARM MODE VS BOTCLIPS PREMIUM MODE ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#140808] border border-red-950/80">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSwitchMode("FARM")}
                className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  activeMode === "FARM"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/40"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>🌾</span>
                <span>BotClips Farm Mode</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono text-red-200">Curated</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("PREMIUM")}
                className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  activeMode === "PREMIUM"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/40"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>⚡</span>
                <span>BotClips Premium</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono text-amber-200">3,000+ Svc</span>
              </button>
            </div>

            <div className="text-xs text-neutral-400 px-3 hidden lg:block">
              {activeMode === "FARM" 
                ? "🚜 Pre-configured algorithmic farm nodes with custom tested rates." 
                : "⚡ Direct high-speed global delivery network across 3,000+ services."}
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Premium Mode Filters & Search */}
          {activeMode === "PREMIUM" && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#140808] border border-red-950/60">
              {/* Platform Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {["ALL", "INSTAGRAM", "YOUTUBE", "TIKTOK", "TWITTER", "TELEGRAM", "FACEBOOK", "OTHER"].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                      platformFilter === plat
                        ? "bg-amber-500 text-black shadow-xs font-black"
                        : "bg-neutral-900/80 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {plat === "ALL" ? "All Platforms" : plat}
                  </button>
                ))}
              </div>

              {/* Real-time Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 3,000+ premium services (e.g. YouTube views, TikTok followers, Instagram likes)..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0e0606] border border-red-950 focus:border-amber-500/70 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleActivateTask} className="space-y-6">
            
            {/* Row 1: Select Service & Post Link */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left: Select Service */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-400" />
                    <span>Select Service ({activeMode === "FARM" ? "Farm Packages" : "Premium Catalog"})</span>
                  </label>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    {loadingPremium ? "Loading catalog..." : `${filteredCatalog.length} Services Available`}
                  </span>
                </div>

                {/* Dropdown Box */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-12 px-4 rounded-xl bg-[#120808] border border-red-900/50 hover:border-red-500/80 text-left text-neutral-200 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {selectedService?.name}
                      </span>
                      <span className="shrink-0 px-2.5 py-0.5 rounded bg-red-950 text-red-400 text-xs font-bold border border-red-900/60 font-mono">
                        ₹{serviceRate.toFixed(2)} / 1k
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#140808] border border-red-900/60 rounded-xl shadow-2xl py-1 z-30 max-h-72 overflow-y-auto">
                      {filteredCatalog.length === 0 ? (
                        <div className="p-4 text-center text-xs text-neutral-500">
                          {loadingPremium ? "Fetching services from provider network..." : "No services found matching filters."}
                        </div>
                      ) : (
                        filteredCatalog.map((svc) => (
                          <button
                            key={svc.serviceId || svc.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(svc.serviceId);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-xs font-mono flex items-center justify-between hover:bg-red-950/40 transition-colors cursor-pointer border-b border-red-950/40 last:border-0 ${
                              selectedServiceId === svc.serviceId ? "text-red-400 font-bold bg-red-950/30" : "text-neutral-300"
                            }`}
                          >
                            <div className="flex flex-col gap-0.5 truncate mr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm truncate">{svc.name}</span>
                                {svc.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 border border-red-900/80 text-red-400 font-black shrink-0">
                                    {svc.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400">
                                {svc.platform || "GLOBAL"} {svc.cat ? `• ${svc.cat}` : ""}
                              </span>
                            </div>
                            <span className="shrink-0 px-2.5 py-1 rounded-md bg-red-950/90 text-red-300 font-black text-xs border border-red-900/70 font-mono">
                              ₹{svc.rate.toFixed(2)} / 1k
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Post / Video Link */}
              <div>
                <div className="mb-2">
                  <label className="text-sm font-semibold text-red-500 block">
                    Post / Video Link
                  </label>
                </div>

                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#120808] border border-red-900/50 focus:border-red-500 text-neutral-200 placeholder-neutral-600 text-sm font-mono outline-none transition-colors"
                />
                
                {(!postLink || !isValidUrl(postLink)) && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    Valid URL required.
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Min Qty, Max Qty, Goal, Interval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Min Qty */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Min Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={minQty}
                  onChange={(e) => setMinQty(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#120808] border border-red-900/50 focus:border-red-500 text-neutral-200 text-sm font-mono outline-none"
                />
              </div>

              {/* Max Qty */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Max Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxQty}
                  onChange={(e) => setMaxQty(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#120808] border border-red-900/50 focus:border-red-500 text-neutral-200 text-sm font-mono outline-none"
                />
              </div>

              {/* Goal */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Goal
                </label>
                <input
                  type="number"
                  min="10"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#120808] border border-red-900/50 focus:border-red-500 text-neutral-200 text-sm font-mono outline-none"
                />
              </div>

              {/* Interval Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Interval ({intervalMinutes}m)
                  </label>
                </div>
                <div className="h-11 flex items-center px-1">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ── CARD 2: AUDITOR DETECTION COMPARISON GRAPHIC ── */}
            <div className="rounded-2xl bg-[#140808] border border-red-950/80 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-950/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Auditor Detection: Fake SMM Views vs BotClips Jitter Engine</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        WHOP PROVEN
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Why standard linear dripfeed gets videos shadowbanned, and how our stochastic Poisson jitter passes platform audits.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJitterPreview(!showJitterPreview)}
                  className="text-xs font-mono font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>View Jitter Schedule ({previewBatches.length} Pulses)</span>
                  {showJitterPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Side-by-Side Comparison Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Fake Banned Bot SMM Panel Flow */}
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-xs text-neutral-200">Standard SMM Drip-Feed</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-300">
                      89/100 BOT RISK (BANNED)
                    </span>
                  </div>

                  {/* Flat robot blocks */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="flex-1 min-w-[32px] h-8 rounded bg-red-800/80 border border-red-600/40 flex items-center justify-center text-[10px] font-mono text-red-200 font-bold">
                        {Math.round(cleanGoal / 8)}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Identical, flat view blocks delivered on a mechanical clock. Platform moderation algorithms detect zero-variance spikes and restrict FYP distribution within 4 hours.
                  </p>
                </div>

                {/* 2. BotClips Organic Jitter Engine Flow */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-neutral-200">BotClips Organic Jitter Engine</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                      12/100 HUMAN RESONANCE (ACCEPTED)
                    </span>
                  </div>

                  {/* Stochastic dynamic blocks */}
                  <div className="flex items-end gap-1.5 pt-1 overflow-x-auto pb-1 h-10">
                    {previewBatches.slice(0, 8).map((b, i) => {
                      const heightPercent = Math.min(100, Math.max(35, Math.round((b.views / Math.max(1, maxQty)) * 100)));
                      return (
                        <div 
                          key={i} 
                          style={{ height: `${heightPercent}%` }}
                          className="flex-1 min-w-[32px] rounded bg-emerald-500/80 border border-emerald-400/50 flex items-center justify-center text-[10px] font-mono text-emerald-950 font-black transition-all"
                        >
                          {b.views}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Non-linear parabolic growth waves with stochastic time jitter (±35%) and organic watch-time retention. Mirrors natural viral sharing patterns and passes Whop audits.
                  </p>
                </div>
              </div>

              {/* Collapsible Scheduled Pulses Drawer */}
              {showJitterPreview && (
                <div className="mt-4 pt-3 border-t border-red-950/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Generated Pulses ({previewBatches.length} Total):</span>
                    <span>Total Scheduled: {previewBatches.reduce((acc, cur) => acc + cur.views, 0)} Views</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 max-h-48 overflow-y-auto">
                    {previewBatches.map((batch, index) => (
                      <div key={index} className="p-2 rounded-lg bg-[#0e0606] border border-red-950 text-left font-mono">
                        <div className="text-[10px] text-neutral-500">Pulse #{batch.batchNumber || index + 1}</div>
                        <div className="text-xs font-bold text-emerald-400">{batch.views} views</div>
                        <div className="text-[10px] text-neutral-400">{batch.timeFormatted}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── CARD 3: COST CALCULATION & SUBMIT ── */}
            <div className="p-5 rounded-2xl bg-[#140808] border border-red-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-400 block">Total Estimated Cost</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    ₹{estimatedCost.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    ({cleanGoal.toLocaleString()} views @ ₹{serviceRate.toFixed(2)}/1k)
                  </span>
                </div>
                {!hasSufficientBalance && (
                  <p className="text-xs text-red-400 font-medium">
                    Requires ₹{(estimatedCost - currentBalance).toFixed(2)} more. Please deposit to proceed.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !hasSufficientBalance}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-sm font-black tracking-wide shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {submitting ? "Deploying Algorithmic Task..." : "⚡ Launch Engagement Task"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── CARD 4: ACTIVE ENGAGEMENT QUEUE ── */}
      <div className="bg-[#0b0505] text-white rounded-3xl p-6 sm:p-8 border border-red-950/60 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 border-b border-red-950/60">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              <span>Active Engagement Tasks ({activeQueue.length})</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live automated tasks running on our non-linear Poisson pacing engine.
            </p>
          </div>
        </div>

        {activeQueue.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 font-medium text-sm">
            No active engagement tasks running. Configure parameters above to launch your first task!
          </div>
        ) : (
          <div className="divide-y divide-red-950/50">
            {activeQueue.map((task) => (
              <div key={task.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-white">{task.serviceName}</span>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                      task.status === "ACTIVE" 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                        : "bg-amber-950 text-amber-400 border border-amber-900"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono truncate">{task.link}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
                    <span>Goal: {task.goal.toLocaleString()}</span>
                    <span>Cost: ₹{task.cost.toFixed(2)}</span>
                    <span>Interval: {task.intervalMinutes}m</span>
                    <span>Launched: {task.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {task.status === "ACTIVE" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
