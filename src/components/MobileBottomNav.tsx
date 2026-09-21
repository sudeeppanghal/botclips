"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ShoppingCart, 
  Plus, 
  Clapperboard, 
  Wallet, 
  Zap,
  Menu,
  X
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenNewOrder?: () => void;
  onOpenSidebar?: () => void;
}

export default function MobileBottomNav({
  onOpenNewOrder,
  onOpenSidebar
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [runningCount, setRunningCount] = useState(0);

  useEffect(() => {
    async function checkRunning() {
      try {
        const res = await fetch("/api/orders?limit=20&running=true");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setRunningCount(data.orders.length);
        }
      } catch {}
    }
    checkRunning();
    const interval = setInterval(checkRunning, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { 
      label: "Orders", 
      href: "/dashboard/orders", 
      icon: ShoppingCart,
      badge: runningCount > 0 ? runningCount : null 
    },
    { label: "Store", href: "/dashboard/store", icon: Clapperboard },
    { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Center Floating Action Button (New Order) */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={() => {
              if (onOpenNewOrder) {
                onOpenNewOrder();
              } else {
                window.location.href = "/dashboard#new-order";
              }
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white dark:border-[#111827]"
            title="Place New Order"
            aria-label="New Order"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">Order</span>
        </div>

        {/* Right 2 items */}
        {navItems.slice(2, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
