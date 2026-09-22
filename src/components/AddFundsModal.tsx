"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Wallet, QrCode, Copy, Check, ShieldCheck, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react";

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
  const [amount, setAmount] = useState(200);
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const safeAmount = Math.max(200, Number(amount) || 200);
  const upiId = "Jaatdhillon@fam";
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=DhillonSMM%26am=${safeAmount}%26cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.75));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setScreenshot(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (Number(amount) < 200) {
      setErrorMsg("Minimum deposit amount is strictly ₹200 INR due to huge order volume. ₹100 deposit will be available in the future. Thank you guys for supporting our services!");
      return;
    }
    if (!utr || utr.trim().length < 8) {
      setErrorMsg("Please enter a valid 12-digit UPI / UTR Transaction ID.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          utr: utr.trim(), 
          amount: Math.max(200, Number(amount)),
          screenshot1: screenshot || undefined
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setErrorMsg("Your session expired. Please refresh the page or log in again.");
        } else {
          setErrorMsg(data.error || "Failed to submit deposit.");
        }
        return;
      }

      setSuccessMsg("UTR submitted successfully! Pending verification. Your balance will be credited once confirmed.");

      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
        setUtr("");
        setScreenshot(null);
        onClose();
        if (onFundsAdded) onFundsAdded(Math.max(100, Number(amount)));
        window.dispatchEvent(new Event("balance_updated"));
      }, 2000);
    } catch (err: any) {
      setErrorMsg("Error submitting deposit. Please check your internet connection.");
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="my-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="my-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
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

        {/* High Order Volume Announcement Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-blue-500/30 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-black text-xs uppercase tracking-wide">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>🔥 High Order Volume Announcement</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
              Min ₹200 Active
            </span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            Due to huge order volume across our services, minimum deposit is temporarily set to <strong>₹200 INR</strong> to keep processing instantaneous.
          </p>
          <p className="text-[10.5px] text-slate-600 dark:text-slate-400">
            ⚡ <strong>₹100 minimum deposit</strong> will be available again soon. Thank you guys for your massive support — our services are working best! 🚀
          </p>
        </div>

        {/* Strict Deposit Rules & Security Warning Notice */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>⚠️ Strict Deposit Rules & Ban Warning</span>
          </div>
          <ul className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Below ₹200 = No Refund:</strong> Minimum deposit is strictly ₹200 INR (or 1 USDT). Deposits under ₹200 cannot be credited or refunded.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Fake Screenshot = Direct Ban:</strong> Submitting fake / manipulated receipts or invalid UTR results in <strong>instant permanent account ban</strong>.</span>
            </li>
          </ul>
        </div>

        {method === "UPI" ? (
          <form onSubmit={handleUpiSubmit} className="space-y-4 pt-4">
            {/* Amount Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Deposit Amount ({currencySymbol})
                </label>
                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                  Min ₹200
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      amount === amt
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {currencySymbol}{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="200"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                onBlur={() => {
                  if (amount < 200) setAmount(200);
                }}
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-xl text-slate-900 dark:text-white outline-hidden ${
                  amount < 200 ? "border-rose-500 focus:border-rose-500" : "border-slate-200/80 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {amount < 200 && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">
                  ⚠️ Minimum deposit amount is ₹200 INR. Due to high orders, ₹100 deposit will be back in the future.
                </p>
              )}
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

            {/* Screenshot Proof Attachment */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              {screenshot ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={screenshot}
                      alt="Attached Screenshot"
                      className="w-10 h-10 rounded-lg object-cover border border-emerald-400/40 shrink-0"
                    />
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Screenshot Attached</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        Payment proof ready to verify
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                    title="Remove Screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>📷 Upload Payment Screenshot / Receipt (Recommended)</span>
                </button>
              )}
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
          <div className="space-y-4 pt-2">
            {/* USDT TRC20 QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent("TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz")}`} 
                  alt="USDT TRC20 QR Code" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">Scan with Binance, TrustWallet, or TronLink</span>
            </div>

            {/* TRC20 Address with Copy Button */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">USDT TRC20 Address (TRON Network)</span>
                <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* BEP20 Address */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">USDT BEP20 (BSC) Address</span>
              <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-center">
              Send USDT to the address or scan the QR code above. Submit txHash on the{" "}
              <Link href="/dashboard/wallet" onClick={onClose} className="text-blue-600 dark:text-blue-400 font-bold underline">
                Wallet page
              </Link>{" "}
              for automated on-chain credit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
