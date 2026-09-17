"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Check,
  Copy,
  Zap
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [minDeposit, setMinDeposit] = useState(100);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBotToken(data.settings.telegramBotToken || "");
          setChatId(data.settings.telegramChatId || "");
          setUpiId(data.settings.upiId || "");
          setMinDeposit(data.settings.minDeposit || 100);
        }
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: botToken.trim(),
          telegramChatId: chatId.trim(),
          upiId: upiId.trim(),
          minDeposit: Number(minDeposit)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setNotification(data.message || "Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setError("Please enter Bot Token and Chat ID before sending a test message.");
      return;
    }

    setTesting(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sendTestMessage: true,
          telegramBotToken: botToken.trim(),
          telegramChatId: chatId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test message failed");

      setNotification("🎉 Test message sent to your Telegram channel! Webhook is verified.");
    } catch (err: any) {
      setError(err.message || "Failed to send test message");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bot className="w-7 h-7 text-blue-500" />
          Telegram Channel & Platform Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Connect your Telegram Channel/Group to approve deposits with 1-click buttons, get midnight reports, and run commands.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telegram Card */}
        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Telegram Bot & Channel Connection
                </h2>
                <p className="text-xs text-slate-500">Live deposit alerts, 1-tap inline approvals, and midnight reporting</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${botToken && chatId ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"}`}>
              {botToken && chatId ? "Connected" : "Setup Needed"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                1. Telegram Bot Token (from @BotFather)
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 7891234567:AAHq_K8j2mN9..."
                className="w-full px-4 py-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Create a bot via <a href="https://t.me/BotFather" target="_blank" className="text-blue-500 underline font-bold">@BotFather</a> and paste the API token here.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                2. Telegram Channel or Group Chat ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. -1001234567890 or @your_channel_name"
                className="w-full px-4 py-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Add your bot as an <b>Admin</b> to your channel/group, then paste the Chat ID.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Telegram Configuration"}
            </button>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={testing || !botToken || !chatId}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{testing ? "Sending..." : "Send Test Notification"}</span>
            </button>
          </div>
        </div>

        {/* Telegram Features Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">1-Tap Inline Approvals</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tap <b>[Approve]</b> or <b>[Reject]</b> directly under the Telegram receipt message to instantly credit user funds.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Midnight Executive Report</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated financial report dispatched daily at 00:00 IST showing total deposits, orders, and user growth.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Admin Slash Commands</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Run <code>/today</code>, <code>/pending</code>, <code>/credit</code>, or <code>/balance</code> in Telegram anytime.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
