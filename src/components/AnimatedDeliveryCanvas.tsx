"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { DeliveryCurve } from "@/lib/delivery-graphs";

interface AnimatedDeliveryCanvasProps {
  curve: DeliveryCurve;
  height?: number;
  showControls?: boolean;
  showEngagementLayer?: boolean;
  accentColor?: string;
  durationHours?: number;
}

export default function AnimatedDeliveryCanvas({
  curve,
  height = 180,
  showControls = true,
  showEngagementLayer = true,
  accentColor = "#06b6d4",
  durationHours = 24
}: AnimatedDeliveryCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.42);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setProgress((prev) => {
        const next = prev + delta * 0.16;
        return next > 1.0 ? 0.0 : next;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const data = curve.dataPoints || [0, 20, 50, 80, 100];
  const totalSegments = data.length - 1;
  const currentIdx = progress * totalSegments;
  const lowerIdx = Math.floor(currentIdx);
  const upperIdx = Math.min(totalSegments, lowerIdx + 1);
  const t = currentIdx - lowerIdx;
  const currentVal = data[lowerIdx] + (data[upperIdx] - data[lowerIdx]) * t;

  const particleX = Math.round(progress * 100);
  const particleY = Math.round(95 - (currentVal / 100) * 85);

  return (
    <div 
      className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-hidden shadow-xl"
      style={{
        transform: "translate3d(0, 0, 0)",
        WebkitTransform: "translate3d(0, 0, 0)",
        contain: "paint",
        isolation: "isolate",
      }}
    >
      {/* Lightweight GPU-Safe Radial Glow Backgrounds (No heavy blur filters) */}
      <div 
        className="absolute -top-10 left-1/4 w-48 h-48 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      <div 
        className="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, #9333ea 0%, transparent 70%)" }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {curve.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {curve.velocityType}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Detection: 100%</span>
          </div>
          {showControls && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
              title={isPlaying ? "Pause Simulation" : "Play Simulation"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${curve.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
              <stop offset="70%" stopColor={accentColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={`eng-grad-${curve.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />

          {/* Area Fill */}
          <path
            d={`${curve.svgPath} L 100,100 L 0,100 Z`}
            fill={`url(#grad-${curve.id})`}
          />

          {/* Engagement Wave */}
          {showEngagementLayer && (
            <path
              d="M 0,98 Q 20,95 40,75 T 70,30 T 100,12"
              fill="none"
              stroke={`url(#eng-grad-${curve.id})`}
              strokeWidth="1.2"
              strokeDasharray="1.5 1.5"
              className="opacity-70"
            />
          )}

          {/* Background subtle glow stroke (GPU safe, no feGaussianBlur) */}
          <path
            d={curve.svgPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            className="opacity-30"
          />

          {/* Main crisp curve stroke */}
          <path
            d={curve.svgPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Live Progress Particle */}
          <circle
            cx={particleX}
            cy={particleY}
            r="3.5"
            fill="#ffffff"
            stroke={accentColor}
            strokeWidth="2"
          />

          {/* Vertical progress tracker */}
          <line
            x1={particleX}
            y1="0"
            x2={particleX}
            y2="100"
            stroke={accentColor}
            strokeWidth="0.8"
            strokeDasharray="1 2"
            className="opacity-60"
          />
        </svg>

        {/* Floating Percentage Badge (Solid background, completely glitch-free) */}
        <div 
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 rounded-md bg-slate-900 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300 shadow-lg flex items-center gap-1.5"
          style={{ 
            left: `${particleX}%`, 
            top: `${Math.max(15, (particleY / 100) * height)}px` 
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{Math.round(currentVal)}% delivered</span>
        </div>
      </div>

      {/* Time Phases */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
        <span>0h (Upload)</span>
        <span>{Math.round(durationHours * 0.25)}h (Hook Phase)</span>
        <span>{Math.round(durationHours * 0.5)}h (Peak Multiplier)</span>
        <span>{Math.round(durationHours * 0.75)}h (FYP Wave)</span>
        <span>{durationHours}h (Target)</span>
      </div>

      {showEngagementLayer && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] bg-slate-900/80 rounded-xl px-3 py-1.5 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full" style={{ background: accentColor }} />
              <span className="text-slate-300 font-bold">Views Volume (Non-Linear Jitter)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <span className="text-slate-400 font-medium">Likes & Shares Pacing</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 font-bold">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Algorithm-Paced</span>
          </div>
        </div>
      )}
    </div>
  );
}
