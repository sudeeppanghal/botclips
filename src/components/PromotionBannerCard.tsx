"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ExternalLink } from "lucide-react";

export interface BannerData {
  id: string;
  name: string;
  imageUrl: string;
  badge?: string | null;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText?: string | null;
  secondaryButtonUrl?: string | null;
  openLinksNewTab?: boolean;
  status: string;
  showOnDashboard?: boolean;
  priority?: number;
}

export default function PromotionBannerCard({
  onBannerLoaded,
}: {
  onBannerLoaded?: (hasBanner: boolean) => void;
}) {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBanner() {
      try {
        const res = await fetch("/api/banners");
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.banner) {
            setBanner(data.banner);
            if (onBannerLoaded) onBannerLoaded(true);

            // Record impression
            if (data.banner.id) {
              fetch("/api/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: data.banner.id, action: "impression" }),
              }).catch(() => {});
            }
          } else {
            setBanner(null);
            if (onBannerLoaded) onBannerLoaded(false);
          }
        }
      } catch (err) {
        console.error("Failed to load promotion banner:", err);
        if (isMounted) {
          setBanner(null);
          if (onBannerLoaded) onBannerLoaded(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTrackClick = (action: "primary_click" | "secondary_click") => {
    if (banner?.id) {
      fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, action }),
      }).catch(() => {});
    }
  };

  // If loading, render smooth dark shimmer so layout does not jitter
  if (loading) {
    return (
      <div className="relative w-full aspect-[16/9] min-h-[240px] sm:min-h-[290px] md:min-h-[330px] rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0d0914] animate-pulse flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-purple-500/40 animate-spin" />
      </div>
    );
  }

  // If no active banner exists, completely hide without leaving an empty void
  if (!banner) {
    return null;
  }

  const openInNewTab = banner.openLinksNewTab ?? true;
  const targetAttr = openInNewTab ? "_blank" : "_self";
  const relAttr = openInNewTab ? "noopener noreferrer" : undefined;

  return (
    <div className="relative w-full aspect-[16/9] min-h-[250px] sm:min-h-[300px] md:min-h-[340px] rounded-2xl overflow-hidden border border-purple-500/30 bg-[#090511] shadow-[0_4px_35px_rgba(168,85,247,0.18)] group transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_8px_45px_rgba(168,85,247,0.3)] flex flex-col justify-end">
      {/* 16:9 Banner Background Image with object-fit: cover */}
      <img
        src={banner.imageUrl}
        alt={banner.title || banner.name || "BotClips Promotion"}
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.02] ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Placeholder Shimmer before image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/80 via-[#100a1c] to-indigo-950/70 animate-pulse flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-400/50 animate-spin" />
        </div>
      )}

      {/* Cyberpunk Vignettes for crystal clear text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07040d] via-[#07040d]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07040d]/90 via-[#07040d]/40 to-transparent pointer-events-none" />
      
      {/* Ambient Neon Purple Rim Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/10 via-fuchsia-600/15 to-indigo-600/10 rounded-2xl blur-xs pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Dynamic Overlay Content */}
      <div className="relative z-10 w-full p-5 sm:p-7 md:p-8 flex flex-col justify-end space-y-3">
        {/* Optional Badge */}
        {banner.badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-purple-200 backdrop-blur-md self-start shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{banner.badge}</span>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-1.5 max-w-2xl">
          {banner.title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] flex items-center gap-2">
              <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                {banner.title}
              </span>
            </h2>
          )}

          {banner.description && (
            <p className="text-xs sm:text-sm md:text-base text-purple-100/90 font-medium leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] max-w-xl line-clamp-2">
              {banner.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {banner.primaryButtonText && banner.primaryButtonUrl && (
            <a
              href={banner.primaryButtonUrl}
              target={targetAttr}
              rel={relAttr}
              onClick={() => handleTrackClick("primary_click")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>{banner.primaryButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}

          {banner.secondaryButtonText && banner.secondaryButtonUrl && (
            <a
              href={banner.secondaryButtonUrl}
              target={targetAttr}
              rel={relAttr}
              onClick={() => handleTrackClick("secondary_click")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-purple-300/50 backdrop-blur-md font-bold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs"
            >
              <span>{banner.secondaryButtonText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
