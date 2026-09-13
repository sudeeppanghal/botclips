"use client";

import React, { useState } from "react";
import { Server, Plus, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminPanelsPage() {
  const [panels, setPanels] = useState([
    {
      id: "panel-1",
      name: "JustAnotherPanel (Primary)",
      url: "https://justanotherpanel.com/api/v2",
      balance: "$142.50",
      status: "ONLINE",
      active: true,
      lastChecked: "2 mins ago"
    },
    {
      id: "panel-2",
      name: "Peakerr SMM (Backup)",
      url: "https://peakerr.com/api/v2",
      balance: "$85.00",
      status: "ONLINE",
      active: true,
      lastChecked: "15 mins ago"
    }
  ]);

  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleTestConnection = (pId: string) => {
    setSyncing(pId);
    setTimeout(() => {
      setSyncing(null);
      setMessage("Connection test successful! Provider API is responding in 145ms.");
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleAddPanel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !apiUrl || !apiKey) return;

    setPanels([
      ...panels,
      {
        id: "panel-" + (panels.length + 1),
        name,
        url: apiUrl,
        balance: "$0.00",
        status: "ONLINE",
        active: true,
        lastChecked: "Just now"
      }
    ]);

    setShowAddModal(false);
    setName("");
    setApiUrl("");
    setApiKey("");
    setMessage("Provider added successfully!");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Upstream SMM Providers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect external SMM v2 APIs for automatic order dispatch and service synchronization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Connect New Provider</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Panels List */}
      <div className="space-y-4">
        {panels.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                    {p.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-400 mt-0.5">{p.url}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Provider Balance: <span className="font-black text-slate-900 dark:text-white">{p.balance}</span> • Checked: {p.lastChecked}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleTestConnection(p.id)}
                disabled={syncing === p.id}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing === p.id ? "animate-spin text-blue-600" : ""}`} />
                <span>{syncing === p.id ? "Testing..." : "Test Connection"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Connect SMM v2 Provider</h3>
            <form onSubmit={handleAddPanel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Peakerr SMM or JustAnotherPanel"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://provider.com/api/v2"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">API Secret Key</label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your provider secret API key"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
