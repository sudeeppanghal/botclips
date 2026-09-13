"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (loginEmail.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleDemoUser = () => {
    setEmail("roonie@dhillionsmm.com");
    setPassword("password123");
    handleLogin("roonie@dhillionsmm.com", "password123");
  };

  const handleDemoAdmin = () => {
    setEmail("admin@dhillionsmm.com");
    setPassword("adminpassword123");
    handleLogin("admin@dhillionsmm.com", "adminpassword123");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-3 hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 stroke-[2.2]" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your BotClips dashboard</p>
        </div>

        {/* 1-Click Fast Demo Login Buttons */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Test Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoUser}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-xs text-center"
            >
              Demo User (Roonie)
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="roonie@dhillionsmm.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
