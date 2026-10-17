"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  Tag,
  User,
  LogOut,
  Wallet,
  ChevronRight,
  X,
  LogIn,
  Plus,
  UserPlus,
} from "lucide-react";

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  openNewTxModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentTab = "dashboard",
  onSelectTab,
  openNewTxModal,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout, isLoading } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Daftar Transaksi", icon: Receipt },
    { id: "wallets", label: "Dompet & Rekening", icon: Wallet },
    { id: "savings", label: "Target Tabungan", icon: PiggyBank },
    { id: "reports", label: "Laporan & Rasio", icon: PieChart },
    { id: "categories", label: "Kategori Biaya", icon: Tag },
    { id: "profile", label: "Profil Akun", icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-zinc-800 bg-[#0d0d11] flex flex-col justify-between h-screen select-none transition-transform duration-200 md:static md:translate-x-0 ${isOpenMobile ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm">
                <Wallet className="h-5 w-5 text-zinc-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-zinc-100">
                  CatatUang
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Laravel Style Portal
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 rounded text-zinc-400 hover:text-white"
                aria-label="Tutup Menu"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Add CTA */}
          {openNewTxModal && (
            <div className="p-3">
              <button
                onClick={openNewTxModal}
                id="sidebar-quick-add-btn"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-zinc-100 hover:bg-white py-2 px-3 text-xs font-semibold text-zinc-950 shadow-sm transition active:scale-[0.99]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Catat Transaksi Baru</span>
              </button>
            </div>
          )}

          {/* Navigation Section */}
          <div className="px-3 py-2">
            <p className="px-3 text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    id={`sidebar-nav-${item.id}`}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition ${isActive
                      ? "bg-zinc-800/90 text-zinc-100 font-semibold border-l-2 border-zinc-200"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${isActive ? "text-zinc-100" : "text-zinc-500"
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Footer Panel */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#0a0a0d]">
          {isLoading ? (
            <div className="rounded-md border border-zinc-800/80 p-2.5 bg-[#121216] flex items-center gap-2.5 animate-pulse">
              <div className="h-8 w-8 rounded-md bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-2.5 w-28 rounded bg-zinc-800/70" />
              </div>
            </div>
          ) : user ? (
            <div className="rounded-md border border-zinc-800/80 p-2.5 bg-[#121216]">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-xs font-bold font-mono text-zinc-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                id="sidebar-logout-btn"
                className="w-full flex items-center justify-center gap-1.5 rounded py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 transition border border-rose-950/40"
              >
                <LogOut className="h-3 w-3" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link
                href="/login"
                id="sidebar-guest-login-btn"
                className="w-full flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                <LogIn className="h-3 w-3" />
                <span>Masuk (Login)</span>
              </Link>
              <Link
                href="/register"
                id="sidebar-guest-register-btn"
                className="w-full flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-200 hover:bg-white transition"
              >
                <UserPlus className="h-3 w-3" />
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
