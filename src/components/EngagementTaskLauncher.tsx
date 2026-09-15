"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Sliders, 
  ChevronDown, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Trash2, 
  Wallet,
  Calculator
} from "lucide-react";

interface AdminCatalogService {
  id: string;
  serviceId: string;
  name: string;
  cat?: string;
  platform?: string;
  rate: number;
  min?: number;
  max?: number;
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
  // Admin Panel Services only (default fallback while loading)
  const [catalogServices, setCatalogServices] = useState<AdminCatalogService[]>([
    { id: "srv_1789388608016", serviceId: "5245", name: "Special Instagram VIEWS [Real Farm Organic]", rate: 20.50, min: 100, max: 2000000 },
    { id: "srv_1026", serviceId: "1026", name: "Instagram Reels Views [Fast Viral Boost]", rate: 6.00, min: 100, max: 10000000 },
    { id: "srv_ig_106", serviceId: "106", name: "Instagram Reels Views [Push Algorithm Farm]", rate: 28.00, min: 100, max: 5000000 },
    { id: "srv_ig_107", serviceId: "107", name: "Instagram High Retention Reels Views", rate: 35.00, min: 100, max: 5000000 },
    { id: "srv_1025", serviceId: "1025", name: "Instagram High Retention Likes [Real Active]", rate: 11.00, min: 50, max: 500000 },
    { id: "srv_1789388890825", serviceId: "4806", name: "Instagram Likes [Main Provider]", rate: 14.00, min: 50, max: 500000 },
    { id: "srv_1789388730338", serviceId: "4897", name: "Special Instagram Likes [Smartphone Farm]", rate: 18.00, min: 50, max: 200000 },
    { id: "srv_ig_104", serviceId: "104", name: "Instagram High Quality Likes", rate: 45.00, min: 50, max: 100000 },
    { id: "srv_ig_110", serviceId: "110", name: "Instagram Saves & Shares Combo", rate: 39.00, min: 100, max: 50000 },
  ]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("5245");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form State
  const [postLink, setPostLink] = useState("");
  const [minQty, setMinQty] = useState(100);
  const [maxQty, setMaxQty] = useState(150);
  const [goal, setGoal] = useState(1000);
  const [intervalMinutes, setIntervalMinutes] = useState(20);

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

  // 2. Fetch all active services from admin panel API
  useEffect(() => {
    async function loadAdminServices() {
      try {
        const res = await fetch("/api/services");
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
          }));

          setCatalogServices(list);
          // Default to 5245 if present
          if (list.some(s => s.serviceId === "5245")) {
            setSelectedServiceId("5245");
          } else if (list.length > 0) {
            setSelectedServiceId(list[0].serviceId);
          }
        }
      } catch (err) {
        console.error("Failed to load admin services in task launcher:", err);
      }
    }
    loadAdminServices();
  }, []);

  // 3. Load active tasks from localStorage
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

  // Find currently selected service
  const selectedService = 
    catalogServices.find(s => s.serviceId === selectedServiceId || s.id === selectedServiceId) || 
    catalogServices[0];

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
          isAutomatedTask: true
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to launch task");
      }

      // Update balance locally for instant responsiveness
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
      setSuccessMessage(`Automated task for ${selectedService.name} (ID: ${selectedService.serviceId}) activated! ₹${estimatedCost.toFixed(2)} deducted.`);
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
        {/* Subtle red ambient glow */}
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
              <span className="text-neutral-400">Wallet:</span>
              <span className="font-bold text-white font-mono text-sm">₹{currentBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleActivateTask} className="space-y-6">
            {/* Row 1: Select Service & Post / Video Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left: Select Service (Admin Services Only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-400" />
                    <span>Select Service</span>
                  </label>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    {catalogServices.length} Services Available
                  </span>
                </div>

                {/* Dropdown Box with Rate Display */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-12 px-4 rounded-xl bg-[#120808] border border-red-900/50 hover:border-red-500/80 text-left text-neutral-200 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {selectedService?.name} ({selectedService?.serviceId})
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-red-950 text-red-400 text-xs font-bold border border-red-900/60 font-mono">
                        ₹{serviceRate.toFixed(2)} / 1k
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#140808] border border-red-900/60 rounded-xl shadow-2xl py-1 z-30 max-h-72 overflow-y-auto">
                      {catalogServices.map((svc) => (
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
                            <span className="font-bold text-white text-sm truncate">{svc.name}</span>
                            <span className="text-[11px] text-neutral-400">
                              Service ID: {svc.serviceId} {svc.cat ? `• ${svc.cat}` : ""}
                            </span>
                          </div>
                          <span className="shrink-0 px-2.5 py-1 rounded-md bg-red-950/90 text-red-300 font-black text-xs border border-red-900/70 font-mono">
                            ₹{svc.rate.toFixed(2)} / 1k
                          </span>
                        </button>
                      ))}
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
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                  <span>Interval ({intervalMinutes}m)</span>
                </div>
                <div className="h-11 flex items-center px-1">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full h-1.5 bg-red-950 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            </div>

            {/* ── LIVE CALCULATED ORDER COST & WALLET STATUS ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#140808] border border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-neutral-400 font-semibold flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-red-500" />
                  <span>Calculated Order Cost</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-500 font-mono tracking-tight">
                    ₹{estimatedCost.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    ({cleanGoal.toLocaleString()} volume × ₹{serviceRate.toFixed(2)} / 1,000)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-red-950/80">
                <div className="text-left sm:text-right">
                  <span className="text-neutral-400 block text-[11px]">Your Wallet</span>
                  <span className="font-black text-white font-mono text-sm">₹{currentBalance.toFixed(2)}</span>
                </div>

                <div className="text-left sm:text-right pl-4 border-l border-red-900/50">
                  <span className="text-neutral-400 block text-[11px]">After Order</span>
                  <span className={`font-black font-mono text-sm ${hasSufficientBalance ? "text-emerald-400" : "text-red-400"}`}>
                    {hasSufficientBalance ? `₹${remainingBalance.toFixed(2)}` : "Insufficient Balance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Big Red Button */}
            <button
              type="submit"
              disabled={submitting || !hasSufficientBalance}
              className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                +
              </div>
              <span>
                {submitting 
                  ? "Launching Automated Task..." 
                  : !hasSufficientBalance 
                  ? `Insufficient Balance (Requires ₹${estimatedCost.toFixed(2)})`
                  : `Activate Automated Task • Pay ₹${estimatedCost.toFixed(2)}`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ── CARD 2: ACTIVE QUEUE ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-wider mb-3 px-1">
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-[1px]" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-[1px]" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-[1px]" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-[1px]" />
          </div>
          <span>Active Queue</span>
        </div>

        {activeQueue.length === 0 ? (
          /* Empty Queue State matching user screenshot */
          <div className="rounded-3xl border border-dashed border-red-900/60 bg-[#0c0505] p-12 text-center">
            <h3 className="text-xl font-bold text-neutral-300">
              Queue Empty
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              No tasks currently running for this app.
            </p>
          </div>
        ) : (
          /* Active Running Tasks */
          <div className="space-y-3">
            {activeQueue.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-red-950/70 bg-[#0c0505] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-400 text-[11px] font-mono font-bold border border-red-900/60">
                      ID {task.serviceId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      task.status === "ACTIVE" 
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 animate-pulse"
                        : "bg-amber-950/60 text-amber-400 border border-amber-900/50"
                    }`}>
                      ● {task.status}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Every {task.intervalMinutes}m
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white font-bold truncate max-w-md">
                    {task.serviceName}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate max-w-md">
                    {task.link}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="text-xs text-neutral-400">Pacing</div>
                    <div className="text-sm font-bold text-white">
                      {task.minQty}–{task.maxQty} / batch
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs text-neutral-400">Cost</div>
                    <div className="text-sm font-bold text-white">
                      ₹{task.cost ? task.cost.toFixed(2) : "0.00"}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs text-neutral-400">Goal</div>
                    <div className="text-sm font-black text-red-400">
                      {task.goal.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-red-950">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title={task.status === "ACTIVE" ? "Pause Task" : "Resume Task"}
                    >
                      {task.status === "ACTIVE" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="p-2 rounded-xl bg-red-950/30 text-red-400 hover:bg-red-900/50 transition-colors cursor-pointer"
                      title="Terminate Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
