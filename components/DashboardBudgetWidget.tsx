"use client";

import React from "react";
import { BudgetTrackerData } from "@/lib/types";
import {
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

interface DashboardBudgetWidgetProps {
  trackerData: BudgetTrackerData | null;
  loading: boolean;
  onNavigateToBudget: () => void;
  onOpenLimitsModal: () => void;
}

export default function DashboardBudgetWidget({
  trackerData,
  loading,
  onNavigateToBudget,
  onOpenLimitsModal,
}: DashboardBudgetWidgetProps) {
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

  const getStatusPill = (status?: string, isExceeded?: boolean) => {
    if (isExceeded || status === "exceeded" || status === "danger") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-800 text-rose-300">
          <ShieldAlert className="h-3 w-3 text-rose-400" />
          <span>TERLAMPAUI</span>
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span>WASPADA</span>
        </span>
      );
    }
    if (status === "safe") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>AMAN</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
        <span>TIDAK AKTIF</span>
      </span>
    );
  };

  const getBarColor = (pct: number, isExceeded?: boolean) => {
    if (isExceeded || pct >= 100) return "bg-rose-500";
    if (pct >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const hasLimits = (daily && daily.limit > 0) || (weekly && weekly.limit > 0);

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#121216] p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
              Budget Tracker & AI Guard
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Monitoring batas belanja harian & mingguan Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLimitsModal}
            className="flex items-center gap-1 rounded border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-300 transition"
            title="Ubah Batas Harian / Mingguan"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">Atur Batas</span>
          </button>
          <button
            onClick={onNavigateToBudget}
            className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-200 transition"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500">
          <div className="h-4 w-4 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
          <span>Memuat data budget...</span>
        </div>
      ) : hasLimits ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Tracker Mini Card */}
          <div className="rounded-lg border border-zinc-800/80 bg-[#09090b] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Batas Harian (Hari ini)</span>
              </div>
              {getStatusPill(daily?.status, daily?.is_exceeded)}
            </div>

            {daily && daily.limit > 0 ? (
              <>
                <div className="flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-sm font-bold text-zinc-100">
                      {formatRupiah(daily.spent)}
                    </span>
                    <span className="text-[11px] text-zinc-500 ml-1">
                      / {formatRupiah(daily.limit)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      daily.is_exceeded ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {daily.percentage ? daily.percentage.toFixed(0) : "0"}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getBarColor(
                      daily.percentage || 0,
                      daily.is_exceeded
                    )}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, daily.percentage || 0))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                  <span
                    className={
                      daily.remaining < 0 ? "text-rose-400 font-semibold" : "text-emerald-400"
                    }
                  >
                    Sisa: {formatRupiah(daily.remaining)}
                  </span>
                  <span>{daily.transactions_count || 0} pengeluaran</span>
                </div>
              </>
            ) : (
              <div className="py-2 text-center text-[11px] text-zinc-500">
                Batas harian belum diatur
              </div>
            )}
          </div>

          {/* Weekly Tracker Mini Card */}
          <div className="rounded-lg border border-zinc-800/80 bg-[#09090b] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                <span>Batas Mingguan (Senin-Minggu)</span>
              </div>
              {getStatusPill(weekly?.status, weekly?.is_exceeded)}
            </div>

            {weekly && weekly.limit > 0 ? (
              <>
                <div className="flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-sm font-bold text-zinc-100">
                      {formatRupiah(weekly.spent)}
                    </span>
                    <span className="text-[11px] text-zinc-500 ml-1">
                      / {formatRupiah(weekly.limit)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      weekly.is_exceeded ? "text-rose-400" : "text-blue-400"
                    }`}
                  >
                    {weekly.percentage ? weekly.percentage.toFixed(0) : "0"}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getBarColor(
                      weekly.percentage || 0,
                      weekly.is_exceeded
                    )}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, weekly.percentage || 0))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                  <span
                    className={
                      weekly.remaining < 0 ? "text-rose-400 font-semibold" : "text-blue-400"
                    }
                  >
                    Sisa: {formatRupiah(weekly.remaining)}
                  </span>
                  <span>{weekly.transactions_count || 0} pengeluaran</span>
                </div>
              </>
            ) : (
              <div className="py-2 text-center text-[11px] text-zinc-500">
                Batas mingguan belum diatur
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 px-3 text-center border border-dashed border-zinc-800 rounded-lg bg-[#09090b]/40 flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-zinc-400">
            Anda belum menentukan batas maksimal pengeluaran harian dan mingguan.
          </p>
          <button
            onClick={onOpenLimitsModal}
            className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            + Pasang Batas Pengeluaran Sekarang
          </button>
        </div>
      )}

      {/* AI Quick Insight Snippet */}
      {aiAnalysis && (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 flex items-start gap-2.5 text-xs">
          <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-200">
              {aiAnalysis.headline || "Insight AI Gemini:"}
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {aiAnalysis.advice || aiAnalysis.analysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
