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
  DownloadCloud,
  Sparkles,
  Flame,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  Coins,
  Scale,
  BadgePercent,
  Wine,
  LogIn
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

type AdminTab = "OVERVIEW" | "ORDERS" | "USERS" | "PANELS" | "SERVICES" | "COMBOS" | "PAYMENTS" | "SETTINGS";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const notify = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text: msg, type });
    setSuccessMsg(msg);
    setTimeout(() => {
      setToastMessage(null);
      setSuccessMsg(null);
    }, 3500);
  };

  // ── State for Orders & Upstream Provider Tracking ──
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedProviderFilter, setSelectedProviderFilter] = useState("ALL");

  // ── State for Users ──
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [customBalanceInput, setCustomBalanceInput] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);
  const [userSort, setUserSort] = useState<"NEWEST" | "OLDEST" | "HIGH_BALANCE" | "LOW_BALANCE" | "HIGH_DEPOSIT" | "HIGH_SPENT" | "MOST_ORDERS">("NEWEST");
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");
  const [userBalanceFilter, setUserBalanceFilter] = useState<"ALL" | "HAS_BALANCE" | "ZERO_BALANCE">("ALL");

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

  // ── State for Financials & Partner Distribution ──
  const [financials, setFinancials] = useState<any>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  // ── State for Crypto Payments Queue ──
  const [cryptoPayments, setCryptoPayments] = useState<any[]>([]);
  const [paymentSubTab, setPaymentSubTab] = useState<"ALL" | "UPI" | "CRYPTO">("ALL");

  // ── State for Settings ──
  const [settings, setSettings] = useState({
    siteName: "BotClips",
    currencySymbol: "₹",
    usdToInr: 96.0,
    upiId: "Jaatdhillon@fam",
    trc20Address: "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz",
    bep20Address: "0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410",
    telegram: "@botclipscn_bot",
    whatsapp: "+91 99999 99999",
    minDeposit: 100,
    cloudinaryCloudName: "",
    cloudinaryUploadPreset: "",
    cloudinaryApiKey: "",
    maintenanceMode: false,
    maintenanceMessage: "Scheduled infrastructure maintenance in progress. All running orders continue running normally.",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // ── State for Whop & Combo Settings ──
  const [comboPlatform, setComboPlatform] = useState<"INSTAGRAM" | "TIKTOK" | "YOUTUBE">("INSTAGRAM");
  const [comboConfig, setComboConfig] = useState<any>(null);
  const [availableComboServices, setAvailableComboServices] = useState<any[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [savingCombos, setSavingCombos] = useState(false);

  useEffect(() => {
    loadAdminSettings();
    loadRealPayments();
    loadMaintenanceStatus();
    loadPanels();
    loadServices();
    loadComboSettings();
    loadFinancials();
    loadCryptoPayments();
    loadOrders();
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders.map((o: any) => {
          let providerCode = "S1";
          let providerName = "SMMSocialMedia";
          let providerBadgeClass = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

          if (o.panel?.id === "panel_yoyomedia" || o.panel?.apiUrl?.includes("yoyo")) {
            providerCode = "Y1";
            providerName = "YoyoMedia";
            providerBadgeClass = "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
          } else if (o.panel?.id === "panel_jap" || o.panel?.apiUrl?.includes("justanotherpanel")) {
            providerCode = "J1";
            providerName = "JAP Provider";
            providerBadgeClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
          } else if (o.curveStyle?.includes("CUSTOM_API") || (!o.panel && o.charge === 0)) {
            providerCode = "BYO";
            providerName = "User SMM API";
            providerBadgeClass = "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
          }

          return {
            id: o.id,
            user: o.user?.email || o.userId || "Client",
            userName: o.user?.name || "",
            service: o.service?.name || "Service #" + (o.service?.serviceId || o.serviceId),
            serviceId: o.service?.serviceId || o.serviceId,
            platform: o.service?.platform || "INSTAGRAM",
            link: o.link,
            quantity: o.quantity,
            charge: o.charge,
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            providerCode,
            providerName,
            providerBadgeClass,
            providerOrderId: o.providerOrderId,
            panelId: o.panelId || o.panel?.id,
            runs: o.runs,
            intervalMinutes: o.intervalMinutes,
            failReason: o.failReason,
          };
        }));
      }
    } catch (e) {
      console.error("Failed to load orders in admin:", e);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadFinancials() {
    setLoadingFinancials(true);
    try {
      const res = await fetch("/api/admin/financials");
      const data = await res.json();
      if (data.success && data.data) {
        setFinancials(data.data);
      }
    } catch {} finally {
      setLoadingFinancials(false);
    }
  }

  async function loadCryptoPayments() {
    try {
      const res = await fetch("/api/billing/crypto");
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setCryptoPayments(data.payments.map((p: any) => ({
          id: p.id,
          user: p.user?.email || p.userId,
          txHash: p.txHash,
          amountUsdt: p.amountUsdt,
          amountInr: p.amountInr || Math.round(p.amountUsdt * 96),
          network: p.network,
          onChainVerified: p.onChainVerified,
          onChainDetails: p.onChainDetails,
          status: p.status,
          screenshot1: p.screenshot1,
          screenshot2: p.screenshot2,
          time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      }
    } catch {}
  }

  const handleApproveCrypto = async (id: string, amountUsdt: number, amountInr: number, user: string) => {
    setCryptoPayments(prev => prev.map(p => p.id === id ? { ...p, status: "CONFIRMED" } : p));
    notify("Approved " + amountUsdt + " USDT (~₹" + amountInr + ") for " + user + "! Balance credited.");
    try {
      await fetch("/api/billing/crypto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id, action: "APPROVE" }),
      });
      loadFinancials();
    } catch {}
  };

  const handleRejectCrypto = async (id: string) => {
    setCryptoPayments(prev => prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
    notify("Crypto deposit rejected.");
    try {
      await fetch("/api/billing/crypto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id, action: "REJECT" }),
      });
      loadFinancials();
    } catch {}
  };

  async function loadAdminSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({
          ...prev,
          siteName: data.settings.siteName || prev.siteName,
          upiId: data.settings.upiId || prev.upiId,
          trc20Address: data.settings.trc20Address || prev.trc20Address,
          bep20Address: data.settings.bep20Address || prev.bep20Address,
          minDeposit: Number(data.settings.minDeposit) || 100,
          telegram: data.settings.supportTelegram?.startsWith("tg_config_") ? "@botclipscn_bot" : (data.settings.supportTelegram || prev.telegram),
          whatsapp: data.settings.supportWhatsapp || prev.whatsapp,
          maintenanceMode: data.settings.maintenanceMode ?? prev.maintenanceMode,
          maintenanceMessage: data.settings.maintenanceMessage || prev.maintenanceMessage,
        }));
      }
    } catch {}
  }

  async function handleSaveDepositSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiId: settings.upiId,
          trc20Address: settings.trc20Address,
          bep20Address: settings.bep20Address,
          minDeposit: Number(settings.minDeposit) || 100,
          whatsapp: settings.whatsapp,
          telegram: settings.telegram
        })
      });
      const data = await res.json();
      if (data.success) {
        notify("Deposit settings saved! Minimum deposit is now ₹" + (settings.minDeposit || 100) + " across entire site.");
      } else {
        notify(data.error || "Failed to save settings");
      }
    } catch {
      notify("Failed to save settings to server");
    } finally {
      setSavingSettings(false);
    }
  }

  async function loadComboSettings() {
    setLoadingCombos(true);
    try {
      const res = await fetch("/api/admin/combo-settings");
      const data = await res.json();
      if (data.success) {
        if (data.comboSettings) setComboConfig(data.comboSettings);
        if (Array.isArray(data.availableServices)) setAvailableComboServices(data.availableServices);
      }
    } catch {} finally {
      setLoadingCombos(false);
    }
  }

  async function handleSaveComboSettings() {
    if (!comboConfig) return;
    setSavingCombos(true);
    try {
      const res = await fetch("/api/admin/combo-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comboSettings: comboConfig }),
      });
      const data = await res.json();
      if (data.success) {
        notify("Whop & Combo mapping saved successfully! All user combos will route through these services.");
      } else {
        notify(data.error || "Failed to save combo settings");
      }
    } catch {
      notify("Error saving combo configuration");
    } finally {
      setSavingCombos(false);
    }
  }

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

  const handleAdjustBalance = async (userId: string, amount: number) => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: Math.max(0, Number(u.balance || 0) + amount) } : u));
    if (editingUser && editingUser.id === userId) {
      setEditingUser((prev: any) => prev ? { ...prev, balance: Math.max(0, Number(prev.balance || 0) + amount) } : null);
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, balanceAdjust: amount })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Adjusted balance by ${amount > 0 ? "+" : ""}₹${amount} successfully!`, "success");
        loadUsers();
      } else {
        notify(data.error || "Failed to adjust balance", "error");
        loadUsers();
      }
    } catch (err) {
      notify("Error adjusting user balance", "error");
      loadUsers();
    }
  };

  const handleSetExactBalance = async (userId: string, exactAmount: number) => {
    setSavingBalance(true);
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: exactAmount } : u));
    if (editingUser && editingUser.id === userId) {
      setEditingUser((prev: any) => prev ? { ...prev, balance: exactAmount } : null);
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, setBalance: exactAmount })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Balance set to ₹${exactAmount} successfully!`, "success");
        setEditingUser(null);
        setCustomBalanceInput("");
        loadUsers();
      } else {
        notify(data.error || "Failed to set balance", "error");
        loadUsers();
      }
    } catch (err) {
      notify("Error setting user balance", "error");
      loadUsers();
    } finally {
      setSavingBalance(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        notify(`User status set to ${newStatus}`);
        loadUsers();
      }
    } catch {
      notify("Error updating user status");
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        notify(`User role updated to ${newRole}`);
        loadUsers();
      }
    } catch {
      notify("Error updating user role");
    }
  };

  const handleImpersonate = async (userId: string, email: string) => {
    notify(`Logging into account ${email}...`);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Logged into ${email}! Redirecting to user dashboard...`);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      } else {
        notify(data.error || "Failed to switch user account");
      }
    } catch {
      notify("Error switching user account");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${email}"? All orders and data will be removed.`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify(`User ${email} deleted successfully`);
        loadUsers();
      } else {
        notify(data.error || "Failed to delete user");
      }
    } catch {
      notify("Error deleting user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Screenshot Fullscreen Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden p-3 shadow-2xl flex flex-col items-center cursor-default"
          >
            {/* Header Controls */}
            <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Eye className="w-4 h-4 text-blue-400" />
                Payment Proof Screenshot
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Resolution</span>
                </a>
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
                  title="Close preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image display */}
            <div className="p-2 overflow-auto max-h-[78vh] flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Proof Fullscreen Preview" 
                className="max-w-full max-h-[74vh] object-contain rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 text-sm font-bold ${
            toastMessage.type === "success"
              ? "bg-emerald-600/95 text-white border-emerald-400/50 shadow-emerald-500/20"
              : toastMessage.type === "error"
              ? "bg-rose-600/95 text-white border-rose-400/50 shadow-rose-500/20"
              : "bg-blue-600/95 text-white border-blue-400/50 shadow-blue-500/20"
          }`}>
            <span>{toastMessage.text}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
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
          { id: "COMBOS", label: "Whop & Combos Config", icon: Sparkles },
          { id: "PAYMENTS", label: "Deposit Queue (UPI & Crypto)", icon: CreditCard, badge: payments.filter(p => p.status === "PENDING").length + cryptoPayments.filter(p => p.status === "PENDING").length },
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
          {/* Main Financial & System Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Total Users</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {financials?.totalUsers ?? users.length}
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Registered Clients</span>
            </div>

            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Total Deposits (Combined)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{(financials?.deposits?.totalCombinedInr || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-blue-600">UPI + USDT TRC20</span>
            </div>

            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Real Provider Cost</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                ₹{(financials?.costs?.realCostInr || 0).toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-slate-400">Upstream Wholesale</span>
            </div>

            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Pending Verifications</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {payments.filter(p => p.status === "PENDING").length + cryptoPayments.filter(p => p.status === "PENDING").length}
              </div>
              <button onClick={() => setActiveTab("PAYMENTS")} className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer">
                Review UPI & Crypto Queue →
              </button>
            </div>
          </div>

          {/* ──────────────── PARTNER PROFIT DISTRIBUTION & SETTLEMENT WIDGET ──────────────── */}
          <div className="bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black tracking-tight text-white">
                        Founder Profit Distribution & Settlement
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                        All Settled
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Net Profit = (Total Confirmed Deposits - Real Wholesale Cost) split 50/50 between 2 partners
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Remaining Net Profit</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{(financials?.profit?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 2 Partners Cards: Jack & Daniel with a Wine Bottle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Partner 1: Jack */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                        <Wine className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>Partner: Jack</span>
                          <span className="text-xs">🍾</span>
                        </div>
                        <div className="text-[11px] text-slate-400">50% Equity Settlement</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <Wine className="w-3 h-3 text-amber-400" />
                      <span>Settled</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Distributable Share:</span>
                    <span className="text-xl font-black text-emerald-400">
                      ₹{(financials?.profit?.partners?.jack?.shareInr || financials?.profit?.partners?.ram?.shareInr || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Partner 2: Daniel */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shadow-xs">
                        <Wine className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>Partner: Daniel</span>
                          <span className="text-xs">🍷</span>
                        </div>
                        <div className="text-[11px] text-slate-400">50% Equity Settlement</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <Wine className="w-3 h-3 text-purple-400" />
                      <span>Settled</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Distributable Share:</span>
                    <span className="text-xl font-black text-purple-400">
                      ₹{(financials?.profit?.partners?.daniel?.shareInr || financials?.profit?.partners?.dhillown?.shareInr || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Separate Breakdown of UPI and Crypto Deposits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">UPI Deposits Total</div>
                      <div className="text-[11px] text-slate-400">
                        {financials?.deposits?.upi?.confirmedCount || 0} Confirmed Payments
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm text-blue-300">
                    ₹{(financials?.deposits?.upi?.totalInr || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Crypto Deposits Total</div>
                      <div className="text-[11px] text-slate-400">
                        {financials?.deposits?.crypto?.confirmedCount || 0} Confirmed ({financials?.deposits?.crypto?.totalUsdt || 0} USDT)
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm text-emerald-300">
                    ₹{(financials?.deposits?.crypto?.totalInr || 0).toLocaleString()}
                  </div>
                </div>
              </div>
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

      {/* ──────────────── TAB 2: ORDERS MANAGER & UPSTREAM SMM DISPATCH TRACKER ──────────────── */}
      {activeTab === "ORDERS" && (() => {
        const filteredOrders = orders.filter((o) => {
          const matchProvider = 
            selectedProviderFilter === "ALL" || 
            o.providerCode === selectedProviderFilter;

          const query = orderSearch.trim().toLowerCase();
          const matchSearch = 
            !query ||
            String(o.id).toLowerCase().includes(query) ||
            String(o.providerOrderId || "").toLowerCase().includes(query) ||
            String(o.user).toLowerCase().includes(query) ||
            String(o.service).toLowerCase().includes(query) ||
            String(o.link).toLowerCase().includes(query);

          return matchProvider && matchSearch;
        });

        const countS1 = orders.filter(o => o.providerCode === "S1").length;
        const countY1 = orders.filter(o => o.providerCode === "Y1").length;
        const countBYO = orders.filter(o => o.providerCode === "BYO").length;

        return (
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Header with Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Client Orders & Upstream SMM Provider Tracker
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">
                    Live Database
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track every client order in real-time and monitor which upstream API (<strong className="text-emerald-500 font-bold">S1: SMMSocialMedia</strong>, <strong className="text-purple-500 font-bold">Y1: YoyoMedia</strong>, or <strong className="text-cyan-500 font-bold">BYO API</strong>) executed the dispatch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin text-blue-600" : ""}`} />
                  <span>{loadingOrders ? "Refreshing..." : "Refresh Orders"}</span>
                </button>
              </div>
            </div>

            {/* Provider Filter Badges & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setSelectedProviderFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedProviderFilter === "ALL"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>All Providers</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-black/20 text-[10px]">
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedProviderFilter("S1")}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedProviderFilter === "S1"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                >
                  <Server className="w-3 h-3" />
                  <span>S1 • SMMSocialMedia</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-700/20 text-[10px]">
                    {countS1}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedProviderFilter("Y1")}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedProviderFilter === "Y1"
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                  }`}
                >
                  <Server className="w-3 h-3" />
                  <span>Y1 • YoyoMedia</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-700/20 text-[10px]">
                    {countY1}
                  </span>
                </button>

                {countBYO > 0 && (
                  <button
                    onClick={() => setSelectedProviderFilter("BYO")}
                    className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedProviderFilter === "BYO"
                        ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                        : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>BYO • User API</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-cyan-700/20 text-[10px]">
                      {countBYO}
                    </span>
                  </button>
                )}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID, upstream #, link, user..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Client</th>
                    <th className="py-3 px-2">Provider / API</th>
                    <th className="py-3 px-2">Upstream Order #</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Target Link</th>
                    <th className="py-3 px-2">Qty & Pacing</th>
                    <th className="py-3 px-2">Charge</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                        {loadingOrders ? "Loading live orders..." : "No orders match your filter criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-2">
                          <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            #{String(o.id).slice(-8)}
                          </div>
                          <div className="text-[10px] text-slate-400">{o.date}</div>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-slate-900 dark:text-white max-w-[150px] truncate" title={o.user}>
                            {o.user}
                          </div>
                          {o.userName && (
                            <div className="text-[10px] text-slate-400">{o.userName}</div>
                          )}
                        </td>

                        {/* Provider / API Badge (S1, Y1, BYO) */}
                        <td className="py-3.5 px-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border shadow-xs ${o.providerBadgeClass}`}>
                            <Server className="w-3 h-3 shrink-0" />
                            <span>{o.providerCode}</span>
                            <span className="opacity-80 font-semibold">• {o.providerName}</span>
                          </span>
                        </td>

                        {/* Upstream Order ID */}
                        <td className="py-3.5 px-2">
                          {o.providerOrderId ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>#{o.providerOrderId}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-500 font-medium italic">
                              Pending dispatch
                            </span>
                          )}
                        </td>

                        {/* Service & ID */}
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-slate-900 dark:text-white max-w-[180px] truncate" title={o.service}>
                            {o.service}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            ID: <strong className="text-slate-600 dark:text-slate-300 font-bold">{o.serviceId}</strong> • {o.platform}
                          </div>
                        </td>

                        {/* Link */}
                        <td className="py-3.5 px-2 font-mono text-[11px]">
                          <a
                            href={o.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-600 underline flex items-center gap-1 max-w-[160px] truncate cursor-pointer"
                            title={o.link}
                          >
                            <span className="truncate">{o.link}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        {/* Qty & Pacing */}
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {Number(o.quantity).toLocaleString()}
                          </div>
                          {o.runs > 1 ? (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                              {o.runs} batches @ {o.intervalMinutes}m
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400">Direct delivery</div>
                          )}
                        </td>

                        {/* Charge */}
                        <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white text-xs">
                          ₹{Number(o.charge).toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            o.status === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                              : o.status === "IN_PROGRESS"
                              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800 animate-pulse"
                              : o.status === "PROCESSING"
                              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800"
                              : o.status === "FAILED" || o.status === "CANCELLED"
                              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {o.status === "IN_PROGRESS" && <Zap className="w-2.5 h-2.5" />}
                            <span>{o.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ──────────────── TAB 3: LIVE USERS & FULL ADMIN BALANCES ──────────────── */}
      {activeTab === "USERS" && (() => {
        const filteredUsers = users
          .filter((u) => {
            const query = userSearch.trim().toLowerCase();
            const matchSearch =
              !query ||
              String(u.id).toLowerCase().includes(query) ||
              String(u.name || "").toLowerCase().includes(query) ||
              String(u.email || "").toLowerCase().includes(query) ||
              String(u.phone || "").toLowerCase().includes(query);

            const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
            const matchStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;
            const matchBalance =
              userBalanceFilter === "ALL" ||
              (userBalanceFilter === "HAS_BALANCE" && Number(u.balance) > 0) ||
              (userBalanceFilter === "ZERO_BALANCE" && Number(u.balance) === 0);

            return matchSearch && matchRole && matchStatus && matchBalance;
          })
          .sort((a, b) => {
            if (userSort === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (userSort === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (userSort === "HIGH_BALANCE") return (Number(b.balance) || 0) - (Number(a.balance) || 0);
            if (userSort === "LOW_BALANCE") return (Number(a.balance) || 0) - (Number(b.balance) || 0);
            if (userSort === "HIGH_DEPOSIT") return (Number(b.totalDeposited) || 0) - (Number(a.totalDeposited) || 0);
            if (userSort === "HIGH_SPENT") return (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0);
            if (userSort === "MOST_ORDERS") return (b.orderCount || 0) - (a.orderCount || 0);
            return 0;
          });

        const totalUserBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);
        const totalUserDeposits = users.reduce((sum, u) => sum + (Number(u.totalDeposited) || 0), 0);
        const totalUserSpent = users.reduce((sum, u) => sum + (Number(u.totalSpent) || 0), 0);

        return (
          <div className="space-y-5">
            {/* Modal: Edit User Exact Balance */}
            {editingUser && (
              <div 
                onClick={() => setEditingUser(null)}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 cursor-default"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Adjust User Balance</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{editingUser.email}</p>
                    </div>
                    <button 
                      onClick={() => setEditingUser(null)}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Current Balance:</span>
                    <span className="font-black text-base text-blue-600 dark:text-blue-400 font-mono">₹{Number(editingUser.balance).toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Set Exact Balance (₹ INR)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        placeholder="e.g. 500"
                        value={customBalanceInput}
                        onChange={(e) => setCustomBalanceInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                      <button
                        disabled={savingBalance || customBalanceInput === ""}
                        onClick={() => {
                          if (customBalanceInput === "") return;
                          handleSetExactBalance(editingUser.id, Number(customBalanceInput));
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                      >
                        {savingBalance ? "Saving..." : "Set Exact"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Quick Increment / Decrement
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[+100, +500, +1000, -100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            handleAdjustBalance(editingUser.id, amt);
                            setEditingUser(null);
                          }}
                          className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                            amt > 0 
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100" 
                              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                          }`}
                        >
                          {amt > 0 ? `+₹${amt}` : `-₹${Math.abs(amt)}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Login from Modal */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleImpersonate(editingUser.id, editingUser.email)}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>1-Click Login as {editingUser.name || "User"}</span>
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</div>
                <span className="text-[10px] text-emerald-600 font-bold">Registered Accounts</span>
              </div>
              <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total User Balances</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{totalUserBalance.toFixed(2)}</div>
                <span className="text-[10px] text-slate-400">Available Wallet Capital</span>
              </div>
              <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Deposited</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalUserDeposits.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-600 font-bold">UPI + Crypto USDT</span>
              </div>
              <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total User Spending</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{totalUserSpent.toFixed(2)}</div>
                <span className="text-[10px] text-purple-600 font-bold">All Orders Delivered</span>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              {/* Header & Filter Controls Bar */}
              <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered User Directory</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">
                        Showing {filteredUsers.length} of {users.length} Users
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Filter by highest/lowest balance, registration date, roles, and status.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search name, email, ID..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 w-52"
                      />
                    </div>
                    <button
                      onClick={loadUsers}
                      disabled={loadingUsers}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Sort Pills Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  {/* Sort Order Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                    <select
                      value={userSort}
                      onChange={(e: any) => setUserSort(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="NEWEST" className="dark:bg-slate-900">✨ Newest Registered</option>
                      <option value="OLDEST" className="dark:bg-slate-900">⏳ Oldest Registered</option>
                      <option value="HIGH_BALANCE" className="dark:bg-slate-900">💰 Highest Balance</option>
                      <option value="LOW_BALANCE" className="dark:bg-slate-900">📉 Lowest Balance</option>
                      <option value="HIGH_DEPOSIT" className="dark:bg-slate-900">💳 Most Deposited</option>
                      <option value="HIGH_SPENT" className="dark:bg-slate-900">🛍️ Top Spenders</option>
                      <option value="MOST_ORDERS" className="dark:bg-slate-900">📦 Most Orders</option>
                    </select>
                  </div>

                  {/* Balance Filter */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setUserBalanceFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userBalanceFilter === "ALL"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All Balances
                    </button>
                    <button
                      onClick={() => setUserBalanceFilter("HAS_BALANCE")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userBalanceFilter === "HAS_BALANCE"
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Has Balance (&gt;₹0)
                    </button>
                    <button
                      onClick={() => setUserBalanceFilter("ZERO_BALANCE")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userBalanceFilter === "ZERO_BALANCE"
                          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      ₹0 Balance
                    </button>
                  </div>

                  {/* Role Filter */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setUserRoleFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userRoleFilter === "ALL"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All Roles
                    </button>
                    <button
                      onClick={() => setUserRoleFilter("USER")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userRoleFilter === "USER"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Users Only
                    </button>
                    <button
                      onClick={() => setUserRoleFilter("ADMIN")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userRoleFilter === "ADMIN"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Admins Only
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setUserStatusFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userStatusFilter === "ALL"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => setUserStatusFilter("ACTIVE")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userStatusFilter === "ACTIVE"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setUserStatusFilter("BANNED")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        userStatusFilter === "BANNED"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Banned
                    </button>
                  </div>

                  {/* Reset Filters */}
                  {(userSearch || userSort !== "NEWEST" || userRoleFilter !== "ALL" || userStatusFilter !== "ALL" || userBalanceFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setUserSearch("");
                        setUserSort("NEWEST");
                        setUserRoleFilter("ALL");
                        setUserStatusFilter("ALL");
                        setUserBalanceFilter("ALL");
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-2">User / Email</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Wallet Balance</th>
                      <th className="py-3 px-2">Total Deposited</th>
                      <th className="py-3 px-2">Total Spent</th>
                      <th className="py-3 px-2">Activity</th>
                      <th className="py-3 px-2 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                          <span>Loading real users from database...</span>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          {/* User / Email */}
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name || "User"}</span>
                                  {u.role === "ADMIN" && (
                                    <Crown className="w-3 h-3 text-amber-500 inline shrink-0" />
                                  )}
                                </div>
                                <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                                <div className="text-[10px] text-slate-400">
                                  Joined: {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-2">
                            <button
                              onClick={() => handleToggleUserRole(u.id, u.role)}
                              title="Click to toggle Role (ADMIN / USER)"
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                u.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {u.role}
                            </button>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-2">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              title="Click to toggle Status (ACTIVE / BANNED)"
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                u.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {u.status}
                            </button>
                          </td>

                          {/* Wallet Balance */}
                          <td className="py-3.5 px-2">
                            <div className="font-black text-slate-900 dark:text-white font-mono text-sm">
                              ₹{Number(u.balance || 0).toFixed(2)}
                            </div>
                          </td>

                          {/* Total Deposited */}
                          <td className="py-3.5 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{Number(u.totalDeposited || 0).toFixed(2)}
                          </td>

                          {/* Total Spent */}
                          <td className="py-3.5 px-2 font-mono font-bold text-slate-600 dark:text-slate-300">
                            ₹{Number(u.totalSpent || 0).toFixed(2)}
                          </td>

                          {/* Activity */}
                          <td className="py-3.5 px-2 text-slate-500">
                            <div className="text-[11px] font-semibold">
                              <strong className="text-slate-800 dark:text-slate-200">{u.orderCount || 0}</strong> orders
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.depositCount || 0} deposits
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-2 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* 1-Click Admin Impersonation / Login as User */}
                              <button
                                onClick={() => handleImpersonate(u.id, u.email)}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title={`Login into ${u.email}'s account with 1 click`}
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Login</span>
                              </button>

                              {/* Edit Balance & Info Modal Trigger */}
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setCustomBalanceInput(String(u.balance));
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                                title="Edit User Balance & Permissions"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* ──────────────── TAB: WHOP CLIPPERS & COMBO CONFIGURATION ──────────────── */}
      {activeTab === "COMBOS" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Whop Clippers & Multi-Signal Combo Configuration
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Map which upstream provider services power Views, Likes, Shares, Saves & Comments for each platform.
                  </p>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                {(["INSTAGRAM", "TIKTOK", "YOUTUBE"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setComboPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      comboPlatform === p
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {loadingCombos ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">
                Loading combo settings...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Views Mapping */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Default Views Service ({comboPlatform})</span>
                      </span>
                    </div>
                    <select
                      value={comboConfig?.[comboPlatform]?.viewsServiceId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComboConfig((prev: any) => ({
                          ...prev,
                          [comboPlatform]: {
                            ...prev?.[comboPlatform],
                            viewsServiceId: val
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-hidden"
                    >
                      <option value="">Select Default Service...</option>
                      {availableComboServices.filter(s => s.platform === comboPlatform).map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.serviceId}] {s.name} - ₹{s.customRate}/1k
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Likes Mapping */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>Default Likes Service ({comboPlatform})</span>
                      </span>
                    </div>
                    <select
                      value={comboConfig?.[comboPlatform]?.likesServiceId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComboConfig((prev: any) => ({
                          ...prev,
                          [comboPlatform]: {
                            ...prev?.[comboPlatform],
                            likesServiceId: val
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-hidden"
                    >
                      <option value="">Select Default Service...</option>
                      {availableComboServices.filter(s => s.platform === comboPlatform).map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.serviceId}] {s.name} - ₹{s.customRate}/1k
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shares Mapping */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Default Shares Service ({comboPlatform})</span>
                      </span>
                    </div>
                    <select
                      value={comboConfig?.[comboPlatform]?.sharesServiceId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComboConfig((prev: any) => ({
                          ...prev,
                          [comboPlatform]: {
                            ...prev?.[comboPlatform],
                            sharesServiceId: val
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-hidden"
                    >
                      <option value="">Select Default Service...</option>
                      {availableComboServices.filter(s => s.platform === comboPlatform).map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.serviceId}] {s.name} - ₹{s.customRate}/1k
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Saves Mapping */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-purple-400" />
                        <span>Default Saves Service ({comboPlatform})</span>
                      </span>
                    </div>
                    <select
                      value={comboConfig?.[comboPlatform]?.savesServiceId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComboConfig((prev: any) => ({
                          ...prev,
                          [comboPlatform]: {
                            ...prev?.[comboPlatform],
                            savesServiceId: val
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-hidden"
                    >
                      <option value="">Select Default Service...</option>
                      {availableComboServices.filter(s => s.platform === comboPlatform).map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.serviceId}] {s.name} - ₹{s.customRate}/1k
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comments Mapping */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Default Comments Service ({comboPlatform})</span>
                      </span>
                    </div>
                    <select
                      value={comboConfig?.[comboPlatform]?.commentsServiceId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComboConfig((prev: any) => ({
                          ...prev,
                          [comboPlatform]: {
                            ...prev?.[comboPlatform],
                            commentsServiceId: val
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium outline-hidden"
                    >
                      <option value="">Select Default Service...</option>
                      {availableComboServices.filter(s => s.platform === comboPlatform).map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.serviceId}] {s.name} - ₹{s.customRate}/1k
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Non-linear jitter and organic pacing applied automatically across all combo orders</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveComboSettings}
                    disabled={savingCombos}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingCombos ? "Saving Configuration..." : "Save Whop & Combo Settings"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 6: DEPOSIT VERIFICATION QUEUE (UPI & CRYPTO) ──────────────── */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          {/* Sub-Tabs: All / UPI / Crypto */}
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setPaymentSubTab("ALL")}
              className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (
                paymentSubTab === "ALL" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              )}
            >
              All Deposits
            </button>
            <button
              onClick={() => setPaymentSubTab("UPI")}
              className={"px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer " + (
                paymentSubTab === "UPI" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              )}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>UPI Payments</span>
              {payments.filter(p => p.status === "PENDING").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                  {payments.filter(p => p.status === "PENDING").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setPaymentSubTab("CRYPTO")}
              className={"px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer " + (
                paymentSubTab === "CRYPTO" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              )}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto USDT (TRC-20)</span>
              {cryptoPayments.filter(p => p.status === "PENDING").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                  {cryptoPayments.filter(p => p.status === "PENDING").length}
                </span>
              )}
            </button>
          </div>

          {/* UPI Table (Show if ALL or UPI) */}
          {(paymentSubTab === "ALL" || paymentSubTab === "UPI") && (
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>UPI Deposits Queue (2 Screenshots)</span>
                  </h2>
                  <p className="text-xs text-slate-400">Inspect payment receipt + success screen, match 12-digit UTR, and approve to credit balance</p>
                </div>
                <span className="text-xs font-bold text-blue-600">Min: ₹{settings.minDeposit || 100}</span>
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
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">No UPI deposits found</td>
                      </tr>
                    ) : (
                      payments.map((p) => (
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
                              <span className="text-slate-400 text-[11px] italic">None</span>
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
                              <span className="text-slate-400 text-[11px] italic">None</span>
                            )}
                          </td>

                          <td className="py-3.5 px-2">
                            <span className={"px-2 py-0.5 rounded-md text-[10px] font-bold " + (
                              p.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : p.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                            )}>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Crypto Table (Show if ALL or CRYPTO) */}
          {(paymentSubTab === "ALL" || paymentSubTab === "CRYPTO") && (
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>Crypto USDT (TRC20) Verification Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pre-verified on TronScan API & anti-duplicate protected. Inspect 2 screenshots and approve to credit user balance.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600">Rate: 1 USDT = ₹96</span>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-2">User</th>
                      <th className="py-3 px-2">Blockchain TxID / Explorer</th>
                      <th className="py-3 px-2">Deposit Amount</th>
                      <th className="py-3 px-2">On-Chain Auto-Check</th>
                      <th className="py-3 px-2">Proof 1 (Receipt)</th>
                      <th className="py-3 px-2">Proof 2 (Explorer)</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {cryptoPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">No crypto deposits in queue</td>
                      </tr>
                    ) : (
                      cryptoPayments.map((cp) => (
                        <tr key={cp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-2 font-bold">{cp.user}</td>
                          
                          {/* TxID with TronScan link */}
                          <td className="py-3.5 px-2 font-mono text-[11px]">
                            <a 
                              href={"https://tronscan.org/#/transaction/" + cp.txHash} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <span>{cp.txHash?.slice(0, 14)}...</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-2">
                            <span className="font-black text-slate-900 dark:text-white block text-xs">
                              {cp.amountUsdt} USDT
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600">
                              ≈ ₹{cp.amountInr} INR
                            </span>
                          </td>

                          {/* On-Chain Auto Check */}
                          <td className="py-3.5 px-2">
                            {cp.onChainVerified ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  TronScan Confirmed
                                </span>
                                {cp.onChainDetails && (
                                  <div className="text-[9px] text-slate-400 max-w-[150px] truncate" title={cp.onChainDetails}>
                                    {cp.onChainDetails}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                                ⏳ Pending Sync
                              </span>
                            )}
                          </td>

                          {/* Proof 1 */}
                          <td className="py-3.5 px-2">
                            {cp.screenshot1 ? (
                              <div 
                                onClick={() => setPreviewImage(cp.screenshot1)}
                                className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:scale-105 transition-transform group shadow-2xs"
                              >
                                <img src={cp.screenshot1} alt="Withdrawal Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">None</span>
                            )}
                          </td>

                          {/* Proof 2 */}
                          <td className="py-3.5 px-2">
                            {cp.screenshot2 ? (
                              <div 
                                onClick={() => setPreviewImage(cp.screenshot2)}
                                className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:scale-105 transition-transform group shadow-2xs"
                              >
                                <img src={cp.screenshot2} alt="Explorer Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">None</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-2">
                            <span className={"px-2 py-0.5 rounded-md text-[10px] font-bold " + (
                              cp.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : cp.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {cp.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-2 text-right">
                            {cp.status === "PENDING" ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleApproveCrypto(cp.id, cp.amountUsdt, cp.amountInr, cp.user)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve & Credit ₹{cp.amountInr}</span>
                                </button>
                                <button
                                  onClick={() => handleRejectCrypto(cp.id)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                min="10"
                value={settings.minDeposit}
                onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400">Strictly enforced across Wallet checkout and backend APIs.</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">USDT (TRC-20) Address</label>
                <input
                  type="text"
                  value={settings.trc20Address}
                  onChange={(e) => setSettings({ ...settings, trc20Address: e.target.value })}
                  placeholder="TVTjQK..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">USDT (BEP-20) Address</label>
                <input
                  type="text"
                  value={settings.bep20Address}
                  onChange={(e) => setSettings({ ...settings, bep20Address: e.target.value })}
                  placeholder="0x71C3..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp Support</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Telegram Support / Bot</label>
                <input
                  type="text"
                  value={settings.telegram}
                  onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSaveDepositSettings}
              disabled={savingSettings}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs flex items-center gap-2"
            >
              <span>{savingSettings ? "Saving..." : "Save Deposit & General Config"}</span>
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
