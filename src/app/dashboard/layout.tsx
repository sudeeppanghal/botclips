"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: "User",
    role: "User",
    balance: 0.00,
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser({
            name: data.user.name || data.user.email?.split("@")[0] || "User",
            role: data.user.role === "ADMIN" ? "Admin" : "User",
            balance: Number(data.user.balance || 0),
          });
        }
      } catch {}
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex">
      {/* Responsive Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        brandName="BotClips"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={user.name}
          userRole={user.role}
          walletBalance={user.balance}
          currencySymbol="₹"
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
