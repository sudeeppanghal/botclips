"use client";

import React, { useState } from "react";
import { Wallet, QrCode, Copy, Check, ShieldCheck, History, ArrowDownLeft, AlertCircle } from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState(0.00);
  const [method, setMethod] = useState<"UPI" | "CRYPTO">("UPI");
  const [amount, setAmount] = useState(500);
  const [utr, setUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTrc, setCopiedTrc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadBalance() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setBalance(Number(data.user.balance || 0));
        }
      } catch {}
    }
    loadBalance();
  }, []);

  const [transactions, setTransactions] = useState([
    { id: "TX-9901", method: "UPI", utr: "423891024819", amount: 500, status: "Confirmed", date: "Sep 11, 2026" },
    { id: "TX-9844", method: "UPI", utr: "423401928341", amount: 200, status: "Confirmed", date: "Sep 07, 2026" },
    { id: "TX-9721", method: "USDT", utr: "0x8f3c...4a2b", amount: 1500, status: "Confirmed", date: "Aug 29, 2026" },
  ]);

  const upiId = "dhillonsmm@axl";
  const trc20 = "TYDvh7Q1z3bW9Gj3R2x7Kq9L6m4V2p8A1Z";
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=DhillonSMM%26am=${amount}%26cu=INR`;

  const copyText = (txt: string, type: "upi" | "trc") => {
    navigator.clipboard.writeText(txt);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedTrc(true);
      setTimeout(() => setCopiedTrc(false), 2000);
    }
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.trim().length < 8) {
      alert("Please enter a valid 12-digit UPI / UTR Transaction ID.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setTransactions(prev => [
        {
          id: "TX-" + Math.floor(1000 + Math.random() * 9000),
          method: "UPI",
          utr: utr.trim(),
          amount: Number(amount),
          status: "Pending",
          date: "Just now"
        },
        ...prev
      ]);
      setNotification("UTR submitted! Your funds will be credited automatically within 2-5 minutes.");
      setUtr("");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Balance Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Wallet & Add Funds
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deposit funds with zero transaction fees via UPI QR or Crypto USDT.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Current Available Balance</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Payment Box & Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deposit Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <button
              onClick={() => setMethod("UPI")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                method === "UPI"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              UPI QR Code (Instant)
            </button>
            <button
              onClick={() => setMethod("CRYPTO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                method === "CRYPTO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              USDT (TRC20 / BEP20)
            </button>
          </div>

          {method === "UPI" ? (
            <div className="space-y-4">
              {/* Preset buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Amount (₹)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[200, 500, 1000, 2500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        amount === amt
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                  <img src={upiQrUrl} alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Scan with any UPI App</div>
                  <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, CRED, or BHIM</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span>
                    <button
                      onClick={() => copyText(upiId, "upi")}
                      className="text-blue-600 hover:text-blue-700 font-bold ml-1 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR Form */}
              <form onSubmit={handleUpiSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Enter 12-Digit UTR Number
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 423891024819"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">Available immediately in your UPI payment receipt.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {submitting ? "Verifying..." : "Submit Transaction (Instant Balance)"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400">USDT TRC20 Address</span>
                <div className="mt-2 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{trc20}</span>
                  <button
                    onClick={() => copyText(trc20, "trc")}
                    className="p-1 text-blue-600 font-bold shrink-0"
                  >
                    {copiedTrc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">Rate: 1 USDT = ₹88.00. Automatic confirmation after 1 block network confirmation.</p>
            </div>
          )}
        </div>

        {/* Transaction History (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <History className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Deposits</h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{tx.method} Deposit</div>
                      <div className="text-[10px] font-mono text-slate-400">UTR: {tx.utr}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 dark:text-white">+₹{tx.amount}</div>
                    <span className={`text-[10px] font-bold ${tx.status === "Confirmed" ? "text-emerald-600" : "text-amber-500"}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Encrypted, PCI compliant & secure transaction processing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
