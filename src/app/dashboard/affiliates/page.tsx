"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  Send,
  Lock,
  Headphones
} from "lucide-react";

interface AffiliateStats {
  referralCode: string;
  referralLink: string;
  totalAppUsers: number;
  referredUsersCount: number;
  totalDeposits: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  availableBalance: number;
  minPayout: number;
  payoutUpi?: string;
  payoutCrypto?: string;
  isInfluencer?: boolean;
  influencerChannel?: string;
}

interface RewardItem {
  id: string;
  user: string;
  depositAmount: number;
  commissionAmount: number;
  paymentType: string;
  createdAt: string;
}

interface PayoutItem {
  id: string;
  amount: number;
  method: string;
  destination: string;
  status: string;
  utrOrTxHash?: string;
  createdAt: string;
  paidAt?: string;
}

export default function AffiliatesPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [isAffiliateEnabled, setIsAffiliateEnabled] = useState<boolean | null>(null);

  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payout form
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"UPI" | "USDT">("UPI");
  const [payoutDestination, setPayoutDestination] = useState("");
  const [influencerChannel, setInfluencerChannel] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliates/stats");
      const data = await res.json();
      if (data.success && data.enabled) {
        setIsAffiliateEnabled(true);
        setStats(data.stats);
        setRewards(data.rewards || []);
        setPayouts(data.payouts || []);
        if (data.stats.payoutUpi && !payoutDestination) {
          setPayoutDestination(data.stats.payoutUpi);
        }
        if (data.stats.influencerChannel && !influencerChannel) {
          setInfluencerChannel(data.stats.influencerChannel);
        }
      } else {
        setIsAffiliateEnabled(false);
      }
    } catch (err) {
      console.error("Failed to load affiliate stats:", err);
      setIsAffiliateEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopy = (text: string, type: "link" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMessage(null);

    const amt = Number(payoutAmount);
    if (!amt || amt < 50) {
      setPayoutMessage({ type: "error", text: "Minimum withdrawal amount is ₹50 INR" });
      return;
    }

    if (!stats || amt > stats.availableBalance) {
      setPayoutMessage({ type: "error", text: `Requested amount exceeds available balance (₹${stats?.availableBalance.toFixed(2) || "0.00"})` });
      return;
    }

    if (!payoutDestination.trim()) {
      setPayoutMessage({ type: "error", text: "Please provide a valid destination address or UPI ID" });
      return;
    }

    try {
      setPayoutSubmitting(true);
      const res = await fetch("/api/affiliates/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: payoutMethod,
          destination: payoutDestination.trim(),
          channel: influencerChannel.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPayoutMessage({ type: "success", text: data.message });
        setPayoutAmount("");
        fetchStats();
      } else {
        setPayoutMessage({ type: "error", text: data.error || "Failed to submit payout" });
      }
    } catch (err: any) {
      setPayoutMessage({ type: "error", text: err?.message || "Failed to submit payout" });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-10 bg-slate-800/40 rounded-lg animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If Affiliate is NOT enabled by Admin for this user
  if (!isAffiliateEnabled) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 pt-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              Exclusive Partner Program
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Affiliate & Creator Access
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              The BotClips Partner Program is <b>invite-only</b> and currently <b>OFF</b> for your account. It is reserved for active YouTubers, Instagram creators, clippers, and promoters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-left space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Partner Privileges Once Enabled:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                <span><b>Personalized Referral Code & Link:</b> Branded code to share with your viewers or subscribers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                <span><b>10% Profit Share:</b> Earn transparent 10% commission on the platform profit for every deposit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                <span><b>Instant UPI & USDT Payouts:</b> Request payout anytime directly to your UPI ID or USDT wallet.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard/tickets"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Contact Admin to Request Code</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const code = stats?.referralCode || "VIPPARTNER";
  const link = stats?.referralLink || `https://botclips.online/signup?ref=${code}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Creator & Influencer Affiliate Program
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Earn Direct Commission on Every Referral Deposit
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Promote BotClips on YouTube, Instagram, or Telegram. Receive instant commission credited directly to your affiliate wallet whenever your referred users deposit.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Available Payout</div>
              <div className="text-2xl font-black text-emerald-400">
                ₹{(stats?.availableBalance || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total App Users */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users in App</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(stats?.totalAppUsers || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform community scale</p>
          </div>
        </div>

        {/* Metric 2: Referred Users */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Referrals</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(stats?.referredUsersCount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registered via your link</p>
          </div>
        </div>

        {/* Metric 3: Total Referral Deposits */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Referral Deposits</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{(stats?.totalDeposits || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total deposit volume</p>
          </div>
        </div>

        {/* Metric 4: Total Commission Earned */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Commission Earned</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(stats?.totalCommission || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lifetime affiliate earnings</p>
          </div>
        </div>
      </div>

      {/* Share Link & Formula Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Share Link Box */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                Your Referral Link & Promo Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this link or your promo code in YouTube descriptions, pinned comments, or Instagram bio.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono font-bold">
              CODE: {code}
            </div>
          </div>

          {/* Link Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto select-all">
              {link}
            </div>
            <button
              onClick={() => handleCopy(link, "link")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={() => handleCopy(code, "code")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
              title="Copy referral code only"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? "Code Copied" : "Copy Code"}
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Share:</span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Boost your social clips, views & followers with BotClips! Sign up here: ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Fastest Social Growth & Automation with BotClips!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Grow your brand with BotClips automation: ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Twitter / X
            </a>
          </div>
        </div>

        {/* Right 1 Col: Partner Highlights Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/20 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Partner Program Highlights
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to the BotClips Creator Circle! Promote your personalized link or code and earn passive revenue on every referral.
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>Share your referral link or custom promo code across your social networks.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Users who sign up are permanently attributed to your affiliate dashboard.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Commissions are credited automatically each time a referred user deposits.</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            Commissions credit instantly upon deposit confirmation.
          </div>
        </div>
      </div>

      {/* Payout Section & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Request Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Request Payout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Withdraw earnings to your UPI ID or USDT TRC20 wallet.
            </p>
          </div>

          {/* Balance summary */}
          <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Available:</span>
              <div className="text-base font-bold text-emerald-500">₹{(stats?.availableBalance || 0).toFixed(2)}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Paid Out:</span>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">₹{(stats?.paidCommission || 0).toFixed(2)}</div>
            </div>
          </div>

          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            {/* Method selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payout Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("UPI")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    payoutMethod === "UPI"
                      ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                      : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  UPI (Instant INR)
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod("USDT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    payoutMethod === "USDT"
                      ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                      : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  USDT (TRC20)
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Amount (Min ₹50)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="50"
                  step="1"
                  placeholder="e.g. 500"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {payoutMethod === "UPI" ? "Your UPI ID" : "USDT TRC20 Address"}
              </label>
              <input
                type="text"
                placeholder={payoutMethod === "UPI" ? "e.g. yourname@okhdfcbank" : "e.g. T..."}
                value={payoutDestination}
                onChange={(e) => setPayoutDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Channel handle */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Channel / Creator Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @YourYouTubeChannel"
                value={influencerChannel}
                onChange={(e) => setInfluencerChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {payoutMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  payoutMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {payoutMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={payoutSubmitting || (stats?.availableBalance || 0) < 50}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {payoutSubmitting ? "Submitting Request..." : "Request Payout"}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Payout Requests History */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Payout History
            </h2>
            <span className="text-xs text-slate-400">{payouts.length} total requests</span>
          </div>

          {payouts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No payout requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 font-bold text-emerald-400">
                        ₹{p.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-slate-300">{p.method}</td>
                      <td className="py-3 text-slate-400 max-w-[150px] truncate" title={p.destination}>
                        {p.destination}
                      </td>
                      <td className="py-3 text-right font-sans">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : p.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {p.status === "PAID" ? "PAID" : p.status === "PENDING" ? "IN REVIEW" : "REJECTED"}
                        </span>
                        {p.utrOrTxHash && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5" title={p.utrOrTxHash}>
                            Ref: {p.utrOrTxHash.slice(0, 10)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Referral Activity Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Recent Referral Activity
          </h2>
          <span className="text-xs text-slate-400">{rewards.length} deposits recorded</span>
        </div>

        {rewards.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No referral deposits recorded yet. Share your referral link above to start earning!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Deposit Amount</th>
                  <th className="pb-3">Commission Earned</th>
                  <th className="pb-3">Payment Mode</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-300 font-sans">{r.user}</td>
                    <td className="py-3 text-slate-200">₹{r.depositAmount.toFixed(2)}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{r.commissionAmount.toFixed(2)}</td>
                    <td className="py-3 text-slate-400 font-sans">{r.paymentType}</td>
                    <td className="py-3 text-right text-slate-400 font-sans">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
