"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Server, 
  Layers, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  ArrowLeft, 
  Settings 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== "ADMIN") {
          window.location.href = "/dashboard";
        } else {
          setIsAuthorized(true);
        }
      })
      .catch(() => {
        window.location.href = "/dashboard";
      });
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: ShieldCheck },
    { label: "Services & Catalog", href: "/admin/services", icon: Layers },
    { label: "SMM Providers", href: "/admin/panels", icon: Server },
    { label: "Payment Verification", href: "/admin/payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight">Admin Portal</span>
            <span className="text-[10px] uppercase font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md ml-1">
              Superadmin
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="p-6 sm:p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
