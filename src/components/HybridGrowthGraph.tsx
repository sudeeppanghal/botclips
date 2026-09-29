"use client";

import React, { useState, useMemo } from "react";

export type HybridSlotPoint = {
  slotIndex: number;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  reposts?: number | null;
  offsetMinutes?: number | null;
  scheduledAt?: string | Date | null;
  commentLines?: string[] | null;
};

interface HybridGrowthGraphProps {
  slots: HybridSlotPoint[];
  intervalMinutes?: number;
  height?: number;
  title?: string;
  currencySymbol?: string;
}

export const METRIC_COLORS = {
  views: "#2563eb",    // Signature BotClips Royal Blue
  likes: "#0284c7",    // Vibrant Sky Blue
  comments: "#06b6d4", // Electric Cyan
  shares: "#6366f1",   // Indigo
};

const fmtNum = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
};

export default function HybridGrowthGraph({
  slots,
  intervalMinutes = 72,
  height = 240,
  title = "HYBRID VIRAL GROWTH TRAJECTORY",
}: HybridGrowthGraphProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute cumulative series
  const { points, totals, maxVal } = useMemo(() => {
    if (!slots || slots.length === 0) {
      return {
        points: [],
        totals: { views: 0, likes: 0, comments: 0, shares: 0 },
        maxVal: 1,
      };
    }

    let cv = 0, cl = 0, cc = 0, cs = 0;
    const pts = slots.map((s, idx) => {
      const v = Number(s.views || 0);
      const l = Number(s.likes || 0);
      const c = Number(s.comments || 0);
      const sh = Number(s.shares || 0);

      cv += v;
      cl += l;
      cc += c;
      cs += sh;

      const mins = s.offsetMinutes != null ? s.offsetMinutes : idx * intervalMinutes;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const label = mins === 0 ? "START (T+0)" : h === 0 ? `+${m}m` : `+${h}h${m > 0 ? ` ${m}m` : ""}`;

      return {
        idx,
        label,
        slotV: v,
        slotL: l,
        slotC: c,
        slotSh: sh,
        cumViews: cv,
        cumLikes: cl,
        cumComments: cc,
        cumShares: cs,
      };
    });

    const tot = pts.length > 0
      ? {
          views: pts[pts.length - 1].cumViews,
          likes: pts[pts.length - 1].cumLikes,
          comments: pts[pts.length - 1].cumComments,
          shares: pts[pts.length - 1].cumShares,
        }
      : { views: 0, likes: 0, comments: 0, shares: 0 };

    const max = Math.max(tot.views, tot.likes, tot.comments, tot.shares, 1);

    return { points: pts, totals: tot, maxVal: max };
  }, [slots, intervalMinutes]);

  if (!points || points.length === 0) {
    return null;
  }

  // Graph coordinate calculations
  const paddingLeft = 42;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const graphWidth = 700;
  const graphHeight = height;

  const innerWidth = graphWidth - paddingLeft - paddingRight;
  const innerHeight = graphHeight - paddingTop - paddingBottom;

  const getX = (i: number) => {
    if (points.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (i / (points.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / maxVal) * innerHeight;
  };

  // Generate SVG path strings
  const buildSvgPath = (key: "cumViews" | "cumLikes" | "cumComments" | "cumShares") => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => {
        const x = getX(i);
        const y = getY(p[key]);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const viewsPath = buildSvgPath("cumViews");
  const likesPath = buildSvgPath("cumLikes");
  const commentsPath = buildSvgPath("cumComments");
  const sharesPath = buildSvgPath("cumShares");

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xl overflow-hidden backdrop-blur-md transition-all">
      {/* ── HEADER TITLE BAR ── */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/20">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono">
            {title}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-xs">
          {points.length} Staged Pulses • Bimodal Gaussian
        </span>
      </div>

      {/* ── REAL-TIME STATS SUMMARY ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800 text-center">
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Views</span>
          <span className="text-lg font-black font-mono tracking-tight" style={{ color: METRIC_COLORS.views }}>
            {fmtNum(totals.views)}
          </span>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Likes</span>
          <span className="text-lg font-black font-mono tracking-tight" style={{ color: METRIC_COLORS.likes }}>
            {fmtNum(totals.likes)}
          </span>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Comments</span>
          <span className="text-lg font-black font-mono tracking-tight" style={{ color: METRIC_COLORS.comments }}>
            {fmtNum(totals.comments)}
          </span>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shares / Saves</span>
          <span className="text-lg font-black font-mono tracking-tight" style={{ color: METRIC_COLORS.shares }}>
            {fmtNum(totals.shares)}
          </span>
        </div>
      </div>

      {/* ── INTERACTIVE GRAPH CANVAS ── */}
      <div className="relative p-2 sm:p-4 select-none">
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Neon Glow Filters */}
            <filter id="glow-views" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-likes" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Area Fill Gradient for Views */}
            <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={METRIC_COLORS.views} stopOpacity="0.22" />
              <stop offset="100%" stopColor={METRIC_COLORS.views} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + innerHeight * (1 - pct);
            const val = Math.round(maxVal * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={graphWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {fmtNum(val)}
                </text>
              </g>
            );
          })}

          {/* X Axis Checkpoint Labels */}
          {points.map((p, i) => {
            if (points.length > 12 && i % 2 !== 0 && i !== points.length - 1) return null;
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={graphHeight - 12}
                textAnchor="middle"
                fill="currentColor"
                className="text-slate-400 dark:text-slate-500 font-bold"
                fontSize="9"
                fontFamily="monospace"
              >
                {p.label}
              </text>
            );
          })}

          {/* Area Fill under Views */}
          {points.length > 1 && (
            <path
              d={`${viewsPath} L ${getX(points.length - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`}
              fill="url(#viewsAreaGrad)"
            />
          )}

          {/* Metric Curves */}
          {totals.shares > 0 && (
            <path d={sharesPath} fill="none" stroke={METRIC_COLORS.shares} strokeWidth="1.8" />
          )}
          {totals.comments > 0 && (
            <path d={commentsPath} fill="none" stroke={METRIC_COLORS.comments} strokeWidth="2" filter="url(#glow-cyan)" />
          )}
          {totals.likes > 0 && (
            <path d={likesPath} fill="none" stroke={METRIC_COLORS.likes} strokeWidth="2.2" filter="url(#glow-likes)" />
          )}
          {totals.views > 0 && (
            <path d={viewsPath} fill="none" stroke={METRIC_COLORS.views} strokeWidth="2.5" filter="url(#glow-views)" />
          )}

          {/* Interactive Crosshairs & Hitboxes */}
          {points.map((p, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Invisible wide hitbox for easy mouse selection */}
                <rect
                  x={x - (innerWidth / points.length) / 2}
                  y={paddingTop}
                  width={innerWidth / points.length}
                  height={innerHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {isHovered && (
                  <>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + innerHeight}
                      stroke="currentColor"
                      className="text-blue-500"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />

                    {/* Glowing dots on each line */}
                    {totals.views > 0 && (
                      <circle cx={x} cy={getY(p.cumViews)} r="5" fill={METRIC_COLORS.views} stroke="#fff" strokeWidth="2" />
                    )}
                    {totals.likes > 0 && (
                      <circle cx={x} cy={getY(p.cumLikes)} r="4" fill={METRIC_COLORS.likes} stroke="#fff" strokeWidth="2" />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* ── HOVER FLOATING TOOLTIP ── */}
        {hoveredPoint && (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs font-mono flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">
                Pulse #{hoveredPoint.idx + 1} ({hoveredPoint.label})
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span style={{ color: METRIC_COLORS.views }}>
                Views: <strong>+{hoveredPoint.slotV.toLocaleString()}</strong> (Cum: {fmtNum(hoveredPoint.cumViews)})
              </span>
              {totals.likes > 0 && (
                <span style={{ color: METRIC_COLORS.likes }}>
                  Likes: <strong>+{hoveredPoint.slotL.toLocaleString()}</strong>
                </span>
              )}
              {totals.comments > 0 && (
                <span style={{ color: METRIC_COLORS.comments }}>
                  Comments: <strong>+{hoveredPoint.slotC.toLocaleString()}</strong>
                </span>
              )}
              {totals.shares > 0 && (
                <span style={{ color: METRIC_COLORS.shares }}>
                  Shares: <strong>+{hoveredPoint.slotSh.toLocaleString()}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── LEGEND FOOTER ── */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-center gap-6 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full" style={{ backgroundColor: METRIC_COLORS.views }} />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Organic Views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full" style={{ backgroundColor: METRIC_COLORS.likes }} />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Smart Likes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full" style={{ backgroundColor: METRIC_COLORS.comments }} />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Targeted Comments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded-full" style={{ backgroundColor: METRIC_COLORS.shares }} />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Shares / Saves</span>
        </div>
      </div>
    </div>
  );
}
