"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Sliders, 
  ChevronDown, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink,
  Layers
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  category?: string;
  rate?: number;
}

interface ActiveTask {
  id: string;
  serviceId: string;
  serviceName: string;
  link: string;
  minQty: number;
  maxQty: number;
  goal: number;
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
  // Services
  const [services, setServices] = useState<ServiceItem[]>([
    { id: "5245", name: "views" },
    { id: "1026", name: "likes" },
    { id: "3018", name: "shares" },
    { id: "4092", name: "saves" },
  ]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("5245");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add Service Modal / Inline
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceId, setNewServiceId] = useState("");

  // Form State
  const [postLink, setPostLink] = useState("");
  const [minQty, setMinQty] = useState(100);
  const [maxQty, setMaxQty] = useState(150);
  const [goal, setGoal] = useState(1000);
  const [intervalMinutes, setIntervalMinutes] = useState(20);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Queue State
  const [activeQueue, setActiveQueue] = useState<ActiveTask[]>([]);

  // Load existing tasks from localStorage / API
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("botclips_active_queue");
      if (savedTasks) {
        setActiveQueue(JSON.parse(savedTasks));
      }
      const savedServices = localStorage.getItem("botclips_custom_services");
      if (savedServices) {
        const parsed = JSON.parse(savedServices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage when updated
  const saveQueue = (queue: ActiveTask[]) => {
    setActiveQueue(queue);
    try {
      localStorage.setItem("botclips_active_queue", JSON.stringify(queue));
    } catch {}
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceId.trim() || !newServiceName.trim()) return;
    const newItem: ServiceItem = {
      id: newServiceId.trim(),
      name: newServiceName.trim().toLowerCase(),
    };
    const updated = [newItem, ...services.filter(s => s.id !== newItem.id)];
    setServices(updated);
    setSelectedServiceId(newItem.id);
    setNewServiceId("");
    setNewServiceName("");
    setShowAddModal(false);
    try {
      localStorage.setItem("botclips_custom_services", JSON.stringify(updated));
    } catch {}
  };

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

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

    if (minQty <= 0 || maxQty < minQty || goal < maxQty) {
      setError("Check quantities: Min Qty must be ≤ Max Qty, and Goal must be ≥ Max Qty.");
      return;
    }

    setSubmitting(true);

    try {
      // Call orders API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: `${selectedService.name} (${selectedService.id})`,
          link: postLink,
          quantity: goal,
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

      const newTask: ActiveTask = {
        id: data.order?.id || "task_" + Math.random().toString(36).substring(2, 9),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        link: postLink,
        minQty,
        maxQty,
        goal,
        currentCount: 0,
        intervalMinutes,
        status: "ACTIVE",
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      saveQueue([newTask, ...activeQueue]);
      setSuccessMessage(`Automated task for ${selectedService.name} (${selectedService.id}) successfully activated!`);
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
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <Zap className="w-6 h-6 text-red-500 fill-red-500 shrink-0" />
              <span>New Engagement Task</span>
            </h2>
            <p className="text-sm text-neutral-400 mt-1 font-medium">
              Define your own Service IDs and launch tasks.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleActivateTask} className="space-y-6">
            {/* Row 1: Select Service & Post / Video Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left: Select Service */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-400" />
                    <span>Select Service</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider flex items-center gap-1 border border-red-900/60 hover:border-red-500 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service ID</span>
                  </button>
                </div>

                {/* Dropdown Box */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-12 px-4 rounded-xl bg-[#120808] border border-red-900/50 hover:border-red-500/80 text-left text-neutral-200 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-mono">{selectedService ? `${selectedService.name} (${selectedService.id})` : "Select Service"}</span>
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#140808] border border-red-900/60 rounded-xl shadow-2xl py-1 z-30 max-h-56 overflow-y-auto">
                      {services.map((svc) => (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => {
                            setSelectedServiceId(svc.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-xs font-mono flex items-center justify-between hover:bg-red-950/40 transition-colors cursor-pointer ${
                            selectedServiceId === svc.id ? "text-red-400 font-bold bg-red-950/30" : "text-neutral-300"
                          }`}
                        >
                          <span>{svc.name} ({svc.id})</span>
                          {selectedServiceId === svc.id && <span className="text-red-500 text-xs">●</span>}
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
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                +
              </div>
              <span>{submitting ? "Launching Automated Task..." : "Activate Automated Task"}</span>
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
                      ID {task.serviceId} • {task.serviceName}
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
                  <div className="text-xs font-mono text-neutral-300 truncate max-w-md">
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
                    <div className="text-xs text-neutral-400">Goal</div>
                    <div className="text-sm font-black text-red-400">
                      {task.goal}
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

      {/* ── MODAL: ADD SERVICE ID ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120808] border border-red-900/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              <span>Add Custom Service ID</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Define a Service ID from your connected SMM panel to use in automated tasks.
            </p>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Service ID (Numeric)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5245"
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0a0404] border border-red-900/50 focus:border-red-500 text-white font-mono text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Service Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. views, likes, custom"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0a0404] border border-red-900/50 focus:border-red-500 text-white font-mono text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
