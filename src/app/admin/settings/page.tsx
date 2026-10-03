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
  Zap,
  QrCode,
  Smartphone,
  RefreshCw,
  X,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Telegram Config State
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");

  // UPI Gateway & QR State
  const [upiId, setUpiId] = useState("Jaatdhillon@fam");
  const [savedUpiId, setSavedUpiId] = useState("Jaatdhillon@fam");
  const [minDeposit, setMinDeposit] = useState(100);
  const [savedMinDeposit, setSavedMinDeposit] = useState(100);
  const [savingUpi, setSavingUpi] = useState(false);
  const [showUpiConfirmModal, setShowUpiConfirmModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // FamPay Automation State
  const [fampayWebhookSecret, setFampayWebhookSecret] = useState("");
  const [fampayAutoApprove, setFampayAutoApprove] = useState(false);
  const [fampayWindowHours, setFampayWindowHours] = useState(24);
  const [savingFampay, setSavingFampay] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Master Admin Credentials State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingCreds, setSavingCreds] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBotToken(data.settings.telegramBotToken || "");
          setChatId(data.settings.telegramChatId || "");
          const currentUpi = data.settings.upiId || "Jaatdhillon@fam";
          const currentMin = Number(data.settings.minDeposit) || 100;
          setUpiId(currentUpi);
          setSavedUpiId(currentUpi);
          setMinDeposit(currentMin);
          setSavedMinDeposit(currentMin);
          setFampayWebhookSecret(data.settings.fampayWebhookSecret || "");
          setFampayAutoApprove(Boolean(data.settings.fampayAutoApprove));
          setFampayWindowHours(Number(data.settings.fampayVerificationWindowHours) || 24);
        }
      })
      .catch(() => setError("Failed to load platform settings"))
      .finally(() => setLoading(false));
  }, []);

  // UPI Live Preview QR calculation
  const activePreviewUpi = upiId.trim() || "Jaatdhillon@fam";
  const previewAmount = Math.max(1, Number(minDeposit) || 100);
  const previewUpiUri = `upi://pay?pa=${encodeURIComponent(activePreviewUpi)}&pn=BotClips&am=${previewAmount}&cu=INR&tn=${encodeURIComponent(`BotClips Deposit ₹${previewAmount}`)}`;
  const previewQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(previewUpiUri)}`;

  // Handle open UPI confirmation modal
  const handleOpenUpiModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes("@")) {
      setError("Please enter a valid UPI ID / VPA containing an '@' symbol (e.g. yourname@fam or merchant@okhdfcbank).");
      return;
    }
    setError(null);
    setShowUpiConfirmModal(true);
  };

  // Execute UPI Update after admin confirmation
  const handleConfirmUpiUpdate = async () => {
    setSavingUpi(true);
    setError(null);
    setNotification(null);

    try {
      const cleanMin = Math.max(1, Number(minDeposit) || 50);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiId: upiId.trim(),
          minDeposit: cleanMin
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update UPI settings");

      setSavedUpiId(upiId.trim());
      setSavedMinDeposit(cleanMin);
      setShowUpiConfirmModal(false);
      setNotification(`🎉 SUCCESS: Payment settings saved! Receiving UPI set to "${upiId.trim()}" and Minimum Deposit set to ₹${cleanMin} INR. Active platform-wide.`);
    } catch (err: any) {
      setError(err.message || "Failed to update UPI address");
    } finally {
      setSavingUpi(false);
    }
  };

  // Handle Master Credentials
  const handleChangeCredentials = async () => {
    if (!newEmail.trim() && !newPassword.trim()) return;
    if (newPassword.trim() && newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSavingCreds(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newAdminEmail: newEmail.trim() || undefined,
          newAdminPassword: newPassword.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update admin credentials");

      setNotification("✅ Master Admin credentials updated successfully!");
      setNewPassword("");
      if (newEmail.trim()) setNewEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to update credentials");
    } finally {
      setSavingCreds(false);
    }
  };

  // Handle Telegram Save
  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegram(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: botToken.trim(),
          telegramChatId: chatId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save Telegram settings");

      setNotification("✅ Telegram bot configuration saved successfully!");
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSavingTelegram(false);
    }
  };

  // Handle Send Test Telegram Notification
  const handleSendTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setError("Please enter Bot Token and Chat ID before sending a test message.");
      return;
    }

    setTestingTelegram(true);
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
      setTestingTelegram(false);
    }
  };

  const handleSaveFampay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFampay(true);
    setError(null);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fampayWebhookSecret: fampayWebhookSecret.trim(),
          fampayAutoApprove,
          fampayVerificationWindowHours: Number(fampayWindowHours) || 24
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save FamPay settings");

      setNotification("⚡ FamPay automation configuration saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update FamPay settings");
    } finally {
      setSavingFampay(false);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-blue-500" />
          Payment Gateway & Platform Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your receiving UPI address with instant auto-generated QR code, Telegram notifications, and admin credentials.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-emerald-500/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-rose-500/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. UPI PAYMENT GATEWAY & AUTO QR CODE GENERATOR                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="upi-settings" className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  UPI Payment Gateway & Live QR Code
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                  Auto-Generated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Change your receiving UPI address. The QR code and 1-click app intents for all users will update immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold text-slate-500">Active Receiving UPI:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-300 font-mono font-bold text-xs select-all">
              {savedUpiId}
            </span>
          </div>
        </div>

        <form onSubmit={handleOpenUpiModal} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Input fields */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Receiving UPI ID / VPA Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.trim())}
                  placeholder="e.g. yourname@fam or merchant@okhdfcbank"
                  className="w-full px-4 py-3 text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(upiId);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1.5 block leading-relaxed">
                Enter the exact UPI handle from PhonePe, Google Pay, Paytm, BHIM or Bank. All user payments will be routed to this ID.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Minimum Deposit Limit (₹ INR) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm font-bold bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Currently set to ₹{savedMinDeposit} INR. Users across the platform cannot deposit below this threshold.
              </span>
            </div>

            {/* Change Status Indicator */}
            {(upiId !== savedUpiId || Number(minDeposit) !== Number(savedMinDeposit)) && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Unsaved Payment Configuration Changes:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {upiId !== savedUpiId && (
                      <li>
                        Receiving UPI: <strong className="font-mono">{savedUpiId}</strong> → <strong className="font-mono">{upiId}</strong>
                      </li>
                    )}
                    {Number(minDeposit) !== Number(savedMinDeposit) && (
                      <li>
                        Minimum Deposit: <strong>₹{savedMinDeposit} INR</strong> → <strong>₹{minDeposit} INR</strong>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingUpi}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Deposit & UPI Configuration</span>
            </button>
          </div>

          {/* Right: Live Auto-Generated QR Code Preview */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Live Auto-Generated QR Preview
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time
              </span>
            </div>

            {/* QR Box */}
            <div className="w-48 h-48 bg-white p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center relative group">
              <img
                src={previewQrUrl}
                alt="Auto-Generated UPI QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-1 w-full text-left bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI Intent Link:</div>
              <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate select-all">
                {previewUpiUri}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you confirm, this exact QR code and payment intent will automatically show on every user's Wallet page.
            </p>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. TELEGRAM BOT & NOTIFICATION CONFIGURATION                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSaveTelegram} className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Telegram Bot & Channel Alerts
              </h2>
              <p className="text-xs text-slate-500">Instant deposit alerts with 1-tap inline buttons and midnight reports</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${botToken && chatId ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"}`}>
            {botToken && chatId ? "Connected" : "Setup Needed"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Telegram Bot Token (from @BotFather)
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
              Telegram Channel or Group Chat ID
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
            disabled={savingTelegram}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {savingTelegram ? "Saving..." : "Save Telegram Configuration"}
          </button>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testingTelegram || !botToken || !chatId}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{testingTelegram ? "Sending..." : "Send Test Notification"}</span>
          </button>
        </div>
      </form>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. FAMPAY GMAIL AUTOMATION & WEBHOOK SETTINGS                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSaveFampay} className="bg-white dark:bg-[#131b2e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  FamPay Gmail UTR Auto-Verification
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  fampayAutoApprove
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {fampayAutoApprove ? "⚡ Auto-Approve Active" : "🛡️ Manual Review Mode"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically verify user deposits against real FamPay transaction emails sent via Google Apps Script
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* Webhook Endpoint Display */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Webhook Endpoint URL (Target for Google Apps Script)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value="https://botclips.online/api/payments/fampay/webhook"
                className="w-full px-4 py-3 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-purple-400 outline-none select-all pr-24"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://botclips.online/api/payments/fampay/webhook");
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Configure this exact URL as the <code className="text-purple-300">WEBHOOK_URL</code> in your Google Apps Script project.
            </span>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Webhook Secret Header (x-webhook-secret)
            </label>
            <div className="relative">
              <input
                type="text"
                value={fampayWebhookSecret}
                onChange={(e) => setFampayWebhookSecret(e.target.value)}
                placeholder="Enter or generate a strong shared secret token"
                className="w-full px-4 py-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors pr-44"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const rand = "sec_fam_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    setFampayWebhookSecret(rand);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Generate random secret"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(fampayWebhookSecret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  disabled={!fampayWebhookSecret}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Copy secret"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Set the same token as <code className="text-purple-300">WEBHOOK_SECRET</code> in Google Apps Script Script Properties.
            </span>
          </div>

          {/* Auto-Approval Toggle & Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Instant Auto-Approval Mode
                </span>
                <span className="text-[11px] text-slate-400">
                  {fampayAutoApprove 
                    ? "Credit wallet immediately upon 100% UTR & amount match" 
                    : "Match payments in database, but wait for admin 1-click confirmation"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFampayAutoApprove(!fampayAutoApprove)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  fampayAutoApprove ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  fampayAutoApprove ? "left-6.5" : "left-0.5"
                }`} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Verification Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={fampayWindowHours}
                onChange={(e) => setFampayWindowHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Maximum age difference allowed between email notification and deposit claim (default: 24h).
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingFampay}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{savingFampay ? "Saving..." : "Save FamPay Automation Settings"}</span>
          </button>
        </div>
      </form>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. MASTER ADMIN CREDENTIALS & SECURITY                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Master Admin Credentials & Security
              </h2>
              <p className="text-xs text-slate-500">Change your secret admin login email and password</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              New Admin Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. your_secret_admin@domain.com"
              className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Leave blank if you only want to change your password.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              New Admin Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Minimum 6 characters. Leave blank if not changing password.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleChangeCredentials}
          disabled={savingCreds || (!newEmail.trim() && !newPassword.trim())}
          className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{savingCreds ? "Updating..." : "Update Master Admin Credentials"}</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. CONFIRMATION MODAL FOR UPI CHANGE                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showUpiConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm UPI Address Change</h3>
                  <p className="text-[11px] text-slate-400">Platform-Wide Update</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 font-medium">Previous UPI Address:</span>
                  <span className="font-mono font-bold text-slate-300 select-all">{savedUpiId}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                  <span className="text-blue-300 font-bold">New UPI Address:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm select-all">{upiId.trim()}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 font-medium">Enforced Minimum Deposit:</span>
                  <span className="font-bold text-amber-400 text-sm">₹{minDeposit} INR</span>
                </div>
              </div>

              {/* QR Preview in Modal */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                  <img
                    src={previewQrUrl}
                    alt="New UPI QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-2">
                  Auto-generated for: <strong className="text-white font-mono">{upiId.trim()}</strong>
                </span>
              </div>

              {/* Warning box */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Immediate Effect Notice:</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  All active users visiting the Wallet deposit page or Add Funds modal will immediately see this new UPI ID and its auto-generated QR code.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUpiConfirmModal(false)}
                disabled={savingUpi}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmUpiUpdate}
                disabled={savingUpi}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                {savingUpi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating Platform...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Confirm & Activate New UPI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
