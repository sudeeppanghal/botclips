"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Check, 
  Smartphone, 
  TrendingUp, 
  BarChart3, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Eye, 
  Activity,
  Layers,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Flame,
  CheckCircle
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [selectedProofIndex, setSelectedProofIndex] = useState<number | null>(null);
  const [proofFilter, setProofFilter] = useState<string>("ALL");

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  const proofScreenshots = [
    {
      id: 1,
      src: "/screenshots/1.jpg",
      platform: "TikTok",
      payout: "$5.78",
      views: "1,900+ Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "TIKTOK",
      title: "Content Rewards — TikTok Campaign Approval",
      caption: "Brand Galactic on Content Rewards approved submission mopiofficial. Organic curve with zero bot flags.",
      badge: "Verified Approval",
      likes: "11 Likes"
    },
    {
      id: 2,
      src: "/screenshots/2.jpg",
      platform: "YouTube Shorts",
      payout: "$10.20",
      views: "6,800 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "SHORTS_TIKTOK",
      title: "YouTube Shorts Viral Spike & Payout",
      caption: "Creator reward submission approved with $10.20 estimated payout. 6,800 views, 70 likes and sustained retention.",
      badge: "Approved Payout",
      likes: "70 Likes"
    },
    {
      id: 3,
      src: "/screenshots/3.jpg",
      platform: "Instagram Reels",
      payout: "$27.87",
      views: "18,583 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Instagram Reel Sustained Retention",
      caption: "18,583 views with zero post-delivery dropoff. Linear organic growth curve clearing platform review.",
      badge: "Clean Retention Curve",
      likes: "25 Likes"
    },
    {
      id: 4,
      src: "/screenshots/4.jpg",
      platform: "Instagram Reels",
      payout: "$37.00",
      views: "24,665 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "High-Engagement Instagram Submission",
      caption: "24,665 views and 885 likes. Status approved by brand manager with zero bot detection flags and $37 payout.",
      badge: "Approved Payout",
      likes: "885 Likes"
    },
    {
      id: 5,
      src: "/screenshots/5.jpg",
      platform: "Instagram Reels",
      payout: "$73.29",
      views: "48,862 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Multi-Day Viral Distribution",
      caption: "48,862 views with natural multi-day parabolic velocity. Approved payout of $73.29 without manual flags.",
      badge: "High Earner ($73+)",
      likes: "298 Likes"
    },
    {
      id: 6,
      src: "/screenshots/6.jpg",
      platform: "Instagram Reels",
      payout: "$7.75",
      views: "5,166 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Paced Hourly Delivery Profile",
      caption: "5,166 views distributed across 9 days with natural stair-step pacing to match organic FYP algorithmic tests.",
      badge: "Organic Pacing",
      likes: "24 Likes"
    },
    {
      id: 7,
      src: "/screenshots/7.jpg",
      platform: "Instagram Reels",
      payout: "$37.05",
      views: "18,523 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Podcast Clipping Viral Breakthrough",
      caption: "18,523 views on Elon Musk podcast clip ($2.00 / 1k views campaign). 0 Bot Risk Score (green shield) and instant approval.",
      badge: "0 Bot Risk Score",
      likes: "124 Likes"
    },
    {
      id: 8,
      src: "/screenshots/8.jpg",
      platform: "X (Twitter)",
      payout: "$113.43",
      views: "56,714 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "X",
      title: "Top-Tier Payout: $113.43 on X Clipping",
      caption: "56,714 views, 65 likes, 4 retweets. Flawless S-curve growth triggering a three-figure payout approval.",
      badge: "Top Earner ($113.43)",
      likes: "65 Likes"
    },
    {
      id: 9,
      src: "/screenshots/9.jpg",
      platform: "Instagram Reels",
      payout: "$31.46",
      views: "6,292 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Business Campaign Payout Approved",
      caption: "Business Basics campaign ($2 CPM). 0 Bot Risk rating, $31.46 payout approved by creator sponsor.",
      badge: "Approved Payout",
      likes: "15 Likes"
    },
    {
      id: 10,
      src: "/screenshots/10.jpg",
      platform: "Instagram Reels",
      payout: "$33.21",
      views: "6,600+ Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Verified Clean Audit & Fast Clearance",
      caption: "Zero bot risk shield rating, $33.21 earnings verified on moderation panel with full payout guarantee.",
      badge: "0 Bot Score Shield",
      likes: "Engagement OK"
    }
  ];

  const filteredProofs = proofFilter === "ALL" 
    ? proofScreenshots 
    : proofFilter === "PAYOUTS"
    ? proofScreenshots.filter(p => parseFloat(p.payout.replace("$", "")) >= 30)
    : proofScreenshots.filter(p => p.category === proofFilter);

  const screenshots = [
    {
      src: "/screenshots/campaign-1.png",
      title: "Campaign Performance Overview",
      caption: "High retention views, organic likes, comments & realistic viral growth curve passing Whop review."
    },
    {
      src: "/screenshots/campaign-2.png",
      title: "Submission Analytics Portal",
      caption: "Verified payout status on creator reward portal showing consistent engagement pacing over time."
    },
    {
      src: "/screenshots/campaign-3.png",
      title: "Delivery Growth Consistency",
      caption: "Natural algorithmic climb mimicking genuine viral distribution with zero sudden dropoffs."
    },
    {
      src: "/screenshots/campaign-4.png",
      title: "Detailed Campaign Audit",
      caption: "Transparent metrics inspection demonstrating clean retention signals and 0 automated bot flags."
    }
  ];

  const faqs = [
    {
      q: "Why do standard SMM panels get rejected on Whop & ContentReward?",
      a: "Generic SMM panels rely on cloud datacenter bots that trigger 1-second view pings. These cause severe view drops (e.g., dropping from 70k to 65k overnight), creating erratic zigzag graphs. Reward platform fraud detectors flag these with Bot Risk Scores exceeding 70/100, automatically rejecting submissions and freezing payouts."
    },
    {
      q: "How does BotClips ensure undetectable delivery?",
      a: "BotClips utilizes a private hardware network of 20,000+ physical smartphones and 100,000+ authentic user accounts operating over genuine residential connections. Each view sustains 3 to 7 seconds of actual watchtime, delivering a natural parabolic curve that passes automated and manual platform audits."
    },
    {
      q: "Which platforms and reward campaigns are supported?",
      a: "Our infrastructure is purpose-built for Whop Clipping Campaigns, ContentReward, Clipster, TikTok Creator Rewards, Instagram Reels Bonus programs, and YouTube Shorts monetization."
    },
    {
      q: "What is the minimum deposit and accepted payment methods?",
      a: "Minimum deposit is only ₹50 INR. We accept instant UPI (PhonePe, Google Pay, Paytm) and USDT TRC20 (at a competitive fixed rate of 1 USDT = ₹96.00). Submissions are verified swiftly through our dashboard."
    },
    {
      q: "Can I connect my own SMM panel via API?",
      a: "Yes! BotClips offers both automated internal AI routing (using our hardware viewfarm) as well as Premium Automation where agency owners can connect custom external SMM panel APIs with a weekly ($5) or monthly ($25) license."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111214] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* ── STICKY TOP NAVIGATION ── */}
      <nav className="sticky top-0 z-40 h-[74px] border-b border-[#e9e9ec] bg-white/90 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-6 h-full flex items-center justify-between">
          <BotClipsLogo size="md" href="/" />

          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-[#62666e]">
            <a href="#why" className="hover:text-[#111214] transition-colors">Why BotClips</a>
            <a href="#analytics" className="hover:text-[#111214] transition-colors">Analytics & Proofs</a>
            <a href="#workflow" className="hover:text-[#111214] transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-[#111214] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-[#111214] hover:text-[#246bfe] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#111214] hover:bg-[#246bfe] text-white shadow-sm transition-all duration-200 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="relative pt-20 pb-24 text-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/70 via-white to-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-100 bg-blue-50/80 text-blue-700 text-xs font-extrabold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Built for the Clipping Industry
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50/90 text-emerald-800 text-[11px] font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>20,480 Physical Smartphones Active</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111214] mt-6 max-w-4xl mx-auto leading-[1.05]">
            A clipping industry{" "}
            <span className="bg-gradient-to-r from-neutral-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
              nightmare.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#6b7078] max-w-2xl mx-auto leading-relaxed font-normal">
            Undetectable views, genuine retention curves, and automated compliance designed specifically for <strong className="text-neutral-900 font-semibold">Whop</strong>, <strong className="text-neutral-900 font-semibold">ContentReward</strong>, and <strong className="text-neutral-900 font-semibold">Clipster</strong> reward campaigns.
          </p>

          {/* Floating Live Activity Ticker */}
          <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-600 mt-5 animate-float shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-neutral-900">Live Verification:</span>
            <span>Whop reward payout $420 approved</span>
            <span className="text-slate-400 font-mono text-[10px]">• 3m ago</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#111214] hover:bg-neutral-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Launch Campaign</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#analytics"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-neutral-50 text-[#111214] font-bold text-sm border border-[#dce0e5] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>View Dashboard Proofs</span>
              <Eye className="w-4 h-4 text-blue-600" />
            </a>
          </div>

          {/* Trust stats row */}
          <div className="mt-14 pt-10 border-t border-[#f0f0f3] grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-3">
              <div className="text-2xl font-black text-[#111214]">20,000+</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Physical Device Farm</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-[#111214]">3–7 Sec</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Real Human Watchtime</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-emerald-600">24 / 100</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Avg Bot Risk Score</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-blue-600">0% Drop</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Audit-Approved Payouts</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── COMPARISON SECTION ── */}
      <section id="why" className="py-24 border-t border-[#f0f0f3] bg-[#fafafa]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-black uppercase tracking-wider text-[#246bfe]">
              The Core Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214] mt-2.5">
              Generic SMM panels were never built for clipping.
            </h2>
            <p className="text-[#6b7078] mt-3.5 text-base leading-relaxed">
              When you submit a clip to Whop or ContentReward, automated fraud algorithms inspect your retention curve, view-drop velocity, and hardware IP fingerprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-[#e4e6eb] bg-white shadow-xl shadow-neutral-200/50 overflow-hidden">
            {/* Typical Panel */}
            <div className="p-8 sm:p-10 bg-[#fafafa] border-b md:border-b-0 md:border-r border-[#e4e6eb]">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  ✕
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Typical SMM Panel</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-red-100">
                  <span className="text-red-500 font-bold text-lg leading-none mt-0.5">✕</span>
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">1-Second Bot Pings</strong>
                    Datacenter cloud scrapers register views for 1 second, causing instant retention collapse.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-red-100">
                  <span className="text-red-500 font-bold text-lg leading-none mt-0.5">✕</span>
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">Sudden Post-Delivery Drops</strong>
                    Views frequently fall from 70k down to 65k within 12 hours, creating visible negative drop spikes.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-red-100">
                  <span className="text-red-500 font-bold text-lg leading-none mt-0.5">✕</span>
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">High Bot Risk Score (78/100)</strong>
                    Triggers automated red flags on Whop & ContentReward review dashboards, leading to rejected payouts.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-red-100">
                  <span className="text-red-500 font-bold text-lg leading-none mt-0.5">✕</span>
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">Generic Server Proxies</strong>
                    Repeated subnet pools easily detected and blacklisted by short-form video algorithms.
                  </div>
                </div>
              </div>
            </div>

            {/* BotClips Engine */}
            <div className="p-8 sm:p-10 bg-white">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-neutral-900">BotClips Architecture</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">20,000+ Physical Smartphones</strong>
                    Real devices running genuine mobile operating systems on private residential carrier connections.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">Genuine 3–7s Watchtime Retention</strong>
                    Realistic human playback duration ensures high completion rates and safe algorithmic indexing.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">Ultra-Low Risk Score (24/100)</strong>
                    Consistently passes Whop, Clipster & ContentReward anti-fraud checks with green approval status.
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700 leading-snug">
                    <strong className="text-neutral-900 block mb-0.5">Smooth Parabolic Growth Curve</strong>
                    Natural delivery pacing with zero abrupt dropoffs, safeguarding creator payouts every time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-black uppercase tracking-wider text-[#246bfe]">
              Core Infrastructure
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214] mt-2">
              Engineered specifically for clippers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl border border-[#e9e9ec] bg-white hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Campaign-First Delivery</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Organize orders around short-form clipping workflows. Choose your exact delivery speed, platform, and retention parameters.
              </p>
            </div>

            <div className="p-7 rounded-2xl border border-[#e9e9ec] bg-white hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Whop & Reward Compliance</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Pre-configured delivery velocity ensures your views, likes, and comment ratios look 100% organic to moderation panels.
              </p>
            </div>

            <div className="p-7 rounded-2xl border border-[#e9e9ec] bg-white hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Real-Time Growth Tracking</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Monitor your campaign delivery curves, retention signals, and submission statuses directly from your unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOFS & REAL-WORLD EARNINGS SHOWCASE (10 VERIFIED CLIENT PROOFS) ── */}
      <section id="analytics" className="py-24 bg-[#f7f7f8] border-y border-[#e9e9ec]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Real Client Submissions & Payouts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214]">
              What Whop, ContentReward & Brands See.
            </h2>
            <p className="text-[#6b7078] mt-3 text-base leading-relaxed">
              10 verified submissions directly from client campaigns across TikTok, Instagram Reels, YouTube Shorts, and X. Every order delivered with 3–7s retention, 0-drop stability, and 0 bot risk rating.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-center p-3 border-r border-slate-100 last:border-0">
              <div className="text-2xl font-black text-emerald-600">$349.00+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Sample Approved Payouts</div>
            </div>
            <div className="text-center p-3 border-r border-slate-100 last:border-0">
              <div className="text-2xl font-black text-blue-600">100%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Audit Pass Rate</div>
            </div>
            <div className="text-center p-3 border-r border-slate-100 last:border-0">
              <div className="text-2xl font-black text-slate-900">0 / 100</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Automated Bot Flags</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-black text-purple-600">0% Drop</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Retention Guarantee</div>
            </div>
          </div>

          {/* Proof Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setProofFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                proofFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All 10 Proofs
            </button>
            <button
              onClick={() => setProofFilter("PAYOUTS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                proofFilter === "PAYOUTS"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Top Payouts ($30+)</span>
            </button>
            <button
              onClick={() => setProofFilter("REELS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                proofFilter === "REELS"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Instagram Reels
            </button>
            <button
              onClick={() => setProofFilter("SHORTS_TIKTOK")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                proofFilter === "SHORTS_TIKTOK"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              TikTok & Shorts
            </button>
            <button
              onClick={() => setProofFilter("X")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                proofFilter === "X"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              X / Twitter
            </button>
          </div>

          {/* 10 Real Proofs Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProofs.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => setSelectedProofIndex(proofScreenshots.findIndex(p => p.id === item.id))}
                className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      item.platform.includes("Instagram")
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : item.platform.includes("YouTube")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : item.platform.includes("TikTok")
                        ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                        : "bg-slate-100 text-slate-800 border border-slate-300"
                    }`}>
                      {item.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                      <span>{item.payout}</span>
                    </span>
                  </div>

                  {/* Image Container with Hover Overlay */}
                  <div className="overflow-hidden rounded-xl aspect-[16/10] bg-neutral-950 flex items-center justify-center relative shadow-inner">
                    <img 
                      src={item.src} 
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold backdrop-blur-sm shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Proof</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-3 px-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.title}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>{item.views}</span>
                    <span>{item.likes}</span>
                    <span className="text-emerald-600">Shield 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Architecture Showcase Section */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-extrabold text-slate-900">
                Unified Campaign Tracking Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                How BotClips presents deep submission telemetry, velocity metrics, and delivery curves
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {screenshots.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedProofIndex(idx)}
                  className="cursor-pointer bg-neutral-900 rounded-xl p-2 shadow-md hover:shadow-lg transition-all border border-neutral-800 group"
                >
                  <div className="overflow-hidden rounded-lg aspect-[16/10] bg-neutral-950 relative">
                    <img 
                      src={item.src} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-white font-bold bg-black/70 px-2 py-1 rounded">Zoom</span>
                    </div>
                  </div>
                  <div className="p-2 text-white">
                    <div className="text-xs font-bold truncate">{item.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{item.caption}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Score Comparison Box */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Typical SMM Panel Risk Score */}
            <div className="p-7 rounded-2xl border border-red-200 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Typical SMM Panel Signal</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Flagged / Rejected</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-black text-red-600">78</span>
                <span className="text-lg font-bold text-neutral-400">/ 100 Risk Index</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 mt-4 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "78%" }} />
              </div>
              <p className="text-xs text-[#6b7078] mt-3 leading-relaxed">
                Elevated bot risk score triggered by 1-sec drops and repetitive datacenter proxies. Submissions are marked fraudulent and disqualified.
              </p>
            </div>

            {/* BotClips Safe Risk Score */}
            <div className="p-7 rounded-2xl border border-emerald-200 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">BotClips Quality Signal</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Approved / Paid Out</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-black text-emerald-600">24</span>
                <span className="text-lg font-bold text-neutral-400">/ 100 Risk Index</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "24%" }} />
              </div>
              <p className="text-xs text-[#6b7078] mt-3 leading-relaxed">
                Low risk score generated by authentic 3–7s retention and physical smartphones. Seamlessly clears automated verification filters.
              </p>
            </div>
          </div>

          {/* Delivery Consistency SVG Graph */}
          <div className="mt-8 p-7 rounded-2xl border border-[#e9e9ec] bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Why Delivery Consistency Matters</h3>
                <p className="text-xs text-[#6b7078] mt-0.5">Comparing view velocity and retention profiles over 48 hours</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span>Irregular Bot Drop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>BotClips Organic Curve</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                  <span>Baseline</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[220px] relative mt-4">
              <svg viewBox="0 0 900 220" className="w-full h-full" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="900" y2="40" stroke="#f1f2f4" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="900" y2="90" stroke="#f1f2f4" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="900" y2="140" stroke="#f1f2f4" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="190" x2="900" y2="190" stroke="#f1f2f4" strokeWidth="1" strokeDasharray="4 4" />

                {/* Irregular drop line (Red) */}
                <path 
                  d="M0 190 C90 110 130 205 210 145 S330 105 405 160 S520 70 590 130 S720 80 900 115" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Steady organic curve (Blue) */}
                <path 
                  d="M0 190 C130 175 210 155 300 142 S470 120 580 105 S760 82 900 68" 
                  fill="none" 
                  stroke="#246bfe" 
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Animated active pulse beacon along the curve */}
                <circle cx="580" cy="105" r="8" fill="#246bfe" fillOpacity="0.25" className="animate-ping" />
                <circle cx="580" cy="105" r="4" fill="#246bfe" stroke="#ffffff" strokeWidth="1.5" />

                {/* Baseline (Cyan) */}
                <path 
                  d="M0 205 C160 195 260 180 390 170 S620 150 900 138" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mt-2 text-center text-xs text-[#8d929a]">
              Figure 1: Smooth parabolic curve vs erratic drop-and-spike graphs analyzed by Whop & ContentReward automated reviewers.
            </div>
          </div>
        </div>
      </section>

      {/* ── 4-STEP WORKFLOW ── */}
      <section id="workflow" className="py-24 bg-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-black uppercase tracking-wider text-[#246bfe]">
              Step-By-Step
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214] mt-2.5">
              From submission to payout.
            </h2>
            <p className="text-[#6b7078] mt-2 text-base">
              Four straightforward steps to maximize your clipping rewards with zero risk of disqualification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-[#e9e9ec] bg-white relative">
              <span className="text-xs font-black text-blue-600 block mb-3">STEP 01</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Submit Link</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Paste your TikTok or Instagram Reel clipping submission link and select your desired volume.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#e9e9ec] bg-white relative">
              <span className="text-xs font-black text-blue-600 block mb-3">STEP 02</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Hardware Dispatch</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Our viewfarm routes the order across physical smartphones with authentic residential device fingerprints.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#e9e9ec] bg-white relative">
              <span className="text-xs font-black text-blue-600 block mb-3">STEP 03</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Natural Retention</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Views are watched for 3 to 7 genuine seconds, creating a safe, human engagement profile without drops.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#e9e9ec] bg-white relative">
              <span className="text-xs font-black text-blue-600 block mb-3">STEP 04</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Collect Rewards</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Submit on Whop, ContentReward, or Clipster. Clear compliance reviews smoothly and claim your reward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-20 bg-[#fafafa] border-t border-[#e9e9ec]">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-black uppercase tracking-wider text-[#246bfe]">
              Got Questions?
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#111214] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-[#e4e6eb] rounded-xl bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm sm:text-base text-neutral-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {faqOpen === idx ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />
                  )}
                </button>
                {faqOpen === idx && (
                  <div className="px-6 pb-4 pt-1 text-sm text-[#6b7078] leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ── */}
      <div className="max-w-[1180px] mx-auto px-6 my-20">
        <div className="bg-[#111214] text-white rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#246bfe30,transparent_60%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to secure your clipping payouts?
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8 text-base leading-relaxed">
            Join professional clippers using BotClips to scale campaigns, maintain clean audit scores, and prevent view rejections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-[#111214] font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              Create BotClips Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm border border-neutral-700 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e9e9ec] py-8 text-[#6b7078] text-xs">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BotClipsLogo size="sm" href="/" />
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">High-Retention Clipping Infrastructure</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-neutral-900 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-neutral-900 transition-colors">Register</Link>
            <span>© {new Date().getFullYear()} BotClips. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ── INTERACTIVE LIGHTBOX MODAL WITH PROOF TELEMETRY & CONTROLS ── */}
      {selectedProofIndex !== null && proofScreenshots[selectedProofIndex] && (
        <div 
          onClick={() => setSelectedProofIndex(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex items-center justify-center cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            {/* Modal Top Header Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Proof {selectedProofIndex + 1} of {proofScreenshots.length}
                </span>
                <span className="h-4 w-px bg-slate-700" />
                <span className="text-xs font-bold text-white">
                  {proofScreenshots[selectedProofIndex].platform}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  {proofScreenshots[selectedProofIndex].payout} Approved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProofIndex((selectedProofIndex - 1 + proofScreenshots.length) % proofScreenshots.length)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Previous Proof (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedProofIndex((selectedProofIndex + 1) % proofScreenshots.length)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Next Proof (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedProofIndex(null)}
                  className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Display */}
            <div className="relative bg-black flex items-center justify-center p-2 max-h-[65vh] overflow-hidden">
              <img 
                src={proofScreenshots[selectedProofIndex].src} 
                alt={proofScreenshots[selectedProofIndex].title} 
                className="max-h-[60vh] w-auto max-w-full rounded-lg shadow-xl object-contain" 
              />
            </div>

            {/* Modal Bottom Details Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{proofScreenshots[selectedProofIndex].title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {proofScreenshots[selectedProofIndex].badge}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                  {proofScreenshots[selectedProofIndex].caption}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200">
                    {proofScreenshots[selectedProofIndex].views}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {proofScreenshots[selectedProofIndex].likes} • 0 Bot Risk
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Start Campaign
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
