"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Share2, 
  Bookmark, 
  Heart, 
  Eye, 
  MessageSquare,
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import AnimatedDeliveryCanvas from "@/components/AnimatedDeliveryCanvas";
import { getDeliveryGraphById } from "@/lib/delivery-graphs";

interface WhopClipperShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBlueprint: () => void;
}

export default function WhopClipperShowcaseModal({
  isOpen,
  onClose,
  onApplyBlueprint
}: WhopClipperShowcaseModalProps) {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  const whopCurve = getDeliveryGraphById("whop_clipper_organic_signature");

  const stages = [
    {
      stage: 1,
      name: "Phase 1: 3-Sec Hook Retention",
      timing: "0h - 2h Post-Upload",
      icon: Eye,
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/40",
      description: "Initial organic views drip fed with non-linear pacing. Satisfies the TikTok & Reels 3-second completion gatekeeper, preventing instant zero-view dropoffs."
    },
    {
      stage: 2,
      name: "Phase 2: Sentiment Lock Ratio",
      timing: "2h - 8h Acceleration",
      icon: Heart,
      color: "from-purple-500 to-pink-600",
      textColor: "text-pink-400",
      borderColor: "border-pink-500/40",
      description: "Delivers proportional high-retention likes (8-12%) alongside positive comments. Confirms to the algorithm that real viewers find the clip compelling, opening tier-2 distribution."
    },
    {
      stage: 3,
      name: "Phase 3: Viral Utility Surge (Saves & Shares)",
      timing: "8h - 24h FYP Explosion",
      icon: Share2,
      color: "from-amber-500 to-rose-600",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/40",
      description: "The Holy Grail of short-form algorithms. Massive bursts of saves & direct shares signals high reference value, propelling the video onto the Explore & FYP feeds for 100k+ organic views."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Whop Clippers Multi-Signal Virality Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Elite Clipper Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Why standard views fail and how synchronizing views, likes, shares, comments & saves guarantees FYP traction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Animated Delivery Canvas Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Animated Multi-Signal Curve (24h Simulation)
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Randomized Jitter: Active (±22%)
              </span>
            </div>
            <AnimatedDeliveryCanvas
              curve={whopCurve}
              height={190}
              showControls={true}
              showEngagementLayer={true}
              accentColor="#f59e0b"
              durationHours={24}
            />
          </div>

          {/* Interactive 3-Phase Algorithmic Breakdown */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span>The 3-Phase Algorithmic Trigger Sequence</span>
              <span className="text-[10px] text-slate-500 font-normal">(Click each phase to inspect)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stages.map((st) => {
                const Icon = st.icon;
                const isSelected = activeStage === st.stage;
                return (
                  <div
                    key={st.stage}
                    onClick={() => setActiveStage(st.stage as any)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? `bg-slate-800/90 ${st.borderColor} shadow-lg ring-1 ring-amber-500/30` 
                        : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${st.color} flex items-center justify-center text-white shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {st.timing}
                      </span>
                    </div>

                    <h5 className={`text-xs font-black ${st.textColor} mb-1`}>
                      {st.name}
                    </h5>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Signal Proportions Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700/60 p-4">
            <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Clipper Viral Combo Golden Ratios (10k Base)</span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Views</span>
                </div>
                <div className="text-sm font-black text-white mt-1">10,000</div>
                <div className="text-[9px] text-cyan-400 font-bold">100% Base</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span>Likes</span>
                </div>
                <div className="text-sm font-black text-white mt-1">850 - 1,200</div>
                <div className="text-[9px] text-pink-400 font-bold">~10% Ratio</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Share2 className="w-3 h-3 text-amber-400" />
                  <span>Shares</span>
                </div>
                <div className="text-sm font-black text-white mt-1">150 - 250</div>
                <div className="text-[9px] text-amber-400 font-bold">Viral Signal</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Bookmark className="w-3 h-3 text-purple-400" />
                  <span>Saves</span>
                </div>
                <div className="text-sm font-black text-white mt-1">80 - 140</div>
                <div className="text-[9px] text-purple-400 font-bold">High Utility</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                  <span>Comments</span>
                </div>
                <div className="text-sm font-black text-white mt-1">25 - 50</div>
                <div className="text-[9px] text-emerald-400 font-bold">Positive Hype</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Includes non-linear time jitter & anti-detection protection</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApplyBlueprint();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Whop Clipper Combo Blueprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
