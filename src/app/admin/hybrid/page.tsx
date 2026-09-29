"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Server,
  Shield,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Save,
  Check,
} from "lucide-react";

export default function AdminHybridPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Settings
  const [priceUsd, setPriceUsd] = useState(50);
  const [enabled, setEnabled] = useState(true);
  const [minDelay, setMinDelay] = useState(2);
  const [maxDelay, setMaxDelay] = useState(6);
  const [humanMode, setHumanMode] = useState(true);

  // Metric mappings
  const [metricPanels, setMetricPanels] = useState<Record<string, { panelId: string; serviceId: string }>>({
    views: { panelId: "", serviceId: "" },
    likes: { panelId: "", serviceId: "" },
    comments: { panelId: "", serviceId: "" },
    shares: { panelId: "", serviceId: "" },
    saves: { panelId: "", serviceId: "" },
    reposts: { panelId: "", serviceId: "" },
  });

  // Available options
  const [panels, setPanels] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCampaigns: 0, activeSubscribers: 0 });

  // Grant user access
  const [targetEmail, setTargetEmail] = useState("");
  const [grantDays, setGrantDays] = useState(30);
  const [granting, setGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/hybrid");
      const data = await res.json();
      if (data.success) {
        setPriceUsd(data.config.subscriptionPriceUsd || 50);
        setEnabled(data.config.enabled ?? true);
        setMinDelay(data.config.minDelay || 2);
        setMaxDelay(data.config.maxDelay || 6);
        setHumanMode(data.config.humanMode ?? true);
        if (data.config.metricPanels) {
          setMetricPanels((prev) => ({ ...prev, ...data.config.metricPanels }));
        }
        setPanels(data.availablePanels || []);
        setServices(data.availableServices || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSaveSuccess(null);
      setSaveError(null);

      const res = await fetch("/api/admin/hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionPriceUsd: Number(priceUsd),
          enabled,
          minDelay: Number(minDelay),
          maxDelay: Number(maxDelay),
          humanMode,
          metricPanels,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save settings");
      } else {
        setSaveSuccess("Settings and Node dispersion mappings saved successfully!");
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;

    try {
      setGranting(true);
      setGrantMessage(null);

      const res = await fetch("/api/admin/hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_user",
          email: targetEmail.trim(),
          days: grantDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGrantMessage(`Error: ${data.error}`);
      } else {
        setGrantMessage(data.message);
        setTargetEmail("");
        loadConfig();
      }
    } catch (err: any) {
      setGrantMessage(`Error: ${err.message}`);
    } finally {
      setGranting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto opacity-70" />
        <p className="text-xs font-bold text-slate-500 mt-2">Loading Hybrid Engine configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-600 text-white">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hybrid Automation Engine Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure secret multi-node provider routing, VIP subscription pricing ($50/mo), and bot safety pacing.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Campaigns</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            {stats.totalCampaigns || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">VIP Subscribers</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">
            {stats.activeSubscribers || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Rate</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            ${priceUsd} <span className="text-xs text-slate-400">/mo</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engine State</span>
          <span className="text-sm font-black text-emerald-500 font-mono mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24/7 PM2 ACTIVE</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Node Provider Routing */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Multi-Node Metric Dispersion (Secret Routing)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Map each organic engagement signal to its specific SMM provider node & service ID. (Hidden from users).
              </p>
            </div>

            <div className="space-y-3.5">
              {(["views", "likes", "comments", "shares", "saves", "reposts"] as const).map((metric) => (
                <div
                  key={metric}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="w-28 shrink-0">
                    <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                      {metric}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Signal Node</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full">
                    {/* Panel Selection */}
                    <div>
                      <select
                        value={metricPanels[metric]?.panelId || ""}
                        onChange={(e) =>
                          setMetricPanels({
                            ...metricPanels,
                            [metric]: { ...metricPanels[metric], panelId: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="">Auto (Default Panel)</option>
                        {panels.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Upstream Service ID Input or Selection */}
                    <div>
                      <input
                        type="text"
                        placeholder="Service ID (e.g. 5245)"
                        value={metricPanels[metric]?.serviceId || ""}
                        onChange={(e) =>
                          setMetricPanels({
                            ...metricPanels,
                            [metric]: { ...metricPanels[metric], serviceId: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & VIP User Management */}
        <div className="lg:col-span-5 space-y-5">
          {/* Subscription Settings Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Subscription Rate & Gateway</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Monthly Subscription Fee (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    min="1"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-converts to INR in user wallet (₹{(priceUsd * 96).toLocaleString()} at ₹96/USD).
                </p>
              </div>

              {/* Bot Safety Pacing */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Bot Safety & Human Timing
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Min Delay (s)</label>
                    <input
                      type="number"
                      value={minDelay}
                      onChange={(e) => setMinDelay(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Max Delay (s)</label>
                    <input
                      type="number"
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">Human Timing Mode</span>
                  <input
                    type="checkbox"
                    checked={humanMode}
                    onChange={(e) => setHumanMode(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grant Free Access to User Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Grant VIP Access by Email</span>
              </h2>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  placeholder="creator@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={granting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {granting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Activate VIP Plan</span>
              </button>

              {grantMessage && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">{grantMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
