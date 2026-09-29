"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Layers,
  DollarSign
} from "lucide-react";

interface PanelItem {
  id: string;
  name: string;
  apiUrl: string;
  currency?: string | null;
  balance?: number | null;
  status?: string | null;
  isActive: boolean;
  lastCheckedAt?: string | null;
  _count?: {
    services: number;
  };
}

export default function AdminPanelsPage() {
  const [panels, setPanels] = useState<PanelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add Panel Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [adding, setAdding] = useState(false);

  // Load panels from API
  const loadPanels = async (checkLive = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = checkLive ? "/api/admin/panels?checkBalance=true" : "/api/admin/panels";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPanels(data.panels || []);
      } else {
        setError(data.error || "Failed to load panels");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load panels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanels();
  }, []);

  // Test live connection / balance check for a specific panel
  const handleTestConnection = async (panelId: string) => {
    try {
      setSyncing(panelId);
      setMessage(null);
      setError(null);

      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-balance", panelId }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`Connection verified! Live balance: ${data.currency} ${data.balance}`);
        loadPanels();
      } else {
        setError(data.error || "Connection test failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to test connection");
    } finally {
      setSyncing(null);
    }
  };

  // Add new panel to DB
  const handleAddPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !apiUrl || !apiKey) return;

    try {
      setAdding(true);
      setMessage(null);
      setError(null);

      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          apiUrl,
          apiKey,
          currency,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`Provider "${name}" connected successfully!`);
        setShowAddModal(false);
        setName("");
        setApiUrl("");
        setApiKey("");
        loadPanels();
      } else {
        setError(data.error || "Failed to connect provider");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setAdding(false);
    }
  };

  // Delete a panel
  const handleDeletePanel = async (panelId: string, panelName: string) => {
    if (!confirm(`Are you sure you want to disconnect provider "${panelName}"?`)) return;

    try {
      setMessage(null);
      setError(null);
      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", panelId }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`Provider "${panelName}" removed.`);
        loadPanels();
      } else {
        setError(data.error || "Failed to remove provider");
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove provider");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Server className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Upstream SMM Providers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect external SMM v2 APIs for automatic order dispatch and Hybrid Multi-Node Dispersion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/hybrid"
            className="px-3.5 py-2 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hybrid Routing Matrix</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Connect New Provider</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Panels List */}
      <div className="space-y-4">
        {loading && (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">
            Loading upstream providers...
          </div>
        )}

        {!loading && panels.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3">
            <Server className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No SMM Providers Connected</p>
            <p className="text-xs text-slate-400">Click &quot;Connect New Provider&quot; above to add your first SMM API endpoint.</p>
          </div>
        )}

        {!loading && panels.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-500/20"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {p.isActive ? "ONLINE" : "DISABLED"}
                  </span>
                  {p._count?.services ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {p._count.services} Services
                    </span>
                  ) : null}
                </div>
                <div className="font-mono text-xs text-slate-400 mt-0.5">{p.apiUrl}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>Balance:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {p.currency || "INR"} {p.balance != null ? Number(p.balance).toFixed(2) : "0.00"}
                  </span>
                  {p.lastCheckedAt && (
                    <span className="text-slate-400 text-[10px]">
                      • Checked {new Date(p.lastCheckedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleTestConnection(p.id)}
                disabled={syncing === p.id}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing === p.id ? "animate-spin text-blue-600" : ""}`} />
                <span>{syncing === p.id ? "Checking..." : "Live Balance"}</span>
              </button>

              <button
                onClick={() => handleDeletePanel(p.id, p.name)}
                className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Disconnect Provider"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                <span>Connect SMM v2 Provider</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPanel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chand Main Node, Peakerr SMM, YoyoMedia"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">API Endpoint URL (v2)</label>
                <input
                  type="url"
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://provider.com/api/v2"
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">API Secret Key</label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your SMM API secret key"
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provider Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {adding ? "Connecting..." : "Save & Connect Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
