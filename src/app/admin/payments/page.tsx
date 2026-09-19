"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  ArrowDownLeft, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Image as ImageIcon,
  AlertCircle,
  Coins,
  QrCode,
  DollarSign,
  PlusCircle,
  Send
} from "lucide-react";

interface PaymentItem {
  id: string;
  type: "UPI" | "CRYPTO";
  user: {
    id: string;
    email: string;
    name?: string;
  };
  reference: string; // UTR or TxHash
  amount: number;
  amountUsdt?: number;
  network?: string;
  screenshot1?: string;
  screenshot2?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "UPI" | "CRYPTO">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Quick manual balance credit state
  const [manualEmail, setManualEmail] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const [upiRes, cryptoRes] = await Promise.all([
        fetch("/api/billing/upi").then(r => r.json()).catch(() => ({ payments: [] })),
        fetch("/api/billing/crypto").then(r => r.json()).catch(() => ({ payments: [] }))
      ]);

      const upiList: PaymentItem[] = (upiRes.payments || []).map((p: any) => ({
        id: p.id,
        type: "UPI",
        user: p.user || { id: p.userId, email: "Unknown", name: "Unknown" },
        reference: p.utr,
        amount: Number(p.amount),
        screenshot1: p.screenshot1,
        screenshot2: p.screenshot2,
        status: p.status,
        rejectReason: p.rejectReason,
        createdAt: p.createdAt
      }));

      const cryptoList: PaymentItem[] = (cryptoRes.payments || []).map((p: any) => ({
        id: p.id,
        type: "CRYPTO",
        user: p.user || { id: p.userId, email: "Unknown", name: "Unknown" },
        reference: p.txHash,
        amount: Number(p.amountInr || Math.round(Number(p.amountUsdt || 0) * 96)),
        amountUsdt: Number(p.amountUsdt || 0),
        network: p.network,
        screenshot1: p.screenshot1,
        screenshot2: p.screenshot2,
        status: p.status,
        rejectReason: p.rejectReason,
        createdAt: p.createdAt
      }));

      const combined = [...upiList, ...cryptoList].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPayments(combined);
    } catch (err: any) {
      setMessage({ text: "Failed to load payments from server", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleApprove = async (payment: PaymentItem) => {
    if (!confirm(`Are you sure you want to approve ₹${payment.amount} for ${payment.user.email}? This will immediately credit their wallet balance.`)) {
      return;
    }

    setActionLoadingId(payment.id);
    try {
      const endpoint = payment.type === "UPI" ? "/api/billing/upi" : "/api/billing/crypto";
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id, action: "APPROVE" })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Approved! ₹${payment.amount} credited to ${payment.user.email}'s balance.`, "success");
        fetchPayments();
      } else {
        showToast(data.error || "Approval failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error during approval", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (payment: PaymentItem) => {
    const reason = prompt("Enter rejection reason (optional):", "Invalid UTR or screenshot mismatch");
    if (reason === null) return; // User cancelled prompt

    setActionLoadingId(payment.id);
    try {
      const endpoint = payment.type === "UPI" ? "/api/billing/upi" : "/api/billing/crypto";
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id, action: "REJECT", rejectReason: reason })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Payment rejected.", "success");
        fetchPayments();
      } else {
        showToast(data.error || "Rejection failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error during rejection", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || !manualAmount || Number(manualAmount) <= 0) {
      showToast("Please provide a valid user email/ID and positive amount.", "error");
      return;
    }

    setManualLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: manualEmail.trim(),
          balanceAdjust: Number(manualAmount)
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Successfully credited ₹${manualAmount} to ${data.user?.email || manualEmail}! New balance: ₹${data.user?.balance}`, "success");
        setManualEmail("");
        setManualAmount("");
      } else {
        showToast(data.error || "Failed to credit balance", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error during manual credit", "error");
    } finally {
      setManualLoading(false);
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    if (filterType !== "ALL" && p.type !== filterType) return false;
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = p.user?.email?.toLowerCase().includes(q);
      const matchName = p.user?.name?.toLowerCase().includes(q);
      const matchRef = p.reference?.toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchRef) return false;
    }
    return true;
  });

  const pendingCount = payments.filter(p => p.status === "PENDING").length;
  const pendingTotal = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
  const confirmedTotal = payments.filter(p => p.status === "CONFIRMED").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-500" />
            Payment Verification & Deposit Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review manual UPI QR & USDT payments, verify bank screenshots, and approve funds directly into user wallets.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        }`}>
          {message.type === "success" ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Verifications</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-0.5">{pendingCount} <span className="text-xs font-semibold text-slate-500">payments</span></p>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1">₹{pendingTotal.toLocaleString("en-IN")} awaiting credit</p>
          </div>
          <Clock className="w-9 h-9 text-amber-500 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Approved Deposits</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-0.5">₹{confirmedTotal.toLocaleString("en-IN")}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Successfully credited to users</p>
          </div>
          <ShieldCheck className="w-9 h-9 text-emerald-500 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-300 mt-0.5">{payments.length}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">All time recorded transactions</p>
          </div>
          <Coins className="w-9 h-9 text-blue-500 opacity-60" />
        </div>
      </div>

      {/* Manual Direct Credit Card */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <PlusCircle className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quick Manual Balance Credit (Direct Injection)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          If a user sent funds directly or you need to manually credit any user's balance without a pending queue item, enter their email or user ID below.
        </p>

        <form onSubmit={handleManualCredit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="User Email or ID (e.g. customer@gmail.com)"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="number"
              min="1"
              step="any"
              placeholder="Amount (₹ INR)"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={manualLoading}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {manualLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Credit User Balance</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Method Tabs */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              All Methods
            </button>
            <button
              onClick={() => setFilterType("UPI")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterType === "UPI" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              <QrCode className="w-3 h-3 text-indigo-500" />
              UPI QR
            </button>
            <button
              onClick={() => setFilterType("CRYPTO")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                filterType === "CRYPTO" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              <Coins className="w-3 h-3 text-emerald-500" />
              USDT
            </button>
          </div>

          {/* Status Filter */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "PENDING" ? "bg-amber-500 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("CONFIRMED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "CONFIRMED" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("REJECTED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "REJECTED" ? "bg-rose-600 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, name or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Payment Queue Table */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">Method</th>
                <th className="py-3 px-2">UTR / TxHash</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Proof Screenshot</th>
                <th className="py-3 px-2">Submitted</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading real payment records...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPending = p.status === "PENDING";
                  const isActing = actionLoadingId === p.id;
                  const hasImage1 = p.screenshot1 && (p.screenshot1.startsWith("http") || p.screenshot1.startsWith("data:image"));
                  const hasImage2 = p.screenshot2 && (p.screenshot2.startsWith("http") || p.screenshot2.startsWith("data:image"));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      {/* User */}
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.user?.name || p.user?.email?.split("@")[0] || "Customer"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {p.user?.email}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-4 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.type === "UPI"
                            ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {p.type === "UPI" ? <QrCode className="w-3 h-3" /> : <Coins className="w-3 h-3" />}
                          {p.type === "UPI" ? "UPI QR" : `${p.network || "TRC20"} USDT`}
                        </span>
                      </td>

                      {/* UTR / TxHash */}
                      <td className="py-4 px-2">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 select-all">
                          {p.reference}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-2">
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </div>
                        {p.amountUsdt && p.amountUsdt > 0 && (
                          <div className="text-[10px] font-mono text-slate-400">
                            ≈ {p.amountUsdt} USDT
                          </div>
                        )}
                      </td>

                      {/* Proof Screenshots */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5">
                          {hasImage1 ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(p.screenshot1!)}
                              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer shrink-0"
                              title="Click to view full screenshot 1"
                            >
                              <img src={p.screenshot1} alt="Proof 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">
                              {p.screenshot1 ? "Note provided" : "No receipt"}
                            </span>
                          )}

                          {hasImage2 && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(p.screenshot2!)}
                              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer shrink-0"
                              title="Click to view full screenshot 2"
                            >
                              <img src={p.screenshot2} alt="Proof 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-2 text-slate-400 text-[11px] font-mono">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.status === "CONFIRMED"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                            : p.status === "PENDING"
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 animate-pulse"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                        }`}>
                          {p.status}
                        </span>
                        {p.rejectReason && (
                          <div className="text-[10px] text-rose-500 italic mt-0.5">
                            {p.rejectReason}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-2 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              disabled={isActing}
                              onClick={() => handleApprove(p)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                            >
                              {isActing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Approve & Credit</span>
                            </button>

                            <button
                              disabled={isActing}
                              onClick={() => handleReject(p)}
                              className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px] cursor-pointer transition-colors disabled:opacity-50"
                              title="Reject Deposit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Resolution Screenshot Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] bg-[#0b0f19] rounded-2xl border border-slate-800 overflow-hidden flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                Proof Receipt Screenshot
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-70px)]">
              <img
                src={previewImage}
                alt="Deposit Screenshot"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
