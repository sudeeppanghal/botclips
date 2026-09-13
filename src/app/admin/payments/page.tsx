"use client";

import React, { useState } from "react";
import { CreditCard, Check, X, ShieldCheck, Clock, ArrowDownLeft } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: "pay-1",
      user: "Roonie (roonie@dhillionsmm.com)",
      utr: "423891024819",
      amount: 500,
      method: "UPI QR",
      time: "10 mins ago",
      status: "PENDING"
    },
    {
      id: "pay-2",
      user: "Amit Sharma (amit@gmail.com)",
      utr: "423401928341",
      amount: 200,
      method: "UPI QR",
      time: "2 hours ago",
      status: "CONFIRMED"
    },
    {
      id: "pay-3",
      user: "CryptoWhale (whale@proton.me)",
      utr: "0x8f3c4a2b9102ef19",
      amount: 1500,
      method: "USDT TRC20",
      time: "1 day ago",
      status: "CONFIRMED"
    }
  ]);

  const [message, setMessage] = useState<string | null>(null);

  const handleApprove = (id: string, amount: number, user: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "CONFIRMED" } : p));
    setMessage(`Approved! ₹${amount} has been credited to ${user}'s wallet.`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleReject = (id: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
    setMessage("Payment rejected.");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Payment Verification Queue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review manual UPI UTR submissions and approve deposits to credit user wallet balances.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {/* Verification Queue Table */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">UTR / TxHash</th>
                <th className="py-3 px-2">Method</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Submitted</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-2 font-semibold text-slate-900 dark:text-white">
                    {p.user}
                  </td>
                  <td className="py-4 px-2 font-mono text-slate-600 dark:text-slate-300 font-bold">
                    {p.utr}
                  </td>
                  <td className="py-4 px-2 text-slate-500 font-medium">
                    {p.method}
                  </td>
                  <td className="py-4 px-2 font-black text-slate-900 dark:text-white">
                    ₹{p.amount}
                  </td>
                  <td className="py-4 px-2 text-slate-400 text-[11px]">
                    {p.time}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      p.status === "CONFIRMED"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                        : p.status === "PENDING"
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    {p.status === "PENDING" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(p.id, p.amount, p.user)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
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
    </div>
  );
}
