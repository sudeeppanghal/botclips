"use client";

import React, { useState } from "react";
import { Headphones, Plus, MessageSquare, Send, CheckCircle2, Clock } from "lucide-react";

export default function TicketsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const [tickets, setTickets] = useState([
    {
      id: "TICK-108",
      subject: "Order #1021 Refill Request",
      orderId: "1021",
      status: "Answered",
      date: "Sep 10, 2026",
      messages: [
        { sender: "User", text: "Hi, 50 members dropped on order #1021. Can you please refill?", time: "Sep 10, 10:00 AM" },
        { sender: "Support Admin", text: "Hello! We have triggered the automatic refill server for order #1021. It will complete in 1-2 hours.", time: "Sep 10, 10:24 AM" }
      ]
    },
    {
      id: "TICK-105",
      subject: "UPI Payment UTR Verification",
      orderId: "",
      status: "Closed",
      date: "Sep 07, 2026",
      messages: [
        { sender: "User", text: "Submitted ₹200 deposit UTR 423401928341.", time: "Sep 07, 02:00 PM" },
        { sender: "Support Admin", text: "Approved and balance credited! Thank you.", time: "Sep 07, 02:04 PM" }
      ]
    }
  ]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    const newTick = {
      id: "TICK-" + Math.floor(100 + Math.random() * 900),
      subject,
      orderId,
      status: "Open",
      date: "Today",
      messages: [{ sender: "User", text: message, time: "Just now" }]
    };

    setTickets([newTick, ...tickets]);
    setShowNewModal(false);
    setSubject("");
    setOrderId("");
    setMessage("");
    setActiveTicket(newTick);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const updated = {
      ...activeTicket,
      messages: [
        ...activeTicket.messages,
        { sender: "User", text: replyText.trim(), time: "Just now" }
      ]
    };

    setActiveTicket(updated);
    setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Support Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Need help with an order, refill, or payment? Open a ticket below.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Grid: Ticket List & Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Your Tickets ({tickets.length})
          </h2>
          <div className="space-y-2">
            {tickets.map((t) => (
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
                  <span className="font-mono text-[11px] font-bold text-slate-400">{t.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    t.status === "Answered"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                      : t.status === "Open"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                  {t.subject}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Last update: {t.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Thread (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-slate-400 font-bold">{activeTicket.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeTicket.subject}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{activeTicket.status}</span>
                </div>

                <div className="space-y-3 py-4 max-h-80 overflow-y-auto pr-1">
                  {activeTicket.messages.map((m: any, idx: number) => {
                    const isUser = m.sender === "User";
                    return (
                      <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                          isUser
                            ? "bg-blue-600 text-white rounded-tr-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                        }`}>
                          <div className="text-[10px] opacity-75 font-semibold mb-1">{m.sender}</div>
                          <p>{m.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40 stroke-[1.5]" />
              <p className="text-xs">Select a ticket on the left to view the support conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Open Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Refill request for Order #1021"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Related Order ID (Optional)</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 1024"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
