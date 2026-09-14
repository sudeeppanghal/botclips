"use client";

import { useEffect } from "react";

export default function SecurityShield() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Console Anti-Cracking Warning
    try {
      console.log(
        "%c🔒 BotClips Security Shield: ACTIVE",
        "color: #3b82f6; font-size: 18px; font-weight: bold; background: #0f172a; padding: 6px 12px; border-radius: 6px;"
      );
      console.log(
        "%cProtected under proprietary copyright. Reverse engineering or scraping attempts will result in IP blacklisting.",
        "color: #ef4444; font-size: 11px; font-weight: bold;"
      );
    } catch {}

    // 2. Disable Right-Click Context Menu (prevents View Source and Inspect shortcuts)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
    };

    // 3. Block Developer Shortcut Keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
