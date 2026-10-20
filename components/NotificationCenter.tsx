"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Trash2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NotificationItem, NotificationType } from "@/lib/types";
import { formatNotificationTime } from "./NotificationDropdown";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: number) => Promise<void>;
  onClearRead: () => Promise<void>;
  onOpenCreateModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  loading,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearRead,
  onOpenCreateModal,
  onNavigateTab,
}: NotificationCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // KPI Summary calculations
  const totalCount = notifications.length;
  const successCount = notifications.filter((n) => n.type === "success").length;
  const warningOrDangerCount = notifications.filter(
    (n) => n.type === "warning" || n.type === "danger"
  ).length;

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchCat) return false;
      }

      // Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "unread" && item.is_read) return false;
      if (statusFilter === "read" && !item.is_read) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [notifications, searchQuery, typeFilter, statusFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      void onMarkAsRead(item.id);
    }
    if (item.link) {
      const cleanTab = item.link.replace(/^\//, "").split("?")[0];
      if (cleanTab) {
        onNavigateTab(cleanTab);
      }
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "danger":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-sky-400" />;
    }
  };

  const getTypeBadgeClass = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-950/40 text-emerald-300";
      case "warning":
        return "border-amber-500/30 bg-amber-950/40 text-amber-300";
      case "danger":
        return "border-rose-500/30 bg-rose-950/40 text-rose-300";
      case "info":
      default:
        return "border-sky-500/30 bg-sky-950/40 text-sky-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions Bar */}
      <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60">
              <Bell className="h-4 w-4 text-zinc-100" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
              Pusat Notifikasi & Log Aktivitas
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-mono text-blue-400 font-semibold">
                {unreadCount} BELUM DIBACA
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau seluruh rekam jejak transfer saldo, pencapaian target tabungan, dan peringatan sistem secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => void onRefresh()}
            disabled={loading}
            id="notif-center-refresh-btn"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Perbarui</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={() => void onMarkAllAsRead()}
              id="notif-center-mark-all-read-btn"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          <button
            onClick={() => void onClearRead()}
            id="notif-center-clear-read-btn"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-rose-950/30 px-3 py-1.5 text-xs text-zinc-400 hover:text-rose-400 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Dibaca</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            id="notif-center-create-test-btn"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Uji / Buat Notif</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Notifikasi */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>TOTAL NOTIFIKASI</span>
            <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
              <Layers className="h-3.5 w-3.5 text-zinc-300" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
              {loading ? "..." : totalCount}
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Riwayat tersimpan di backend & lokal
          </span>
        </div>

        {/* Card 2: Belum Dibaca */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>BELUM DIBACA</span>
            <div className="p-1.5 rounded bg-blue-950/40 border border-blue-800/40">
              <Bell className="h-3.5 w-3.5 text-blue-400" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400 tracking-tight">
              {loading ? "..." : unreadCount}
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {unreadCount === 0 ? "Semua telah ditinjau" : "Memerlukan perhatian Anda"}
          </span>
        </div>

        {/* Card 3: Sukses & Pencapaian */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>PENCAPAIAN & SUKSES</span>
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {loading ? "..." : successCount}
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Target tabungan & transfer sukses
          </span>
        </div>

        {/* Card 4: Peringatan & Info */}
        <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>PERINGATAN & RISIKO</span>
            <div className="p-1.5 rounded bg-amber-950/40 border border-amber-800/40">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {loading ? "..." : warningOrDangerCount}
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Pemberitahuan saldo & jatuh tempo
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, kata kunci pesan, atau kategori..."
              className="w-full rounded-md border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 border border-zinc-800 bg-[#09090b] p-1 rounded-md text-xs">
            <button
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-[11px] font-medium transition ${
                statusFilter === "all"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setStatusFilter("unread");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-[11px] font-medium transition flex items-center gap-1.5 ${
                statusFilter === "unread"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Belum Dibaca</span>
              {unreadCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => {
                setStatusFilter("read");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-[11px] font-medium transition ${
                statusFilter === "read"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sudah Dibaca
            </button>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
            <Filter className="h-3 w-3" />
            <span>TIPE:</span>
          </div>
          {["all", "info", "success", "warning", "danger"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition ${
                typeFilter === t
                  ? "bg-zinc-200 text-zinc-950 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t === "all" ? "Semua Tipe" : t}
            </button>
          ))}

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 ml-auto">
            <span>KATEGORI:</span>
          </div>
          {["all", "wallet", "saving", "transaction", "system"].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategoryFilter(c);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition ${
                categoryFilter === c
                  ? "bg-zinc-200 text-zinc-950 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {c === "all" ? "Semua Kategori" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Table / Feed */}
      <div className="rounded-lg border border-zinc-800 bg-[#121216] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-6 w-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-400">
              MEMUAT DATA NOTIFIKASI DARI SERVER...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
              <BellOff className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Tidak Ada Notifikasi Ditemukan
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                ? "Tidak ada notifikasi yang sesuai dengan filter atau kata kunci pencarian Anda."
                : "Belum ada notifikasi yang tercatat. Notifikasi akan otomatis muncul ketika ada mutasi saldo, pencapaian tabungan, atau pesan sistem."}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Kirim Notifikasi Uji Coba Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {paginatedNotifications.map((n) => {
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    n.is_read
                      ? "hover:bg-zinc-800/30 opacity-80 hover:opacity-100"
                      : "bg-blue-950/10 hover:bg-blue-950/20 border-l-2 border-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Type Badge Icon */}
                    <div
                      className={`flex-shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center mt-0.5 ${getTypeBadgeClass(
                        n.type
                      )}`}
                    >
                      {getTypeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-zinc-100">
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40">
                            BARU
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getTypeBadgeClass(
                            n.type
                          )}`}
                        >
                          {n.type}
                        </span>
                        {n.category && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                            {n.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatNotificationTime(n.created_at)}</span>
                        </span>
                        {n.link && (
                          <span className="text-blue-400 flex items-center gap-0.5 hover:underline font-sans">
                            <span>Tautan: {n.link}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                    {!n.is_read ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void onMarkAsRead(n.id);
                        }}
                        title="Tandai sebagai dibaca"
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-blue-400 transition"
                      >
                        <Check className="h-3 w-3" />
                        <span className="hidden sm:inline">Tandai Dibaca</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500 px-2">
                        Dibaca
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void onDeleteNotification(n.id);
                      }}
                      title="Hapus notifikasi ini"
                      className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 border border-zinc-800 bg-zinc-900 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} dari{" "}
              {filteredNotifications.length} notifikasi
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 font-mono text-zinc-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
