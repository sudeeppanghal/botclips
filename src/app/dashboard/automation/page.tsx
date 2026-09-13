"use client";

import React, { useState } from "react";
import { Zap, Activity, Clock, ShieldCheck, Play, Sparkles, CheckCircle2 } from "lucide-react";

export default function AutomationPage() {
  const [profileLink, setProfileLink] = useState("");
  const [curveStyle, setCurveStyle] = useState("ORGANIC_VIRAL");
  const [targetViews, setTargetViews] = useState(10000);
  const [durationHours, setDurationHours] = useState(24);
  const [likeRatio, setLikeRatio] = useState(4.5); // 4.5% likes
  const [saveRatio, setSaveRatio] = useState(2.0); // 2.0% saves
  const [commentRatio, setCommentRatio] = useState(0.4); // 0.4% comments
  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculatedLikes = Math.round((targetViews * likeRatio) / 100);
  const calculatedSaves = Math.round((targetViews * saveRatio) / 100);
  const calculatedComments = Math.round((targetViews * commentRatio) / 100);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileLink) {
      alert("Please enter target video or post URL.");
      return;
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Organic Growth Automation
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure algorithmic warmup, peak, and decay schedules to simulate real viral traction.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Automation campaign scheduled and queued for active delivery!</span>
        </div>
      )}

      {/* Grid: Curve Form & Visual Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Settings (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Campaign Curve Configuration
          </h2>

          <form onSubmit={handleLaunch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Post / Reel URL
              </label>
              <input
                type="text"
                required
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                placeholder="https://instagram.com/reel/C... or YouTube link"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Delivery Curve Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Algorithm Emulation Curve
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ORGANIC_VIRAL", name: "Organic Viral", desc: "Warmup (4h) → Peak (8h) → Decay (12h)" },
                  { id: "STEADY_DRIP", name: "Steady Drip", desc: "Linear equal batch pacing" },
                  { id: "BURST_PUSH", name: "Explosive Burst", desc: "High velocity 1st hour spike" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurveStyle(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      curveStyle === c.id
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Views & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Views
                </label>
                <input
                  type="number"
                  min="1000"
                  max="10000000"
                  value={targetViews}
                  onChange={(e) => setTargetViews(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="6"
                  max="72"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Engagement Ratios Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Auto-Balanced Engagement Targets</span>
                <span className="text-blue-600 text-[11px] font-mono">Algorithm Safe (4-6% Engagement)</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] text-slate-400">Likes ({likeRatio}%)</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {calculatedLikes.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] text-slate-400">Saves ({saveRatio}%)</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {calculatedSaves.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] text-slate-400">Comments ({commentRatio}%)</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {calculatedComments.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Automated Campaign</span>
            </button>
          </form>
        </div>

        {/* Algorithm Visualization (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Curve Waveform Preview
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Simulated delivery velocity curve across {durationHours} hours:
            </p>

            {/* SVG Visualizer */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <svg viewBox="0 0 300 120" className="w-full h-32 overflow-visible">
                {/* Background Grid */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Viral Curve path */}
                <path
                  d="M 10 105 C 50 100, 70 85, 110 30 C 150 10, 190 40, 240 80 C 270 95, 290 105, 300 108"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Pulse dot */}
                <circle cx="110" cy="30" r="5" fill="#60a5fa" className="animate-ping" />
                <circle cx="110" cy="30" r="4" fill="#2563eb" />
              </svg>

              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 mt-2">
                <span>0h (Warmup)</span>
                <span className="text-blue-400 font-bold">Peak Viral Hour</span>
                <span>{durationHours}h (Decay)</span>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero algorithmic flags or shadowban risks</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Automatic 30-day refill safeguard active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
