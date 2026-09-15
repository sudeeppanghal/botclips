"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  ArrowUpRight 
} from "lucide-react";

interface FarmPackage {
  id: string;
  name: string;
  platform: string;
  category: string;
  serviceId: string;
  originalRate: number;
  customRate: number;
  minQuantity: number;
  maxQuantity: number;
  badge?: string;
  isActive: boolean;
  panel?: {
    id: string;
    name: string;
    status: string;
  };
}

interface UpstreamService {
  serviceId: string;
  panelId: string;
  panelName: string;
  name: string;
  category: string;
  platform: string;
  originalRate: number;
  sellingRate: number; // 3x price
  minQuantity: number;
  maxQuantity: number;
  type: string;
}

export default function AdminServicesPage() {
  const [activePlatform, setActivePlatform] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [farmPackages, setFarmPackages] = useState<FarmPackage[]>([]);
  const [upstreamServices, setUpstreamServices] = useState<UpstreamService[]>([]);
  const [panels, setPanels] = useState<any[]>([]);
  const [platformCounts, setPlatformCounts] = useState<Record<string, { farm: number; upstream: number }>>({});

  // Inline Price Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);

  // Create / Edit Farm Package Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT" | "PROMOTE">("CREATE");
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    platform: "INSTAGRAM",
    category: "Instagram Farm Views",
    serviceId: "",
    panelId: "",
    originalRate: 0,
    customRate: 25.00,
    minQuantity: 100,
    maxQuantity: 1000000,
    badge: "ALGORITHM FARM",
  });
  const [submittingModal, setSubmittingModal] = useState(false);

  useEffect(() => {
    loadServicesData();
  }, [activePlatform]);

  async function loadServicesData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services?platform=${activePlatform}`);
      const data = await res.json();
      if (data.success) {
        setFarmPackages(data.farmPackages || []);
        setUpstreamServices(data.upstreamServices || []);
        setPanels(data.panels || []);
        if (data.platformCounts) {
          setPlatformCounts(data.platformCounts);
        }
      }
    } catch (err: any) {
      console.error(err);
      showMessage("Failed to load catalog from provider network", "error");
    } finally {
      setLoading(false);
    }
  }

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // 1. Quick Inline Save Custom Price
  const handleSavePrice = async (id: string) => {
    const num = parseFloat(tempPrice);
    if (isNaN(num) || num <= 0) {
      showMessage("Please enter a valid price", "error");
      return;
    }

    setSavingPrice(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick-update-price",
          id,
          customRate: num,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFarmPackages(prev => prev.map(p => p.id === id ? { ...p, customRate: num } : p));
        setEditingPriceId(null);
        showMessage("Custom price updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update price");
      }
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setSavingPrice(false);
    }
  };

  // 2. Toggle Service Active / Inactive
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-status", id }),
      });
      const data = await res.json();
      if (data.success) {
        setFarmPackages(prev => prev.map(p => p.id === id ? { ...p, isActive: data.isActive } : p));
        showMessage(data.isActive ? "Service activated" : "Service paused");
      }
    } catch (err: any) {
      showMessage(err.message, "error");
    }
  };

  // 3. Delete Farm Package
  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Farm package?")) return;
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setFarmPackages(prev => prev.filter(p => p.id !== id));
        showMessage("Package deleted");
      }
    } catch (err: any) {
      showMessage(err.message, "error");
    }
  };

  // 4. Open Promote Upstream Service to Farm Mode Modal
  const handlePromoteToFarm = (svc: UpstreamService) => {
    setModalMode("PROMOTE");
    // Suggest 3x or 2.5x custom price
    const suggestedRate = svc.sellingRate || Math.round(svc.originalRate * 3);
    setFormData({
      id: "",
      name: `Special ${svc.platform} VIEWS [Real Smartphone Farm]`,
      platform: svc.platform,
      category: svc.category || "Farm Packages",
      serviceId: svc.serviceId,
      panelId: svc.panelId,
      originalRate: svc.originalRate,
      customRate: suggestedRate,
      minQuantity: svc.minQuantity || 100,
      maxQuantity: svc.maxQuantity || 1000000,
      badge: "SMARTPHONE FARM",
    });
    setModalOpen(true);
  };

  // 5. Submit Modal (Create, Edit or Promote)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModal(true);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-farm-package",
          ...formData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save package");
      }

      showMessage(modalMode === "PROMOTE" ? "Promoted to Farm Package successfully!" : "Farm package saved!");
      setModalOpen(false);
      loadServicesData();
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Filter upstream services by search query
  const filteredUpstream = upstreamServices.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.serviceId.includes(q);
  });

  const platforms = [
    { id: "ALL", label: "All Platforms" },
    { id: "INSTAGRAM", label: "Instagram" },
    { id: "YOUTUBE", label: "YouTube" },
    { id: "TIKTOK", label: "TikTok" },
    { id: "TWITTER", label: "Twitter (X)" },
    { id: "TELEGRAM", label: "Telegram" },
    { id: "FACEBOOK", label: "Facebook" },
    { id: "OTHER", label: "Other" },
  ];

  return (
    <div className="space-y-8">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Services & Platform Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage curated BotClips Farm packages with custom pricing and monitor live auto-synced upstream provider services.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => loadServicesData()}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Auto-Sync</span>
          </button>

          <button
            onClick={() => {
              setModalMode("CREATE");
              setFormData({
                id: "",
                name: "",
                platform: activePlatform === "ALL" ? "INSTAGRAM" : activePlatform,
                category: "Farm Packages",
                serviceId: "",
                panelId: panels[0]?.id || "",
                originalRate: 0,
                customRate: 20.00,
                minQuantity: 100,
                maxQuantity: 1000000,
                badge: "ALGORITHM FARM",
              });
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create Farm Package</span>
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
          message.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              🌾 BotClips Farm Packages
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {farmPackages.length}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
              Pre-configured custom rates
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
            🌾
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Upstream SMM Services (3x)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {upstreamServices.length.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 block">
              Auto-fetched & dynamically priced
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-black">
            ⚡
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              🌐 Connected Provider Panels
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {panels.length} Active
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5 block">
              {panels.map(p => p.name).join(", ") || "None"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── PLATFORM FILTER TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {platforms.map((plat) => {
          const counts = platformCounts[plat.id] || { farm: 0, upstream: 0 };
          const isActive = activePlatform === plat.id;
          return (
            <button
              key={plat.id}
              onClick={() => setActivePlatform(plat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{plat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                isActive 
                  ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}>
                {counts.farm}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SECTION 1: CURATED BOTCLIPS FARM PACKAGES ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌾</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                BotClips Farm Mode Packages
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                Custom Admin Pricing
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These curated services are featured in Farm Mode. You can click on any price to update it inline instantly.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Service ID</th>
                <th className="py-3 px-3">Package Name</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Provider Cost</th>
                <th className="py-3 px-3">Custom Selling Price (₹/1k)</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Min / Max</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {farmPackages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No Farm packages configured for this platform. Click "+ Create Farm Package" or promote one from below!
                  </td>
                </tr>
              ) : (
                farmPackages.map((pkg) => {
                  const isEditingThis = editingPriceId === pkg.id;
                  const marginInr = Number(pkg.customRate) - Number(pkg.originalRate || 0);

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{pkg.serviceId}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {pkg.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {pkg.category} {pkg.badge ? `• [${pkg.badge}]` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-300">
                        {pkg.platform}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                        ₹{Number(pkg.originalRate || 0).toFixed(2)}
                      </td>

                      {/* Inline Edit Custom Price */}
                      <td className="py-3.5 px-3 font-mono">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500">₹</span>
                            <input
                              type="number"
                              step="0.5"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-500 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePrice(pkg.id)}
                              disabled={savingPrice}
                              className="p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingPriceId(pkg.id);
                              setTempPrice(String(pkg.customRate));
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-black cursor-pointer group transition-colors"
                            title="Click to edit custom price"
                          >
                            <span>₹{Number(pkg.customRate).toFixed(2)}</span>
                            <Edit3 className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        +₹{marginInr.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                        {pkg.minQuantity.toLocaleString()} - {pkg.maxQuantity.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(pkg.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            pkg.isActive 
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Paused"}
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setModalMode("EDIT");
                              setFormData({
                                id: pkg.id,
                                name: pkg.name,
                                platform: pkg.platform,
                                category: pkg.category,
                                serviceId: pkg.serviceId,
                                panelId: pkg.panel?.id || panels[0]?.id || "",
                                originalRate: pkg.originalRate,
                                customRate: pkg.customRate,
                                minQuantity: pkg.minQuantity,
                                maxQuantity: pkg.maxQuantity,
                                badge: pkg.badge || "ALGORITHM FARM",
                              });
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="Edit full package"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-500 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: LIVE AUTO-FETCHED UPSTREAM SERVICES (PREMIUM CATALOG AT 3X) ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Live Auto-Fetched Upstream Catalog (Premium Mode)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                Automatic 3x Multiplier
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automatically fetched from your connected SMM panels. Users see these at 3x provider rate. You can click <strong>"⭐ Promote to Farm"</strong> to turn any service into a Farm package!
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search upstream services..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-[#111827] z-10">
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Upstream ID</th>
                <th className="py-3 px-3">Service Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Provider Cost</th>
                <th className="py-3 px-3 font-black text-amber-600 dark:text-amber-400">Selling Price (3x)</th>
                <th className="py-3 px-3">Min / Max</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredUpstream.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {loading ? "Auto-fetching services from connected panels..." : "No upstream services found matching filters."}
                  </td>
                </tr>
              ) : (
                filteredUpstream.slice(0, 100).map((svc) => (
                  <tr key={`${svc.panelId}_${svc.serviceId}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #{svc.serviceId}
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-white truncate" title={svc.name}>
                        {svc.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Provider: {svc.panelName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={svc.category}>
                      {svc.category}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">
                      {svc.platform}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      ₹{svc.originalRate.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                      ₹{svc.sellingRate.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {svc.minQuantity} - {svc.maxQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handlePromoteToFarm(svc)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-red-500" />
                        <span>Add to Farm Mode</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE / PROMOTE FARM PACKAGE MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {modalMode === "PROMOTE" ? "Promote to BotClips Farm Package" : modalMode === "EDIT" ? "Edit Farm Package" : "Create New Farm Package"}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Package Name (User-Facing)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Special Instagram VIEWS [Real Smartphone Farm]"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-semibold"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="TWITTER">Twitter (X)</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Upstream Service ID</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    placeholder="e.g. 5245"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Provider Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalRate}
                    onChange={(e) => setFormData({ ...formData, originalRate: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="font-black text-red-600 dark:text-red-400 block mb-1">Your Custom Price (₹ per 1,000)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.customRate}
                    onChange={(e) => setFormData({ ...formData, customRate: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 font-black font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Quantity</label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 10 })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Quantity</label>
                  <input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 1000000 })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="SMARTPHONE FARM"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {submittingModal ? "Saving..." : "Save Farm Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
