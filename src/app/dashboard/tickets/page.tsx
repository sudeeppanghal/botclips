"use client";

import React, { useState, useEffect } from "react";
import { Headphones, Plus, MessageSquare, Send, CheckCircle2, Clock, AlertCircle, RefreshCw, Paperclip, Check } from "lucide-react";

export default function TicketsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "ANSWERED" | "CLOSED">("ALL");
  const [ticketSearch, setTicketSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        if (activeTicket) {
          const freshActive = data.tickets.find((t: any) => t.id === activeTicket.id);
          if (freshActive) setActiveTicket(freshActive);
        } else if (data.tickets.length > 0 && !activeTicket) {
          setActiveTicket(data.tickets[0]);
        }
      }
    } catch {
      notify("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          orderId: orderId.trim() || undefined,
          priority,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        notify("Ticket created successfully!");
        setShowNewModal(false);
        setSubject("");
        setOrderId("");
        setMessage("");
        setPriority("NORMAL");
        setTickets((prev) => [data.ticket, ...prev]);
        setActiveTicket(data.ticket);
      } else {
        notify(data.error || "Failed to create ticket");
      }
    } catch {
      notify("Failed to submit ticket. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        const updatedTicket = {
          ...activeTicket,
          status: "CUSTOMER_REPLY",
          messages: [...(activeTicket.messages || []), data.message],
        };
        setActiveTicket(updatedTicket);
        setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
        setReplyText("");
      } else {
        notify(data.error || "Failed to send message");
      }
    } catch {
      notify("Error sending message");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const s = (t.subject || "").toLowerCase();
      const id = (t.id || "").toLowerCase();
      const oid = (t.orderId || "").toLowerCase();
      return s.includes(q) || id.includes(q) || oid.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Headphones className="w-7 h-7 text-blue-600" />
            <span>Support & Help Desk</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live 24/7 assistance for order refills, custom API setups, and payment verifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTickets}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'OPEN', 'ANSWERED', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {s === 'ALL' ? 'All Tickets' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search tickets or order #..."
          value={ticketSearch}
          onChange={(e) => setTicketSearch(e.target.value)}
          className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 w-full sm:w-64"
        />
      </div>

      {/* Grid: Ticket List & Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Your Tickets ({filteredTickets.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Auto-synced</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No tickets found. Click &quot;New Support Ticket&quot; above to contact admin.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    activeTicket?.id === t.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">#{t.id.slice(-6).toUpperCase()}</span>
                      {t.orderId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Order #{t.orderId}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      t.status === "ANSWERED"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                        : t.status === "OPEN" || t.status === "CUSTOMER_REPLY"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                    {t.subject}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{new Date(t.updatedAt || t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[10px] font-mono">{t.messages?.length || 0} messages</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 font-bold">#{activeTicket.id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        activeTicket.status === "ANSWERED"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                          : activeTicket.status === "OPEN"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{activeTicket.subject}</h3>
                    {activeTicket.orderId && (
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Linked Order: #{activeTicket.orderId}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Priority: {activeTicket.priority || "NORMAL"}</span>
                </div>

                <div className="space-y-3 py-4 max-h-96 overflow-y-auto pr-2">
                  {activeTicket.messages && activeTicket.messages.length > 0 ? (
                    activeTicket.messages.map((m: any, idx: number) => {
                      const isSenderUser = m.senderRole === "USER" || m.sender === "User";
                      return (
                        <div key={idx} className={`flex flex-col ${isSenderUser ? "items-end" : "items-start"}`}>
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs ${
                            isSenderUser
                              ? "bg-blue-600 text-white rounded-tr-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-xs"
                          }`}>
                            <div className="text-[10px] opacity-75 font-semibold mb-1 flex items-center justify-between gap-4">
                              <span>{isSenderUser ? "You" : "Support Administrator"}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.message || m.text}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">No messages yet in this thread.</div>
                  )}
                </div>
              </div>

              {/* Reply Input */}
              {activeTicket.status === "CLOSED" ? (
                <div className="p-3 text-center bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 font-bold">
                  This ticket has been marked as CLOSED. Open a new ticket if you need further help.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your message or refill request..."
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? "Sending..." : "Reply"}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40 stroke-[1.5]" />
              <p className="text-xs font-semibold">Select a ticket on the left to view the support conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Create Support Ticket
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Refill request for Order #1021 / Payment verification"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Linked Order ID (Optional)</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 5291"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Message Description *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, refill requirements, or payment details in detail..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {submitting ? "Creating..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
