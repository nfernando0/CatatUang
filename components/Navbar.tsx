"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Wallet,
  LogOut,
  RefreshCw,
  Server,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout, backendStatus, checkBackend, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Identity (Enterprise Minimal) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            id="nav-brand-link"
            className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                CatatUang
              </span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                v1.0
              </span>
            </div>
          </Link>


        </div>

        {/* Center: High-Density Live Telemetry */}
        <div className="hidden md:flex items-center gap-2">
          <div
            id="backend-status-pill"
            className="flex items-center gap-2 rounded-md border border-zinc-800 bg-[#0e0e11] px-2.5 py-1 text-xs font-mono"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${backendStatus.isOnline ? "bg-emerald-400" : "bg-rose-400"
                }`}
            />
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Server className="h-3 w-3 text-zinc-500" />
              {backendStatus.isOnline
                ? `API :8080 ONLINE`
                : "API :8080 OFFLINE"}
            </span>

            {backendStatus.isOnline && backendStatus.latencyMs > 0 && (
              <span className="text-[10px] text-zinc-500 border-l border-zinc-800 pl-1.5">
                {backendStatus.latencyMs}ms
              </span>
            )}

            <button
              onClick={checkBackend}
              disabled={backendStatus.checking}
              title="Ping endpoint backend"
              className="ml-1 rounded p-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              id="refresh-backend-status-btn"
            >
              <RefreshCw
                className={`h-2.5 w-2.5 ${backendStatus.checking ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Right: User / Auth Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="navbar-theme-toggle-btn"
            title={theme === "dark" ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            className="rounded-md border border-zinc-800 bg-[#121215] p-1.5 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition flex items-center justify-center group"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-zinc-700 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </button>

          {isLoading ? (
            <div className="h-7 w-20 rounded-md bg-zinc-800/60 animate-pulse border border-zinc-800" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 hover:border-zinc-700 transition"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-mono font-semibold text-zinc-300">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="font-mono text-xs text-zinc-300 max-w-[120px] truncate">
                  {user.email}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {/* Minimal Dropdown Menu */}
              {menuOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-1.5 w-56 rounded-lg border border-zinc-800 bg-[#121215] p-1.5 shadow-xl z-50 animate-in fade-in-50"
                >
                  <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1">
                    <p className="text-[10px] font-mono uppercase text-zinc-500">
                      Sesi Pengguna
                    </p>
                    <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>JWT Authenticated</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    id="dropdown-logout-btn"
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/login"
                id="nav-login-btn"
                className="rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Masuk
              </Link>
              <Link
                href="/register"
                id="nav-register-btn"
                className="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-1.5 font-medium text-zinc-950 hover:bg-white transition flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
