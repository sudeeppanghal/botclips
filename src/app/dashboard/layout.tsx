"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import NewOrderModal from "@/components/NewOrderModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [user, setUser] = useState({
    name: "User",
    role: "User",
    balance: 0.00,
  });

  const loadUser = async () => {
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
  };

  useEffect(() => {
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
        <main className="flex-1 p-3.5 sm:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenNewOrder={() => setNewOrderOpen(true)}
        onOpenSidebar={() => setMobileOpen(true)}
      />

      {/* Global New Order Modal from Bottom Nav */}
      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        walletBalance={user.balance}
        onOrderSuccess={() => {
          setNewOrderOpen(false);
          loadUser();
        }}
      />
    </div>
  );
}
