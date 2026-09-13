"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShoppingCart, 
  Users, 
  Server, 
  CreditCard, 
  Settings, 
  Layers, 
  Check, 
  X, 
  Plus, 
  RefreshCw, 
  ArrowUpRight, 
  Search, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  Crown,
  Edit2,
  Trash2,
  Zap,
  CheckCircle2,
  DownloadCloud
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

type AdminTab = "OVERVIEW" | "ORDERS" | "USERS" | "PANELS" | "SERVICES" | "PAYMENTS" | "SETTINGS";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ── State for Orders ──
  const [orders, setOrders] = useState([
    { id: "1024", user: "dipeshdhillon2006@gmail.com", service: "Instagram Real HQ Followers", link: "https://instagram.com/creator_reel", quantity: 1000, charge: 180, status: "COMPLETED", date: "Sep 13, 2026" },
    { id: "1023", user: "creator99@gmail.com", service: "YouTube High Retention Views", link: "https://youtube.com/watch?v=k38x92aL", quantity: 5000, charge: 1200, status: "PROCESSING", date: "Sep 12, 2026" },
    { id: "1022", user: "agency@socials.com", service: "TikTok Real Followers", link: "https://tiktok.com/@agency_growth", quantity: 2000, charge: 380, status: "COMPLETED", date: "Sep 12, 2026" },
    { id: "1021", user: "crypto_alpha@t.me", service: "Telegram Channel Members", link: "https://t.me/channel_alpha", quantity: 500, charge: 60, status: "PENDING", date: "Sep 11, 2026" },
  ]);

  // ── State for Users ──
  const [users, setUsers] = useState([
    { id: "usr_admin", name: "Dipesh Dhillon", email: "dipeshdhillon2006@gmail.com", balance: 0.00, totalSpent: 0.00, role: "ADMIN", status: "ACTIVE", plan: "ACTIVE (Monthly)" },
    { id: "usr_1", name: "Roonie", email: "roonie@dhillionsmm.com", balance: 520.00, totalSpent: 1930.00, role: "USER", status: "ACTIVE", plan: "None" },
    { id: "usr_2", name: "Agency Pro", email: "agency@socials.com", balance: 1450.00, totalSpent: 8400.00, role: "USER", status: "ACTIVE", plan: "ACTIVE (Weekly)" },
  ]);

  // ── State for Panels (including smmsocialmedia.in and yoyomedia) ──
  const [panels, setPanels] = useState<any[]>([
    { 
      id: "panel_smmsocialmedia", 
      name: "SMMSocialMedia (Primary)", 
      url: "https://smmsocialmedia.in/api/v2", 
      apiKey: "smmsocial_api_key_placeholder",
      balance: "₹1,450.00", 
      status: "ONLINE", 
      active: true,
      description: "Background upstream provider for Instagram & YouTube"
    },
    { 
      id: "panel_yoyomedia", 
      name: "YoyoMedia (Secondary)", 
      url: "https://yoyomedia.in/api/v2", 
      apiKey: "yoyo_api_key_placeholder",
      balance: "₹920.00", 
      status: "ONLINE", 
      active: true,
      description: "Background upstream provider for TikTok, Telegram & X"
    },
    { 
      id: "panel_jap", 
      name: "JustAnotherPanel (Backup)", 
      url: "https://justanotherpanel.com/api/v2", 
      apiKey: "jap_api_key_placeholder",
      balance: "$142.50", 
      status: "ONLINE", 
      active: true,
      description: "Global fallback provider"
    },
  ]);

  // ── State for Services ──
  const [services, setServices] = useState<any[]>([
    { id: "srv_ig_hq", platform: "INSTAGRAM", name: "Instagram Real HQ Followers", serviceId: "1024", originalRate: 35, customRate: 180, active: true },
    { id: "srv_ig_likes", platform: "INSTAGRAM", name: "Instagram High Retention Likes", serviceId: "1025", originalRate: 10, customRate: 45, active: true },
    { id: "srv_yt_views", platform: "YOUTUBE", name: "YouTube High Retention Views", serviceId: "2011", originalRate: 60, customRate: 240, active: true },
    { id: "srv_tt_followers", platform: "TIKTOK", name: "TikTok Real Followers", serviceId: "3015", originalRate: 40, customRate: 190, active: true },
    { id: "srv_tg_members", platform: "TELEGRAM", name: "Telegram Channel Members", serviceId: "4010", originalRate: 25, customRate: 120, active: true },
  ]);

  // ── Modals & Interactive States ──
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [checkingPanelId, setCheckingPanelId] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddPanelModal, setShowAddPanelModal] = useState(false);
  const [showUpstreamModal, setShowUpstreamModal] = useState(false);
  const [upstreamServices, setUpstreamServices] = useState<any[]>([]);
  const [fetchingUpstream, setFetchingUpstream] = useState(false);
  const [upstreamSearch, setUpstreamSearch] = useState<string>("");

  const [newPanelForm, setNewPanelForm] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
    currency: "INR",
  });

  const [newServiceForm, setNewServiceForm] = useState({
    panelId: "",
    platform: "INSTAGRAM",
    category: "General",
    name: "",
    serviceId: "",
    originalRate: 1.0,
    customRate: 5.0,
    minQuantity: 10,
    maxQuantity: 100000,
  });

  // ── State for Payments (with 2 Proof Screenshots) ──
  const [payments, setPayments] = useState<any[]>([
    { 
      id: "pay-1", 
      user: "dipeshdhillon2006@gmail.com", 
      utr: "423891024819", 
      amount: 100, 
      time: "5 mins ago", 
      status: "PENDING",
      screenshot1: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
      screenshot2: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop"
    },
    { 
      id: "pay-2", 
      user: "agency@socials.com", 
      utr: "423401928341", 
      amount: 500, 
      time: "1 hour ago", 
      status: "CONFIRMED",
      screenshot1: null,
      screenshot2: null
    },
  ]);

  // ── State for Settings ──
  const [settings, setSettings] = useState({
    siteName: "BotClips",
    currencySymbol: "₹",
    usdToInr: 96.0,
    upiId: "Jaatdhillon@fam",
    telegram: "@dhillionsmm_support",
    whatsapp: "+91 99999 99999",
    minDeposit: 50,
    cloudinaryCloudName: "",
    cloudinaryUploadPreset: "",
    cloudinaryApiKey: "",
    maintenanceMode: false,
    maintenanceMessage: "Scheduled infrastructure maintenance in progress. All running orders continue running normally.",
  });

  const [savingMaintenance, setSavingMaintenance] = useState(false);

  useEffect(() => {
    loadRealPayments();
    loadMaintenanceStatus();
    loadPanels();
    loadServices();
  }, []);

  async function loadPanels() {
    setLoadingPanels(true);
    try {
      const res = await fetch("/api/admin/panels");
      const data = await res.json();
      if (data.success && Array.isArray(data.panels) && data.panels.length > 0) {
        setPanels(data.panels.map((p: any) => ({
          id: p.id,
          name: p.name,
          url: p.apiUrl,
          apiKey: p.apiKeyEncrypted,
          balance: `${p.currency === "INR" ? "₹" : "$"}${Number(p.balance || 0).toFixed(2)}`,
          status: p.status || "ONLINE",
          active: p.isActive,
          description: p.id.includes("smmsocial") 
            ? "Background upstream provider for Instagram & YouTube"
            : p.id.includes("yoyo") 
            ? "Background upstream provider for TikTok, Telegram & X"
            : "SMM upstream API provider",
        })));
      }
    } catch {} finally {
      setLoadingPanels(false);
    }
  }

  async function handleCheckPanelBalance(panelId: string, url?: string, key?: string) {
    setCheckingPanelId(panelId);
    try {
      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-balance",
          panelId,
          apiUrl: url,
          apiKey: key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPanels(prev => prev.map(p => p.id === panelId ? {
          ...p,
          balance: data.formatted || `₹${Number(data.balance).toFixed(2)}`,
          status: "ONLINE",
        } : p));
        notify(`Live balance fetched: ${data.formatted || `₹${Number(data.balance).toFixed(2)}`}`);
      } else {
        notify(data.error || "Failed to fetch live balance");
      }
    } catch (err: any) {
      notify("Network error while checking balance");
    } finally {
      setCheckingPanelId(null);
    }
  }

  async function handleSavePanelCredentials(panelId: string, name: string, apiUrl: string, apiKey: string) {
    try {
      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelId, name, apiUrl, apiKey }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Saved credentials for ${name}`);
        loadPanels();
      } else {
        notify(data.error || "Failed to save credentials");
      }
    } catch {
      notify("Error saving panel credentials");
    }
  }

  async function handleCreatePanel() {
    if (!newPanelForm.name || !newPanelForm.apiUrl || !newPanelForm.apiKey) {
      notify("Please fill all panel fields");
      return;
    }
    try {
      const res = await fetch("/api/admin/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPanelForm),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Added panel ${newPanelForm.name}!`);
        setShowAddPanelModal(false);
        setNewPanelForm({ name: "", apiUrl: "", apiKey: "", currency: "INR" });
        loadPanels();
      } else {
        notify(data.error || "Failed to add panel");
      }
    } catch {
      notify("Network error adding panel");
    }
  }

  async function loadServices() {
    setLoadingServices(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services.map((s: any) => ({
          id: s.id,
          platform: s.platform,
          name: s.name,
          serviceId: s.serviceId,
          originalRate: s.originalRate,
          customRate: s.customRate,
          panelId: s.panelId,
          panelName: s.panel?.name || "Default Panel",
          minQuantity: s.minQuantity,
          maxQuantity: s.maxQuantity,
          active: s.isActive,
        })));
      }
    } catch {} finally {
      setLoadingServices(false);
    }
  }

  async function handleSaveService(srvData: any) {
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(srvData),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Service "${srvData.name}" updated successfully!`);
        setEditingService(null);
        setShowAddServiceModal(false);
        loadServices();
      } else {
        notify(data.error || "Failed to save service");
      }
    } catch {
      notify("Error saving service");
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify("Service deleted");
        setServices(prev => prev.filter(s => s.id !== id));
      } else {
        notify(data.error || "Failed to delete");
      }
    } catch {
      notify("Error deleting service");
    }
  }

  async function handleFetchUpstreamServices(targetPanelId?: string) {
    setFetchingUpstream(true);
    setUpstreamServices([]);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch-upstream-services",
          panelId: targetPanelId || panels[0]?.id,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setUpstreamServices(data.services);
        setShowUpstreamModal(true);
        notify(`Loaded ${data.count} services from upstream provider!`);
      } else {
        notify(data.error || "Could not fetch services from upstream SMM panel");
      }
    } catch {
      notify("Failed to connect to upstream panel");
    } finally {
      setFetchingUpstream(false);
    }
  }

  function handleQuickImportUpstream(rawSrv: any) {
    const origCost = parseFloat(String(rawSrv.rate || 1));
    const suggestedSell = Math.round(origCost * 3.5) || 5;
    let detectedPlatform = "INSTAGRAM";
    const nameLower = (rawSrv.name || "").toLowerCase();
    if (nameLower.includes("tiktok")) detectedPlatform = "TIKTOK";
    else if (nameLower.includes("youtube") || nameLower.includes("shorts")) detectedPlatform = "YOUTUBE";
    else if (nameLower.includes("telegram")) detectedPlatform = "TELEGRAM";
    else if (nameLower.includes("twitter") || nameLower.includes("x ")) detectedPlatform = "X";

    setNewServiceForm({
      panelId: panels[0]?.id || "",
      platform: detectedPlatform,
      category: rawSrv.category || "General",
      name: rawSrv.name || "",
      serviceId: String(rawSrv.service || ""),
      originalRate: origCost,
      customRate: suggestedSell,
      minQuantity: parseInt(rawSrv.min || 10),
      maxQuantity: parseInt(rawSrv.max || 100000),
    });
    setShowUpstreamModal(false);
    setShowAddServiceModal(true);
  }

  async function loadMaintenanceStatus() {
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      if (typeof data.maintenanceMode === "boolean") {
        setSettings(prev => ({
          ...prev,
          maintenanceMode: data.maintenanceMode,
          maintenanceMessage: data.maintenanceMessage || prev.maintenanceMessage,
        }));
      }
    } catch {}
  }

  async function handleToggleMaintenance(newMode: boolean) {
    setSavingMaintenance(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: newMode,
          maintenanceMessage: settings.maintenanceMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, maintenanceMode: data.maintenanceMode }));
        notify(
          newMode 
            ? "🚨 Maintenance Mode ACTIVATED! Public visitors see maintenance screen. All running orders continue running uninterrupted."
            : "✅ Maintenance Mode DEACTIVATED. Full website is now live for all visitors."
        );
      }
    } catch (err) {
      notify("Failed to update maintenance mode");
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function loadRealPayments() {
    try {
      const res = await fetch("/api/billing/upi");
      const data = await res.json();
      if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
        setPayments(data.payments.map((p: any) => ({
          id: p.id,
          user: p.user?.email || p.userId,
          utr: p.utr,
          amount: p.amount,
          time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: p.status,
          screenshot1: p.screenshot1,
          screenshot2: p.screenshot2,
        })));
      }
    } catch {}
  }

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Actions
  const handleApprovePayment = async (id: string, amount: number, user: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "CONFIRMED" } : p));
    notify(`Approved ₹${amount} for ${user}! Wallet balance credited.`);
    try {
      await fetch("/api/billing/upi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id, action: "APPROVE" }),
      });
    } catch {}
  };

  const handleRejectPayment = async (id: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
    notify("Payment rejected.");
    try {
      await fetch("/api/billing/upi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id, action: "REJECT" }),
      });
    } catch {}
  };

  const handleAdjustBalance = (userId: string, amount: number) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newBal = Math.max(0, u.balance + amount);
        notify(`Adjusted balance for ${u.name}: ₹${newBal.toFixed(2)}`);
        return { ...u, balance: newBal };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Screenshot Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black"
            >
              ✕
            </button>
            <img src={previewImage} alt="Proof Fullscreen Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Maintenance Mode Warning Banner (if active) */}
      {settings.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
            <div className="text-xs leading-relaxed">
              <strong className="font-black text-sm block text-amber-800 dark:text-amber-300">
                🚨 WEBSITE MAINTENANCE MODE IS CURRENTLY ACTIVE
              </strong>
              Public visitors see the maintenance screen. All running orders, background cron syncs, and provider engines continue operating 100% uninterrupted.
            </div>
          </div>
          <button
            onClick={() => handleToggleMaintenance(false)}
            disabled={savingMaintenance}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            {savingMaintenance ? "Deactivating..." : "Deactivate Maintenance"}
          </button>
        </div>
      )}

      {/* Top Banner with BotClipsLogo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <BotClipsLogo size="md" href="/admin" />
          <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fulfillment management, payment verification & system settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadRealPayments();
              notify("Refreshed latest data!");
            }}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-xs scrollbar-none">
        {[
          { id: "OVERVIEW", label: "Overview", icon: TrendingUp },
          { id: "ORDERS", label: "Orders Manager", icon: ShoppingCart },
          { id: "USERS", label: "Users & Balances", icon: Users },
          { id: "PANELS", label: "Upstream SMM APIs", icon: Server },
          { id: "SERVICES", label: "Services & Markups", icon: Layers },
          { id: "PAYMENTS", label: "UPI & Screenshot Queue", icon: CreditCard, badge: payments.filter(p => p.status === "PENDING").length },
          { id: "SETTINGS", label: "Site & Cloudinary", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB 1: OVERVIEW ──────────────── */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Total Deposits (30D)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹42,500</div>
              <span className="text-[11px] font-bold text-emerald-600">Min deposit: ₹50</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Total Orders Placed</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{orders.length}</div>
              <span className="text-[11px] font-bold text-blue-600">Dispatched automatically</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Registered Users</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</div>
              <span className="text-[11px] font-bold text-emerald-600">Active</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Pending Screenshot Verifications</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {payments.filter(p => p.status === "PENDING").length}
              </div>
              <button onClick={() => setActiveTab("PAYMENTS")} className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer">
                Review Queue (2 Proofs) →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Automated Background SMM Panels</h3>
            <p className="text-xs text-slate-400 mb-4">Orders placed by users in Mode 1 are routed through these background APIs without exposing them to users.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {panels.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.url}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-[10px] font-bold">
                    ONLINE ({p.balance})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: ORDERS MANAGER ──────────────── */}
      {activeTab === "ORDERS" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">All Client Orders</h2>
            <span className="text-xs font-bold text-slate-400">{orders.length} Total Orders</span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Client Email</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Link</th>
                  <th className="py-3 px-2">Qty</th>
                  <th className="py-3 px-2">Charge</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-2 font-mono font-bold text-blue-600">#{o.id}</td>
                    <td className="py-3.5 px-2 font-medium">{o.user}</td>
                    <td className="py-3.5 px-2 font-semibold">{o.service}</td>
                    <td className="py-3.5 px-2 font-mono text-[11px] text-slate-400 truncate max-w-[180px]">{o.link}</td>
                    <td className="py-3.5 px-2 font-bold">{o.quantity}</td>
                    <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">₹{o.charge}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        o.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: USERS & BALANCES ──────────────── */}
      {activeTab === "USERS" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">User Accounts & Automation Plans</h2>
              <p className="text-xs text-slate-400">Manage user balances, roles, and Mode 2 subscription status</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Current Balance</th>
                  <th className="py-3 px-2">BYO-API Plan</th>
                  <th className="py-3 px-2 text-right">Quick Balance Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white">₹{u.balance.toFixed(2)}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.plan?.includes("ACTIVE") ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustBalance(u.id, 100)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer"
                        >
                          +₹100
                        </button>
                        <button
                          onClick={() => handleAdjustBalance(u.id, -50)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          -₹50
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: UPSTREAM PROVIDERS (smmsocialmedia.in & yoyomedia) ──────────────── */}
      {activeTab === "PANELS" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Connected Upstream SMM Panels</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold">Mode 1 Background</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orders placed by regular users auto-dispatch to these background APIs. Upstream panel names are 100% hidden from regular users.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadPanels}
                  disabled={loadingPanels}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPanels ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowAddPanelModal(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add SMM Provider</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {panels.map((p) => {
                const isChecking = checkingPanelId === p.id;
                return (
                  <div key={p.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.status === "ONLINE" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-1">{p.url}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-right">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Live SMM Balance</span>
                          <span className="text-sm font-black font-mono text-emerald-600">{p.balance}</span>
                        </div>
                        <button
                          onClick={() => handleCheckPanelBalance(p.id, p.url, p.apiKey)}
                          disabled={isChecking}
                          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Query SMM provider balance"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin text-blue-600" : ""}`} />
                          <span>{isChecking ? "Checking..." : "Check Balance"}</span>
                        </button>
                        <button
                          onClick={() => handleFetchUpstreamServices(p.id)}
                          disabled={fetchingUpstream}
                          className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Catalog</span>
                        </button>
                      </div>
                    </div>

                    {/* API Credentials Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">API Endpoint URL</label>
                        <input
                          type="text"
                          defaultValue={p.url}
                          id={`url_${p.id}`}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Provider API Key</label>
                        <input
                          type="password"
                          defaultValue={p.apiKey}
                          id={`key_${p.id}`}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-end">
                        <button
                          onClick={() => {
                            const urlVal = (document.getElementById(`url_${p.id}`) as HTMLInputElement)?.value;
                            const keyVal = (document.getElementById(`key_${p.id}`) as HTMLInputElement)?.value;
                            handleSavePanelCredentials(p.id, p.name, urlVal, keyVal);
                          }}
                          className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Save Credentials
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 5: SERVICES & CUSTOM RATE PRICING ──────────────── */}
      {activeTab === "SERVICES" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Service Profit Margins & SMM Mapping</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-mono font-bold">Custom Rates</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set custom prices for regular users. E.g. Upstream SMM costs ₹1/1k → Set your selling price to ₹5/1k to pocket ₹4 profit automatically.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFetchUpstreamServices()}
                disabled={fetchingUpstream}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-emerald-100"
              >
                <DownloadCloud className={`w-4 h-4 ${fetchingUpstream ? "animate-bounce" : ""}`} />
                <span>{fetchingUpstream ? "Connecting..." : "Import from SMM Panel"}</span>
              </button>
              <button
                onClick={() => {
                  setNewServiceForm({
                    panelId: panels[0]?.id || "",
                    platform: "INSTAGRAM",
                    category: "General",
                    name: "",
                    serviceId: "",
                    originalRate: 1.0,
                    customRate: 5.0,
                    minQuantity: 10,
                    maxQuantity: 100000,
                  });
                  setShowAddServiceModal(true);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mapped Service</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">Upstream ID</th>
                  <th className="py-3 px-2">Platform</th>
                  <th className="py-3 px-2">BotClips Service Title</th>
                  <th className="py-3 px-2">Upstream Cost / 1k</th>
                  <th className="py-3 px-2">Your Sell Rate / 1k</th>
                  <th className="py-3 px-2">Your Profit / 1k</th>
                  <th className="py-3 px-2">Markup</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {services.map((s) => {
                  const profit = (s.customRate - s.originalRate).toFixed(2);
                  const multiplier = s.originalRate > 0 ? (s.customRate / s.originalRate).toFixed(1) : "—";
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-500">#{s.serviceId || s.id}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          s.platform === "INSTAGRAM" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                          s.platform === "YOUTUBE" ? "bg-red-50 text-red-700 border border-red-200" :
                          s.platform === "TIKTOK" ? "bg-cyan-50 text-cyan-700 border border-cyan-200" :
                          s.platform === "TELEGRAM" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {s.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Min: {s.minQuantity || 10} • Max: {s.maxQuantity || 100000}</div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 font-mono font-bold">₹{s.originalRate}</td>
                      <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white font-mono text-sm">₹{s.customRate}</td>
                      <td className="py-3.5 px-2 font-black text-emerald-600 font-mono">+₹{profit}</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold font-mono text-[10px]">
                          {multiplier}x
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingService(s)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                            title="Edit custom rate & service mapping"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer"
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 6: UPI & 2-SCREENSHOT VERIFICATION QUEUE ──────────────── */}
      {activeTab === "PAYMENTS" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Deposit Verification Queue (2 Screenshots)</h2>
              <p className="text-xs text-slate-400">Inspect both payment screenshots, check UTR match, and click Approve to credit user balance</p>
            </div>
            <span className="text-xs font-bold text-blue-600">Min Deposit: ₹50</span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">12-Digit UTR</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Proof 1 (Receipt)</th>
                  <th className="py-3 px-2">Proof 2 (Success)</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-2 font-bold">{p.user}</td>
                    <td className="py-3.5 px-2 font-mono font-bold text-blue-600">{p.utr}</td>
                    <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white">₹{p.amount}</td>
                    
                    {/* Proof 1 */}
                    <td className="py-3.5 px-2">
                      {p.screenshot1 ? (
                        <div 
                          onClick={() => setPreviewImage(p.screenshot1)}
                          className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:scale-105 transition-transform group shadow-2xs"
                        >
                          <img src={p.screenshot1} alt="Proof 1" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not attached</span>
                      )}
                    </td>

                    {/* Proof 2 */}
                    <td className="py-3.5 px-2">
                      {p.screenshot2 ? (
                        <div 
                          onClick={() => setPreviewImage(p.screenshot2)}
                          className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:scale-105 transition-transform group shadow-2xs"
                        >
                          <img src={p.screenshot2} alt="Proof 2" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not attached</span>
                      )}
                    </td>

                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        p.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : p.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      {p.status === "PENDING" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprovePayment(p.id, p.amount, p.user)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Credit</span>
                          </button>
                          <button
                            onClick={() => handleRejectPayment(p.id)}
                            className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 7: SITE & CLOUDINARY SETTINGS ──────────────── */}
      {activeTab === "SETTINGS" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Site Config */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Deposit & General Config</h2>
            
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Minimum Deposit (INR)</label>
              <input
                type="number"
                min="50"
                value={settings.minDeposit}
                onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400">Strictly enforced at checkout/wallet page (default: ₹50).</span>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">UPI ID for Dynamic QR</label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Telegram</label>
                <input
                  type="text"
                  value={settings.telegram}
                  onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => notify("Settings saved successfully!")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Save Deposit Config
            </button>
          </div>

          {/* Cloudinary Config */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-sky-50 text-sky-600 font-bold">☁</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Cloudinary Image Storage</h2>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Stores payment verification screenshots on Cloudinary CDN so your Vercel server and PostgreSQL database experience 0% storage load.
            </p>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Cloud Name</label>
              <input
                type="text"
                placeholder="e.g. dxyz123ab"
                value={settings.cloudinaryCloudName}
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Upload Preset (Unsigned)</label>
              <input
                type="text"
                placeholder="e.g. botclips_receipts"
                value={settings.cloudinaryUploadPreset}
                onChange={(e) => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <button
              onClick={() => notify("Cloudinary credentials updated!")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Save Cloudinary Keys
            </button>
          </div>

          {/* Full-width Card: Website Maintenance Mode Control */}
          <div className="lg:col-span-2 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  settings.maintenanceMode 
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 animate-pulse" 
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Website Maintenance Mode
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Safely pause public-facing pages without interrupting background deliveries or order fulfillment.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide ${
                  settings.maintenanceMode 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                }`}>
                  {settings.maintenanceMode ? "MAINTENANCE ACTIVE" : "NORMAL (LIVE)"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleMaintenance(!settings.maintenanceMode)}
                  disabled={savingMaintenance}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs ${
                    settings.maintenanceMode
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {savingMaintenance 
                    ? "Updating..." 
                    : settings.maintenanceMode 
                      ? "Turn OFF Maintenance" 
                      : "Turn ON Maintenance"}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Disruption Guarantee:</span>
              </div>
              <p>
                • <strong>Existing Orders & Active Campaigns:</strong> Background workers and upstream dispatching continue executing with 0% delay.
              </p>
              <p>
                • <strong>Auto-Sync Cron Jobs:</strong> Order status checks and API deliveries operate normally.
              </p>
              <p>
                • <strong>Admin Security:</strong> Administrators retain full access to this panel and can turn maintenance mode off at any time.
              </p>
              <p>
                • <strong>Confidentiality:</strong> Visitors only see the official BotClips calibration screen. Internal SMM APIs and device configurations are completely concealed.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Maintenance Notice for Visitors
              </label>
              <input
                type="text"
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="Scheduled infrastructure maintenance in progress. All running orders continue running normally."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL 1: EDIT SERVICE & CUSTOM PRICING ──────────────── */}
      {editingService && (
        <div 
          onClick={() => setEditingService(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 cursor-default text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Edit Service & Custom Pricing
              </h3>
              <button 
                onClick={() => setEditingService(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Service Name (Visible to Users)</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Platform</label>
                  <select
                    value={editingService.platform}
                    onChange={(e) => setEditingService({ ...editingService, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="X">X (Twitter)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Upstream SMM Service ID</label>
                  <input
                    type="text"
                    value={editingService.serviceId}
                    onChange={(e) => setEditingService({ ...editingService, serviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Upstream Cost / 1k (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingService.originalRate}
                    onChange={(e) => setEditingService({ ...editingService, originalRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">What the SMM panel charges you</span>
                </div>
                <div>
                  <label className="block font-bold text-emerald-600 mb-1">Your Selling Rate / 1k (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingService.customRate}
                    onChange={(e) => setEditingService({ ...editingService, customRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-lg font-mono font-black text-emerald-600 text-sm"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold">What users pay & deduct</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between font-mono">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Estimated Profit per 1,000 orders:</span>
                <span className="text-base font-black text-emerald-600">
                  +₹{(Number(editingService.customRate || 0) - Number(editingService.originalRate || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveService(editingService)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Custom Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL 2: ADD NEW SERVICE ──────────────── */}
      {showAddServiceModal && (
        <div 
          onClick={() => setShowAddServiceModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 cursor-default text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add New Mapped Service with Custom Pricing
              </h3>
              <button 
                onClick={() => setShowAddServiceModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Service Name (Visible to Users)</label>
                <input
                  type="text"
                  placeholder="e.g. Instagram Real High Retention Followers"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Platform</label>
                  <select
                    value={newServiceForm.platform}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="X">X (Twitter)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Upstream SMM Service ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 1024"
                    value={newServiceForm.serviceId}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, serviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Upstream Cost / 1k (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={newServiceForm.originalRate}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, originalRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">What upstream charges you</span>
                </div>
                <div>
                  <label className="block font-bold text-emerald-600 mb-1">Your Selling Rate / 1k (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={newServiceForm.customRate}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, customRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-lg font-mono font-black text-emerald-600 text-sm"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold">What users pay BotClips</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between font-mono">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Estimated Profit per 1,000 orders:</span>
                <span className="text-base font-black text-emerald-600">
                  +₹{(Number(newServiceForm.customRate || 0) - Number(newServiceForm.originalRate || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveService(newServiceForm)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Create Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL 3: BROWSE UPSTREAM CATALOG ──────────────── */}
      {showUpstreamModal && (
        <div 
          onClick={() => setShowUpstreamModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl cursor-default text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Upstream SMM Services Catalog ({upstreamServices.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Select any service from your SMM provider to set your custom markup and activate on BotClips
                </p>
              </div>
              <button 
                onClick={() => setShowUpstreamModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                placeholder="Search upstream services by name or ID..."
                value={upstreamSearch}
                onChange={(e) => setUpstreamSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
              />
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {upstreamServices
                .filter(s => 
                  !upstreamSearch || 
                  (s.name || "").toLowerCase().includes(upstreamSearch.toLowerCase()) || 
                  String(s.service || "").includes(upstreamSearch) ||
                  (s.category || "").toLowerCase().includes(upstreamSearch.toLowerCase())
                )
                .slice(0, 50)
                .map((srv) => (
                  <div key={srv.service} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl">
                    <div className="space-y-0.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">#{srv.service}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{srv.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Category: {srv.category || "General"}</span>
                        <span>•</span>
                        <span>Min: {srv.min}</span>
                        <span>•</span>
                        <span>Max: {srv.max}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Upstream Rate</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₹{srv.rate}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickImportUpstream(srv)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Set Custom Price</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL 4: ADD SMM PROVIDER ──────────────── */}
      {showAddPanelModal && (
        <div 
          onClick={() => setShowAddPanelModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 cursor-default text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Upstream SMM Provider
              </h3>
              <button 
                onClick={() => setShowAddPanelModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. SMMSocialMedia (Primary)"
                  value={newPanelForm.name}
                  onChange={(e) => setNewPanelForm({ ...newPanelForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">API URL (v2 format)</label>
                <input
                  type="text"
                  placeholder="https://smmsocialmedia.in/api/v2"
                  value={newPanelForm.apiUrl}
                  onChange={(e) => setNewPanelForm({ ...newPanelForm, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="Provider API Key"
                  value={newPanelForm.apiKey}
                  onChange={(e) => setNewPanelForm({ ...newPanelForm, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Currency</label>
                <select
                  value={newPanelForm.currency}
                  onChange={(e) => setNewPanelForm({ ...newPanelForm, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddPanelModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePanel}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
