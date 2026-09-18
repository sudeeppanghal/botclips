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
  CheckCircle,
  Play,
  Pause,
  AlertTriangle,
  Info,
  Maximize2,
  Video,
  Radio,
  Sliders,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Bell,
  Globe,
  Menu
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [selectedProofIndex, setSelectedProofIndex] = useState<number | null>(null);
  const [proofFilter, setProofFilter] = useState<string>("ALL");
  const [activeVideoTab, setActiveVideoTab] = useState<number>(0);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  // Real Client Proofs & High-Value Earnings Showcases from public/proofs & public/screenshots
  const allProofs = [
    {
      id: 1,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-lockscreen-payouts.jpg",
      platform: "Whop Notifications",
      payout: "$1,487+",
      views: "Daily Payout Stream",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "PAYOUTS",
      title: "Consecutive Daily Whop Payouts ($380, $288, $189...)",
      caption: "Live lockscreen alerts from Content Rewards HQ: Multiple same-day payouts approved and credited directly to clipper account without flags.",
      badge: "Consecutive Payouts",
      likes: "7 Streams",
      isHighlight: true
    },
    {
      id: 2,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/content-reward-300-approved.jpg",
      platform: "Content Rewards",
      payout: "$300.00",
      views: "3,866,908 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "PAYOUTS",
      title: "Mybet Campaign: $300 Payout Approved (Green Shield 0)",
      caption: "3.86M views, 72,232 likes, 320 comments. Clean human retention curve clearing moderator inspection with instant approval.",
      badge: "$300 Approved",
      likes: "72.2K Likes",
      isHighlight: true
    },
    {
      id: 3,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/admin-caught-vs-passed.jpg",
      platform: "Moderation Console",
      payout: "$1,459.06",
      views: "User Audit Panel",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "AUDIT",
      title: "Admin POV: Trusted Clipper (76%) vs Botted Clipper (37%)",
      caption: "Real admin panel comparing Reniyo ($1,459 paid, 76% Trust Score) vs Goalkeeper_go (37% Trust Score with red alert flags).",
      badge: "Real Admin Audit",
      likes: "2,145 Users",
      isHighlight: true
    },
    {
      id: 4,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-earning-5230.jpg",
      platform: "Whop Business",
      payout: "$5,230.44",
      views: "Top Clipper",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "PAYOUTS",
      title: "Creator ak47boss: $5,230.44 Total Earnings",
      caption: "Whop business dashboard revenue for top agency clipper scaling brand campaigns using BotClips high-retention infrastructure.",
      badge: "$5,230+ Earned",
      likes: "Verified Account"
    },
    {
      id: 5,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-earning-3860.jpg",
      platform: "Whop Business",
      payout: "$3,860.48",
      views: "100M+ Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "PAYOUTS",
      title: "ClpCartel: $3,860.48 Earned & 100M+ Views",
      caption: "Tier 1 Audience Specialist scaling brand campaigns on Whop. Over 100 million organic views delivered without moderation bans.",
      badge: "$3,860+ Earned",
      likes: "$1.18K / 30d"
    },
    {
      id: 6,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/content-reward-69-approved.jpg",
      platform: "Instagram Reels",
      payout: "$69.08",
      views: "138,162 Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "REELS",
      title: "Mybet Viral Reel: $69.08 Approved Status",
      caption: "138,162 views and 1,846 likes with green bot shield (0). Status marked Approved by campaign manager with 0 drops.",
      badge: "Green Shield 0",
      likes: "1,846 Likes"
    },
    {
      id: 7,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/tier1-usa-audience.jpg",
      platform: "Audience Analytics",
      payout: "Tier 1 Geo",
      views: "48.4% USA",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "AUDIT",
      title: "Clean Tier 1 Audience Fingerprint (48.4% USA, 24.2% UK)",
      caption: "Authentic residential device routing creates high-value Tier 1 demographic distributions required for top CPM payouts.",
      badge: "USA 48.4% + UK",
      likes: "Tier 1 Geo"
    },
    {
      id: 8,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/payout-received-breakdown.jpg",
      platform: "Content Rewards",
      payout: "$63.97",
      views: "Payment Timeline",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "PAYOUTS",
      title: "Transparent Payout Timeline & Direct Deposit",
      caption: "$63.97 total earnings with $6.26 paid out immediately and $57.71 upcoming milestone release without manual fraud scrutiny.",
      badge: "Direct Deposit",
      likes: "Paid Sun Jul 19"
    },
    {
      id: 9,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/screenshots/1.jpg",
      platform: "TikTok",
      payout: "$5.78",
      views: "1,900+ Views",
      botScore: "0 / 100",
      status: "APPROVED",
      category: "SHORTS_TIKTOK",
      title: "Galactic TikTok Submission Approved",
      caption: "Brand Galactic on Content Rewards approved submission mopiofficial. Organic curve with zero bot flags.",
      badge: "Verified Approval",
      likes: "11 Likes"
    },
    {
      id: 10,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/screenshots/8.jpg",
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
    }
  ];

  const filteredProofs = proofFilter === "ALL" 
    ? allProofs 
    : proofFilter === "PAYOUTS"
    ? allProofs.filter(p => p.category === "PAYOUTS" || parseFloat(p.payout.replace("$", "").replace("+", "") || "0") >= 30)
    : allProofs.filter(p => p.category === proofFilter);

  // 4 Core Campaign Dashboards from public/screenshots
  const campaignDashboards = [
    {
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/screenshots/campaign-1.png",
      title: "Whop Campaign: Approved Submission ($5.17)",
      subtitle: "alexjaat • Bot Score 20 (Significantly Low)",
      views: "1,476 Views",
      likes: "54 Likes",
      badge: "Whop Approved",
      caption: "Real Whop campaign audit screen: Approved status, zero fraud flags, clean retention graph, and payout transferred directly to wallet."
    },
    {
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/content-reward-review-console.jpg",
      title: "Content Rewards: 3.86M Views Review Screen",
      subtitle: "Full Algorithmic Telemetry Inspection",
      views: "3,866,908 Views",
      likes: "72,232 Likes",
      badge: "3.8M Approved",
      caption: "Campaign submission review showing steady hourly delivery, authentic residential IP distribution, and Approve/Reject moderation."
    },
    {
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/screenshots/campaign-3.png",
      title: "Algorithmic Growth & Retention Consistency",
      subtitle: "Smooth Parabolic Velocity Tracking",
      views: "18,523 Views",
      likes: "124 Likes",
      badge: "Safe Pacing",
      caption: "Zero dropoff curve over 7 days. Automated fraud monitors classify the clip as 100% organic user traffic."
    },
    {
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/screenshots/campaign-4.png",
      title: "Reward Panel Compliance Audit",
      subtitle: "Multi-Tier Anti-Fraud Verification",
      views: "56,714 Views",
      likes: "885 Likes",
      badge: "High Earner",
      caption: "Approved high-tier payout submission showing coordinated engagement ratio and spotless moderation logs."
    }
  ];

  // Screen recording demo videos from public/videos
  const demoVideos = [
    {
      id: 1,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/videos/video-1.mp4",
      title: "Whop Campaign Payout Clearance & Bot Score Verification",
      caption: "Real-time recording of Whop creator dashboard verifying approved payout, green shield Bot Score (20/100), and clean retention profile.",
      tag: "Whop Approved",
      duration: "0:45",
      metrics: {
        botScore: "20 / 100",
        payout: "$5.17 Approved",
        retention: "Clean S-Curve"
      }
    },
    {
      id: 2,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/videos/video-2.mp4",
      title: "Live Submission Verification & Balance Distribution",
      caption: "Inspection of submission review portal demonstrating instant order processing, zero manual flags, and automated reward clearance.",
      tag: "Portal Review",
      duration: "1:12",
      metrics: {
        botScore: "0 Flags",
        payout: "Credited",
        retention: "100% Verified"
      }
    },
    {
      id: 3,
      src: "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/videos/video-3.mp4",
      title: "Algorithmic Jitter Delivery & Zero-Drop Retention",
      caption: "Demonstration of organic randomized micro-time jitter and coordinated likes/comments pacing passing moderation audits.",
      tag: "Jitter Engine",
      duration: "0:58",
      metrics: {
        botScore: "Organic FYP",
        payout: "Guaranteed",
        retention: "Zero Drop"
      }
    }
  ];

  // Whop AI Bot Detection Tiers directly from owner sketch
  const whopScoreTiers = [
    {
      range: "0 – 20",
      label: "Significantly Low",
      badge: "BotClips Guaranteed Safe Zone",
      status: "100% Payout Approval",
      accent: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      barClass: "bg-emerald-500",
      description: "Spotless score. Whop AI detects 100% organic retention and device diversity. Guaranteed payout approval."
    },
    {
      range: "20 – 40",
      label: "Low",
      badge: "Passing Tier",
      status: "Instant Clearance",
      accent: "teal",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
      barClass: "bg-teal-500",
      description: "Within acceptable algorithmic variance. Clears automated fraud filters without manual admin intervention."
    },
    {
      range: "40 – 60",
      label: "Slight",
      badge: "Elevated Scrutiny",
      status: "Manual Audit Queue",
      accent: "amber",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      barClass: "bg-amber-500",
      description: "Triggers secondary inspection. Payouts delayed 48–72h for retention and IP subnet inspection."
    },
    {
      range: "60 – 80",
      label: "High Risk",
      badge: "Frequent Flag",
      status: "High Rejection Rate",
      accent: "orange",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      barClass: "bg-orange-500",
      description: "Typical generic SMM panels fall here. Datacenter IP patterns and rapid view drops detected."
    },
    {
      range: "80 – 100",
      label: "Very High / Botted",
      badge: "Whop AI Auto-Reject",
      status: "Disqualified ($0.00)",
      accent: "red",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      barClass: "bg-red-500",
      description: "Unnatural spikes, flatline watchtime, or 0 engagement. Whop AI flags submission as artificial ($0 payout)."
    },
    {
      range: "100+",
      label: "Disqualified",
      badge: "Permanent Blacklist",
      status: "Account Ban",
      accent: "rose",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      barClass: "bg-rose-700",
      description: "Severe bot farming detected. Clipper is permanently blacklisted from brand creator reward programs."
    }
  ];

  const faqs = [
    {
      q: "Why do standard SMM panels get rejected on Whop & ContentReward?",
      a: "Generic SMM panels rely on cloud datacenter bots that trigger 1-second view pings. These cause severe view drops (e.g., dropping from 70k to 65k overnight), creating erratic zigzag graphs. Reward platform fraud detectors flag these with Bot Risk Scores exceeding 70/100, automatically rejecting submissions and freezing payouts."
    },
    {
      q: "How does BotClips ensure undetectable delivery?",
      a: "BotClips utilizes a private hardware network of 20,000+ physical smartphones and 100,000+ authentic user accounts operating over genuine residential connections. Each view sustains 3 to 7 seconds of actual watchtime with micro-random time jitter (e.g. 72-63-99-101), delivering a natural parabolic curve that passes automated and manual platform audits."
    },
    {
      q: "Which platforms and reward campaigns are supported?",
      a: "Our infrastructure is purpose-built for Whop Clipping Campaigns, ContentReward, Clipster, TikTok Creator Rewards, Instagram Reels Bonus programs, and YouTube Shorts monetization."
    },
    {
      q: "What is the minimum deposit and accepted payment methods?",
      a: "Minimum deposit is only ₹50 INR. We accept instant UPI (PhonePe, Google Pay, Paytm) and USDT (TRC-20 / BEP-20) with 0% transaction fees. Submissions are verified swiftly through our dashboard."
    },
    {
      q: "Can I connect my own SMM panel via API?",
      a: "Yes! BotClips offers both automated internal AI routing (using our hardware viewfarm) as well as Premium Automation where agency owners can connect custom external SMM panel APIs with a weekly ($10) or monthly ($25) license."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111214] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* ── STICKY TOP NAVIGATION ── */}
      <nav className="sticky top-0 z-40 h-[70px] sm:h-[74px] border-b border-[#e9e9ec] bg-white/95 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <BotClipsLogo size="md" href="/" />

          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-[#62666e]">
            <a href="#admin-pov" className="hover:text-[#111214] transition-colors">Admin POV vs Bypass</a>
            <a href="#bot-score" className="hover:text-[#111214] transition-colors">Whop Bot Score</a>
            <a href="#video-demos" className="hover:text-[#111214] transition-colors">Live Videos</a>
            <a href="#analytics" className="hover:text-[#111214] transition-colors">Real Payout Proofs</a>
            <a href="#faq" className="hover:text-[#111214] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-[13px] sm:text-[14px] font-semibold text-[#111214] hover:text-blue-600 px-2.5 sm:px-3.5 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-[13px] sm:text-[14px] font-bold bg-[#111214] hover:bg-neutral-800 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-xs"
            >
              Get Started
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 shadow-xl px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1 font-semibold text-sm text-neutral-700">
              <a
                href="#admin-pov"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                🛡️ Admin POV & Bypass Proofs
              </a>
              <a
                href="#bot-score"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                📊 Whop Bot Score Tiers
              </a>
              <a
                href="#video-demos"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                🎬 Live Video Screen Recordings
              </a>
              <a
                href="#analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                💰 Real Payout Proofs & Earnings
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                ❓ Frequently Asked Questions
              </a>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Launch Now 🚀
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO HEADER ── */}
      <header className="relative pt-20 pb-20 overflow-hidden bg-white border-b border-[#f0f0f3]">
        <div className="max-w-[1180px] mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Anti-Detection Algorithm for Whop & ContentReward</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111214] max-w-4xl mx-auto leading-[1.08]">
            High-Retention views engineered to bypass{" "}
            <span className="text-[#246bfe]">Whop bot detection.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#6b7078] max-w-2xl mx-auto font-medium leading-relaxed">
            Stop losing clipping campaign payouts to 1-second bot drops. Real physical smartphones, 3–7s retention, coordinated engagement, and zero-risk audit approval.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#246bfe] hover:bg-blue-600 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Campaign Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#admin-pov"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#111214] font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inspect Real Admin Screenshots</span>
              <Eye className="w-4 h-4 text-neutral-500" />
            </a>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-[#f0f0f3] pt-8">
            <div className="p-3">
              <div className="text-2xl font-black text-neutral-900">20,000+</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Real Smartphones</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-neutral-900">3–7s</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Real Human Watchtime</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-emerald-600">0 – 20 / 100</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Whop AI Safe Zone</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-black text-blue-600">100%</div>
              <div className="text-xs font-semibold text-[#6b7078] mt-1">Audit-Approved Payouts</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: ADMIN POV VS BOTCLIPS BYPASS ENGINE (WITH REAL SCREENSHOTS) ── */}
      <section id="admin-pov" className="py-24 bg-[#0d0f12] text-white relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ef444415,transparent_50%),radial-gradient(circle_at_80%_20%,#10b98115,transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1180px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300 text-xs font-black uppercase tracking-wider mb-4">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Real Moderation Console & Whop Audit Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              What Clipping Campaigns Admin Actually See.
            </h2>
            <p className="text-neutral-400 mt-4 text-base sm:text-lg leading-relaxed">
              Real screenshots from Content Rewards and Whop moderation panels. See exactly why cheap bots get red-flagged and how BotClips creators clear payouts effortlessly.
            </p>
          </div>

          {/* DUAL COMPARISON WITH REAL SCREENSHOTS */}
          {/* DUAL COMPARISON WITH REAL SCREENSHOTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Card: ❌ Admin POV: How They Catch Botting */}
            <div className="rounded-3xl bg-[#0d0f14] border border-red-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group/card hover:border-red-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-5 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-7 w-7 rounded-xl bg-red-500 opacity-20" />
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight">Admin POV: How Cheap Bots Get Flagged</h3>
                      <p className="text-xs text-neutral-400 font-medium">Score 100 Flag • Sawtooth Spikes • Disqualified ($0)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-[11px] font-mono font-black uppercase tracking-wider border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
                    Flagged &amp; Rejected
                  </span>
                </div>

                {/* Real Admin Screenshot: Flagged & Disqualified Bot Submission */}
                <div 
                  onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/comparison-botted-breakdown.png")}
                  className="rounded-2xl overflow-hidden border border-red-500/40 bg-[#07090e] relative group cursor-pointer mb-5 shadow-2xl transition-all hover:border-red-400/80 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]"
                >
                  <div className="w-full aspect-[16/9] bg-black/90 flex items-center justify-center relative overflow-hidden">
                    <img loading="lazy" decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/comparison-botted-breakdown.png" 
                      alt="Whop Moderation Panel: High Bot Score (100) & Botted Graphs" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-red-950/90 text-red-200 border border-red-700 text-xs font-extrabold backdrop-blur-md flex items-center gap-2 shadow-2xl group-hover:scale-105 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect High Bot Score &amp; Botted Graphs</span>
                      </span>
                    </div>
                  </div>

                  {/* Modern Animated HUD Status Strip */}
                  <div className="p-3 bg-gradient-to-r from-red-950/60 via-red-900/30 to-neutral-950/80 border-t border-red-900/50 text-xs flex items-center justify-between font-mono backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="tracking-wide text-red-300/90 font-bold uppercase text-[11px]">Whop AI Fraud Detection Alert</span>
                    </div>
                    <span className="font-black text-red-400 px-2.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[11px] tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                      SCORE 100/100 • $0.00 REJECTED
                    </span>
                  </div>
                </div>

                {/* 3 Critical Detection Traps with Modern High-Tech Cards */}
                <div className="space-y-3">
                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-red-950/30 via-neutral-900/50 to-neutral-950/70 border border-red-500/20 hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 font-mono text-xs font-black flex items-center justify-center border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)] shrink-0 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                          01
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-red-300 transition-colors">
                          HIGH BOT SCORE (RED SHIELD 100)
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                        MAX 100 INDEX
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      Whop AI algorithmic moderation flags inorganic traffic immediately with a maximum <span className="font-bold text-red-400">100/100 bot index</span>, instantly triggering automated payout disqualification.
                    </p>
                  </div>

                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-neutral-950/60 to-neutral-900/40 border border-neutral-800 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-400 font-mono text-xs font-black flex items-center justify-center border border-red-500/30 shrink-0 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                          02
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-red-300 transition-colors">
                          BOTTED SAWTOOTH SPIKES
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                        FRAUD PATTERN
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      Unnatural staircase spikes, abrupt flatlines, and instant <span className="font-bold text-red-400">+56k view vertical cliffs</span> trip anti-bot inspection filters within milliseconds.
                    </p>
                  </div>

                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-neutral-950/60 to-neutral-900/40 border border-neutral-800 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-400 font-mono text-xs font-black flex items-center justify-center border border-red-500/30 shrink-0 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                          03
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-red-300 transition-colors">
                          BROKEN INTERACTION RATIOS
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                        0.11% RATIO
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      56,714 views delivered with only <span className="font-bold text-red-400">65 Likes &amp; 2 Comments</span> (dead ratio). Submission immediately rejected with <span className="font-bold text-red-400">$0.00 transferred</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modern Animated Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-neutral-400 font-mono uppercase tracking-wider text-[11px]">Moderation Action:</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-red-500/15 border border-red-500/35 text-red-400 font-mono font-black tracking-wider text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span>REJECTED • $0.00 PAID</span>
                </div>
              </div>
            </div>

            {/* Right Card: ✅ BotClips Algorithmic Bypass Engine */}
            <div className="rounded-3xl bg-[#0d0f14] border border-emerald-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group/card hover:border-emerald-500/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-5 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-7 w-7 rounded-xl bg-emerald-500 opacity-20" />
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight">BotClips Algorithmic Bypass Engine</h3>
                      <p className="text-xs text-neutral-400 font-medium">Score 0 Clean • Organic S-Curves • Verified Payout</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-black uppercase tracking-wider border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] flex items-center gap-1.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified &amp; Transferred</span>
                  </span>
                </div>

                {/* Real Approved Screenshot: Organic Graphs & Perfect Engagement */}
                <div 
                  onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/comparison-organic-breakdown.png")}
                  className="rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#07090e] relative group cursor-pointer mb-5 shadow-2xl transition-all hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                >
                  <div className="w-full aspect-[16/9] bg-black/90 flex items-center justify-center relative overflow-hidden">
                    <img loading="lazy" decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/comparison-organic-breakdown.png" 
                      alt="Whop Moderation Panel: Low Bot Score (0) & Organic Graphs" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-emerald-950/90 text-emerald-200 border border-emerald-700 text-xs font-extrabold backdrop-blur-md flex items-center gap-2 shadow-2xl group-hover:scale-105 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect Low Bot Score &amp; Organic Graphs</span>
                      </span>
                    </div>
                  </div>

                  {/* Modern Animated HUD Status Strip */}
                  <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-neutral-950/80 border-t border-emerald-900/50 text-xs flex items-center justify-between font-mono backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="tracking-wide text-emerald-300/90 font-bold uppercase text-[11px]">Whop Creator Rewards Clearance</span>
                    </div>
                    <span className="font-black text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      SCORE 0/100 • $37.05 APPROVED
                    </span>
                  </div>
                </div>

                {/* 3 Algorithmic Bypass Points with Modern High-Tech Cards */}
                <div className="space-y-3">
                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-emerald-950/30 via-neutral-900/50 to-neutral-950/70 border border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black flex items-center justify-center border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)] shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          01
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                          SPOTLESS BOT SCORE (GREEN SHIELD 0)
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                        CLEAN 0 INDEX
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      Flawless <span className="font-bold text-emerald-400">0/100 bot index</span> on Whop campaign moderation audit. Passed automated platform filters with instant 100% payment approval.
                    </p>
                  </div>

                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-neutral-950/60 to-neutral-900/40 border border-neutral-800 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-xs font-black flex items-center justify-center border border-emerald-500/30 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          02
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                          ORGANIC PARABOLIC S-CURVES
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        NATURAL RETENTION
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      Real parabolic retention curves (<span className="font-bold text-emerald-400">9.3k views, 315 likes, continuous watchtime</span>) mimicking genuine algorithmic FYP virality.
                    </p>
                  </div>

                  <div className="group relative rounded-2xl p-4 bg-gradient-to-r from-neutral-950/60 to-neutral-900/40 border border-neutral-800 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-xs font-black flex items-center justify-center border border-emerald-500/30 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          03
                        </div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                          PERFECT MULTI-SIGNAL ENGAGEMENT
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        HEALTHY 3.6% RATIO
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-8.5 group-hover:text-neutral-300 transition-colors">
                      24,665 views backed by <span className="font-bold text-emerald-400">885 likes, shares &amp; active creator comments</span>. Full payout guaranteed (<span className="font-bold text-emerald-400">$37.05+ transferred</span>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Modern Animated Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-neutral-400 font-mono uppercase tracking-wider text-[11px]">Whop Payout Result:</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-mono font-black tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>APPROVED • 100% TRANSFERRED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: REAL EARNINGS & CREATOR REVENUE PROOF SHOWCASE (USER SCREENSHOTS) ── */}
      <section className="py-24 bg-white border-b border-[#e9e9ec]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real User Screenshots & Revenue Dashboards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214]">
              Real Whop Earnings Generated with BotClips.
            </h2>
            <p className="text-[#6b7078] mt-3 text-base leading-relaxed">
              Actual business dashboards, $300 campaign approvals, lockscreen deposit notifications, and Tier 1 audience demographics submitted by our clippers.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* Card 1: Whop Lockscreen Stream */}
            <div 
              onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-lockscreen-payouts.jpg")}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black relative mb-3">
                  <img loading="lazy" decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-lockscreen-payouts.jpg" 
                    alt="Whop Lockscreen Payouts" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold">Zoom In</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900">Whop Payout Notification Stream</div>
                <p className="text-[11px] text-[#6b7078] mt-1">Continuous same-day payments: $380, $288, $189 directly from Content Rewards.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold">$1,487+ Stream</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Verified</span>
              </div>
            </div>

            {/* Card 2: $300 Approved Campaign */}
            <div 
              onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/content-reward-300-approved.jpg")}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black relative mb-3">
                  <img  decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/content-reward-300-approved.jpg" 
                    alt="Content Rewards $300 Approved" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold">Zoom In</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900">$300 Campaign Approval</div>
                <p className="text-[11px] text-[#6b7078] mt-1">3,866,908 views, 72,232 likes with Green Bot Shield (0). Approved by brand.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold">$300.00 Payout</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">Shield 0</span>
              </div>
            </div>

            {/* Card 3: ak47boss $5,230 Earned */}
            <div 
              onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-earning-5230.jpg")}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black relative mb-3">
                  <img loading="lazy" decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/whop-earning-5230.jpg" 
                    alt="ak47boss $5,230 Earned" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold">Zoom In</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900">Whop Dashboard: $5,230.44</div>
                <p className="text-[11px] text-[#6b7078] mt-1">Top clipper business dashboard verified on Whop using BotClips views.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold">$5,230.44</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">Business</span>
              </div>
            </div>

            {/* Card 4: Tier 1 Audience USA */}
            <div 
              onClick={() => setSelectedImageModal("https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/tier1-usa-audience.jpg")}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black relative mb-3">
                  <img  decoding="async" src="https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/proofs/tier1-usa-audience.jpg" 
                    alt="Tier 1 USA Audience" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold">Zoom In</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-900">48.4% USA Demographics</div>
                <p className="text-[11px] text-[#6b7078] mt-1">Tier 1 country audience distribution required to clear brand campaign audits.</p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-bold">USA + UK (72%)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">Tier 1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHOP AI BOT DETECTION SCALE (0-100+) ── */}
      <section id="bot-score" className="py-24 bg-[#fafafa] border-b border-[#e9e9ec]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Verification Matrix</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214]">
              Whop & Campaign AI Bot Score Meter.
            </h2>
            <p className="text-[#6b7078] mt-3 text-base leading-relaxed">
              Moderation algorithms categorize every submitted link into 6 distinct bot score tiers. Here is how submissions are evaluated and why BotClips guarantees the 0–20 Safe Zone.
            </p>
          </div>

          {/* Scale Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whopScoreTiers.map((tier, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
                      {tier.range}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${tier.badgeClass}`}>
                      {tier.badge}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden mb-4">
                    <div className={`h-full ${tier.barClass} rounded-full`} style={{ width: `${(idx + 1) * 16.6}%` }} />
                  </div>

                  <div className="text-sm font-bold text-neutral-800 mb-1">
                    {tier.label}
                  </div>
                  <p className="text-xs text-[#6b7078] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Platform Action:</span>
                  <span className="font-bold text-neutral-900">{tier.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout Banner */}
          <div className="mt-10 p-6 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">BotClips 100% Safe Zone Guarantee</h4>
                <p className="text-xs text-neutral-600">Every campaign view order includes micro-jitter timing and coordinated likes to maintain scores below 20.</p>
              </div>
            </div>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
            >
              Start Safe Order
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: LIVE SCREEN RECORDINGS & VIDEO PROOFS ── */}
      <section id="video-demos" className="py-24 bg-white border-b border-[#e9e9ec]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-black uppercase tracking-wider mb-3">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Demonstration Recordings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214]">
              Watch Real Whop Payouts in Action.
            </h2>
            <p className="text-[#6b7078] mt-3 text-base leading-relaxed">
              Inspect unedited screen recordings of creator submissions being verified, approved, and paid out with green bot risk shields.
            </p>
          </div>

          {/* Video Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {demoVideos.map((vid, idx) => (
              <button
                key={vid.id}
                onClick={() => setActiveVideoTab(idx)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeVideoTab === idx
                    ? "bg-[#111214] text-white shadow-lg shadow-neutral-900/20 scale-[1.02]"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${activeVideoTab === idx ? "text-blue-400 fill-blue-400" : "text-neutral-400"}`} />
                <span>Video {vid.id}: {vid.tag}</span>
                <span className="text-[10px] opacity-70 font-mono">({vid.duration})</span>
              </button>
            ))}
          </div>

          {/* Active Video Player Showcase */}
          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Video Player (Left 8 cols) */}
              <div className="lg:col-span-8 rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-neutral-800">
                <video
                  key={demoVideos[activeVideoTab].src}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  preload="none"
                >
                  <source src={demoVideos[activeVideoTab].src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Details & Telemetry (Right 4 cols) */}
              <div className="lg:col-span-4 text-white space-y-5 p-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs border border-blue-500/30">
                  <span>Recording #{demoVideos[activeVideoTab].id}</span>
                  <span>•</span>
                  <span>{demoVideos[activeVideoTab].duration}</span>
                </div>

                <h3 className="text-xl font-bold leading-snug">
                  {demoVideos[activeVideoTab].title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {demoVideos[activeVideoTab].caption}
                </p>

                {/* Telemetry Metrics */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-neutral-400">Whop Bot Score:</span>
                    <span className="text-emerald-400 font-bold">{demoVideos[activeVideoTab].metrics.botScore}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-neutral-400">Payout Status:</span>
                    <span className="text-white font-bold">{demoVideos[activeVideoTab].metrics.payout}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Retention Signal:</span>
                    <span className="text-blue-400 font-bold">{demoVideos[activeVideoTab].metrics.retention}</span>
                  </div>
                </div>

                <Link
                  href="/signup"
                  className="block text-center w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-extrabold text-xs transition-colors"
                >
                  Get BotClips Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: 10 VERIFIED CLIENT PAYOUT PROOFS GRID ── */}
      <section id="analytics" className="py-24 bg-[#f7f7f8] border-b border-[#e9e9ec]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>10 Verified Submissions & Approvals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111214]">
              Verified Client Payout Proofs.
            </h2>
            <p className="text-[#6b7078] mt-3 text-base leading-relaxed">
              Every order delivered with 3–7s retention, 0-drop stability, and 0 bot risk rating. Filter across Whop Payouts, Content Rewards, Reels, TikTok, and X.
            </p>
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
              <span>Top Payouts ($30+ & Streams)</span>
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

          {/* 10 Proofs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProofs.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => setSelectedProofIndex(idx)}
                className="group cursor-pointer bg-white rounded-2xl p-3 shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      item.platform.includes("Instagram")
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : item.platform.includes("Whop")
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
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
                    <img loading="lazy" decoding="async" src={item.src} 
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
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
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{item.title}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>{item.views}</span>
                    <span>{item.likes}</span>
                    <span className="text-emerald-600">Shield 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Consistency SVG Graph */}
          <div className="mt-14 p-7 rounded-2xl border border-[#e9e9ec] bg-white shadow-sm">
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

                {/* Animated active pulse beacon */}
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
                Paste your TikTok, Shorts, or Instagram Reel clipping submission link and select your desired volume.
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
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Micro-Jitter Retention</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Views are watched for 3 to 7 genuine seconds with randomized interval pacing, creating human FYP curves.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#e9e9ec] bg-white relative">
              <span className="text-xs font-black text-blue-600 block mb-3">STEP 04</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Collect Rewards</h3>
              <p className="text-sm text-[#6b7078] leading-relaxed">
                Submit on Whop, ContentReward, or Clipster. Clear compliance reviews smoothly and claim your earnings.
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
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm sm:text-base text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer"
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
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-semibold text-neutral-700">Founders: Jack & Daniel 🍾🍷</span>
            <Link href="/login" className="hover:text-neutral-900 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-neutral-900 transition-colors">Register</Link>
            <span>© {new Date().getFullYear()} BotClips. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ── INTERACTIVE LIGHTBOX MODAL (FOR ALL PROOF SCREENSHOTS) ── */}
      {selectedProofIndex !== null && allProofs[selectedProofIndex] && (
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
                  Proof {selectedProofIndex + 1} of {allProofs.length}
                </span>
                <span className="h-4 w-px bg-slate-700" />
                <span className="text-xs font-bold text-white">
                  {allProofs[selectedProofIndex].platform}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  {allProofs[selectedProofIndex].payout} Approved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProofIndex((selectedProofIndex - 1 + allProofs.length) % allProofs.length)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Previous Proof"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedProofIndex((selectedProofIndex + 1) % allProofs.length)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Next Proof"
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
              <img loading="lazy" decoding="async" src={allProofs[selectedProofIndex].src} 
                alt={allProofs[selectedProofIndex].title} 
                className="max-h-[60vh] w-auto max-w-full rounded-lg shadow-xl object-contain" 
              />
            </div>

            {/* Modal Bottom Details Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{allProofs[selectedProofIndex].title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {allProofs[selectedProofIndex].badge}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                  {allProofs[selectedProofIndex].caption}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200">
                    {allProofs[selectedProofIndex].views}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {allProofs[selectedProofIndex].likes} • 0 Bot Risk
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

      {/* ── SINGLE IMAGE MODAL (ZOOM FOR COMPARISON / DASHBOARDS) ── */}
      {selectedImageModal && (
        <div 
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <span className="text-xs font-bold text-white">Full Screenshot Inspection</span>
              <button 
                onClick={() => setSelectedImageModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative bg-black flex items-center justify-center p-3 max-h-[75vh] overflow-hidden">
              <img loading="lazy" decoding="async" src={selectedImageModal} 
                alt="Full Screenshot Inspection" 
                className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl object-contain" 
              />
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY MOBILE BOTTOM ACTION BANNER ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <div className="text-[11px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Undetected Views from ₹50</span>
          </div>
          <div className="text-[12px] font-extrabold text-neutral-900 leading-tight">
            Whop 0/100 Bot Score
          </div>
        </div>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1 shrink-0"
        >
          <span>Launch Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
