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
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#090d16] border border-cyan-950/60 p-4 overflow-hidden shadow-2xl">
      <div 
        className="absolute -top-12 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }}
      />
      <div className="absolute -bottom-10 right-1/4 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15 bg-purple-600/30" />

      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2">
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
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/50"
              title={isPlaying ? "Pause Simulation" : "Play Simulation"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${curve.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
              <stop offset="70%" stopColor={accentColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={`eng-grad-${curve.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.4" />

          <path
            d={`${curve.svgPath} L 100,100 L 0,100 Z`}
            fill={`url(#grad-${curve.id})`}
          />

          {showEngagementLayer && (
            <path
              d="M 0,98 Q 20,95 40,75 T 70,30 T 100,12"
              fill="none"
              stroke={`url(#eng-grad-${curve.id})`}
              strokeWidth="1.3"
              strokeDasharray="1.5 1.5"
              className="opacity-75"
            />
          )}

          <path
            d={curve.svgPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />

          <circle
            cx={particleX}
            cy={particleY}
            r="3.5"
            fill="#ffffff"
            stroke={accentColor}
            strokeWidth="1.8"
            className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] transition-all duration-75"
          />

          <line
            x1={particleX}
            y1="0"
            x2={particleX}
            y2="100"
            stroke={accentColor}
            strokeWidth="0.6"
            strokeDasharray="1 2"
            className="opacity-60"
          />
        </svg>

        <div 
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 rounded-md bg-slate-900/95 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shadow-xl backdrop-blur-md flex items-center gap-1.5"
          style={{ 
            left: `${particleX}%`, 
            top: `${Math.max(15, (particleY / 100) * height)}px` 
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{Math.round(currentVal)}% delivered</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>0h (Upload)</span>
        <span>{Math.round(durationHours * 0.25)}h (Hook Phase)</span>
        <span>{Math.round(durationHours * 0.5)}h (Peak Multiplier)</span>
        <span>{Math.round(durationHours * 0.75)}h (FYP Wave)</span>
        <span>{durationHours}h (Target)</span>
      </div>

      {showEngagementLayer && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] bg-slate-900/60 rounded-xl px-3 py-1.5 border border-slate-800">
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
