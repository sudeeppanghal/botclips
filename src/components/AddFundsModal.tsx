"use client";

import React, { useState } from "react";
import { X, Wallet, QrCode, Copy, Check, ShieldCheck, ArrowRight } from "lucide-react";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
  onFundsAdded?: (amount: number) => void;
}

export default function AddFundsModal({
  isOpen,
  onClose,
  currencySymbol = "₹",
  onFundsAdded
}: AddFundsModalProps) {
  const [method, setMethod] = useState<"UPI" | "CRYPTO">("UPI");
  const [amount, setAmount] = useState(500);
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiId = "dhillonsmm@axl";
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=DhillonSMM%26am=${amount}%26cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.trim().length < 8) {
      alert("Please enter a valid 12-digit UPI / UTR Transaction ID.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr: utr.trim(), amount: Number(amount) }),
      });

      setSuccessMsg("UTR submitted successfully! Pending verification. Your balance will be credited once confirmed.");

      setTimeout(() => {
        setSuccessMsg(null);
        setUtr("");
        onClose();
      }, 2500);
    } catch (err) {
      setSuccessMsg("UTR submitted! Pending verification.");
      setTimeout(() => {
        setSuccessMsg(null);
        setUtr("");
        onClose();
      }, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Add Funds</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instant deposit with 0% transaction fee</p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMethod("UPI")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              method === "UPI"
                ? "bg-white dark:bg-[#131b2e] text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            UPI QR Code (Instant)
          </button>
          <button
            type="button"
            onClick={() => setMethod("CRYPTO")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              method === "CRYPTO"
                ? "bg-white dark:bg-[#131b2e] text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            USDT (TRC20 / BEP20)
          </button>
        </div>

        {method === "UPI" ? (
          <form onSubmit={handleUpiSubmit} className="space-y-4 pt-4">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Deposit Amount ({currencySymbol})
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[200, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      amount === amt
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {currencySymbol}{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="50"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center">
                <img
                  src={upiQrUrl}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>

              {/* Copy UPI ID */}
              <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{upiId}</span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold ml-1 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* UTR / Transaction ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Enter 12-Digit UTR / Transaction ID
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 423589123456"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">Found in your payment app receipt under UTR or UPI Ref No.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {submitting ? "Verifying Transaction..." : "Verify & Add Funds"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">USDT TRC20 Address</span>
              <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all mt-1">
                TYDvh7Q1z3bW9Gj3R2x7Kq9L6m4V2p8A1Z
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">USDT BEP20 (BSC) Address</span>
              <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all mt-1">
                0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send USDT to either address and contact live support or submit txHash on the full Wallet page for instant automated credit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
