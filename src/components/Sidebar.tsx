"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bot, 
  Home, 
  Zap, 
  Wallet, 
  Settings, 
  Headphones, 
  Clapperboard, 
  Crown, 
  ChevronRight,
  X,
  Sparkles,
  Cpu,
  MessageSquare,
  Share2
} from "lucide-react";
import BotClipsLogo from "@/components/BotClipsLogo";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  brandName?: string;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile, brandName = "BotClips" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Affiliates & Earn", href: "/dashboard/affiliates", icon: Share2, badge: "10% SHARE" },
    { label: "Chat Box ( Wins )", href: "/dashboard/chat", icon: MessageSquare, badge: "WINS" },
    { label: "Automation", href: "/dashboard/automation", icon: Zap },
    { label: "M-Automation", href: "/dashboard/m-automation", icon: Cpu, badge: "PRO" },
    { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Contact Us", href: "/dashboard/tickets", icon: Headphones },
    { label: "Clipping Stuffs", href: "/dashboard/services", icon: Clapperboard },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-[#111827] border-r border-slate-100 dark:border-slate-800/80 flex flex-col justify-between p-5 z-50 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 px-1">
            <BotClipsLogo size="md" href="/dashboard" />
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom VIP Upgrade Card */}
        <div className="pt-4">
          <Link
            href="/dashboard/m-automation"
            className="block p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/15 border border-amber-500/20 hover:border-amber-500/30 transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500/30" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Upgrade to Premium</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-7">
              Connect your own SMM API ($10/wk • $25/mo)
            </p>
          </Link>
        </div>
      </aside>
    </>
  );
}
