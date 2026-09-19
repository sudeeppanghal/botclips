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
  ExternalLink
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
  const [vanitySubmitting, setVanitySubmitting] = useState(false);
  const [vanityError, setVanityError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setPromoters(data.promoters || []);
        setPayouts(data.payouts || []);
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

  const handleSaveVanityCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoter) return;
    setVanityError("");

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

  const openVanityModal = (promoter: PromoterItem) => {
    setSelectedPromoter(promoter);
    setVanityCodeInput(promoter.referralCode || "");
    setChannelInput(promoter.influencerChannel || "");
    setVanityError("");
  };

  const filteredPromoters = promoters.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.email.toLowerCase().includes(term) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.referralCode && p.referralCode.toLowerCase().includes(term)) ||
      (p.influencerChannel && p.influencerChannel.toLowerCase().includes(term))
    );
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
            Track YouTube/Instagram influencer promotions, nominal 30% profit split, and clear payout queues.
          </p>
        </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Influencer & Promoter Directory ({promoters.length})
            </h2>
            <p className="text-xs text-slate-400">
              Assign custom vanity codes (e.g. VIP, CHANNEL_NAME) and view performance.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search promoter / code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="pb-3">Promoter</th>
                <th className="pb-3">Referral Code</th>
                <th className="pb-3">Signups</th>
                <th className="pb-3">Total Deposits</th>
                <th className="pb-3">Nominal 30% Profit</th>
                <th className="pb-3">10% Cut</th>
                <th className="pb-3">Available</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPromoters.map((p) => (
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
                  <td className="py-3 text-white font-bold">
                    {p.referralsCount}
                  </td>
                  <td className="py-3 text-slate-300">
                    ₹{p.totalDeposits.toFixed(2)}
                  </td>
                  <td className="py-3 text-purple-300">
                    ₹{p.nominalProfit.toFixed(2)}
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
              ))}
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
    </div>
  );
}
