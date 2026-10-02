"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Wallet,
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  RefreshCw,
  Calendar,
  Share2,
  Heart,
  Eye,
  Bookmark,
  Repeat,
  Trash2,
  Clipboard,
  Check,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  ExternalLink,
  Shield
} from "lucide-react";
import HybridGrowthGraph, { HybridSlotPoint, METRIC_COLORS } from "@/components/HybridGrowthGraph";
import {
  calculateBimodalWeights,
  distributeBimodalOrganic,
  generateMultiplierSequence,
  VIRAL_RATIO_PRESETS,
  generateAiViralStrategy,
  AiViralStrategy,
  NICHE_COMMENT_BANKS,
} from "@/lib/hybrid-algorithms";

// Safe ratio thresholds inspired by authentic platform algorithmic discovery
const SAFE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  likes:    { min: 4.0, max: 8.0, label: "4% – 8%" },
  comments: { min: 0.1, max: 0.5, label: "0.1% – 0.5%" },
  reposts:  { min: 0.5, max: 2.0, label: "0.5% – 2%" },
  shares:   { min: 1.0, max: 3.0, label: "1% – 3%" },
  saves:    { min: 2.0, max: 5.0, label: "2% – 5%" },
};

function getRatioStatus(key: string, val: number): { status: "safe" | "low" | "high"; color: string; bg: string; border: string; label: string } {
  const r = SAFE_RANGES[key];
  if (!r) return { status: "safe", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "SAFE" };
  if (val < r.min) return { status: "low", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "LOW" };
  if (val > r.max) return { status: "high", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "HIGH" };
  return { status: "safe", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "SAFE" };
}

// Parse "LIVE SEQUENCE PREVIEW" pasted text into pulses
function parseSequenceText(text: string): HybridSlotPoint[] | null {
  const num = (block: string, key: string) => {
    const m = block.match(new RegExp(key + "[:\\s]+([\\d,]+)", "i"));
    return m ? parseInt(m[1].replace(/,/g, "")) : 0;
  };

  const extractComments = (block: string): string[] => {
    const lines = block.split("\n");
    const comments: string[] = [];
    let inCommentSection = false;
    const METRIC_KEYS = /^(slot|views?|likes?|reposts?|shares?|saves?)\s*[\d:(]/i;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { inCommentSection = false; continue; }
      const commentKeyMatch = line.match(/^comments?\s*\d*\s*:\s*(.+)/i);
      if (commentKeyMatch) {
        const val = commentKeyMatch[1].trim();
        if (val && !/^\d+$/.test(val)) comments.push(val);
        inCommentSection = true;
        continue;
      }
      const bareHeader = line.match(/^comments?\s*:?\s*$/i);
      if (bareHeader) { inCommentSection = true; continue; }
      if (inCommentSection && !METRIC_KEYS.test(line)) { comments.push(line); continue; }
      if (METRIC_KEYS.test(line)) inCommentSection = false;
    }
    return comments;
  };

  const blocks = text.split(/(?=SLOT\s+\d+)/i).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 0) return null;

  const result: HybridSlotPoint[] = [];
  for (const block of blocks) {
    const slotMatch = block.match(/SLOT\s+(\d+)(?:\s*\(([^)]*)\))?/i);
    if (!slotMatch) continue;
    const slotIndex = parseInt(slotMatch[1]);
    const timeStr = slotMatch[2] || "";
    let offsetMinutes: number = slotIndex * 72;
    if (timeStr && timeStr.trim()) {
      const h = timeStr.match(/(\d+)\s*h/i);
      const m = timeStr.match(/(\d+)\s*m/i);
      offsetMinutes = (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    }
    const commentLines = extractComments(block);
    const numericComments = num(block, "Comments");
    const commentCount = commentLines.length > 0 ? commentLines.length : numericComments;
    result.push({
      slotIndex,
      offsetMinutes,
      views: num(block, "Views"),
      likes: num(block, "Likes"),
      comments: commentCount,
      shares: num(block, "Shares"),
      saves: num(block, "Saves"),
      reposts: num(block, "Reposts"),
      commentLines: commentLines.length > 0 ? commentLines : undefined,
    } as any);
  }
  return result.length > 0 ? result : null;
}

export default function HybridAutomationPage() {
  // Plan & User Status
  const [planLoading, setPlanLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Active top navigation / workflow mode
  const [activeTab, setActiveTab] = useState<"creator" | "campaigns">("creator");
  const [activeSubMode, setActiveSubMode] = useState<"default" | "scheduled" | "multi_panel" | "auto" | "ratio" | "custom">("default");

  // Campaign Form State
  const [mode, setMode] = useState<"bimodal_curve" | "multiplier_auto" | "custom_slots">("bimodal_curve");
  const [campaignName, setCampaignName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [totalViews, setTotalViews] = useState(25000);
  const [slotsCount, setSlotsCount] = useState(12);
  const [intervalMinutes, setIntervalMinutes] = useState(72);
  const [multiplier, setMultiplier] = useState(1.5);
  const [ratioPreset, setRatioPreset] = useState<"BALANCED" | "HIGH_ENGAGEMENT" | "STEALTH_LOW" | "CUSTOM">("BALANCED");
  const [customCommentText, setCustomCommentText] = useState("");

  // Min Pulse Views (Provider Minimum Threshold Enforcement)
  const [minPulseViews, setMinPulseViews] = useState(100);

  // AI Viral Growth Strategist State
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPlatformGoal, setAiPlatformGoal] = useState<"TIKTOK_FYP" | "INSTAGRAM_REELS" | "WHOP_FUNNEL" | "YOUTUBE_SHORTS" | "STEALTH_ORGANIC">("TIKTOK_FYP");
  const [aiNiche, setAiNiche] = useState("trading");
  const [activeAiStrategy, setActiveAiStrategy] = useState<AiViralStrategy | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Custom Ratio Sliders (Percentages)
  const [customLikesPct, setCustomLikesPct] = useState(4.0);
  const [customCommentsPct, setCustomCommentsPct] = useState(0.5);
  const [customSharesPct, setCustomSharesPct] = useState(1.5);
  const [customSavesPct, setCustomSavesPct] = useState(2.0);
  const [customRepostsPct, setCustomRepostsPct] = useState(0.5);

  // Base metrics for Multiplier mode
  const [baseMetrics, setBaseMetrics] = useState({
    views: 500,
    likes: 25,
    comments: 2,
    shares: 8,
    saves: 15,
    reposts: 2,
  });

  // Manual slots override (from sequence paste or custom slot editing)
  const [customManualSlots, setCustomManualSlots] = useState<HybridSlotPoint[] | null>(null);

  // Sequence Paste Box state
  const [pasteOpen, setPasteOpen] = useState(false);
  const [sequencePasteText, setSequencePasteText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState<string | null>(null);

  // UI state
  const [inspectSlots, setInspectSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active campaigns list & details
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [campaignActionLoading, setCampaignActionLoading] = useState<string | null>(null);

  // Section reference for smooth scroll
  const sectionRef = useRef<HTMLDivElement>(null);

  // Load plan and balance
  const loadPlanAndBalance = async () => {
    try {
      setPlanLoading(true);
      const res = await fetch("/api/hybrid/plan");
      const data = await res.json();
      if (data.success) {
        setHasAccess(data.hasAccess);
        setPricing(data.pricing);
        setUserBalance(Number(data.balance || 0));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlanLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const res = await fetch("/api/hybrid/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadPlanAndBalance();
    loadCampaigns();
    const handleBalanceUpdate = () => loadPlanAndBalance();
    window.addEventListener("balance_updated", handleBalanceUpdate);
    return () => window.removeEventListener("balance_updated", handleBalanceUpdate);
  }, []);

  // Purchase VIP Subscription
  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      setSubscribeError(null);
      const res = await fetch("/api/hybrid/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setSubscribeError(data.error || "Failed to subscribe");
      } else {
        setHasAccess(true);
        loadPlanAndBalance();
        window.dispatchEvent(new Event("balance_updated"));
      }
    } catch (err: any) {
      setSubscribeError(err.message || "Network error");
    } finally {
      setSubscribing(false);
    }
  };

  // Top Action Button Handlers
  const handleTopButton = (btn: "creator" | "campaigns" | "scheduled" | "multi_panel" | "auto" | "ratio" | "custom" | "ai") => {
    if (btn === "campaigns") {
      setActiveTab("campaigns");
      setActiveSubMode("default");
      loadCampaigns();
      return;
    }

    setActiveTab("creator");

    if (btn === "ai") {
      setActiveSubMode("default");
      setAiPanelOpen(true);
    } else if (btn === "creator") {
      setActiveSubMode("default");
      setMode("bimodal_curve");
      setCustomManualSlots(null);
    } else if (btn === "scheduled") {
      setActiveSubMode("scheduled");
      setCustomManualSlots(null);
    } else if (btn === "multi_panel") {
      setActiveSubMode("multi_panel");
      setMode("custom_slots");
    } else if (btn === "auto") {
      setActiveSubMode("auto");
      setMode("multiplier_auto");
      setCustomManualSlots(null);
    } else if (btn === "ratio") {
      setActiveSubMode("ratio");
      setCustomManualSlots(null);
    } else if (btn === "custom") {
      setActiveSubMode("custom");
      setMode("custom_slots");
      setInspectSlots(true);
    }

    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Run AI Viral Growth Strategist Engine
  const handleRunAiStrategist = (targetGoal = aiPlatformGoal, targetNiche = aiNiche) => {
    setAiGenerating(true);
    setAiSuccessMessage(null);
    try {
      const strat = generateAiViralStrategy(targetGoal, targetNiche);
      setActiveAiStrategy(strat);
      setMode("bimodal_curve");
      setTotalViews(strat.totalViews);
      setSlotsCount(strat.slotsCount);
      setIntervalMinutes(strat.intervalMinutes);
      setMinPulseViews(strat.minPulseViews);
      setRatioPreset("CUSTOM");
      setCustomLikesPct(strat.likesPct);
      setCustomCommentsPct(strat.commentsPct);
      setCustomSharesPct(strat.sharesPct);
      setCustomSavesPct(strat.savesPct);
      setCustomRepostsPct(strat.repostsPct);
      setCustomCommentText(strat.comments.join("\n"));
      setCustomManualSlots(null);
      setAiSuccessMessage(`⚡ AI Plan Generated: ${strat.name}! Optimal curves and ${strat.comments.length} authentic niche comments configured.`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle Parse Live Sequence Text
  const handleApplySequencePaste = () => {
    setPasteError(null);
    setPasteSuccess(null);
    if (!sequencePasteText.trim()) {
      setPasteError("Please paste live sequence text first.");
      return;
    }

    const parsed = parseSequenceText(sequencePasteText);
    if (!parsed || parsed.length === 0) {
      setPasteError("Unable to detect pulses. Ensure text contains 'SLOT 0...', 'views:', etc.");
      return;
    }

    setCustomManualSlots(parsed);
    setSlotsCount(parsed.length);
    setMode("custom_slots");
    setInspectSlots(true);
    const sumViews = parsed.reduce((acc, s) => acc + Number(s.views || 0), 0);
    setTotalViews(sumViews > 0 ? sumViews : 10000);
    setPasteSuccess(`Successfully imported ${parsed.length} pulses with custom metrics!`);
    setTimeout(() => setPasteOpen(false), 1500);
  };

  // Manual Pulse Editing Functions
  const handleAddPulse = () => {
    const current = generatedSlots;
    if (current.length >= 24) return;
    const newIdx = current.length;
    const lastSlot = current[current.length - 1];
    const newSlot: HybridSlotPoint = {
      slotIndex: newIdx,
      views: lastSlot ? lastSlot.views : 1000,
      likes: lastSlot ? lastSlot.likes : 40,
      comments: lastSlot ? lastSlot.comments : 2,
      shares: lastSlot ? lastSlot.shares : 10,
      saves: lastSlot ? lastSlot.saves : 20,
      reposts: lastSlot ? lastSlot.reposts : 5,
      offsetMinutes: newIdx * intervalMinutes,
    } as any;
    setCustomManualSlots([...current, newSlot]);
    setSlotsCount(current.length + 1);
  };

  const handleRemovePulse = () => {
    const current = generatedSlots;
    if (current.length <= 1) return;
    const updated = current.slice(0, -1);
    setCustomManualSlots(updated);
    setSlotsCount(updated.length);
  };

  const handleUpdatePulseMetric = (slotIdx: number, field: string, val: number) => {
    const current = [...generatedSlots];
    if (current[slotIdx]) {
      current[slotIdx] = { ...current[slotIdx], [field]: Math.max(0, val) };
      setCustomManualSlots(current);
    }
  };

  // Generate Slots dynamically based on selected Mode or Custom Slots
  const generatedSlots: HybridSlotPoint[] = useMemo(() => {
    if (customManualSlots && customManualSlots.length > 0) {
      return customManualSlots.map(s => ({
        ...s,
        views: Math.max(minPulseViews, Number(s.views || 0))
      }));
    }

    const commentsPool = customCommentText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    if (mode === "bimodal_curve") {
      const viewDist = distributeBimodalOrganic(totalViews, slotsCount, minPulseViews);
      const ratios = ratioPreset === "CUSTOM" 
        ? {
            likesRatio: customLikesPct / 100,
            commentsRatio: customCommentsPct / 100,
            sharesRatio: customSharesPct / 100,
            savesRatio: customSavesPct / 100,
            repostsRatio: customRepostsPct / 100,
          }
        : VIRAL_RATIO_PRESETS[ratioPreset];

      return viewDist.map((rawViews, idx) => {
        const views = Math.max(minPulseViews, rawViews);
        const likes = Math.max(0, Math.round(views * ratios.likesRatio));
        const comments = Math.max(0, Math.round(views * ratios.commentsRatio));
        const shares = Math.max(0, Math.round(views * ratios.sharesRatio));
        const saves = Math.max(0, Math.round(views * ratios.savesRatio));
        const reposts = Math.max(0, Math.round(views * ratios.repostsRatio));

        // Stagger custom comments
        let slotComments: string[] | undefined = undefined;
        if (commentsPool.length > 0 && comments > 0) {
          slotComments = [];
          const startIdx = idx * 2;
          slotComments.push(commentsPool[startIdx % commentsPool.length]);
          if (comments >= 5 && commentsPool.length > 1) {
            slotComments.push(commentsPool[(startIdx + 1) % commentsPool.length]);
          }
        }

        return {
          slotIndex: idx,
          views,
          likes,
          comments,
          shares,
          saves,
          reposts,
          offsetMinutes: idx * intervalMinutes,
          commentLines: slotComments,
        } as any;
      });
    }

    if (mode === "multiplier_auto") {
      const seq = generateMultiplierSequence(baseMetrics, slotsCount, multiplier, minPulseViews);
      return seq.map((s, idx) => ({
        ...s,
        views: Math.max(minPulseViews, s.views),
        offsetMinutes: idx * intervalMinutes,
      }));
    }

    // Custom Slots default / Multi-Node
    return Array.from({ length: slotsCount }, (_, idx) => {
      const views = Math.max(minPulseViews, Math.round(totalViews / slotsCount));
      return {
        slotIndex: idx,
        views,
        likes: Math.round(views * (customLikesPct / 100)),
        comments: Math.max(1, Math.round(views * (customCommentsPct / 100))),
        shares: Math.round(views * (customSharesPct / 100)),
        saves: Math.round(views * (customSavesPct / 100)),
        reposts: Math.round(views * (customRepostsPct / 100)),
        offsetMinutes: idx * intervalMinutes,
      };
    });
  }, [
    customManualSlots,
    mode, 
    totalViews, 
    slotsCount, 
    intervalMinutes, 
    minPulseViews,
    ratioPreset, 
    customLikesPct, 
    customCommentsPct, 
    customSharesPct, 
    customSavesPct, 
    customRepostsPct, 
    baseMetrics, 
    multiplier, 
    customCommentText
  ]);

  // Real-time Cost Estimation
  const estimatedCost = useMemo(() => {
    const rateViews = 7.5 / 1000;
    const rateLikes = 10.5 / 1000;
    const rateComments = 345.0 / 1000;
    const rateShares = 2.0 / 1000;
    const rateSaves = 0.002;
    const rateReposts = 0.005;

    let total = 0;
    for (const slot of generatedSlots) {
      total += (Number(slot.views || 0) * rateViews);
      total += (Number(slot.likes || 0) * rateLikes);
      total += (Number(slot.comments || 0) * rateComments);
      total += (Number(slot.shares || 0) * rateShares);
      total += (Number(slot.saves || 0) * rateSaves);
      total += (Number(slot.reposts || 0) * rateReposts);
    }
    return Number(total.toFixed(2));
  }, [generatedSlots]);

  // Campaign Actions (Pause, Resume, Delete, Retry Pulse)
  const toggleCampaignExpansion = async (campaignId: string) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      setCampaignDetails(null);
      return;
    }
    setExpandedCampaignId(campaignId);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/hybrid/campaigns/${campaignId}`);
      const data = await res.json();
      if (data.success) {
        setCampaignDetails(data.campaign);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: "pause" | "resume" | "delete" | "retry_slot", slotIndex?: number) => {
    try {
      setCampaignActionLoading(`${action}-${campaignId}-${slotIndex ?? ""}`);
      if (action === "delete") {
        if (!confirm("Are you sure you want to cancel this campaign? All pending pulses will be cancelled.")) return;
        const res = await fetch(`/api/hybrid/campaigns/${campaignId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          loadCampaigns();
          if (expandedCampaignId === campaignId) {
            setExpandedCampaignId(null);
            setCampaignDetails(null);
          }
        }
        return;
      }

      const res = await fetch(`/api/hybrid/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slotIndex }),
      });
      const data = await res.json();
      if (data.success) {
        loadCampaigns();
        // Refresh details if expanded
        if (expandedCampaignId === campaignId) {
          const refRes = await fetch(`/api/hybrid/campaigns/${campaignId}`);
          const refData = await refRes.json();
          if (refData.success) setCampaignDetails(refData.campaign);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignActionLoading(null);
    }
  };

  // Submit Campaign Launch
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!videoUrl || !videoUrl.trim().startsWith("http")) {
      setSubmitError("Please enter a valid target video URL.");
      return;
    }

    if (userBalance < estimatedCost) {
      setSubmitError(`Insufficient wallet balance. Required: ₹${estimatedCost}, Available: ₹${userBalance.toFixed(2)}. Please add funds.`);
      return;
    }

    try {
      setSubmitting(true);
      const activeRatios = ratioPreset === "CUSTOM"
        ? {
            likesRatio: customLikesPct / 100,
            commentsRatio: customCommentsPct / 100,
            sharesRatio: customSharesPct / 100,
            savesRatio: customSavesPct / 100,
            repostsRatio: customRepostsPct / 100,
          }
        : VIRAL_RATIO_PRESETS[ratioPreset];

      const res = await fetch("/api/hybrid/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName || `HYBRID-${Date.now().toString().slice(-6)}`,
          videoUrl: videoUrl.trim(),
          mode,
          intervalMinutes,
          multiplier,
          slots: generatedSlots,
          ratios: activeRatios,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to launch campaign");
      } else {
        setSubmitSuccess(data.message);
        loadCampaigns();
        loadPlanAndBalance();
        window.dispatchEvent(new Event("balance_updated"));
        setActiveTab("campaigns");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hybrid Automation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              VIP Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dual-Peak Bimodal Gaussian curves & multi-node metric dispersion engineered for Whop clippers & viral creators.
          </p>
        </div>

        {/* Live Balance Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Wallet Balance</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">₹{userBalance.toFixed(2)}</span>
            </div>
            <Link
              href="/dashboard/wallet"
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors"
            >
              Deposit
            </Link>
          </div>
        </div>
      </div>

      {/* ── SUBSCRIPTION VIP LOCK SCREEN ── */}
      {!planLoading && !hasAccess && (
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-blue-950/20 dark:via-[#111827] dark:to-[#111827] p-8 sm:p-12 text-center shadow-lg">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Exclusive VIP Feature
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Unlock Hybrid Algorithmic Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The exact multi-node automation system used by top Whop clippers to hit TikTok FYP and Instagram Explore.
                Includes non-linear dual-bell curve dispersion, autonomous multipliers, and multi-provider failover.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-blue-200 dark:border-blue-900/50 shadow-sm flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Subscription</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {pricing?.formattedPrice || "₹50"}
                </span>
                <span className="text-[10px] text-slate-400 block">/ 30 Days</span>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your Balance</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{userBalance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block">Instant activation</span>
              </div>
            </div>

            {subscribeError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{subscribeError}</span>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
            >
              {subscribing ? "Activating VIP Access..." : `Subscribe for ${pricing?.formattedPrice || "₹4,800"}`}
            </button>
          </div>
        </div>
      )}

      {/* ── UNLOCKED STATE: HYBRID AUTOMATION WORKSTATION ── */}
      {!planLoading && hasAccess && (
        <div ref={sectionRef} className="space-y-6">
          {/* Top Horizontal Workflow Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {/* 1. Launch Campaign Button */}
            <button
              onClick={() => handleTopButton("creator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "creator" && activeSubMode === "default"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>

            {/* 2. Active Campaigns Counter */}
            <button
              onClick={() => handleTopButton("campaigns")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "campaigns"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Active Campaigns ({campaigns.length})</span>
            </button>

            {/* 3. SCHEDULED Button */}
            <button
              onClick={() => handleTopButton("scheduled")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "creator" && activeSubMode === "scheduled"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>SCHEDULED</span>
            </button>

            {/* 4. MULTI - PANEL Button */}
            <button
              onClick={() => handleTopButton("multi_panel")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "creator" && (activeSubMode === "multi_panel" || mode === "custom_slots")
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>MULTI - PANEL</span>
            </button>

            {/* 5. AUTO Multiplier Button */}
            <button
              onClick={() => handleTopButton("auto")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "creator" && (activeSubMode === "auto" || mode === "multiplier_auto")
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>AUTO</span>
            </button>

            {/* 6. RATIO Button */}
            <button
              onClick={() => handleTopButton("ratio")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "creator" && activeSubMode === "ratio"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>RATIO</span>
            </button>

            {/* 7. CUSTOM Slots Button */}
            <button
              onClick={() => handleTopButton("custom")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                activeTab === "creator" && activeSubMode === "custom"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>CUSTOM</span>
            </button>

            {/* 8. AI STRATEGIST Button */}
            <button
              onClick={() => handleTopButton("ai")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider ${
                aiPanelOpen
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40"
                  : "bg-white dark:bg-[#111827] text-purple-600 dark:text-purple-400 hover:border-purple-400 border border-purple-200 dark:border-purple-900/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              <span>AI STRATEGIST</span>
            </button>
          </div>

          {activeTab === "creator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration Controls */}
              <div className="lg:col-span-6 space-y-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Campaign Configuration</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Select delivery curve and configure staged pulse parameters.
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {mode === "bimodal_curve" ? "Viral Wave" : mode === "multiplier_auto" ? "Autonomous 2.0x" : "Multi-Node"}
                    </span>
                  </div>

                  {/* ── AI VIRAL GROWTH STRATEGIST (AUTONOMOUS ENGINE) ── */}
                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>AI Viral Growth Strategist</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              SMART ALGO
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Auto-calculate optimal curve, golden ratios & 15+ authentic niche comments.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAiPanelOpen(!aiPanelOpen)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{aiPanelOpen ? "Close AI" : "Open AI"}</span>
                        {aiPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {aiPanelOpen && (
                      <div className="pt-3 border-t border-purple-500/20 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                              Target Platform & Algorithmic Goal
                            </label>
                            <select
                              value={aiPlatformGoal}
                              onChange={(e) => setAiPlatformGoal(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="TIKTOK_FYP">🚀 TikTok FYP (High Shares & Saves)</option>
                              <option value="INSTAGRAM_REELS">📸 Instagram Explore (Saves Heavy)</option>
                              <option value="WHOP_FUNNEL">💼 Whop High-Ticket (Authority Comments)</option>
                              <option value="YOUTUBE_SHORTS">▶️ YouTube Shorts Shelf Breakout</option>
                              <option value="STEALTH_ORGANIC">🛡️ Ultra-Stealth Anti-Drop Organic Drift</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                              Target Content Niche
                            </label>
                            <select
                              value={aiNiche}
                              onChange={(e) => setAiNiche(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="trading">📈 Trading, Forex & Crypto</option>
                              <option value="ecommerce">🛍️ E-commerce & Dropshipping</option>
                              <option value="fitness">💪 Fitness & Bodybuilding</option>
                              <option value="motivation">🧠 Mindset & Wealth Motivation</option>
                              <option value="ai_saas">🤖 AI Tools & Software</option>
                              <option value="general_viral">🔥 General Viral Entertainment</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleRunAiStrategist(aiPlatformGoal, aiNiche)}
                            disabled={aiGenerating}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-purple-500/25 hover:opacity-95 cursor-pointer disabled:opacity-50 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{aiGenerating ? "Generating..." : "⚡ Generate AI Optimized Campaign"}</span>
                          </button>

                          {activeAiStrategy && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>AI Active ({activeAiStrategy.platform})</span>
                            </span>
                          )}
                        </div>

                        {aiSuccessMessage && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                            <span>{aiSuccessMessage}</span>
                          </div>
                        )}

                        {activeAiStrategy && (
                          <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-500/20 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                                <span>{activeAiStrategy.rationale.targetAlgorithm}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-500/20">
                                Safety: {activeAiStrategy.rationale.safetyRating}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              <strong className="text-purple-600 dark:text-purple-400">Viral Trigger: </strong>
                              {activeAiStrategy.rationale.viralTrigger}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              <strong>Retention & Anti-Ban: </strong>
                              {activeAiStrategy.rationale.predictedRetention}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Algorithmic Pacing Model
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("bimodal_curve");
                          setActiveSubMode("default");
                          setCustomManualSlots(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          mode === "bimodal_curve"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Viral Wave</span>
                        <span className="text-[9px] opacity-80 font-normal">Dual-Peak Bell</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMode("multiplier_auto");
                          setActiveSubMode("auto");
                          setCustomManualSlots(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          mode === "multiplier_auto"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Multiplier</span>
                        <span className="text-[9px] opacity-80 font-normal">Smart Sequence</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMode("custom_slots");
                          setActiveSubMode("multi_panel");
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          mode === "custom_slots"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Multi-Node</span>
                        <span className="text-[9px] opacity-80 font-normal">Custom Slots</span>
                      </button>
                    </div>
                  </div>

                  {/* Video URL & Campaign Name */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Target Video Link (TikTok / Instagram / YouTube)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.tiktok.com/@user/video/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Campaign Designation
                      </label>
                      <input
                        type="text"
                        placeholder="OP-ALPHA-VIRAL-01"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Paste Live Sequence Preview Box (Like Chand) */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPasteOpen(!pasteOpen)}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Paste Live Sequence Preview (Direct Import)</span>
                        {pasteOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {customManualSlots && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomManualSlots(null);
                            setPasteSuccess(null);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                        >
                          Reset to Generator
                        </button>
                      )}
                    </div>

                    {pasteOpen && (
                      <div className="space-y-2 pt-2 border-t border-blue-500/20">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Paste sequence text formatted like <code className="text-blue-600 font-mono">SLOT 0 (0hr) Views: 1000 Likes: 40...</code>. It will auto-populate all pulses.
                        </p>
                        <textarea
                          rows={4}
                          value={sequencePasteText}
                          onChange={(e) => setSequencePasteText(e.target.value)}
                          placeholder={"SLOT 0 (0hr)\nviews: 1200\nlikes: 50\ncomments:\nAwesome clip!\n\nSLOT 1 (1hr 12m)\nviews: 2400\nlikes: 100"}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        {pasteError && (
                          <div className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{pasteError}</span>
                          </div>
                        )}
                        {pasteSuccess && (
                          <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 shrink-0" />
                            <span>{pasteSuccess}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleApplySequencePaste}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Parse & Apply Slots
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mode-Specific Parameters */}
                  {mode === "bimodal_curve" && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Total Views Target
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono font-black text-sm">
                            {totalViews.toLocaleString()} Views
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="250000"
                          step="1000"
                          value={totalViews}
                          onChange={(e) => setTotalViews(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                            Injection Slots
                          </label>
                          <select
                            value={slotsCount}
                            onChange={(e) => {
                              setSlotsCount(Number(e.target.value));
                              setCustomManualSlots(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          >
                            <option value="6">6 Pulses (Rapid Sprint)</option>
                            <option value="10">10 Pulses (Optimal Curve)</option>
                            <option value="12">12 Pulses (Recommended)</option>
                            <option value="18">18 Pulses (High Stealth)</option>
                            <option value="24">24 Pulses (Full 24-48h Spread)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                            Interval Between Slots
                          </label>
                          <select
                            value={intervalMinutes}
                            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          >
                            <option value="30">Every 30 Minutes (Rapid)</option>
                            <option value="60">Every 60 Minutes (Hourly)</option>
                            <option value="72">Every 72 Minutes (Default)</option>
                            <option value="120">Every 2 Hours (Steady Climb)</option>
                            <option value="180">Every 3 Hours (Deep Stealth)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Min Views / Pulse</span>
                            <span className="text-[9px] text-blue-500 font-normal">Provider Guard</span>
                          </label>
                          <select
                            value={minPulseViews}
                            onChange={(e) => setMinPulseViews(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          >
                            <option value="100">100 Views (Provider Min)</option>
                            <option value="150">150 Views (Safe Velocity)</option>
                            <option value="250">250 Views (High Traffic)</option>
                            <option value="500">500 Views (Aggressive Wave)</option>
                          </select>
                        </div>
                      </div>

                      {/* Viral Ratio Presets with Safe Rating Badges */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Engagement Ratio Profile
                          </label>
                          <span className="text-[10px] text-slate-400">Platform-authentic signals</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { key: "BALANCED", label: "Balanced", desc: "TikTok FYP" },
                            { key: "HIGH_ENGAGEMENT", label: "Viral Push", desc: "Instagram Explore" },
                            { key: "STEALTH_LOW", label: "Stealth", desc: "Anti-Drop Safe" },
                            { key: "CUSTOM", label: "Custom %", desc: "Manual Sliders" },
                          ].map((p) => (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => {
                                setRatioPreset(p.key as any);
                                if (p.key === "CUSTOM") setActiveSubMode("ratio");
                              }}
                              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                ratioPreset === p.key
                                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xs"
                                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs hover:border-blue-400"
                              }`}
                            >
                              <div className="font-bold text-xs">{p.label}</div>
                              <div className="text-[8px] opacity-75">{p.desc}</div>
                            </button>
                          ))}
                        </div>

                        {/* Safe Ratio Badges Inspector */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                              <span>Organic Ratio Safety Engine</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Algorithm Guard</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {[
                              { key: "likes", name: "Likes", val: customLikesPct },
                              { key: "comments", name: "Comments", val: customCommentsPct },
                              { key: "shares", name: "Shares", val: customSharesPct },
                              { key: "saves", name: "Saves", val: customSavesPct },
                              { key: "reposts", name: "Reposts", val: customRepostsPct },
                            ].map((m) => {
                              const stat = getRatioStatus(m.key, m.val);
                              return (
                                <div key={m.key} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold block">{m.name}</span>
                                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{m.val}%</span>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${stat.color} ${stat.bg} ${stat.border}`}>
                                    {stat.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {ratioPreset === "CUSTOM" && (
                          <div className="p-3.5 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block uppercase tracking-wider">
                              Custom Engagement Signal Ratios (% of views)
                            </span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <div className="flex justify-between text-[11px] mb-1 font-bold">
                                  <span>Likes Ratio:</span>
                                  <span className="text-blue-600">{customLikesPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="15"
                                  step="0.5"
                                  value={customLikesPct}
                                  onChange={(e) => setCustomLikesPct(Number(e.target.value))}
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-[11px] mb-1 font-bold">
                                  <span>Shares Ratio:</span>
                                  <span className="text-indigo-600">{customSharesPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="8"
                                  step="0.5"
                                  value={customSharesPct}
                                  onChange={(e) => setCustomSharesPct(Number(e.target.value))}
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-[11px] mb-1 font-bold">
                                  <span>Comments Ratio:</span>
                                  <span className="text-cyan-600">{customCommentsPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="3"
                                  step="0.1"
                                  value={customCommentsPct}
                                  onChange={(e) => setCustomCommentsPct(Number(e.target.value))}
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-[11px] mb-1 font-bold">
                                  <span>Saves Ratio:</span>
                                  <span className="text-sky-600">{customSavesPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="6"
                                  step="0.5"
                                  value={customSavesPct}
                                  onChange={(e) => setCustomSavesPct(Number(e.target.value))}
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Multiplier Mode Parameters */}
                  {mode === "multiplier_auto" && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                            Growth Multiplier Sequence Factor
                          </label>
                          <span className="text-xs font-mono font-bold text-blue-600">{multiplier}× Exponential</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { label: "1.0×", val: 1.0, sub: "Linear" },
                            { label: "1.2×", val: 1.2, sub: "Organic" },
                            { label: "1.5×", val: 1.5, sub: "+50%/slot" },
                            { label: "1.8×", val: 1.8, sub: "+80%/slot" },
                            { label: "2.0×", val: 2.0, sub: "Maximum" },
                          ].map((m) => (
                            <button
                              key={m.val}
                              type="button"
                              onClick={() => setMultiplier(m.val)}
                              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                multiplier === m.val
                                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xs"
                                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs font-bold"
                              }`}
                            >
                              <div className="text-xs">{m.label}</div>
                              <div className="text-[8px] opacity-80">{m.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Base Views</label>
                          <input
                            type="number"
                            value={baseMetrics.views}
                            onChange={(e) => setBaseMetrics({ ...baseMetrics, views: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Base Likes</label>
                          <input
                            type="number"
                            value={baseMetrics.likes}
                            onChange={(e) => setBaseMetrics({ ...baseMetrics, likes: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Base Shares</label>
                          <input
                            type="number"
                            value={baseMetrics.shares}
                            onChange={(e) => setBaseMetrics({ ...baseMetrics, shares: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-Node Dispersion Status Card */}
                  {mode === "custom_slots" && (
                    <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-500/20 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span>Multi-Node Dispersion Routing Matrix</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Traffic is distributed across dedicated infrastructure nodes for maximum platform stealth and zero drop risk.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block">Views Farm</span>
                          <span className="font-bold text-blue-600">Optimal Node A</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block">Likes Node</span>
                          <span className="font-bold text-sky-500">Tier-1 Provider</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block">Comments Pool</span>
                          <span className="font-bold text-cyan-500">Custom Seed Node</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Comments Pool */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Custom Staged Comments Pool (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder={"Insane edit! 🔥\nNeed part 2 ASAP\nBro cooked with this one"}
                      value={customCommentText}
                      onChange={(e) => setCustomCommentText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Comments will be automatically distributed across pulses to simulate organic conversation.
                    </span>
                  </div>

                  {/* Anti-Detection Bot Safety Assurance Card */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Anti-Detection Bot Safety Status</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Human Mode ON
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <div>✓ Randomized micro-delays (2s – 8s)</div>
                      <div>✓ Upstream link-busy auto-reschedule (+2m)</div>
                      <div>✓ Multi-slot sine jitter variance</div>
                      <div>✓ Max 3 auto-retries on provider timeout</div>
                    </div>
                  </div>

                  {/* Cost & Launch Button */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-[#111827] dark:to-blue-950/10 border border-blue-500/20 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Estimated Campaign Cost
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          ₹{estimatedCost}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Total Pulses
                        </span>
                        <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                          {generatedSlots.length} Pulses over {Math.round((generatedSlots.length * intervalMinutes) / 60)}h
                        </span>
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {submitSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{submitSuccess}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleLaunchCampaign}
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Scheduled Pulses...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Deploy Hybrid Campaign (₹{estimatedCost})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic SVG Curve Visualizer & Pulse Inspector */}
              <div className="lg:col-span-6 space-y-5">
                <HybridGrowthGraph slots={generatedSlots} />

                {/* Pulse Inspector Accordion & Manual Pulse Editor */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setInspectSlots(!inspectSlots)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-blue-500" />
                      <span>Inspect Pulse Schedule ({generatedSlots.length} Slots)</span>
                      {inspectSlots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {/* Add / Remove Pulse Controls (Like Chand) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRemovePulse}
                        disabled={generatedSlots.length <= 1}
                        title="Remove last pulse"
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {generatedSlots.length}/24
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPulse}
                        disabled={generatedSlots.length >= 24}
                        title="Add pulse"
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {inspectSlots && (
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {generatedSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold">
                                {idx === 0 ? "NOW" : `+${Math.floor((slot.offsetMinutes || idx * intervalMinutes) / 60)}h${(slot.offsetMinutes || idx * intervalMinutes) % 60 > 0 ? ` ${(slot.offsetMinutes || idx * intervalMinutes) % 60}m` : ""}`}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              Pulse #{slot.slotIndex != null ? slot.slotIndex : idx}
                            </span>
                          </div>

                          {/* Editable Metrics Grid */}
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Views</span>
                              <input
                                type="number"
                                value={slot.views || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "views", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-blue-600 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Likes</span>
                              <input
                                type="number"
                                value={slot.likes || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "likes", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-sky-500 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Comments</span>
                              <input
                                type="number"
                                value={slot.comments || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "comments", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-cyan-500 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Shares</span>
                              <input
                                type="number"
                                value={slot.shares || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "shares", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-indigo-500 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Saves</span>
                              <input
                                type="number"
                                value={slot.saves || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "saves", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-purple-400 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Reposts</span>
                              <input
                                type="number"
                                value={slot.reposts || 0}
                                onChange={(e) => handleUpdatePulseMetric(idx, "reposts", Number(e.target.value))}
                                className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-teal-400 font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Campaigns Monitor Tab */}
          {activeTab === "campaigns" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Live Hybrid Campaigns
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time execution status of all scheduled viral pulses.
                    </p>
                  </div>
                  <button
                    onClick={loadCampaigns}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Sparkles className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No campaigns launched yet.</p>
                    <button
                      onClick={() => handleTopButton("creator")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Create First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((c) => {
                      const progressPct = c.totalSlots > 0 ? Math.round((c.completedSlots / c.totalSlots) * 100) : 0;
                      const isExpanded = expandedCampaignId === c.id;
                      const isActionBusy = campaignActionLoading?.includes(c.id);

                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                                  {c.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    c.status === "completed"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : c.status === "paused"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                      : c.status === "cancelled"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>
                              <a
                                href={c.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:underline font-mono truncate max-w-sm block mt-0.5 flex items-center gap-1"
                              >
                                <span>{c.videoUrl}</span>
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                                  {c.deliveredViews.toLocaleString()} / {(c.totalViews || 0).toLocaleString()} Views
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {c.completedSlots} of {c.totalSlots} Slots Executed ({progressPct}%)
                                </span>
                              </div>

                              {/* Campaign Action Buttons (Like Chand) */}
                              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                                {c.status === "active" && (
                                  <button
                                    type="button"
                                    onClick={() => handleCampaignAction(c.id, "pause")}
                                    disabled={isActionBusy}
                                    title="Pause Campaign"
                                    className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {c.status === "paused" && (
                                  <button
                                    type="button"
                                    onClick={() => handleCampaignAction(c.id, "resume")}
                                    disabled={isActionBusy}
                                    title="Resume Campaign"
                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                )}

                                {c.status !== "cancelled" && c.status !== "completed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleCampaignAction(c.id, "delete")}
                                    disabled={isActionBusy}
                                    title="Cancel / Purge Campaign"
                                    className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => toggleCampaignExpansion(c.id)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-400 cursor-pointer flex items-center gap-1"
                                >
                                  <span>{isExpanded ? "Hide Pulses" : "Inspect Pulses"}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          {/* Expanded Detailed Pulse Breakdown (Like Chand history-detail) */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span>Pulse Sequence Breakdown</span>
                                {detailsLoading && <span className="text-[10px] text-blue-500">Loading pulse logs...</span>}
                              </div>

                              {campaignDetails?.slots && (
                                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                                  {campaignDetails.slots.map((slot: any) => {
                                    const isSlotBusy = campaignActionLoading === `retry_slot-${c.id}-${slot.slotIndex}`;
                                    let ordersInfo = "";
                                    if (slot.panelOrderId) {
                                      try {
                                        const parsed = JSON.parse(slot.panelOrderId);
                                        if (parsed.errors && Object.keys(parsed.errors).length > 0) {
                                          ordersInfo = Object.values(parsed.errors).join(", ");
                                        } else if (parsed.note) {
                                          ordersInfo = parsed.note;
                                        }
                                      } catch {}
                                    }

                                    return (
                                      <div
                                        key={slot.id}
                                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 font-mono"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center justify-center">
                                            {slot.slotIndex + 1}
                                          </span>
                                          <span className="text-slate-500 text-[11px]">
                                            +{Math.floor((slot.offsetMinutes || 0) / 60)}h{(slot.offsetMinutes || 0) % 60 > 0 ? ` ${(slot.offsetMinutes || 0) % 60}m` : ""}
                                          </span>
                                          <span
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                              slot.status === "completed"
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : slot.status === "failed"
                                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                                : slot.status === "processing"
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                            }`}
                                          >
                                            {slot.status}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px]">
                                          <span className="text-blue-600 font-bold">👁️ {slot.views}</span>
                                          <span className="text-sky-500 font-bold">❤️ {slot.likes}</span>
                                          <span className="text-cyan-500 font-bold">💬 {slot.comments}</span>
                                          <span className="text-indigo-500 font-bold">↗️ {slot.shares}</span>
                                        </div>

                                        {/* Action / Retry Button */}
                                        <div className="flex items-center gap-2">
                                          {ordersInfo && (
                                            <span className="text-[10px] text-slate-400 truncate max-w-xs" title={ordersInfo}>
                                              {ordersInfo}
                                            </span>
                                          )}
                                          {(slot.status === "failed" || slot.status === "pending") && (
                                            <button
                                              type="button"
                                              onClick={() => handleCampaignAction(c.id, "retry_slot", slot.slotIndex)}
                                              disabled={isSlotBusy}
                                              className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-100 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                                            >
                                              <RotateCcw className={`w-2.5 h-2.5 ${isSlotBusy ? "animate-spin" : ""}`} />
                                              <span>{isSlotBusy ? "Retrying..." : "Retry"}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
