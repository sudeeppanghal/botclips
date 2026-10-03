"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  MousePointerClick,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Clock,
  Search,
  Check,
  X,
  Upload,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface BannerItem {
  id: string;
  name: string;
  imageUrl: string;
  badge?: string | null;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText?: string | null;
  secondaryButtonUrl?: string | null;
  openLinksNewTab: boolean;
  status: "ACTIVE" | "INACTIVE";
  showOnDashboard: boolean;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
  impressions: number;
  primaryClicks: number;
  secondaryClicks: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerStats {
  total: number;
  active: number;
  impressions: number;
  primaryClicks: number;
  secondaryClicks: number;
  clicks: number;
  ctr: string;
}

const DEFAULT_BANNER_IMAGE = "/banners/promotion-banned-16-9.png";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [stats, setStats] = useState<BannerStats>({
    total: 0,
    active: 0,
    impressions: 0,
    primaryClicks: 0,
    secondaryClicks: 0,
    clicks: 0,
    ctr: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Preview Modal
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "16:9 Views Promotion",
    imageUrl: DEFAULT_BANNER_IMAGE,
    badge: "PROMOTION",
    title: "PROMOTION BANNED",
    description: "Get real views for your 16:9 videos without any risk",
    primaryButtonText: "Go Now",
    primaryButtonUrl: "/dashboard/services",
    secondaryButtonText: "Click Here",
    secondaryButtonUrl: "https://t.me/botclipssmm",
    openLinksNewTab: true,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    showOnDashboard: true,
    enableSchedule: false,
    startDate: "",
    endDate: "",
    priority: 1,
  });

  const notify = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
        if (data.stats) setStats(data.stats);
      } else {
        notify(data.error || "Failed to load banners", "error");
      }
    } catch {
      notify("Failed to connect to banners API", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      name: "16:9 Views Promotion",
      imageUrl: DEFAULT_BANNER_IMAGE,
      badge: "PROMOTION",
      title: "PROMOTION BANNED",
      description: "Get real views for your 16:9 videos without any risk",
      primaryButtonText: "Go Now",
      primaryButtonUrl: "/dashboard/services",
      secondaryButtonText: "Click Here",
      secondaryButtonUrl: "https://t.me/botclipssmm",
      openLinksNewTab: true,
      status: "ACTIVE",
      showOnDashboard: true,
      enableSchedule: false,
      startDate: "",
      endDate: "",
      priority: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      imageUrl: banner.imageUrl,
      badge: banner.badge || "",
      title: banner.title,
      description: banner.description,
      primaryButtonText: banner.primaryButtonText,
      primaryButtonUrl: banner.primaryButtonUrl,
      secondaryButtonText: banner.secondaryButtonText || "",
      secondaryButtonUrl: banner.secondaryButtonUrl || "",
      openLinksNewTab: banner.openLinksNewTab ?? true,
      status: banner.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      showOnDashboard: banner.showOnDashboard ?? true,
      enableSchedule: Boolean(banner.startDate || banner.endDate),
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : "",
      priority: banner.priority || 1,
    });
    setShowModal(true);
  };

  const handleDuplicate = async (banner: BannerItem) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, action: "duplicate" }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Duplicated as "${banner.name} (Copy)"`, "success");
        loadBanners();
      } else {
        notify(data.error || "Failed to duplicate banner", "error");
      }
    } catch {
      notify("Duplicate failed", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, PNG, WebP
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      notify("Invalid file format. Only JPG, PNG, and WebP are supported.", "error");
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      notify("Image file size must be less than 8MB.", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        notify("Banner image uploaded successfully!", "success");
      } else {
        notify(data.error || "Failed to upload image", "error");
      }
    } catch {
      notify("Upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      notify("Banner image URL is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        imageUrl: formData.imageUrl.trim(),
        badge: formData.badge ? formData.badge.trim() : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        primaryButtonText: formData.primaryButtonText.trim(),
        primaryButtonUrl: formData.primaryButtonUrl.trim(),
        secondaryButtonText: formData.secondaryButtonText ? formData.secondaryButtonText.trim() : null,
        secondaryButtonUrl: formData.secondaryButtonUrl ? formData.secondaryButtonUrl.trim() : null,
        openLinksNewTab: formData.openLinksNewTab,
        status: formData.status,
        showOnDashboard: formData.showOnDashboard,
        startDate: formData.enableSchedule && formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.enableSchedule && formData.endDate ? new Date(formData.endDate).toISOString() : null,
        priority: Number(formData.priority) || 1,
      };

      let res;
      if (editingBanner) {
        res = await fetch("/api/admin/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBanner.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        notify(editingBanner ? "Banner updated successfully" : "Banner published successfully", "success");
        setShowModal(false);
        loadBanners();
      } else {
        notify(data.error || "Failed to save banner", "error");
      }
    } catch {
      notify("An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    const newStatus = banner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Banner marked as ${newStatus}`, "success");
        loadBanners();
      } else {
        notify(data.error || "Failed to update status", "error");
      }
    } catch {
      notify("Failed to toggle status", "error");
    }
  };

  const handleToggleDashboard = async (banner: BannerItem) => {
    const nextVal = !banner.showOnDashboard;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, showOnDashboard: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        notify(nextVal ? "Dashboard display enabled" : "Dashboard display disabled", "success");
        loadBanners();
      } else {
        notify(data.error || "Failed to update dashboard visibility", "error");
      }
    } catch {
      notify("Failed to toggle dashboard visibility", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        notify("Banner deleted successfully", "success");
        loadBanners();
      } else {
        notify(data.error || "Failed to delete banner", "error");
      }
    } catch {
      notify("Failed to delete banner", "error");
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && b.status === "ACTIVE") ||
      (statusFilter === "INACTIVE" && b.status === "INACTIVE");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-bounce ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Promotion Banner
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage promotional banners displayed on the user dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadBanners}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-purple-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Promotion</span>
          </button>
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Banners</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Active Banners</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Impressions</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.impressions.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">Primary Clicks</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.primaryClicks.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-fuchsia-500 uppercase tracking-wider">Secondary Clicks</div>
          <div className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400 mt-1">
            {stats.secondaryClicks.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Average CTR</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.ctr}%</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#131b2e] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search banner name, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Banners List / Table */}
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Loading promotional banners...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Promotion Banners Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first 16:9 promotional banner to start displaying promotions on the user dashboard.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              + Create Promotion Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Banner Preview</th>
                  <th className="py-3.5 px-4">Name & Title</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Dashboard</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4 text-right">Impressions</th>
                  <th className="py-3.5 px-4 text-right">Clicks (Pri / Sec)</th>
                  <th className="py-3.5 px-4 text-right">CTR</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredBanners.map((banner) => {
                  const ctr =
                    banner.impressions > 0
                      ? ((banner.clicks / banner.impressions) * 100).toFixed(2) + "%"
                      : "0.00%";

                  return (
                    <tr
                      key={banner.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      {/* Banner Preview Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setPreviewBanner(banner)}
                          className="relative w-28 aspect-[16/9] rounded-lg overflow-hidden border border-purple-500/30 group cursor-pointer shadow-xs bg-slate-900 shrink-0"
                          title="Click to view live preview"
                        >
                          <img
                            src={banner.imageUrl}
                            alt={banner.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </td>

                      {/* Banner Name & Details */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {banner.name}
                          </span>
                          {banner.badge && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black border border-purple-500/30">
                              {banner.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 line-clamp-1">
                          {banner.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {banner.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Pri: {banner.primaryButtonText}
                          </span>
                          {banner.secondaryButtonText && (
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              Sec: {banner.secondaryButtonText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold font-mono text-[11px]">
                          #{banner.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(banner)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                            banner.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30 hover:bg-slate-500/25"
                          }`}
                          title="Click to toggle status"
                        >
                          {banner.status === "ACTIVE" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              INACTIVE
                            </>
                          )}
                        </button>
                      </td>

                      {/* Show On Dashboard */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleDashboard(banner)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                            banner.showOnDashboard
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                          title="Click to toggle dashboard display"
                        >
                          {banner.showOnDashboard ? "ON" : "OFF"}
                        </button>
                      </td>

                      {/* Schedule Dates */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {banner.startDate || banner.endDate ? (
                          <div className="space-y-0.5">
                            <div>Start: {banner.startDate ? new Date(banner.startDate).toLocaleString() : "Immediate"}</div>
                            <div>End: {banner.endDate ? new Date(banner.endDate).toLocaleString() : "No Expiry"}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Always Active</span>
                        )}
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {banner.impressions.toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                        <div className="font-bold">{banner.clicks.toLocaleString()} total</div>
                        <div className="text-[10px] text-slate-400">
                          {banner.primaryClicks} / {banner.secondaryClicks}
                        </div>
                      </td>

                      {/* CTR */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ctr}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions: Edit, Duplicate, Activate/Deactivate, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(banner)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                            title="Edit Promotion"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(banner)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                            title="Duplicate Promotion"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(banner.id, banner.name)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Delete Promotion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ──────────────── CREATE / EDIT MODAL ──────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingBanner ? "Edit Promotion Banner" : "Create New Promotion Banner"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure the 16:9 banner displayed on the user dashboard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* ──────────────── LIVE PREVIEW SECTION ──────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>Live Preview (Exact Dashboard Render)</span>
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    16:9 Aspect Ratio
                  </span>
                </div>

                <div className="relative w-full aspect-[16/9] min-h-[260px] sm:min-h-[300px] rounded-2xl overflow-hidden border border-purple-500/40 bg-[#090511] shadow-[0_4px_30px_rgba(168,85,247,0.25)] flex flex-col justify-end p-5 sm:p-7 md:p-8">
                  <img
                    src={formData.imageUrl || DEFAULT_BANNER_IMAGE}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as any).src = DEFAULT_BANNER_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07040d] via-[#07040d]/75 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07040d]/90 via-[#07040d]/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-2.5">
                    {formData.badge && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-[10px] font-black uppercase tracking-widest text-purple-200">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        <span>{formData.badge}</span>
                      </div>
                    )}
                    {formData.title && (
                      <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                        <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                          {formData.title}
                        </span>
                      </h4>
                    )}
                    {formData.description && (
                      <p className="text-xs sm:text-sm text-purple-100/90 font-medium line-clamp-2 max-w-xl drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
                        {formData.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      {formData.primaryButtonText && (
                        <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-black text-xs shadow-md flex items-center gap-1.5">
                          <span>{formData.primaryButtonText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {formData.secondaryButtonText && (
                        <div className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 backdrop-blur-md">
                          <span>{formData.secondaryButtonText}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ──────────────── FORM FIELDS ──────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Promotion Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    1. Promotion Name (Internal)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. 16:9 Views Promotion"
                  />
                </div>

                {/* Banner Image Upload & URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      2. Banner Image (16:9 Aspect Ratio)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{uploadingImage ? "Uploading..." : "Upload File (JPG/PNG/WebP)"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: DEFAULT_BANNER_IMAGE })}
                        className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                      >
                        Reset to Default Graphic
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white font-mono"
                    placeholder="/banners/promotion-banned-16-9.png or https://..."
                  />
                </div>

                {/* Small Badge / Label */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    3. Small Badge / Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. PROMOTION"
                  />
                </div>

                {/* Main Heading */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    4. Main Heading
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. PROMOTION BANNED"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    5. Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Get real views for your 16:9 videos without any risk"
                  />
                </div>

                {/* Primary Button Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    6. Primary Button Text
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.primaryButtonText}
                    onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Go Now"
                  />
                </div>

                {/* Primary Button URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    7. Primary Button URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.primaryButtonUrl}
                    onChange={(e) => setFormData({ ...formData, primaryButtonUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. /dashboard/services"
                  />
                </div>

                {/* Secondary Button Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    8. Secondary Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonText}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Click Here"
                  />
                </div>

                {/* Secondary Button URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    9. Secondary Button URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonUrl}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="e.g. https://t.me/botclipssmm"
                  />
                </div>

                {/* Open Link In */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    10. Open Link In
                  </label>
                  <select
                    value={formData.openLinksNewTab ? "NEW_TAB" : "SAME_TAB"}
                    onChange={(e) => setFormData({ ...formData, openLinksNewTab: e.target.value === "NEW_TAB" })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="NEW_TAB">New Tab (Default)</option>
                    <option value="SAME_TAB">Same Tab</option>
                  </select>
                </div>

                {/* Display Priority */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Display Priority (1 = Highest)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Status & Show On Dashboard */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Show On Dashboard
                  </label>
                  <select
                    value={formData.showOnDashboard ? "ON" : "OFF"}
                    onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.value === "ON" })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="ON">ON (Visible on user dashboard)</option>
                    <option value="OFF">OFF (Hidden)</option>
                  </select>
                </div>

                {/* Scheduling Section */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Date & Time Scheduling
                      </span>
                      <p className="text-[11px] text-slate-400">
                        If disabled, banner remains active permanently until manually toggled.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableSchedule}
                        onChange={(e) => setFormData({ ...formData, enableSchedule: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Schedule</span>
                    </label>
                  </div>

                  {formData.enableSchedule && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Start Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-purple-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingBanner ? "Update Banner" : "Publish Banner"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── FULL PREVIEW MODAL ──────────────── */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl rounded-2xl bg-[#090511] border border-purple-500/40 p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{previewBanner.name} (Live 16:9 View)</span>
              </h3>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-purple-500/30">
              <img
                src={previewBanner.imageUrl}
                alt={previewBanner.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07040d] via-[#07040d]/75 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07040d]/90 via-[#07040d]/40 to-transparent pointer-events-none" />

              <div className="relative z-10 h-full w-full p-6 sm:p-8 flex flex-col justify-end space-y-2">
                {previewBanner.badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-[11px] font-black uppercase text-purple-200 self-start">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{previewBanner.badge}</span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase drop-shadow-md">
                  {previewBanner.title}
                </h2>
                <p className="text-xs sm:text-sm text-purple-100/90 font-medium max-w-xl drop-shadow">
                  {previewBanner.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-black text-xs shadow-md">
                    {previewBanner.primaryButtonText}
                  </div>
                  {previewBanner.secondaryButtonText && (
                    <div className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold">
                      {previewBanner.secondaryButtonText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
