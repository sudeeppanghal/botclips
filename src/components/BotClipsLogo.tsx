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
    sm: { icon: 28, text: "text-lg", gap: "gap-2" },
    md: { icon: 36, text: "text-xl sm:text-2xl", gap: "gap-2.5" },
    lg: { icon: 44, text: "text-2xl sm:text-3xl", gap: "gap-3" },
    xl: { icon: 56, text: "text-3xl sm:text-4xl", gap: "gap-3.5" }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const logoMark = (
    <div className="relative shrink-0 flex items-center justify-center group">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-600/40 via-cyan-500/30 to-indigo-600/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* SVG Icon */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative transform transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="bcGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#246bfe" />
            <stop offset="0.5" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#00d4ff" />
          </linearGradient>
          <linearGradient id="bcGrad2" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#dbeafe" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="bcNeon" x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00f2fe" />
            <stop offset="1" stopColor="#4facfe" />
          </linearGradient>
          <filter id="bcGlow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagon / Shield Base */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="#0c1017"
          stroke="url(#bcGrad1)"
          strokeWidth="1.8"
        />

        {/* Diagonal Cyber Slit / Clip Grid */}
        <line x1="8" y1="40" x2="40" y2="8" stroke="url(#bcGrad1)" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.4" />
        
        {/* Modern Play / Clip Arrow with Cutout */}
        <path
          d="M17 14.5C17 13.4 18.2 12.7 19.1 13.3L34.2 22.8C35.1 23.4 35.1 24.6 34.2 25.2L19.1 34.7C18.2 35.3 17 34.6 17 33.5V14.5Z"
          fill="url(#bcGrad1)"
        />

        {/* Dynamic Velocity Pulse Bar inside Play Head */}
        <path
          d="M21 19L27 24L21 29"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* High-Tech Accent Node (Top Right) */}
        <circle cx="36" cy="12" r="2.5" fill="#00f2fe" filter="url(#bcGlow)" />
      </svg>
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
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent ml-0.5">
            Clips
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1 shadow-[0_0_8px_#00f2fe] animate-pulse" />
        </div>
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
