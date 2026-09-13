"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Star,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Play
} from "lucide-react";

export default function HomePage() {
  const [selectedCurve, setSelectedCurve] = useState("ORGANIC");
  const [activePlatform, setActivePlatform] = useState("INSTAGRAM");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const curves: Record<string, { title: string; badge: string; desc: string; duration: string; path: string }> = {
    ORGANIC: {
      title: "Organic Viral Algorithm",
      badge: "Best for Reels & Shorts",
      desc: "Simulates genuine human discovery. Views gradually build up over 4 hours, peak during prime algorithm test windows, and decay naturally with 0 flags.",
      duration: "24h - 72h Pacing",
      path: "M 10 90 C 50 85, 70 65, 110 20 C 150 10, 190 40, 240 70 C 270 85, 290 92, 300 95"
    },
    VYRO: {
      title: "Explosive Hook Velocity",
      badge: "Best for Viral AI Content",
      desc: "Delivers an immediate sustained burst in the first 2 hours to pass the platform retention hook test, followed by steady engagement drip.",
      duration: "12h - 48h Pacing",
      path: "M 10 90 C 20 15, 60 15, 120 35 C 180 50, 240 75, 300 85"
    },
    UNIVERSAL: {
      title: "Universal Multi-Peak Wave",
      badge: "Best for Global Audiences",
      desc: "Double-peaked cyclic pacing designed to trigger engagement surges across multiple global timezones as creators cross international feeds.",
      duration: "24h - 96h Pacing",
      path: "M 10 90 C 40 20, 80 80, 140 25 C 200 80, 250 30, 300 90"
    },
    STEADY: {
      title: "Continuous Linear Drip",
      badge: "Best for Accounts Seeking Safe Pacing",
      desc: "Strictly even batch distribution every hour over multi-day campaigns. Perfect for client agencies and cautious creators.",
      duration: "48h - 168h (1-7 Days)",
      path: "M 10 90 L 300 20"
    }
  };

  const sampleServices: Record<string, Array<{ name: string; rate: string; speed: string; refill: string }>> = {
    INSTAGRAM: [
      { name: "Instagram Real HQ Followers [Instant]", rate: "₹180 / 1k", speed: "0 - 15 mins", refill: "30 Days Refill" },
      { name: "Instagram High Retention Likes [Real Active]", rate: "₹45 / 1k", speed: "Instant", refill: "Lifetime Guarantee" },
      { name: "Instagram Reels Views [Viral Push]", rate: "₹15 / 1k", speed: "Instant 50k/min", refill: "Non-Drop" },
      { name: "Instagram Real Indian Comments [Custom]", rate: "₹380 / 1k", speed: "Gradual Drip", refill: "Safe" },
    ],
    YOUTUBE: [
      { name: "YouTube High Retention Views [Monetizable]", rate: "₹240 / 1k", speed: "1 - 3 hours", refill: "Lifetime Refill" },
      { name: "YouTube Real Subscribers [Non-Drop]", rate: "₹1,200 / 1k", speed: "24 - 48 hours", refill: "60 Days Refill" },
      { name: "YouTube 4000 Watch Hours Package", rate: "₹3,400 / pkg", speed: "3 - 7 days", refill: "Monetization Safe" },
      { name: "YouTube Likes & Comments [Engagement]", rate: "₹190 / 1k", speed: "Instant", refill: "Non-Drop" },
    ],
    TIKTOK: [
      { name: "TikTok Real Followers [Guaranteed No Drop]", rate: "₹190 / 1k", speed: "0 - 30 mins", refill: "30 Days Refill" },
      { name: "TikTok Video Views [FYP Algorithm Boost]", rate: "₹20 / 1k", speed: "Instant 100k/hr", refill: "Non-Drop" },
      { name: "TikTok Active Likes & Shares Combo", rate: "₹95 / 1k", speed: "10 mins", refill: "Safe" },
    ],
    TELEGRAM: [
      { name: "Telegram Channel Members [Global Non-Drop]", rate: "₹120 / 1k", speed: "Instant 10k/hr", refill: "60 Days Refill" },
      { name: "Telegram Post Views [1-5 Recent Posts Autoview]", rate: "₹10 / 1k", speed: "Instant", refill: "Non-Drop" },
      { name: "Telegram Group Active Discussion Members", rate: "₹210 / 1k", speed: "Gradual Drip", refill: "Safe" },
    ],
    TWITTER: [
      { name: "Twitter (X) Followers [Real Profiles with PFP]", rate: "₹350 / 1k", speed: "1 - 6 hours", refill: "30 Days Refill" },
      { name: "Twitter (X) High Speed Likes & Retweets", rate: "₹110 / 1k", speed: "Instant", refill: "Non-Drop" },
      { name: "Twitter (X) Impressions & Poll Votes", rate: "₹45 / 1k", speed: "Instant", refill: "Non-Drop" },
    ]
  };

  const faqs = [
    {
      q: "Can my social media account get banned or shadowbanned?",
      a: "No. Unlike conventional SMM panels that blast flat bots within seconds, BotClips utilizes Organic Algorithmic Curves and natural delivery velocity. This simulates genuine virality that complies with platform guidelines."
    },
    {
      q: "How fast do orders start delivering?",
      a: "95% of our services start delivering within 0 to 60 seconds automatically through our connected high-speed SMM v2 infrastructure."
    },
    {
      q: "How does the UPI QR Code payment work?",
      a: "Go to Add Funds in your dashboard, choose an amount, scan the generated UPI QR code with any app (GPay, PhonePe, Paytm, BHIM), and paste the 12-digit UTR receipt number. Funds are credited to your balance instantly."
    },
    {
      q: "What is an Organic Drip-Feed Curve?",
      a: "Instead of receiving 10,000 views at the exact same second, Drip-Feed divides your order into organic batches (e.g. 500 views every 30 minutes). This mimics genuine algorithmic spread on the Instagram Explore or YouTube Recommendations feed."
    },
    {
      q: "What happens if a service drops followers over time?",
      a: "All services marked with 'Refill' come with automatic 30 to 60 day refill guarantees. You can trigger an automatic refill directly from your Order History page with 1 click."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      
      {/* ─── 1. Public Top Navbar ─── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bot className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              BotClips
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <a href="#curves" className="hover:text-blue-600 transition-colors">Organic Curves</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <Link href="/admin" className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. Hero Section ─── */}
      <section className="pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Next-Gen High-Speed SMM Automation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          Scale Your Social Growth With Algorithmic Pacing & Zero Drops
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The ultimate SMM Panel for creators, agencies, and businesses. Equipped with proprietary Organic Viral Curves, instant UPI QR code top-ups, and automated v2 provider API dispatch.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
          >
            Browse All Services
          </a>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <Clock className="w-5 h-5 text-blue-600 mb-2" />
            <div className="font-black text-xl text-slate-900 dark:text-white">0-30s</div>
            <div className="text-xs text-slate-400">Instant Order Dispatch</div>
          </div>
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <div className="font-black text-xl text-slate-900 dark:text-white">100% Safe</div>
            <div className="text-xs text-slate-400">Organic Viral Algorithms</div>
          </div>
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <Users className="w-5 h-5 text-cyan-600 mb-2" />
            <div className="font-black text-xl text-slate-900 dark:text-white">50k+</div>
            <div className="text-xs text-slate-400">Orders Delivered</div>
          </div>
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500 mb-2" />
            <div className="font-black text-xl text-slate-900 dark:text-white">4.9 / 5</div>
            <div className="text-xs text-slate-400">Customer Rating</div>
          </div>
        </div>
      </section>

      {/* ─── 3. Organic Viral Curves Showcase (From yoyosmm reference) ─── */}
      <section id="curves" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Proprietary Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Why Flat SMM Panels Get Flagged (And We Don't)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Standard panels spike thousands of fake bots in 1 second, causing instant shadowbans. Our Organic Curve Engine delivers paced engagement calibrated to actual recommendation algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Curves List */}
          <div className="lg:col-span-6 space-y-3">
            {Object.entries(curves).map(([key, c]) => {
              const active = selectedCurve === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedCurve(key)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-white dark:bg-[#131b2e] border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-[#131b2e]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{c.desc}</p>
                  <div className="mt-2 text-[11px] font-mono font-bold text-slate-400">{c.duration}</div>
                </div>
              );
            })}
          </div>

          {/* Right Live Waveform Visualizer */}
          <div className="lg:col-span-6 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Delivery Waveform</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">Algorithm Active</span>
            </div>

            <div className="py-8">
              <svg viewBox="0 0 320 120" className="w-full h-40 overflow-visible">
                <line x1="10" y1="30" x2="310" y2="30" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="10" y1="60" x2="310" y2="60" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="10" y1="90" x2="310" y2="90" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

                <path
                  d={curves[selectedCurve].path}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span>Warmup (0-4h)</span>
              <span className="text-blue-600 font-bold">Peak Engagement Window</span>
              <span>Organic Decay Tail</span>
            </div>

            <Link
              href="/dashboard/automation"
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Configure This Curve in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4. Live Services & Pricing Catalog ─── */}
      <section id="services" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Top Services & Instant Rates
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              No hidden fees. Free refills included with all guaranteed servers.
            </p>
          </div>

          {/* Platform Tab Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-xl p-1.5 scrollbar-none">
            {["INSTAGRAM", "YOUTUBE", "TIKTOK", "TELEGRAM", "TWITTER"].map((p) => (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === p
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p === "TWITTER" ? "Twitter (X)" : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Rate / 1k</th>
                  <th className="py-3 px-2">Delivery Speed</th>
                  <th className="py-3 px-2">Refill Guarantee</th>
                  <th className="py-3 px-2 text-right">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sampleServices[activePlatform]?.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-2 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-4 px-2 font-black text-blue-600 dark:text-blue-400">
                      {s.rate}
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-mono">
                      {s.speed}
                    </td>
                    <td className="py-4 px-2 text-emerald-600 font-semibold">
                      {s.refill}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Link
                        href="/dashboard"
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition-all inline-flex items-center gap-1"
                      >
                        <span>Order</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── 5. How It Works (4 Steps) ─── */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Simple 4-Step Process
        </span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          How BotClips Works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-12 text-left">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Account</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Sign up in 10 seconds. Deposit funds securely via UPI or Crypto to start placing orders.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Funds</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Scan our dynamic UPI QR code with GPay/PhonePe or send Crypto USDT with 0% fee.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pick Your Service</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Choose your platform, paste your video/profile link, and select your organic drip-feed curve.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Watch Viral Delivery</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Our automated SMM API dispatches your order instantly with live tracking & 30-day refills.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 6. FAQ Accordion ─── */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto border-t border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = faqOpen === i;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 7. CTA Banner & Footer ─── */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl p-10 sm:p-14 text-white shadow-xl shadow-blue-500/20">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Automate Your Social Reach?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Join thousands of creators and agencies using BotClips to scale engagement safely.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-white text-blue-600 hover:bg-slate-100 font-black text-sm shadow-md transition-all"
            >
              Create Free Account & Start
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white font-bold text-sm transition-all"
            >
              Open Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">BotClips SMM Automation</span>
          </div>
          <div>© 2026 BotClips / DhillonSMM. Powered by Cloudflare & Vercel.</div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/login" className="hover:text-blue-600">Client Login</Link>
            <Link href="/admin" className="hover:text-blue-600">Admin Portal</Link>
            <Link href="/dashboard/services" className="hover:text-blue-600">Services</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
