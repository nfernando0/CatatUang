"use client";

import React, { useState } from "react";
import {
  BudgetTrackerData,
  BudgetItem,
  CategoryItem,
} from "@/lib/types";
import {
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  Info,
  Clock,
  Layers,
} from "lucide-react";

interface BudgetTrackerViewProps {
  trackerData: BudgetTrackerData | null;
  categoryBudgets: BudgetItem[];
  categories: CategoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onRefreshAI: () => void;
  loadingAI: boolean;
  onOpenLimitsModal: () => void;
  onOpenCreateCategoryBudget: () => void;
  onOpenEditCategoryBudget: (item: BudgetItem) => void;
  onDeleteCategoryBudget: (id: number, name: string) => void;
  onOpenNewTxModal: () => void;
}

export default function BudgetTrackerView({
  trackerData,
  categoryBudgets,
  categories,
  loading,
  onRefresh,
  onRefreshAI,
  loadingAI,
  onOpenLimitsModal,
  onOpenCreateCategoryBudget,
  onOpenEditCategoryBudget,
  onDeleteCategoryBudget,
  onOpenNewTxModal,
}: BudgetTrackerViewProps) {
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  const daily = trackerData?.daily;
  const weekly = trackerData?.weekly;
  const aiAnalysis = trackerData?.ai_analysis;

  const formatRupiah = (amount?: number) => {
    if (amount === undefined || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status?: string, isExceeded?: boolean) => {
    if (isExceeded || status === "exceeded" || status === "danger") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/80 border border-rose-800 text-rose-300 animate-pulse">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>TERLAMPAUI</span>
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>WASPADA (≥80%)</span>
        </span>
      );
    }
    if (status === "safe") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>AMAN</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
        <span>BELUM DIATUR</span>
      </span>
    );
  };

  const getProgressBarColor = (percentage: number, isExceeded: boolean) => {
    if (isExceeded || percentage >= 100) return "bg-rose-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const filteredCategoryBudgets = categoryBudgets.filter((b) => {
    if (filterPeriod === "all") return true;
    return b.period === filterPeriod;
  });

  const hasAnyLimits = (daily && daily.limit > 0) || (weekly && weekly.limit > 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#121216] p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/70 border border-emerald-900/60 text-emerald-400 shadow-inner">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-zinc-100">
                  Budget Tracker & AI Financial Guard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded border border-emerald-900/80 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kawal batas maksimal pengeluaran harian dan mingguan Anda dengan saran finansial cerdas Google Gemini.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3.5 py-2 text-xs font-mono text-zinc-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sinkronkan</span>
          </button>

          <button
            onClick={onOpenLimitsModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-emerald-900/80 bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-300 px-4 py-2 text-xs font-mono font-semibold transition active:scale-95"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Atur Batas Utama</span>
          </button>

          <button
            onClick={onOpenCreateCategoryBudget}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Budget Kategori</span>
          </button>
        </div>
      </div>

      {/* No Limits Configured Callout Banner */}
      {!hasAnyLimits && (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-5 sm:p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Batas Pengeluaran Belum Diatur
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tentukan batas belanja harian (misal Rp 100.000) dan mingguan (misal Rp 700.000) agar AI dapat mengawasi pengeluaran Anda dan memberi sinyal peringatan dini.
            </p>
          </div>
          <div>
            <button
              onClick={onOpenLimitsModal}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 text-xs shadow-lg transition active:scale-95"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Atur Batas Harian & Mingguan Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Budget Grid: Daily Limit Card & Weekly Limit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Daily Budget */}
        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  Batas Pengeluaran Harian
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  {daily?.date ? `Hari ini (${daily.date})` : "Hari ini"}
                </span>
              </div>
            </div>
            <div>{getStatusBadge(daily?.status, daily?.is_exceeded)}</div>
          </div>

          {daily && daily.limit > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-lg border border-zinc-800/80 bg-[#09090b]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Batas Maksimal
                  </span>
                  <div className="text-xs sm:text-sm font-bold font-mono text-zinc-200 mt-0.5">
                    {formatRupiah(daily.limit)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Terpakai
                  </span>
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                      daily.is_exceeded
                        ? "text-rose-400"
                        : daily.percentage >= 80
                        ? "text-amber-400"
                        : "text-zinc-200"
                    }`}
                  >
                    {formatRupiah(daily.spent)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Sisa Kuota
                  </span>
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                      daily.remaining < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatRupiah(daily.remaining)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">
                    Persentase Pengeluaran
                  </span>
                  <span
                    className={`font-bold ${
                      daily.is_exceeded
                        ? "text-rose-400"
                        : daily.percentage >= 80
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {daily.percentage ? daily.percentage.toFixed(1) : "0"}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(
                      daily.percentage || 0,
                      daily.is_exceeded
                    )}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, daily.percentage || 0))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>{daily.transactions_count || 0} transaksi pengeluaran tercatat</span>
                <button
                  onClick={onOpenLimitsModal}
                  className="text-zinc-400 hover:text-zinc-200 underline decoration-dotted transition"
                >
                  Ubah Batas
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2 border border-zinc-800/60 rounded-lg bg-[#09090b]/50">
              <p className="text-xs text-zinc-400">Batas harian belum ditetapkan.</p>
              <button
                onClick={onOpenLimitsModal}
                className="text-xs font-mono font-medium text-emerald-400 hover:underline"
              >
                + Pasang Batas Harian
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Weekly Budget */}
        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-950/40 border border-blue-900/60 text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  Batas Pengeluaran Mingguan
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  {weekly?.start_date && weekly?.end_date
                    ? `${weekly.start_date} s/d ${weekly.end_date}`
                    : "Minggu Berjalan (Senin - Minggu)"}
                </span>
              </div>
            </div>
            <div>{getStatusBadge(weekly?.status, weekly?.is_exceeded)}</div>
          </div>

          {weekly && weekly.limit > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-lg border border-zinc-800/80 bg-[#09090b]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Batas Maksimal
                  </span>
                  <div className="text-xs sm:text-sm font-bold font-mono text-zinc-200 mt-0.5">
                    {formatRupiah(weekly.limit)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Terpakai
                  </span>
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                      weekly.is_exceeded
                        ? "text-rose-400"
                        : weekly.percentage >= 80
                        ? "text-amber-400"
                        : "text-zinc-200"
                    }`}
                  >
                    {formatRupiah(weekly.spent)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    Sisa Kuota
                  </span>
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${
                      weekly.remaining < 0 ? "text-rose-400" : "text-blue-400"
                    }`}
                  >
                    {formatRupiah(weekly.remaining)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">
                    Persentase Pengeluaran
                  </span>
                  <span
                    className={`font-bold ${
                      weekly.is_exceeded
                        ? "text-rose-400"
                        : weekly.percentage >= 80
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}
                  >
                    {weekly.percentage ? weekly.percentage.toFixed(1) : "0"}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(
                      weekly.percentage || 0,
                      weekly.is_exceeded
                    )}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, weekly.percentage || 0))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>{weekly.transactions_count || 0} transaksi minggu ini</span>
                <button
                  onClick={onOpenLimitsModal}
                  className="text-zinc-400 hover:text-zinc-200 underline decoration-dotted transition"
                >
                  Ubah Batas
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2 border border-zinc-800/60 rounded-lg bg-[#09090b]/50">
              <p className="text-xs text-zinc-400">Batas mingguan belum ditetapkan.</p>
              <button
                onClick={onOpenLimitsModal}
                className="text-xs font-mono font-medium text-blue-400 hover:underline"
              >
                + Pasang Batas Mingguan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Financial Advisor Section */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-[#121216] via-[#14141c] to-[#0f141f] p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative glowing corner */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Evaluasi Cerdas AI Gemini
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {aiAnalysis?.source === "gemini" ? "Google Gemini Live" : "Smart Rule Engine"}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Wawasan otomatis berbasis perilaku pengeluaran dan limit keuangan Anda
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshAI}
            disabled={loadingAI}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-200 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingAI ? "animate-spin text-emerald-400" : ""}`} />
            <span>{loadingAI ? "Menganalisis..." : "Minta Analisis AI"}</span>
          </button>
        </div>

        {/* AI Content */}
        {aiAnalysis ? (
          <div className="mt-4 space-y-4">
            {/* Headline Banner */}
            <div
              className={`rounded-lg p-3.5 border flex items-start gap-3 ${
                aiAnalysis.status === "danger"
                  ? "bg-rose-950/30 border-rose-900/60 text-rose-200"
                  : aiAnalysis.status === "warning"
                  ? "bg-amber-950/30 border-amber-900/60 text-amber-200"
                  : "bg-emerald-950/30 border-emerald-900/60 text-emerald-200"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {aiAnalysis.status === "danger" ? (
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                ) : aiAnalysis.status === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold font-mono">
                  {aiAnalysis.headline || "Status Budget Terkini"}
                </div>
                {aiAnalysis.smart_alert && (
                  <p className="text-xs leading-relaxed opacity-90">
                    {aiAnalysis.smart_alert}
                  </p>
                )}
              </div>
            </div>

            {/* Analysis & Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Analysis */}
              <div className="rounded-lg border border-zinc-800/80 bg-[#09090b]/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300">
                  <Info className="h-3.5 w-3.5 text-blue-400" />
                  <span>Analisis Finansial</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {aiAnalysis.analysis ||
                    "Pengeluaran Anda sedang dievaluasi terhadap batas maksimal harian dan mingguan."}
                </p>
              </div>

              {/* Actionable Advice */}
              <div className="rounded-lg border border-zinc-800/80 bg-[#09090b]/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Saran & Rekomendasi Penghematan</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {aiAnalysis.advice ||
                    "Pertahankan konsistensi pencatatan transaksi untuk menjaga kestabilan arus kas Anda."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-5 text-center text-xs text-zinc-400">
            Klik tombol &quot;Minta Analisis AI&quot; untuk memuat evaluasi finansial terbaru dari Google Gemini.
          </div>
        )}
      </div>

      {/* Category Budgets Management Section */}
      <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                Batas Anggaran per Kategori Belanja
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Alokasikan plafon pengeluaran spesifik untuk kategori tertentu (misal Makanan, Bensin, Hiburan)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter Period Tabs */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-[#09090b] p-0.5 text-xs font-mono">
              <button
                onClick={() => setFilterPeriod("all")}
                className={`rounded px-2.5 py-1 transition ${
                  filterPeriod === "all"
                    ? "bg-zinc-800 text-zinc-100 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Semua ({categoryBudgets.length})
              </button>
              <button
                onClick={() => setFilterPeriod("weekly")}
                className={`rounded px-2.5 py-1 transition ${
                  filterPeriod === "weekly"
                    ? "bg-indigo-950 text-indigo-300 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setFilterPeriod("monthly")}
                className={`rounded px-2.5 py-1 transition ${
                  filterPeriod === "monthly"
                    ? "bg-indigo-950 text-indigo-300 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Bulanan
              </button>
            </div>

            <button
              onClick={onOpenCreateCategoryBudget}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-900/60 bg-indigo-950/40 hover:bg-indigo-950/80 text-indigo-300 px-3 py-1.5 text-xs font-mono transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Budgets Grid / Table */}
        {filteredCategoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategoryBudgets.map((b) => {
              const catName = b.category_data?.name || b.category || "Umum";
              const percent = b.percentage || 0;
              const isExceeded = b.is_exceeded || false;

              return (
                <div
                  key={b.id}
                  className="rounded-lg border border-zinc-800 bg-[#09090b] p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">
                          {catName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                          {b.period === "daily"
                            ? "Harian"
                            : b.period === "weekly"
                            ? "Mingguan"
                            : "Bulanan"}
                        </span>
                      </div>
                      {b.description && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {b.description}
                        </p>
                      )}
                    </div>
                    <div>{getStatusBadge(b.status, isExceeded)}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">
                        {formatRupiah(b.spent || 0)}
                      </span>
                      <span className="text-zinc-500 font-semibold">
                        / {formatRupiah(b.amount)}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getProgressBarColor(
                          percent,
                          isExceeded
                        )}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, percent))}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                      <span
                        className={
                          (b.remaining ?? 0) < 0
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }
                      >
                        Sisa: {formatRupiah(b.remaining ?? (b.amount - (b.spent || 0)))}
                      </span>
                      <span className="text-zinc-500">{percent.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => onOpenEditCategoryBudget(b)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition"
                      title="Edit Budget"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategoryBudget(b.id, catName)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-400 transition"
                      title="Hapus Budget"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2 border border-zinc-800/60 rounded-lg bg-[#09090b]/40">
            <p className="text-xs text-zinc-400">
              Belum ada batas anggaran khusus per kategori.
            </p>
            <button
              onClick={onOpenCreateCategoryBudget}
              className="text-xs font-mono font-medium text-indigo-400 hover:underline"
            >
              + Tambah Batas Kategori Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
