"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  Flame, 
  Rocket, 
  Coins, 
  Heart, 
  Crown, 
  Target, 
  ShieldCheck, 
  Lock, 
  Plus, 
  X, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Pin,
  CheckCircle2,
  AlertCircle,
  Eye,
  Wallet,
  Zap,
  TrendingUp,
  Smile
} from "lucide-react";
import AddFundsModal from "@/components/AddFundsModal";

interface ChatMsg {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userBadge: string;
  avatarUrl?: string | null;
  message: string;
  imageUrl?: string | null;
  reactions: Record<string, string[]>;
  isPinned?: boolean;
  createdAt: string;
}

export default function ChatBoxWinsPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [canChat, setCanChat] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [inputText, setInputText] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load chat messages with lightweight query
  async function loadMessages(isInitial = false) {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch("/api/chat?limit=80");
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setCanChat(Boolean(data.canChat));
        if (data.currentUser) {
          setCurrentUser(data.currentUser);
        }
      }
    } catch {
      // Non-blocking fallback
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages(true);

    // Ultra-efficient visibility-aware live poller (stops when tab inactive to save 100% server bandwidth)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadMessages(false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on initial load or new user message
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Handle image upload direct to Cloudinary or client storage
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      notify("Image size must be under 8MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setShowImageModal(true);
  };

  // Upload image to Cloudinary (direct from client, 0 server bandwidth load)
  async function uploadImageToCloudinary(): Promise<string | null> {
    if (!imageFile && !imageUrlInput) return imageUrlInput || null;
    if (imageUrlInput.trim().startsWith("http")) return imageUrlInput.trim();

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile!);
      formData.append("upload_preset", "botclips_receipts");

      // Try unsigned Cloudinary first
      const clRes = await fetch("https://api.cloudinary.com/v1_1/dhillionsmm/image/upload", {
        method: "POST",
        body: formData,
      });

      if (clRes.ok) {
        const clData = await clRes.json();
        return clData.secure_url || clData.url;
      }

      // Server upload fallback route
      const srvRes = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });
      const srvData = await srvRes.json();
      if (srvData.success && srvData.url) {
        return srvData.url;
      }
    } catch {
      notify("Could not upload image directly. Please paste image URL.");
    } finally {
      setUploadingImage(false);
    }
    return imagePreview || imageUrlInput || null;
  }

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imagePreview && !imageUrlInput) return;

    if (!canChat) {
      setShowAddFundsModal(true);
      return;
    }

    setSubmittingMessage(true);
    try {
      let finalImageUrl: string | null = null;
      if (imageFile || imageUrlInput) {
        finalImageUrl = await uploadImageToCloudinary();
      }

      // Instant Optimistic UI update (0ms lag!)
      const tempId = "temp_" + Date.now();
      const optimisticMsg: ChatMsg = {
        id: tempId,
        userId: currentUser?.id || "me",
        userName: currentUser?.name || currentUser?.email?.split("@")[0] || "You",
        userEmail: currentUser?.email || "",
        userRole: currentUser?.role || "USER",
        userBadge: currentUser?.role === "ADMIN" ? "👑 BOTCLIPS ADMIN" : "🌟 VERIFIED CLIPPER",
        avatarUrl: null,
        message: inputText.trim(),
        imageUrl: finalImageUrl || imagePreview || null,
        reactions: {},
        isPinned: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInputText("");
      setImageFile(null);
      setImagePreview(null);
      setImageUrlInput("");
      setShowImageModal(false);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: optimisticMsg.message,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
      } else if (data.locked) {
        setCanChat(false);
        notify(data.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        notify(data.error || "Failed to send message");
      }
    } catch {
      notify("Network error. Please check connection.");
    } finally {
      setSubmittingMessage(false);
    }
  };

  // Toggle Reaction
  const handleReact = async (messageId: string, emoji: string) => {
    if (!currentUser) {
      notify("Please sign in to react to wins!");
      return;
    }

    // Optimistic toggle
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentList = Array.isArray(m.reactions[emoji]) ? [...m.reactions[emoji]] : [];
        const userIdx = currentList.indexOf(currentUser.id);
        if (userIdx > -1) {
          currentList.splice(userIdx, 1);
        } else {
          currentList.push(currentUser.id);
        }
        return {
          ...m,
          reactions: {
            ...m.reactions,
            [emoji]: currentList,
          },
        };
      })
    );

    try {
      await fetch(`/api/chat/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {}
  };

  // Delete message (Admin or Owner)
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await fetch(`/api/chat?id=${messageId}`, { method: "DELETE" });
      notify("Message deleted");
    } catch {
      notify("Error deleting message");
    }
  };

  const reactionEmojis = ["🔥", "🚀", "💰", "❤️", "👑", "🎯"];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#1e1b4b] border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Chat Box ( Wins )</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Community
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Share your viral video milestones, views volume, Whop payouts, and trade strategies with verified clippers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMessages(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddFundsModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800/90 rounded-3xl shadow-xl flex flex-col h-[680px] overflow-hidden">
        
        {/* Sticky Chat Announcement / Rules Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Anti-Spam Active • Only recharged & verified clippers can post screenshots & text</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400">
            {messages.length} Community Messages
          </span>
        </div>

        {/* Scrollable Messages Stream */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <p className="font-bold">Loading live creator wins...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Wins Posted Yet!</h3>
              <p className="text-xs max-w-sm text-slate-400">
                Be the first creator to share your view milestone, viral algorithm spike, or earnings screenshot!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser && msg.userId === currentUser.id;
              const isAdmin = msg.userRole === "ADMIN";

              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3 group transition-all ${
                    msg.isPinned ? "bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20" : ""
                  }`}
                >
                  {/* User Avatar */}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                    isAdmin 
                      ? "bg-gradient-to-br from-amber-500 to-rose-600 text-white ring-2 ring-amber-400/40" 
                      : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                  }`}>
                    {msg.userName.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Message Content Body */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {msg.userName}
                      </span>

                      {/* Badge Pill */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isAdmin
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : msg.userBadge.includes("VIP")
                          ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                          : msg.userBadge.includes("TOP")
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      }`}>
                        {msg.userBadge}
                      </span>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Delete action for Admin or Author */}
                      {(currentUser?.role === "ADMIN" || isMe) && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 cursor-pointer ml-auto"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Text Message */}
                    {msg.message && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    )}

                    {/* Image Attachment (Win Screenshot) */}
                    {msg.imageUrl && (
                      <div className="pt-1">
                        <div 
                          onClick={() => setLightboxImage(msg.imageUrl!)}
                          className="relative max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group/img cursor-zoom-in bg-slate-950 shadow-md"
                        >
                          <img 
                            src={msg.imageUrl} 
                            alt="Win Screenshot" 
                            className="w-full max-h-72 object-cover transition-transform duration-200 group-hover/img:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                            <Eye className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {reactionEmojis.map((emoji) => {
                        const userIds = msg.reactions[emoji] || [];
                        const count = userIds.length;
                        const hasReacted = currentUser && userIds.includes(currentUser.id);

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer border ${
                              hasReacted
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold scale-105"
                                : count > 0
                                ? "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 opacity-60 hover:opacity-100"
                            }`}
                            title={`React with ${emoji}`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[10px] font-bold">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ──────────────── SMART BOTTOM BAR (GATED OR ACTIVE) ──────────────── */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          {canChat ? (
            /* ALLOWED / ACTIVE CHAT INPUT */
            <form onSubmit={handleSendMessage} className="space-y-2">
              {imagePreview && (
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-xs relative">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">Screenshot Attached</span>
                    <span className="text-[10px] text-emerald-500 font-medium">Ready to share</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Image Upload Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Attach Win Screenshot"
                >
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Share your viral milestone, views volume, or ask clippers..."
                  className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-inner"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={submittingMessage || (!inputText.trim() && !imagePreview)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingMessage ? "Posting..." : "Post Win"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* 🔒 LOCKED / DEPOSIT-GATED STATE */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Chat Box Gated for Verified Creators</span>
                    <span className="px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-500 text-[10px] uppercase font-bold">
                      Recharge Required
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    You can chat 💬 and share your wins after your first recharge / deposit!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddFundsModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Add Funds / Recharge to Unlock</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Win High Resolution" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => {
          setShowAddFundsModal(false);
          loadMessages(false);
        }}
        onFundsAdded={() => {
          setCanChat(true);
          notify("Deposit recorded! Chat permissions unlocked.");
          loadMessages(false);
        }}
      />
    </div>
  );
}
