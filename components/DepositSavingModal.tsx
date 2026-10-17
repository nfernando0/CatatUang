"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { savingService } from "@/services/saving.service";
import { SavingItem } from "@/lib/types";
import { X, Loader2, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";

interface DepositSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saving: SavingItem | null;
}

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export default function DepositSavingModal({
  isOpen,
  onClose,
  onSuccess,
  saving,
}: DepositSavingModalProps) {
  const { token } = useAuth();

  const [depositAmount, setDepositAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !saving) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const currentAmt = saving.current_amount || 0;
  const targetAmt = saving.target_amount || 0;
  const parsedDeposit = parseFloat(depositAmount.replace(/[^0-9.]/g, "") || "0");
  const projectedTotal = currentAmt + parsedDeposit;
  const projectedPercentage = targetAmt > 0 ? Math.min(100, Math.round((projectedTotal / targetAmt) * 100)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
      setErrorMessage("Nominal setoran harus lebih dari 0.");
      return;
    }

    setSubmitting(true);

    try {
      await savingService.updateSaving(
        saving.id,
        {
          current_amount: projectedTotal,
        },
        token || undefined
      );

      setDepositAmount("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menambahkan setoran tabungan.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121216] shadow-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Setor Dana Tabungan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Info Badge */}
        <div className="mt-3 p-3 rounded border border-zinc-800 bg-[#09090b] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">
              {saving.name}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Target: {formatRupiah(targetAmt)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-mono text-emerald-400 block">
              {formatRupiah(currentAmt)}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Terkumpul ({saving.progress_percentage}%)
            </span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          {/* Deposit Amount Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Nominal Setoran (Rp)
            </label>
            <input
              type="number"
              min="1000"
              required
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Contoh: 100000"
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block mb-1">
              PILIH CEPAT:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt.toString())}
                  className="rounded border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 transition"
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Progress Preview */}
          {parsedDeposit > 0 && (
            <div className="p-3 rounded border border-emerald-900/50 bg-emerald-950/20 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>Saldo Setelah Setoran:</span>
                <span className="font-bold text-emerald-400">
                  {formatRupiah(projectedTotal)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Progres Baru:</span>
                <span>{projectedPercentage}%</span>
              </div>
              {projectedTotal >= targetAmt && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Target tabungan akan terpenuhi 100%! 🎉</span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-zinc-800 px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-1.5 text-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyetor...</span>
                </>
              ) : (
                <span>Konfirmasi Setor Dana</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
