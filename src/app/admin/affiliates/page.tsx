"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  Search, 
  Edit3, 
  TrendingUp, 
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  UserPlus
} from "lucide-react";

interface AdminMetrics {
  totalUsers: number;
  referredUsersCount: number;
  totalReferralDeposits: number;
  totalNominalProfit: number;
  totalCommissionsEarned: number;
  totalPayoutsPaid: number;
  totalPayoutsPending: number;
}

interface PromoterItem {
  id: string;
  name: string | null;
  email: string;
  referralCode: string | null;
  isInfluencer: boolean;
  isPromoter?: boolean;
  referralCommissionRate?: number;
  influencerChannel: string | null;
  referralsCount: number;
  totalDeposits: number;
  nominalProfit: number;
  commissionEarned: number;
  paidAmount: number;
  pendingAmount: number;
  availableBalance: number;
  createdAt: string;
}

interface PayoutItem {
  id: string;
  amount: number;
  method: string;
  destination: string;
  status: "PENDING" | "PAID" | "REJECTED";
  utrOrTxHash?: string;
  createdAt: string;
  paidAt?: string;
  promoter: {
    id: string;
    name: string | null;
    email: string;
    referralCode: string | null;
    influencerChannel: string | null;
    payoutUpi: string | null;
    payoutCrypto: string | null;
  };
}

export default function AdminAffiliatesPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [promoters, setPromoters] = useState<PromoterItem[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Payout actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [utrInputs, setUtrInputs] = useState<Record<string, string>>({});

  // Vanity code modal / state
  const [selectedPromoter, setSelectedPromoter] = useState<PromoterItem | null>(null);
  const [vanityCodeInput, setVanityCodeInput] = useState("");
  const [channelInput, setChannelInput] = useState("");
  const [vanityRateInput, setVanityRateInput] = useState("5.0");
  const [vanitySubmitting, setVanitySubmitting] = useState(false);
  const [vanityError, setVanityError] = useState("");

  // Assign any user as new affiliate modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignCode, setAssignCode] = useState("");
  const [assignChannel, setAssignChannel] = useState("");
  const [assignRate, setAssignRate] = useState("5.0");
  const [assignUserSearch, setAssignUserSearch] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Quick inline rate editing
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editingRateVal, setEditingRateVal] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setPromoters(data.promoters || []);
        setPayouts(data.payouts || []);
        if (data.allUsers) setAllUsers(data.allUsers);
      }
    } catch (err) {
      console.error("Failed to load admin affiliates data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayoutAction = async (payoutId: string, action: "APPROVE_PAYOUT" | "REJECT_PAYOUT") => {
    const isApprove = action === "APPROVE_PAYOUT";
    if (!window.confirm(`⚠️ Are you sure you want to ${isApprove ? "APPROVE and mark PAID" : "REJECT"} this payout request?`)) {
      return;
    }
    try {
      setActionLoading(payoutId);
      const utr = utrInputs[payoutId] || "";
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payoutId,
          utrOrTxHash: utr,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to process payout");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePromoterStatus = async (userId: string, currentStatus: boolean, userEmail?: string) => {
    const nextStatus = !currentStatus;
    if (!window.confirm(`⚠️ Are you sure you want to ${nextStatus ? "ENABLE" : "DISABLE"} affiliate access for ${userEmail || "this user"}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_PROMOTER",
          userId,
          isPromoter: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to update promoter status");
      }
    } catch {
      alert("Error updating promoter status");
    }
  };

  const handleUpdateCommissionRate = async (userId: string, rate: number) => {
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert("Please enter a valid rate between 0% and 100%");
      return;
    }
    if (!window.confirm(`⚠️ Set deposit commission rate to ${rate}% for this affiliate partner?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_COMMISSION_RATE", userId, commissionRate: rate })
      });
      const data = await res.json();
      if (data.success) {
        setEditingRateId(null);
        fetchData();
      } else {
        alert(data.error || "Failed to update commission rate");
      }
    } catch {
      alert("Error updating commission rate");
    }
  };

  const handleAssignAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) {
      setAssignError("Please select a user to assign.");
      return;
    }
    const rateNum = Number(assignRate) || 5.0;
    if (!window.confirm(`Are you sure you want to assign this referral code with ${rateNum}% deposit commission and ENABLE affiliate access for this user?`)) {
      return;
    }
    try {
      setAssignSubmitting(true);
      setAssignError("");
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_PROMOTER",
          userId: assignUserId,
          customCode: assignCode.trim().toUpperCase(),
          influencerChannel: assignChannel.trim(),
          commissionRate: rateNum,
          isPromoter: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAssignModal(false);
        setAssignUserId("");
        setAssignCode("");
        setAssignChannel("");
        setAssignRate("5.0");
        setAssignUserSearch("");
        fetchData();
      } else {
        setAssignError(data.error || "Failed to assign affiliate");
      }
    } catch (err: any) {
      setAssignError(err?.message || "Failed to assign affiliate");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleSaveVanityCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoter) return;
    setVanityError("");

    const rateNum = Number(vanityRateInput) || 5.0;
    try {
      setVanitySubmitting(true);
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_VANITY_CODE",
          userId: selectedPromoter.id,
          customCode: vanityCodeInput.trim().toUpperCase(),
          influencerChannel: channelInput.trim(),
          commissionRate: rateNum,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedPromoter(null);
        fetchData();
      } else {
        setVanityError(data.error || "Failed to assign vanity code");
      }
    } catch (err: any) {
      setVanityError(err?.message || "Failed to assign vanity code");
    } finally {
      setVanitySubmitting(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");

  const openVanityModal = (promoter: PromoterItem) => {
    setSelectedPromoter(promoter);
    setVanityCodeInput(promoter.referralCode || "");
    setChannelInput(promoter.influencerChannel || "");
    setVanityRateInput(String(promoter.referralCommissionRate ?? 5.0));
    setVanityError("");
  };

  const filteredPromoters = promoters.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.email.toLowerCase().includes(term) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.referralCode && p.referralCode.toLowerCase().includes(term)) ||
      (p.influencerChannel && p.influencerChannel.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === "ENABLED") return Boolean(p.isPromoter);
    if (statusFilter === "DISABLED") return !p.isPromoter;
    return true;
  });

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");
  const processedPayouts = payouts.filter((p) => p.status !== "PENDING");

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-slate-800/40 rounded-lg animate-pulse w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Affiliates & Influencer Partner Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Assign custom referral codes to creators, toggle partner status (Default: OFF), and approve payouts.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAssignModal(true);
            setAssignError("");
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Assign New Affiliate Partner</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Total App Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {(metrics?.totalUsers || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Referred: <span className="text-purple-400 font-semibold">{metrics?.referredUsersCount || 0}</span>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Referral Volume</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ₹{(metrics?.totalReferralDeposits || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Nominal 30% Margin: <span className="text-purple-400 font-semibold">₹{(metrics?.totalNominalProfit || 0).toFixed(2)}</span>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Influencer 10% Cut</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{(metrics?.totalCommissionsEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Paid: ₹{(metrics?.totalPayoutsPaid || 0).toFixed(2)}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            ₹{(metrics?.totalPayoutsPending || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requests waiting: <span className="text-amber-300 font-semibold">{pendingPayouts.length}</span>
          </p>
        </div>
      </div>

      {/* Pending Payout Queue */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Payout Requests ({pendingPayouts.length})
            </h2>
            <p className="text-xs text-slate-400">
              Transfer funds via UPI / USDT TRC20 and paste UTR/TxHash to mark completed.
            </p>
          </div>
        </div>

        {pendingPayouts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            🎉 All influencer payout requests are cleared! No pending requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Promoter</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">UTR / TxHash Reference</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {pendingPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-sans">
                      <div className="font-bold text-white">{p.promoter.name || "Creator"}</div>
                      <div className="text-[11px] text-slate-400">{p.promoter.email}</div>
                      {p.promoter.influencerChannel && (
                        <div className="text-[10px] text-purple-400 mt-0.5">{p.promoter.influencerChannel}</div>
                      )}
                    </td>
                    <td className="py-3 font-bold text-emerald-400 text-sm">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 select-all">
                      {p.destination}
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        placeholder="Enter UTR / TxHash"
                        value={utrInputs[p.id] || ""}
                        onChange={(e) => setUtrInputs({ ...utrInputs, [p.id]: e.target.value })}
                        className="w-48 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-3 text-right space-x-2 font-sans">
                      <button
                        onClick={() => handlePayoutAction(p.id, "APPROVE_PAYOUT")}
                        disabled={actionLoading === p.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        {actionLoading === p.id ? "Processing..." : "Approve & Mark Paid"}
                      </button>
                      <button
                        onClick={() => handlePayoutAction(p.id, "REJECT_PAYOUT")}
                        disabled={actionLoading === p.id}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promoters & Influencers Directory */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Registered Users & Affiliate Directory ({promoters.length})
            </h2>
            <p className="text-xs text-slate-400">
              All registered users in BotClips. Toggle affiliate promotion ON or OFF with 1-click, assign codes, and configure custom commission %.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ALL" ? "bg-purple-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({promoters.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ENABLED")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ENABLED" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                🟢 Enabled ({promoters.filter(p => p.isPromoter).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DISABLED")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "DISABLED" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                ⚪ Disabled ({promoters.filter(p => !p.isPromoter).length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user / email / code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="pb-3">User / Promoter</th>
                <th className="pb-3">Referral Code</th>
                <th className="pb-3">Affiliate Status</th>
                <th className="pb-3">Signups</th>
                <th className="pb-3">Total Deposits</th>
                <th className="pb-3">Deposit Commission %</th>
                <th className="pb-3">Total Earned</th>
                <th className="pb-3">Available</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPromoters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-sans">
                    No registered users found matching the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredPromoters.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-3 font-sans">
                    <div className="font-bold text-white">{p.name || "Promoter"}</div>
                    <div className="text-[11px] text-slate-400">{p.email}</div>
                    {p.influencerChannel && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 font-medium">
                        {p.influencerChannel}
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-bold text-purple-400">
                    {p.referralCode || "—"}
                  </td>
                  <td className="py-3 font-sans">
                    <button
                      onClick={() => handleTogglePromoterStatus(p.id, Boolean(p.isPromoter), p.email)}
                      title="Click to toggle Affiliate Access (Default: OFF)"
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        p.isPromoter
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {p.isPromoter ? "🟢 ENABLED" : "⚪ DISABLED"}
                    </button>
                  </td>
                  <td className="py-3 text-white font-bold">
                    {p.referralsCount}
                  </td>
                  <td className="py-3 text-slate-300">
                    ₹{p.totalDeposits.toFixed(2)}
                  </td>
                  <td className="py-3 font-sans">
                    {editingRateId === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={editingRateVal}
                          onChange={(e) => setEditingRateVal(e.target.value)}
                          className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-purple-500 text-white font-mono text-xs font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateCommissionRate(p.id, Number(editingRateVal))}
                          className="p-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold cursor-pointer"
                          title="Save rate"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingRateId(null)}
                          className="p-1 rounded bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingRateId(p.id);
                          setEditingRateVal(String(p.referralCommissionRate ?? 5.0));
                        }}
                        title="Admin Secret: Click to edit commission % for this promoter"
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>{p.referralCommissionRate ?? 5.0}%</span>
                        <Edit3 className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    ₹{p.commissionEarned.toFixed(2)}
                  </td>
                  <td className="py-3 text-emerald-300">
                    ₹{p.availableBalance.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={() => openVanityModal(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Set Custom Code
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Vanity Code Modal */}
      {selectedPromoter && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Assign Vanity Referral Code
            </h3>
            <p className="text-xs text-slate-400">
              Create a custom branded code for <b>{selectedPromoter.name || selectedPromoter.email}</b>.
            </p>

            <form onSubmit={handleSaveVanityCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Custom Referral Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. TECHBURST or ROUND2HELL"
                  value={vanityCodeInput}
                  onChange={(e) => setVanityCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Link will be: https://botclips.online/signup?ref={vanityCodeInput || "CODE"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Influencer Channel / Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. YouTube: @TechBurst (100k subs)"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Commission Rate (Deposit % - Secret) */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Deposit Commission % (Admin Secret)
                  </label>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">
                    🔒 Hidden from Promoter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="5.0"
                    value={vanityRateInput}
                    onChange={(e) => setVanityRateInput(e.target.value)}
                    className="w-28 px-3 py-1.5 bg-slate-900 border border-purple-500/40 rounded-lg text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                  <span className="text-[11px] text-slate-400 italic">
                    (Promoter gets ₹{((Number(vanityRateInput) || 0) * 1).toFixed(2)} on ₹100 deposit)
                  </span>
                </div>
              </div>

              {vanityError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {vanityError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPromoter(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vanitySubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  {vanitySubmitting ? "Saving..." : "Save Vanity Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Any User as Affiliate Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Assign Affiliate / Referral Partner
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select any registered user and assign a custom referral code. This will <b>ENABLE</b> their affiliate dashboard and give them a 10% profit cut.
            </p>

            <form onSubmit={handleAssignAffiliate} className="space-y-4">
              {/* Select User */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Select User Account *
                </label>
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={assignUserSearch}
                  onChange={(e) => setAssignUserSearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs mb-2 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
                <select
                  value={assignUserId}
                  onChange={(e) => {
                    setAssignUserId(e.target.value);
                    const selected = allUsers.find(u => u.id === e.target.value);
                    if (selected?.referralCode) {
                      setAssignCode(selected.referralCode);
                    }
                    if (selected?.influencerChannel) {
                      setAssignChannel(selected.influencerChannel);
                    }
                    if (selected?.referralCommissionRate !== undefined) {
                      setAssignRate(String(selected.referralCommissionRate));
                    }
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">-- Choose a user ({allUsers.length} total) --</option>
                  {allUsers
                    .filter((u) => {
                      const q = assignUserSearch.toLowerCase();
                      return !q || u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q));
                    })
                    .slice(0, 80)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name ? `${u.name} (${u.email})` : u.email} {u.isPromoter ? " [Already Partner]" : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Deposit Commission % (Admin Secret) */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Deposit Commission % (Admin Secret)
                  </label>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">
                    🔒 Hidden from User
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="5.0"
                    value={assignRate}
                    onChange={(e) => setAssignRate(e.target.value)}
                    className="w-28 px-3 py-1.5 bg-slate-900 border border-purple-500/40 rounded-lg text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                  <span className="text-[11px] text-slate-400 italic">
                    (₹100 deposit = ₹{((Number(assignRate) || 0) * 1).toFixed(2)} to partner)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  You decide the exact % cut from every deposit made by this partner&apos;s referrals.
                </p>
              </div>

              {/* Custom Referral Code */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Custom Referral Code (e.g. VIPCREATOR, YOUTUBER)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  value={assignCode}
                  onChange={(e) => setAssignCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500">
                  Letters, numbers, dash/underscore only. If empty, a unique VIP code will be generated.
                </p>
              </div>

              {/* Influencer Channel / Handle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Channel / Social Media Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. @TechGuru / YouTube"
                  value={assignChannel}
                  onChange={(e) => setAssignChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {assignError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {assignError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={assignSubmitting || !assignUserId}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {assignSubmitting ? "Assigning..." : "Assign & Enable Partner"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
