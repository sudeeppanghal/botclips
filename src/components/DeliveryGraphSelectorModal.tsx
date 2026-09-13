"use client";

import React, { useState } from "react";
import { 
  X, 
  Search, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  ArrowRight,
  Activity
} from "lucide-react";
import { 
  DELIVERY_GRAPHS, 
  DELIVERY_CATEGORIES, 
  DeliveryCurve, 
  getDeliveryGraphById 
} from "@/lib/delivery-graphs";

interface DeliveryGraphSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGraphId?: string;
  onSelectGraph: (graph: DeliveryCurve) => void;
}

export default function DeliveryGraphSelectorModal({
  isOpen,
  onClose,
  selectedGraphId = "viral_exp_takeoff",
  onSelectGraph,
}: DeliveryGraphSelectorModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [highlightedId, setHighlightedId] = useState<string>(selectedGraphId);

  if (!isOpen) return null;

  const filtered = DELIVERY_GRAPHS.filter(g => {
    const matchCat = activeCategory === "ALL" || g.category === activeCategory;
    const matchSearch = 
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.recommendedFor.toLowerCase().includes(search.toLowerCase()) ||
      g.velocityType.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const highlightedGraph = getDeliveryGraphById(highlightedId);

  const handleApply = (graph: DeliveryCurve) => {
    onSelectGraph(graph);
    onClose();
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "VIRAL": return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "ORGANIC_SAFE": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
      case "MULTI_WAVE": return "text-purple-500 bg-purple-500/10 border-purple-500/30";
      case "ALGORITHM_TRIGGER": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "TIME_TARGETED": return "text-rose-500 bg-rose-500/10 border-rose-500/30";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Algorithm Delivery Engine • 60 Presets</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Custom Delivery Graph
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Pick the exact velocity curve that controls how views, likes, and engagement are paced over time to optimize algorithmic promotion and retention.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 60 curves by name, platform (Reels, Shorts, FYP, X), or pacing style..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-xs"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {DELIVERY_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curve Grid & Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((curve) => {
            const isSelected = highlightedId === curve.id;
            const isCurrentlyActive = selectedGraphId === curve.id;

            return (
              <div
                key={curve.id}
                onClick={() => setHighlightedId(curve.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 bg-white dark:bg-[#131b2e]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(curve.category)}`}>
                      {curve.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{curve.durationHours}h Pace</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {curve.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {curve.description}
                  </p>
                </div>

                {/* SVG Graph Visualization */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                    <span>Velocity Profile</span>
                    <span>{curve.velocityType}</span>
                  </div>

                  <svg viewBox="0 0 100 100" className="w-full h-16 stroke-blue-400" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                    
                    {/* Background glow path */}
                    <path
                      d={curve.svgPath}
                      fill="none"
                      stroke={isSelected ? "#38bdf8" : "#3b82f6"}
                      strokeWidth="4"
                      strokeOpacity="0.3"
                    />
                    
                    {/* Main sharp curve */}
                    <path
                      d={curve.svgPath}
                      fill="none"
                      stroke={isSelected ? "#38bdf8" : "#60a5fa"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
                    <span>0h (Launch)</span>
                    <span>{curve.durationHours}h (Target)</span>
                  </div>
                </div>

                {/* Bottom Meta & Select Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{curve.safetyRating}% Safe</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(curve);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isCurrentlyActive
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Selected Summary Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131b2e] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Selected Graph:</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {highlightedGraph.name} ({highlightedGraph.durationHours}h Duration)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApply(highlightedGraph)}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Apply Delivery Curve</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
