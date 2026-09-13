"use client";

import React, { useState, useRef } from "react";
import { Wallet, Copy, Check, ShieldCheck, History, ArrowDownLeft, AlertCircle, UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState(0.00);
  const [method, setMethod] = useState<"UPI" | "CRYPTO">("UPI");
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTrc, setCopiedTrc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Screenshots state
  const [screenshot1, setScreenshot1] = useState<string | null>(null);
  const [screenshot2, setScreenshot2] = useState<string | null>(null);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setBalance(Number(meData.user.balance || 0));
        }

        const upiRes = await fetch("/api/billing/upi");
        const upiData = await upiRes.json();
        if (upiData.success && Array.isArray(upiData.payments)) {
          setTransactions(upiData.payments);
        }
      } catch {}
    }
    loadData();
  }, []);

  const upiId = "dhillonsmm@axl";
  const trc20 = "TYDvh7Q1z3bW9Gj3R2x7Kq9L6m4V2p8A1Z";
  const activeAmount = customAmount ? Number(customAmount) : amount;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=BotClips%26am=${activeAmount}%26cu=INR`;

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

  // Image Upload handler (Cloudinary endpoint)
  const handleFileUpload = async (file: File, target: 1 | 2) => {
    if (!file) return;

    if (target === 1) setUploading1(true);
    else setUploading2(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (target === 1) setScreenshot1(data.url);
      else setScreenshot2(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image screenshot");
    } finally {
      if (target === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);

    const depositAmount = customAmount ? Number(customAmount) : amount;

    if (depositAmount < 50) {
      setError("Minimum deposit amount is strictly ₹50 INR.");
      return;
    }

    if (!utr || utr.trim().length < 8) {
      setError("Please enter a valid 12-digit UPI / UTR Transaction ID.");
      return;
    }

    if (!screenshot1 || !screenshot2) {
      setError("Both Screenshot 1 (Receipt) and Screenshot 2 (Success Screen) are required to verify your payment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: utr.trim(),
          amount: depositAmount,
          screenshot1,
          screenshot2,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit deposit proof.");
      }

      setTransactions(prev => [
        {
          id: data.payment?.id || "TX-" + Date.now(),
          method: "UPI",
          utr: utr.trim(),
          amount: depositAmount,
          status: "PENDING",
          screenshot1,
          screenshot2,
          createdAt: new Date().toISOString(),
        },
        ...prev
      ]);

      setNotification("Deposit submitted! Admin will inspect the 2 screenshots and approve your balance within 2-5 minutes.");
      setUtr("");
      setScreenshot1(null);
      setScreenshot2(null);
      setCustomAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
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
            Deposit funds with zero transaction fees via UPI QR or Crypto USDT. Minimum deposit is ₹50 INR.
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
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
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
              UPI QR Code (Min ₹50)
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Select Amount (Min ₹50)
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold">100% Zero Fees</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !customAmount && amount === amt
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5">
                  <input
                    type="number"
                    min="50"
                    placeholder="Or enter custom amount (e.g. ₹75, ₹250)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic QR */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                  <img src={upiQrUrl} alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Scan & Pay ₹{activeAmount}
                  </div>
                  <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, CRED, or BHIM</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span>
                    <button
                      type="button"
                      onClick={() => copyText(upiId, "upi")}
                      className="text-blue-600 hover:text-blue-700 font-bold ml-1 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR & 2 Screenshots Form */}
              <form onSubmit={handleUpiSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    1. Enter 12-Digit UTR Number
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 423891024819"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">Found on your UPI confirmation screen or bank SMS.</span>
                </div>

                {/* 2 Screenshots Upload (Cloudinary backed) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    2. Upload 2 Verification Screenshots
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Screenshot 1 */}
                    <div 
                      onClick={() => fileInputRef1.current?.click()}
                      className={`p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        screenshot1 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30"
                      }`}
                    >
                      <input
                        ref={fileInputRef1}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 1);
                        }}
                      />
                      {screenshot1 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot1} alt="Receipt Preview" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 1 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading1 ? "Uploading..." : "Screenshot 1: Receipt"}
                          </div>
                          <div className="text-[10px] text-slate-400">Click to upload payment receipt</div>
                        </div>
                      )}
                    </div>

                    {/* Screenshot 2 */}
                    <div 
                      onClick={() => fileInputRef2.current?.click()}
                      className={`p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        screenshot2 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30"
                      }`}
                    >
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 2);
                        }}
                      />
                      {screenshot2 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot2} alt="Success Screen Preview" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 2 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading2 ? "Uploading..." : "Screenshot 2: Success Screen"}
                          </div>
                          <div className="text-[10px] text-slate-400">Click to upload UPI success screen</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploading1 || uploading2 || !screenshot1 || !screenshot2}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting Proof..." : "Submit Deposit for Verification"}
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

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No deposits yet. Make your first deposit above.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">UPI Deposit</div>
                        <div className="text-[10px] font-mono text-slate-400">UTR: {tx.utr}</div>
                        {tx.screenshot1 && (
                          <div className="text-[10px] text-blue-600 font-semibold">2 Proofs Attached</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 dark:text-white">+₹{tx.amount}</div>
                      <span className={`text-[10px] font-bold ${
                        tx.status === "CONFIRMED" ? "text-emerald-600" : tx.status === "REJECTED" ? "text-rose-600" : "text-amber-500"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Cloudinary secure image upload & instant verification queue.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
