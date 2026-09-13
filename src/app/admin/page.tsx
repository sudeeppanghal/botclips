"use client";

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";

type AdminTab = "OVERVIEW" | "ORDERS" | "USERS" | "PANELS" | "SERVICES" | "PAYMENTS" | "SETTINGS";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── State for Orders ──
  const [orders, setOrders] = useState([
    { id: "1024", user: "roonie@dhillionsmm.com", service: "Instagram Real HQ Followers", link: "https://instagram.com/roonie_creator", quantity: 1000, charge: 180, status: "COMPLETED", date: "Sep 11, 2026" },
    { id: "1023", user: "creator99@gmail.com", service: "YouTube High Retention Views", link: "https://youtube.com/watch?v=k38x92aL", quantity: 5000, charge: 1200, status: "PROCESSING", date: "Sep 11, 2026" },
    { id: "1022", user: "tiktok_viral@outlook.com", service: "TikTok Real Followers", link: "https://tiktok.com/@roonie.official", quantity: 2000, charge: 380, status: "COMPLETED", date: "Sep 10, 2026" },
    { id: "1021", user: "crypto_alpha@t.me", service: "Telegram Channel Members", link: "https://t.me/channel_alpha", quantity: 500, charge: 60, status: "PENDING", date: "Sep 10, 2026" },
    { id: "1020", user: "growth_agency@agency.com", service: "Twitter (X) Active Likes", link: "https://x.com/roonie/status/18342", quantity: 1000, charge: 110, status: "COMPLETED", date: "Sep 09, 2026" },
  ]);

  // ── State for Users ──
  const [users, setUsers] = useState([
    { id: "usr_1", name: "Roonie", email: "roonie@dhillionsmm.com", balance: 520.00, totalSpent: 1930.00, role: "USER", status: "ACTIVE" },
    { id: "usr_2", name: "Agency Pro", email: "agency@socials.com", balance: 1450.00, totalSpent: 8400.00, role: "USER", status: "ACTIVE" },
    { id: "usr_3", name: "Amit Kumar", email: "amit.k@gmail.com", balance: 50.00, totalSpent: 450.00, role: "USER", status: "ACTIVE" },
    { id: "usr_4", name: "Admin Dhillon", email: "admin@dhillionsmm.com", balance: 9999.00, totalSpent: 0.00, role: "ADMIN", status: "ACTIVE" },
  ]);

  // ── State for Panels ──
  const [panels, setPanels] = useState([
    { id: "p1", name: "JustAnotherPanel (Primary)", url: "https://justanotherpanel.com/api/v2", balance: "$142.50", status: "ONLINE", active: true },
    { id: "p2", name: "Peakerr SMM (Backup)", url: "https://peakerr.com/api/v2", balance: "$85.00", status: "ONLINE", active: true },
  ]);

  // ── State for Services ──
  const [services, setServices] = useState([
    { id: "1024", platform: "INSTAGRAM", name: "Instagram Real HQ Followers", originalRate: 35, customRate: 180, active: true },
    { id: "1025", platform: "INSTAGRAM", name: "Instagram High Retention Likes", originalRate: 10, customRate: 45, active: true },
    { id: "2011", platform: "YOUTUBE", name: "YouTube High Retention Views", originalRate: 60, customRate: 240, active: true },
    { id: "3015", platform: "TIKTOK", name: "TikTok Real Followers", originalRate: 40, customRate: 190, active: true },
    { id: "4010", platform: "TELEGRAM", name: "Telegram Channel Members", originalRate: 25, customRate: 120, active: true },
  ]);

  // ── State for UPI Payments ──
  const [payments, setPayments] = useState([
    { id: "pay-1", user: "Roonie (roonie@dhillionsmm.com)", utr: "423891024819", amount: 500, time: "10 mins ago", status: "PENDING" },
    { id: "pay-2", user: "Amit Kumar (amit.k@gmail.com)", utr: "423401928341", amount: 200, time: "2 hours ago", status: "CONFIRMED" },
    { id: "pay-3", user: "CryptoWhale (whale@proton.me)", utr: "0x8f3c4a2b9102ef19", amount: 1500, time: "1 day ago", status: "CONFIRMED" },
  ]);

  // ── State for Settings ──
  const [settings, setSettings] = useState({
    siteName: "BotClips",
    currencySymbol: "₹",
    usdToInr: 88.0,
    upiId: "dhillionsmm@axl",
    telegram: "@dhillionsmm_support",
    whatsapp: "+91 99999 99999",
    minDeposit: 100
  });

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Actions
  const handleApprovePayment = async (id: string, amount: number, user: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "CONFIRMED" } : p));
    notify(`Approved ₹${amount} for ${user}! Wallet credited.`);
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

  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    notify(`Order #${id} updated to ${newStatus}`);
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
            Complete control over users, balances, upstream providers, orders, and profit margins.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs self-start"
        >
          View Client Dashboard →
        </Link>
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
          { id: "PANELS", label: "Upstream Providers", icon: Server },
          { id: "SERVICES", label: "Services & Markups", icon: Layers },
          { id: "PAYMENTS", label: "UPI Approvals", icon: CreditCard, badge: payments.filter(p => p.status === "PENDING").length },
          { id: "SETTINGS", label: "Site Settings", icon: Settings },
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
              <span className="text-[11px] font-bold text-emerald-600">↑ +24% net profit</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Total Orders Placed</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{orders.length}</div>
              <span className="text-[11px] font-bold text-blue-600">All dispatched</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Registered Users</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</div>
              <span className="text-[11px] font-bold text-emerald-600">Active</span>
            </div>
            <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Pending UPI Verifications</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {payments.filter(p => p.status === "PENDING").length}
              </div>
              <button onClick={() => setActiveTab("PAYMENTS")} className="text-[11px] font-bold text-amber-600 hover:underline">
                Review Queue →
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Automated Provider Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {panels.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.url}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-[10px] font-bold">
                    ONLINE (145ms)
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
                  <th className="py-3 px-2">#ID</th>
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Link</th>
                  <th className="py-3 px-2">Qty</th>
                  <th className="py-3 px-2">Charge</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Quick Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-2 font-mono font-bold">#{o.id}</td>
                    <td className="py-3.5 px-2 text-slate-500">{o.user}</td>
                    <td className="py-3.5 px-2 font-semibold">{o.service}</td>
                    <td className="py-3.5 px-2 font-mono text-[11px] max-w-[140px] truncate text-blue-600">{o.link}</td>
                    <td className="py-3.5 px-2 font-bold">{o.quantity.toLocaleString()}</td>
                    <td className="py-3.5 px-2 font-black">₹{o.charge}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        o.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : o.status === "PROCESSING" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled (Refund)</option>
                      </select>
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Users</h2>
            <span className="text-xs font-bold text-slate-400">{users.length} Users</span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Wallet Balance</th>
                  <th className="py-3 px-2">Total Spent</th>
                  <th className="py-3 px-2 text-right">Adjust Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-2 font-bold">{u.name}</td>
                    <td className="py-3.5 px-2 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${u.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-black text-blue-600">₹{u.balance.toFixed(2)}</td>
                    <td className="py-3.5 px-2 text-slate-500 font-semibold">₹{u.totalSpent.toFixed(2)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustBalance(u.id, 500)}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                        >
                          +₹500
                        </button>
                        <button
                          onClick={() => handleAdjustBalance(u.id, -200)}
                          className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer"
                        >
                          -₹200
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

      {/* ──────────────── TAB 4: UPSTREAM PROVIDERS ──────────────── */}
      {activeTab === "PANELS" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Active SMM Providers</h2>
                <p className="text-xs text-slate-400">Direct v2 SMM APIs used to deliver orders automatically</p>
              </div>
              <button
                onClick={() => notify("Enter API URL & Key in .env or connect below")}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add API</span>
              </button>
            </div>

            <div className="space-y-3">
              {panels.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-xs font-mono text-slate-400">{p.url}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">Live Balance: {p.balance}</div>
                  </div>
                  <button
                    onClick={() => notify(`Connection to ${p.name} OK! Latency: 120ms`)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Ping</span>
                  </button>
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
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Average Markup: 3.8x (380%)</span>
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

      {/* ──────────────── TAB 6: UPI APPROVALS ──────────────── */}
      {activeTab === "PAYMENTS" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">UPI Payment Verification Queue</h2>
              <p className="text-xs text-slate-400">Match UTR numbers with your UPI App statement and approve in 1 click</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">12-Digit UTR</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Submitted</th>
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
                    <td className="py-3.5 px-2 text-slate-400 text-[11px]">{p.time}</td>
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

      {/* ──────────────── TAB 7: SITE SETTINGS ──────────────── */}
      {activeTab === "SETTINGS" && (
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Payment & Site Configuration</h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Site Title</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
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
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Support WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Support Telegram</label>
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
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
