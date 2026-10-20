"use client";

import React, { useState, useEffect, useRef } from "react";
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
  X,
  Sparkles,
} from "lucide-react";
import { NotificationItem, NotificationType } from "@/lib/types";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: number) => Promise<void>;
  onClearRead: () => Promise<void>;
  onNavigateTab?: (tab: string) => void;
  onOpenFullCenter?: () => void;
  onOpenCreateModal?: () => void;
}

export function formatNotificationTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Baru saja";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return "Kemarin";
    if (diffDay < 7) return `${diffDay} hr lalu`;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);
  } catch {
    return dateString;
  }
}

function getTypeIcon(type: NotificationType) {
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
}

function getTypeBadgeClass(type: NotificationType): string {
  switch (type) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "danger":
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    case "info":
    default:
      return "border-sky-500/20 bg-sky-500/10 text-sky-400";
  }
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearRead,
  onNavigateTab,
  onOpenFullCenter,
  onOpenCreateModal,
}: NotificationDropdownProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications =
    activeFilter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      void onMarkAsRead(item.id);
    }
    if (item.link) {
      // Extract target tab if link starts with slash, e.g., "/savings" -> "savings"
      const cleanTab = item.link.replace(/^\//, "").split("?")[0];
      if (cleanTab && onNavigateTab) {
        onNavigateTab(cleanTab);
        onClose();
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      id="notification-dropdown-panel"
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-[#121216]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Dropdown Header */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60">
            <Bell className="h-3.5 w-3.5 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-100 tracking-tight">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-1.5 py-0.2 text-[10px] font-mono text-blue-400 font-semibold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400">Pemberitahuan aktivitas & saldo</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => void onMarkAllAsRead()}
              id="dropdown-mark-all-read-btn"
              title="Tandai semua telah dibaca"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition"
              aria-label="Tandai semua dibaca"
            >
              <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
            </button>
          )}

          <button
            onClick={() => void onClearRead()}
            id="dropdown-clear-read-btn"
            title="Bersihkan notifikasi yang sudah dibaca"
            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
            aria-label="Bersihkan sudah dibaca"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 transition"
            aria-label="Tutup"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800/60 bg-[#0d0d11]/50 text-xs">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
            activeFilter === "all"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter("unread")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
            activeFilter === "unread"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <span>Belum Dibaca</span>
          {unreadCount > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Notification List Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/40">
        {isLoading ? (
          <div className="p-6 text-center space-y-2">
            <div className="h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[11px] font-mono text-zinc-400">
              MEMUAT NOTIFIKASI...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2.5 text-zinc-500">
              <BellOff className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {activeFilter === "unread"
                ? "Semua notifikasi sudah dibaca"
                : "Belum ada notifikasi"}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Aktivitas transfer, saldo, dan tabungan akan muncul di sini.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 transition-colors cursor-pointer group flex items-start gap-2.5 ${
                  n.is_read
                    ? "hover:bg-zinc-800/40 opacity-80 hover:opacity-100"
                    : "bg-blue-950/15 hover:bg-blue-950/25"
                }`}
              >
                {/* Type Icon Badge */}
                <div
                  className={`mt-0.5 flex-shrink-0 h-7 w-7 rounded-lg border flex items-center justify-center ${getTypeBadgeClass(
                    n.type
                  )}`}
                >
                  {getTypeIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-semibold text-zinc-100 truncate">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                      {formatNotificationTime(n.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between mt-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      {n.category && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                          {n.category}
                        </span>
                      )}
                      {n.link && (
                        <span className="text-[10px] text-blue-400 flex items-center gap-0.5 hover:underline">
                          <span>Buka</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Quick Item Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void onMarkAsRead(n.id);
                          }}
                          title="Tandai dibaca"
                          className="p-1 rounded text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void onDeleteNotification(n.id);
                        }}
                        title="Hapus"
                        className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs gap-2">
        {onOpenCreateModal && (
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            id="dropdown-create-test-notification-btn"
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-900 transition"
          >
            <Plus className="h-3 w-3" />
            <span>Tes / Buat Notif</span>
          </button>
        )}

        {onOpenFullCenter && (
          <button
            onClick={() => {
              onClose();
              onOpenFullCenter();
            }}
            id="dropdown-open-full-center-btn"
            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-950/30 transition"
          >
            <Sparkles className="h-3 w-3" />
            <span>Lihat Semua</span>
          </button>
        )}
      </div>
    </div>
  );
}
