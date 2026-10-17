"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { walletService } from "@/services/wallet.service";
import { WalletItem } from "@/lib/types";
import { X, Loader2, Coins, AlertCircle } from "lucide-react";

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallet: WalletItem | null;
}

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export default function AdjustBalanceModal({
  isOpen,
  onClose,
  onSuccess,
  wallet,
}: AdjustBalanceModalProps) {
  const { token } = useAuth();

  const [mode, setMode] = useState<"topup" | "set">("topup");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !wallet) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const currentBal = wallet.balance || 0;
  const parsedAmt = parseFloat(amount.replace(/[^0-9.-]/g, "") || "0");
  const projectedBalance = mode === "topup" ? currentBal + parsedAmt : parsedAmt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNaN(parsedAmt)) {
      setErrorMessage("Nominal harus berupa angka valid.");
      return;
    }

    if (mode === "topup" && parsedAmt <= 0) {
      setErrorMessage("Nominal top-up harus lebih dari 0.");
      return;
    }

    setSubmitting(true);

    try {
      await walletService.updateWallet(
        wallet.id,
        {
          balance: projectedBalance,
        },
        token || undefined
      );

      setAmount("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui saldo dompet.";
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
            <Coins className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Kelola Saldo: {wallet.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="mt-3 p-3 rounded border border-zinc-800 bg-[#09090b] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">
              Saldo Saat Ini
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Tipe: {wallet.type.toUpperCase()}
            </span>
          </div>
          <span className="text-base font-bold font-mono text-emerald-400">
            {formatRupiah(currentBal)}
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          <button
            type="button"
            onClick={() => setMode("topup")}
            className={`py-1.5 text-xs font-mono font-semibold rounded border transition ${
              mode === "topup"
                ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
                : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            + Tambah Saldo (Top-up)
          </button>
          <button
            type="button"
            onClick={() => setMode("set")}
            className={`py-1.5 text-xs font-mono font-semibold rounded border transition ${
              mode === "set"
                ? "bg-blue-950/70 border-blue-800 text-blue-300"
                : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Koreksi Saldo Baru
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              {mode === "topup" ? "Nominal Top-up (Rp)" : "Saldo Baru Aktual (Rp)"}
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === "topup" ? "Contoh: 100000" : "Contoh: 2500000"}
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Quick preset buttons for topup */}
          {mode === "topup" && (
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                PILIH CEPAT:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="rounded border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 transition"
                  >
                    +{formatRupiah(amt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview */}
          {amount && !isNaN(parsedAmt) && (
            <div className="p-2.5 rounded border border-zinc-800 bg-[#09090b] text-xs font-mono flex justify-between items-center">
              <span className="text-zinc-400 text-[11px]">Hasil Saldo Akhir:</span>
              <span className="font-bold text-emerald-400">
                {formatRupiah(projectedBalance)}
              </span>
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
              className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-1.5 text-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
