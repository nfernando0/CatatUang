"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Plus,
  Menu,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  breadcrumbTitle?: string;
  onOpenNewTx?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onToggleSidebar?: () => void;
}

const emptySubscribe = () => () => { };

function getTodayFormatted() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function Header({
  breadcrumbTitle = "Pencatatan Pengeluaran",
  onOpenNewTx,
  searchQuery = "",
  onSearchChange,
  onToggleSidebar,
}: HeaderProps) {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Today's formatted date in Indonesian (hydrated on client)
  const todayFormatted = React.useSyncExternalStore(
    emptySubscribe,
    getTodayFormatted,
    () => ""
  );

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            id="header-mobile-sidebar-toggle"
            className="md:hidden p-1.5 rounded border border-zinc-800 bg-[#121216] text-zinc-400 hover:text-zinc-100"
            aria-label="Buka Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <span>Aplikasi</span>
            <span>/</span>
            <span className="text-zinc-300 font-medium">Dashboard</span>
            <span>/</span>
            <span className="text-zinc-400">{breadcrumbTitle}</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 mt-0.5">
            {breadcrumbTitle}
          </span>
        </div>
      </div>

      {/* Center: Search Field */}
      {onSearchChange && (
        <div className="hidden md:flex items-center max-w-sm w-full mx-4">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari transaksi atau kategori..."
              className="w-full rounded-md border border-zinc-800 bg-[#121216] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Right: Quick Action, Date & User Profile */}
      <div className="flex items-center gap-3">
        {/* Date Stamp */}
        <span
          suppressHydrationWarning
          className="hidden xl:inline-block text-[11px] font-mono text-zinc-500 border border-zinc-800/80 rounded px-2 py-1 bg-[#121216]"
        >
          {todayFormatted}
        </span>

        {/* Quick Add Button */}
        {onOpenNewTx && (
          <button
            onClick={onOpenNewTx}
            id="header-add-tx-btn"
            className="flex items-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-3 py-1.5 text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah</span>
          </button>
        )}

        {/* Dark Mode / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          id="header-theme-toggle-btn"
          title={theme === "dark" ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
          aria-label={theme === "dark" ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className="relative rounded-md border border-zinc-800 bg-[#121216] p-1.5 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition flex items-center justify-center group"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-700 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          title="Notifikasi"
          className="relative rounded-md border border-zinc-800 bg-[#121216] p-1.5 text-zinc-400 hover:text-zinc-200 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User Dropdown or Guest Login */}
        {isLoading ? (
          <div className="h-7 w-20 rounded-md bg-zinc-800/60 animate-pulse border border-zinc-800" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="header-user-dropdown-btn"
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-[#121216] p-1.5 text-xs text-zinc-300 hover:border-zinc-700 transition"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 font-mono text-[11px] font-bold text-zinc-200">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {dropdownOpen && (
              <div
                id="header-dropdown-menu"
                className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-800 bg-[#121216] p-1.5 shadow-xl z-50 text-xs"
              >
                <div className="px-2.5 py-1.5 border-b border-zinc-800 mb-1">
                  <p className="font-semibold text-zinc-200 truncate">{user.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">{user.email}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={logout}
                    id="header-logout-btn"
                    className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/30 transition text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            id="header-guest-login-btn"
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#121216] hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-200 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </header>
  );
}
