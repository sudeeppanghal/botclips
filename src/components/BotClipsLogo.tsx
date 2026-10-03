"use client";

import React from "react";
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
    sm: { height: 34, icon: 34, className: "h-8 sm:h-[34px]" },
    md: { height: 44, icon: 44, className: "h-10 sm:h-11 md:h-12" },
    lg: { height: 56, icon: 56, className: "h-12 sm:h-14 md:h-16" },
    xl: { height: 76, icon: 76, className: "h-16 sm:h-20" }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = showText ? (
    <div className={`relative inline-flex items-center group ${className}`}>
      {/* Soft neon purple ambient glow on hover */}
      <div 
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/30 via-pink-500/25 to-indigo-600/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
      />
      <img
        src="/logo.png?v=3"
        alt="BotClips"
        height={currentSize.height}
        className={`relative ${currentSize.className} w-auto object-contain transform transition-all duration-300 group-hover:scale-[1.03] drop-shadow-[0_2px_12px_rgba(168,85,247,0.3)]`}
        loading="eager"
      />
    </div>
  ) : (
    <div className={`relative shrink-0 inline-flex items-center justify-center group ${className}`}>
      {/* Neon purple/pink ambient glow */}
      <div 
        className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600/50 via-pink-500/40 to-indigo-500/50 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
      />
      <img
        src="/logo-icon.png?v=3"
        alt="BotClips Mascot"
        width={currentSize.icon}
        height={currentSize.icon}
        className="relative object-contain transform transition-all duration-300 group-hover:scale-110 drop-shadow-[0_2px_14px_rgba(168,85,247,0.45)]"
        style={{ width: currentSize.icon, height: currentSize.icon }}
        loading="eager"
      />
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center cursor-pointer select-none">
      {content}
    </Link>
  ) : (
    content
  );
}
