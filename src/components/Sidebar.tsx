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
  Sparkles
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  brandName?: string;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile, brandName = "BotClips" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Automation", href: "/dashboard/automation", icon: Zap },
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
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bot className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {brandName}
              </span>
            </Link>
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
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom VIP Upgrade Card */}
        <div className="pt-4">
          <Link
            href="/dashboard/wallet"
            className="block p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500/20" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Upgrade Now</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-7">
              Get faster services and exclusive features.
            </p>
          </Link>
        </div>
      </aside>
    </>
  );
}
