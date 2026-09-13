"use client";

import React, { useState } from "react";
import { Crown, Check, Zap, ArrowRight, Wallet, X, AlertCircle } from "lucide-react";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onUpgradeSuccess: () => void;
  onOpenAddFunds: (amountNeeded?: number) => void;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  walletBalance,
  onUpgradeSuccess,
  onOpenAddFunds,
}: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"WEEKLY" | "MONTHLY">("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const planCost = selectedPlan === "WEEKLY" ? 480 : 2400; // $5 = ₹480, $25 = ₹2,400
  const planUsd = selectedPlan === "WEEKLY" ? "$5" : "$25";
  const hasEnoughBalance = walletBalance >= planCost;
  const shortfall = Math.max(0, planCost - walletBalance);

  const handleUpgrade = async () => {
    if (!hasEnoughBalance) {
      onClose();
      onOpenAddFunds(shortfall);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/automation/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate subscription");
      }

      setSuccess(`Congratulations! Your ${selectedPlan} Premium Automation Pass is now active.`);
      setTimeout(() => {
        onUpgradeSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to activate subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white mb-2">
            <Crown className="w-3.5 h-3.5 fill-white" />
            <span>Mode 2 • BYO SMM Panel API</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Upgrade to Premium Automation
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            Connect your own SMM panel API & run unlimited campaigns with 0% platform markup.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Plan Selector */}
          <div className="grid grid-cols-2 gap-3">
            {/* Weekly */}
            <div
              onClick={() => setSelectedPlan("WEEKLY")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "WEEKLY"
                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Weekly Pass
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  $5 <span className="text-xs font-bold text-slate-400">/ ₹480</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Valid for 7 days</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Full BYO-API</span>
              </div>
            </div>

            {/* Monthly */}
            <div
              onClick={() => setSelectedPlan("MONTHLY")}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "MONTHLY"
                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
              }`}
            >
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                Save 17%
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Pass
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  $25 <span className="text-xs font-bold text-slate-400">/ ₹2,400</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Valid for 30 days</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Best Value</span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              What You Get with Mode 2:
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Connect any SMM panel (yoyomedia, smmsocialmedia, etc.)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Live balance sync from your upstream panel</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Batch-import and map default service IDs</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>0% platform markup — orders execute at pure provider rate</span>
            </div>
          </div>

          {/* Wallet Balance Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Your Wallet Balance</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  ₹{walletBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Plan Cost</div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₹{planCost} ({planUsd})
              </div>
            </div>
          </div>

          {/* Action Button */}
          {hasEnoughBalance ? (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Activating Subscription...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Activate with Wallet Balance (₹{planCost})</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddFunds(shortfall);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add ₹{Math.ceil(shortfall)} to Wallet to Upgrade</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Deposit via UPI (PhonePe, GPay, Paytm) or USDT TRC20 (min deposit ₹50).
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
