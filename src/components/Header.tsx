"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Wallet,
  ExternalLink
} from "lucide-react";
import { useTheme } from "./ThemeContext";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  walletBalance?: number;
  currencySymbol?: string;
  onOpenMobile?: () => void;
  onSearchSelect?: (serviceName: string) => void;
}

export default function Header({
  userName = "User",
  userRole = "User",
  walletBalance = 0.00,
  currencySymbol = "₹",
  onOpenMobile,
  onSearchSelect
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockQuickServices = [
    { name: "Instagram Real Active Followers", cat: "Instagram", rate: "₹180/1k" },
    { name: "Instagram High Retention Likes", cat: "Instagram", rate: "₹45/1k" },
    { name: "YouTube High Retention Views", cat: "YouTube", rate: "₹240/1k" },
    { name: "TikTok Followers [Guaranteed]", cat: "TikTok", rate: "₹190/1k" },
    { name: "Telegram Channel Members [Non-Drop]", cat: "Telegram", rate: "₹120/1k" },
    { name: "Twitter (X) Retweets & Likes", cat: "Twitter", rate: "₹110/1k" },
  ];

  const filteredServices = searchQuery.trim() === "" 
    ? [] 
    : mockQuickServices.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.cat.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left side: Hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for a service (e.g. Instagram followers)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all outline-hidden"
            />
          </div>

          {/* Search autocomplete modal */}
          {searchOpen && filteredServices.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Matching Services
              </div>
              <div className="space-y-1">
                {filteredServices.map((svc, i) => (
                  <Link
                    key={i}
                    href="/dashboard/order"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      if (onSearchSelect) onSearchSelect(svc.name);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{svc.name}</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">{svc.cat}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{svc.rate}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side controls: Theme Toggle, Notifications, User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">1 New</span>
              </div>
              <div className="py-3 space-y-2">
                <div className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Order #1024 Completed!</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">1,000 Instagram Followers successfully delivered.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-3 p-1 pl-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {userName}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {userRole}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                <div className="text-xs text-slate-400">Signed in as</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{userName}</div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Balance: {currencySymbol}{walletBalance.toFixed(2)}
                </div>
              </div>

              <Link
                href="/dashboard/wallet"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Wallet className="w-4 h-4 text-slate-500" />
                <span>Add Funds / Wallet</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin Portal</span>
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-800/60 my-1" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
