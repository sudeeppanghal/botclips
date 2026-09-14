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
    sm: { icon: 32, text: "text-lg", gap: "gap-2" },
    md: { icon: 40, text: "text-xl sm:text-2xl", gap: "gap-2.5" },
    lg: { icon: 48, text: "text-2xl sm:text-3xl", gap: "gap-3" },
    xl: { icon: 60, text: "text-3xl sm:text-4xl", gap: "gap-3.5" }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const [imgError, setImgError] = useState(false);

  const mascotIconUrl = "https://kixjzeptylzlgnmnihwv.supabase.co/storage/v1/object/public/media/branding/botclips-icon.png";

  const logoMark = (
    <div className="relative shrink-0 flex items-center justify-center group">
      {/* Ambient neon cyan/blue glow */}
      <div 
        className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-600/40 via-cyan-400/30 to-blue-500/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500" 
      />

      {/* 3D Robot Mascot Icon */}
      {!imgError ? (
        <img
          src={mascotIconUrl}
          alt="BotClips Mascot"
          width={currentSize.icon}
          height={currentSize.icon}
          onError={() => setImgError(true)}
          className="relative object-contain transform transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(0,180,255,0.4)]"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        />
      ) : (
        <div 
          className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        >
          🤖
        </div>
      )}
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
      <div className="flex flex-col select-none">
        <div className={`font-black tracking-tight leading-none ${currentSize.text} flex items-center`}>
          <span className="text-[#111214] dark:text-white transition-colors">Bot</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent ml-0.5">
            Clips
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1 shadow-[0_0_8px_#00f2fe] animate-pulse" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:block">
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
