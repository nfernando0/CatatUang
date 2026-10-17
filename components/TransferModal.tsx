"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { walletService } from "@/services/wallet.service";
import { WalletItem } from "@/lib/types";
import { X, Loader2, ArrowRightLeft, AlertCircle, CheckCircle2 } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallets: WalletItem[];
  defaultFromWalletId?: number;
}

const QUICK_TRANSFER_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export default function TransferModal({
  isOpen,
  onClose,
  onSuccess,
  wallets,
  defaultFromWalletId,
}: TransferModalProps) {
  const { token } = useAuth();

  const [fromId, setFromId] = useState<number>(() => {
    if (defaultFromWalletId) return defaultFromWalletId;
    return wallets[0]?.id || 0;
  });

  const [toId, setToId] = useState<number>(() => {
    const candidate = wallets.find((w) => w.id !== (defaultFromWalletId || wallets[0]?.id));
    return candidate ? candidate.id : wallets[1]?.id || 0;
  });

  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);
  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "") || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fromId === toId) {
      setErrorMessage("Dompet asal dan dompet tujuan tidak boleh sama.");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Nominal transfer harus lebih dari 0.");
      return;
    }

    if (fromWallet && fromWallet.balance < parsedAmount) {
      setErrorMessage(
        `Saldo ${fromWallet.name} tidak mencukupi (Tersedia: ${formatRupiah(fromWallet.balance)}).`
      );
      return;
    }

    setSubmitting(true);

    try {
      await walletService.transfer(
        {
          from_wallet_id: fromId,
          to_wallet_id: toId,
          amount: parsedAmount,
          notes: notes.trim(),
        },
        token || undefined
      );

      setAmount("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses transfer.";
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
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Transfer Saldo Antar Dompet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* From Wallet */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Dari Dompet (Sumber Dana)
            </label>
            <select
              value={fromId}
              onChange={(e) => setFromId(Number(e.target.value))}
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-[#121216] text-zinc-200">
                  {w.name} — Saldo: {formatRupiah(w.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* To Wallet */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Ke Dompet (Tujuan Transfer)
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(Number(e.target.value))}
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
            >
              {wallets.map((w) => (
                <option
                  key={w.id}
                  value={w.id}
                  disabled={w.id === fromId}
                  className="bg-[#121216] text-zinc-200"
                >
                  {w.name} {w.id === fromId ? "(Dompet Asal)" : `(Saldo: ${formatRupiah(w.balance)})`}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-mono uppercase text-zinc-400">
                Nominal Transfer (Rp)
              </label>
              {fromWallet && (
                <button
                  type="button"
                  onClick={() => setAmount(fromWallet.balance.toString())}
                  className="text-[10px] font-mono text-blue-400 hover:underline"
                >
                  Transfer Semua ({formatRupiah(fromWallet.balance)})
                </button>
              )}
            </div>
            <input
              type="number"
              min="1000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              {QUICK_TRANSFER_AMOUNTS.map((amt) => (
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

          {/* Live Preview */}
          {parsedAmount > 0 && fromWallet && toWallet && (
            <div className="p-3 rounded border border-zinc-800 bg-[#09090b] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Sisa Saldo {fromWallet.name}:</span>
                <span className={fromWallet.balance - parsedAmount >= 0 ? "text-zinc-200" : "text-rose-400 font-bold"}>
                  {formatRupiah(fromWallet.balance - parsedAmount)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Saldo Baru {toWallet.name}:</span>
                <span className="text-emerald-400 font-semibold">
                  {formatRupiah(toWallet.balance + parsedAmount)}
                </span>
              </div>
              {fromWallet.balance >= parsedAmount && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] pt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Saldo mencukupi untuk transfer</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Catatan Transfer (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pindah saldo untuk jajan / tarik tunai"
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

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
              className="flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 text-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mentransfer...</span>
                </>
              ) : (
                <span>Konfirmasi Transfer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
