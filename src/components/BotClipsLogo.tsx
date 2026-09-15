"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function BotClipsLogo({
  size = "md",
  showText = true,
  href = "/",
  className = ""
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 36, text: "text-lg", gap: "gap-2.5", sub: "text-[9px]" },
    md: { icon: 44, text: "text-xl sm:text-2xl", gap: "gap-3", sub: "text-[10px]" },
    lg: { icon: 54, text: "text-2xl sm:text-3xl", gap: "gap-3.5", sub: "text-[11px]" },
    xl: { icon: 66, text: "text-3xl sm:text-4xl", gap: "gap-4", sub: "text-[12px]" }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const [imgError, setImgError] = useState(false);

  // High-res BotClips mascot with local fallback
  const mascotIconUrl = imgError
    ? "/logo-icon.png"
    : "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/branding/botclips-icon.png";

  const logoMark = (
    <div className="relative shrink-0 flex items-center justify-center group">
      {/* Dynamic neon cyan/blue ambient glow */}
      <div 
        className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-600/50 via-cyan-400/40 to-sky-400/50 blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
      />

      {/* 3D Robot Mascot Icon */}
      <img
        src={mascotIconUrl}
        alt="BotClips Mascot"
        width={currentSize.icon}
        height={currentSize.icon}
        onError={() => setImgError(true)}
        className="relative object-contain transform transition-all duration-300 group-hover:scale-110 drop-shadow-[0_2px_14px_rgba(0,180,255,0.5)]"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      />
    </div>
  );

  if (!showText) {
    return href ? (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        {logoMark}
      </Link>
    ) : (
      <div className={`inline-flex items-center ${className}`}>{logoMark}</div>
    );
  }

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group ${className}`}>
      {logoMark}
      <div className="flex flex-col select-none justify-center">
        {/* Main Title: BotClips */}
        <div className={`font-black tracking-tight leading-none ${currentSize.text} flex items-center`}>
          <span className="text-slate-950 dark:text-white transition-colors font-extrabold">Bot</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 bg-clip-text text-transparent ml-0.5 font-black">
            Clips
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1.5 shadow-[0_0_10px_#00f2fe] animate-pulse" />
        </div>
        {/* Tagline: VIRAL AUTOMATION - Never hidden! Life of our branding */}
        <span className={`block font-extrabold tracking-[0.2em] uppercase mt-1 text-slate-500 dark:text-cyan-400/90 leading-tight ${currentSize.sub}`}>
          Viral Automation
        </span>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center cursor-pointer">
      {content}
    </Link>
  ) : (
    content
  );
}
