"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { budgetService } from "@/services/budget.service";
import { BudgetTrackerData } from "@/lib/types";
import {
  X,
  Target,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
} from "lucide-react";

interface BudgetLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: BudgetTrackerData) => void;
  initialDailyLimit?: number;
  initialWeeklyLimit?: number;
}

export default function BudgetLimitsModal({
  isOpen,
  onClose,
  onSuccess,
  initialDailyLimit = 0,
  initialWeeklyLimit = 0,
}: BudgetLimitsModalProps) {
  const { token } = useAuth();

  const [dailyLimitStr, setDailyLimitStr] = useState<string>("");
  const [weeklyLimitStr, setWeeklyLimitStr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill values when modal opens
  useEffect(() => {
    if (isOpen) {
      setDailyLimitStr(
        initialDailyLimit > 0 ? initialDailyLimit.toLocaleString("id-ID") : ""
      );
      setWeeklyLimitStr(
        initialWeeklyLimit > 0 ? initialWeeklyLimit.toLocaleString("id-ID") : ""
      );
      setErrorMessage(null);
    }
  }, [isOpen, initialDailyLimit, initialWeeklyLimit]);

  if (!isOpen) return null;

  // Format currency display while typing
  const handleAmountChange = (
    value: string,
    setter: (val: string) => void
  ) => {
    const rawDigits = value.replace(/\D/g, "");
    if (!rawDigits) {
      setter("");
      return;
    }
    const num = parseInt(rawDigits, 10);
    setter(num.toLocaleString("id-ID"));
  };

  const parseNumber = (val: string): number => {
    const rawDigits = val.replace(/\D/g, "");
    return rawDigits ? parseInt(rawDigits, 10) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const dailyVal = parseNumber(dailyLimitStr);
    const weeklyVal = parseNumber(weeklyLimitStr);

    if (dailyVal === 0 && weeklyVal === 0) {
      if (
        !window.confirm(
          "Anda mengosongkan batas harian dan mingguan. Kedua batas akan dinonaktifkan. Lanjutkan?"
        )
      ) {
        return;
      }
    }

    setLoading(true);

    try {
      const res = await budgetService.setLimits(
        {
          daily_limit: dailyVal,
          weekly_limit: weeklyVal,
        },
        token || undefined
      );

      if (res.status === "success") {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || "Gagal memperbarui batas anggaran.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan pada sistem."
      );
    } finally {
      setLoading(false);
    }
  };

  const dailyPresets = [50000, 100000, 150000, 250000];
  const weeklyPresets = [350000, 700000, 1000000, 1500000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#121216] shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-1.5">
                Batas Pengeluaran
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400">
                  AI Guard
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Atur pagu maksimal belanja harian & mingguan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Daily Limit Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <span>Batas Harian (Per Hari)</span>
                <span className="text-zinc-500 font-normal">Opsional</span>
              </label>
              {dailyLimitStr && (
                <button
                  type="button"
                  onClick={() => setDailyLimitStr("")}
                  className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 transition"
                >
                  Kosongkan
                </button>
              )}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-mono font-semibold text-zinc-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={dailyLimitStr}
                onChange={(e) =>
                  handleAmountChange(e.target.value, setDailyLimitStr)
                }
                placeholder="0 (Tidak dibatasi)"
                className="w-full rounded-lg border border-zinc-800 bg-[#09090b] pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Quick chips for Daily */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500">
                Preset:
              </span>
              {dailyPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDailyLimitStr(val.toLocaleString("id-ID"))}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                    parseNumber(dailyLimitStr) === val
                      ? "border-emerald-700 bg-emerald-950/70 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  Rp {(val / 1000).toLocaleString("id-ID")}k
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Limit Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <span>Batas Mingguan (Senin - Minggu)</span>
                <span className="text-zinc-500 font-normal">Opsional</span>
              </label>
              {weeklyLimitStr && (
                <button
                  type="button"
                  onClick={() => setWeeklyLimitStr("")}
                  className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 transition"
                >
                  Kosongkan
                </button>
              )}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-mono font-semibold text-zinc-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={weeklyLimitStr}
                onChange={(e) =>
                  handleAmountChange(e.target.value, setWeeklyLimitStr)
                }
                placeholder="0 (Tidak dibatasi)"
                className="w-full rounded-lg border border-zinc-800 bg-[#09090b] pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Quick chips for Weekly */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500">
                Preset:
              </span>
              {weeklyPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWeeklyLimitStr(val.toLocaleString("id-ID"))}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                    parseNumber(weeklyLimitStr) === val
                      ? "border-blue-700 bg-blue-950/70 text-blue-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {val >= 1000000
                    ? `Rp ${val / 1000000} Jt`
                    : `Rp ${(val / 1000).toLocaleString("id-ID")}k`}
                </button>
              ))}
            </div>
          </div>

          {/* AI Helper Banner */}
          <div className="rounded-lg border border-zinc-800 bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-blue-950/20 p-3 text-xs flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-200">
                Otomasi AI Google Gemini
              </p>
              <p className="leading-relaxed">
                Setiap kali Anda mencatat pengeluaran, AI akan memantau sisa
                anggaran harian & mingguan serta memberikan rekomendasi cerdas
                bila Anda mendekati batas.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-zinc-800 bg-transparent hover:bg-zinc-800/60 px-4 py-2 text-xs font-mono font-medium text-zinc-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan Batas Anggaran</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
