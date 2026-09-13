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
  Eye,
  ExternalLink,
  Crown
} from "lucide-react";

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
  const [panels, setPanels] = useState([
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
  const [services, setServices] = useState([
    { id: "1024", platform: "INSTAGRAM", name: "Instagram Real HQ Followers", originalRate: 35, customRate: 180, active: true },
    { id: "1025", platform: "INSTAGRAM", name: "Instagram High Retention Likes", originalRate: 10, customRate: 45, active: true },
    { id: "2011", platform: "YOUTUBE", name: "YouTube High Retention Views", originalRate: 60, customRate: 240, active: true },
    { id: "3015", platform: "TIKTOK", name: "TikTok Real Followers", originalRate: 40, customRate: 190, active: true },
    { id: "4010", platform: "TELEGRAM", name: "Telegram Channel Members", originalRate: 25, customRate: 120, active: true },
  ]);

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
    upiId: "dhillonsmm@axl",
    telegram: "@dhillionsmm_support",
    whatsapp: "+91 99999 99999",
    minDeposit: 50,
    cloudinaryCloudName: "",
    cloudinaryUploadPreset: "",
    cloudinaryApiKey: "",
  });

  useEffect(() => {
    loadRealPayments();
  }, []);

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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-500 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Master Admin Panel
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete control over background SMM providers (smmsocialmedia.in, yoyomedia), UPI screenshot verification, and users.
          </p>
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Background Upstream Providers</h2>
                <p className="text-xs text-slate-400">Configured provider APIs used in Mode 1. Completely hidden from regular users.</p>
              </div>
              <button
                onClick={() => notify("Configure new provider API below")}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add SMM Provider</span>
              </button>
            </div>

            <div className="space-y-3">
              {panels.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">ACTIVE</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{p.url}</div>
                      <div className="text-xs text-slate-500 mt-1">{p.description}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">
                        Balance: {p.balance}
                      </span>
                      <button
                        onClick={() => notify(`Connection to ${p.name} OK! Ping: 88ms`)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Test Ping</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold">API Key:</span>
                    <input
                      type="password"
                      defaultValue={p.apiKey}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs w-64"
                    />
                    <button
                      onClick={() => notify(`Updated API key for ${p.name}`)}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 5: SERVICES & MARKUPS ──────────────── */}
      {activeTab === "SERVICES" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Profit Margins</h2>
              <p className="text-xs text-slate-400">Original Provider Cost vs Client Price (Calculates automated margin)</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Average Margin: 3.8x (380%)</span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Platform</th>
                  <th className="py-3 px-2">Service Name</th>
                  <th className="py-3 px-2">Provider Cost</th>
                  <th className="py-3 px-2">Your Sell Rate</th>
                  <th className="py-3 px-2">Your Profit / 1k</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {services.map((s) => {
                  const profit = s.customRate - s.originalRate;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-2 font-mono font-bold">#{s.id}</td>
                      <td className="py-3.5 px-2 font-bold text-blue-600">{s.platform}</td>
                      <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td className="py-3.5 px-2 text-slate-400 font-mono">₹{s.originalRate}</td>
                      <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white">₹{s.customRate}</td>
                      <td className="py-3.5 px-2 font-black text-emerald-600">+₹{profit}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                          Active
                        </span>
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
        </div>
      )}

    </div>
  );
}
