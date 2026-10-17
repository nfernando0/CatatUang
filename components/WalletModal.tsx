"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { walletService } from "@/services/wallet.service";
import { WalletItem, WalletType } from "@/lib/types";
import { X, Loader2, Wallet, AlertCircle } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletToEdit?: WalletItem | null;
}

const WALLET_TYPES: { type: WalletType; label: string }[] = [
  { type: "bank", label: "Rekening Bank" },
  { type: "ewallet", label: "E-Wallet (GoPay, OVO, Dana)" },
  { type: "cash", label: "Uang Tunai / Kas Fisik" },
  { type: "investment", label: "Rekening Investasi" },
  { type: "other", label: "Lainnya" },
];

const COLOR_PRESETS = [
  { label: "Blue", hex: "#3b82f6" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Violet", hex: "#8b5cf6" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Rose", hex: "#f43f5e" },
  { label: "Cyan", hex: "#06b6d4" },
];

function WalletFormInner({
  onClose,
  onSuccess,
  walletToEdit,
}: {
  onClose: () => void;
  onSuccess: () => void;
  walletToEdit: WalletItem | null;
}) {
  const { token } = useAuth();

  const [name, setName] = useState<string>(() => walletToEdit?.name || "");
  const [type, setType] = useState<WalletType>(() => walletToEdit?.type || "bank");
  const [accountNumber, setAccountNumber] = useState<string>(
    () => walletToEdit?.account_number || ""
  );
  const [balance, setBalance] = useState<string>(
    () => (walletToEdit?.balance !== undefined ? walletToEdit.balance.toString() : "0")
  );
  const [color, setColor] = useState<string>(() => walletToEdit?.color || "#3b82f6");
  const [isDefault, setIsDefault] = useState<boolean>(() => !!walletToEdit?.is_default);
  const [description, setDescription] = useState<string>(() => walletToEdit?.description || "");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedBalance = parseFloat(balance.replace(/[^0-9.-]/g, "") || "0");

    if (!name.trim()) {
      setErrorMessage("Nama dompet / akun wajib diisi.");
      return;
    }

    if (isNaN(parsedBalance)) {
      setErrorMessage("Nominal saldo harus berupa angka valid.");
      return;
    }

    setSubmitting(true);

    try {
      if (walletToEdit) {
        await walletService.updateWallet(
          walletToEdit.id,
          {
            name: name.trim(),
            type,
            account_number: accountNumber.trim() || undefined,
            balance: parsedBalance,
            color,
            description: description.trim(),
            is_default: isDefault,
          },
          token || undefined
        );
      } else {
        await walletService.createWallet(
          {
            name: name.trim(),
            type,
            account_number: accountNumber.trim() || undefined,
            balance: parsedBalance,
            color,
            description: description.trim(),
            is_default: isDefault,
          },
          token || undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data dompet.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {walletToEdit ? "Ubah Akun Dompet" : "Tambah Dompet / Rekening Baru"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
        {/* Wallet Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Nama Dompet / Rekening <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Rekening BCA, Kas Tunai, GoPay"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Wallet Type */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Tipe Dompet
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WalletType)}
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
          >
            {WALLET_TYPES.map((t) => (
              <option key={t.type} value={t.type} className="bg-[#121216] text-zinc-200">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number (Optional) */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Nomor Rekening / No. Telepon (Opsional)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Contoh: 1234567890 / 08123456789"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Balance */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Saldo Saat Ini (Rp) <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Contoh: 5000000"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Color Presets */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
            Warna Aksen Kartu
          </label>
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className={`h-6 w-6 rounded-full transition flex items-center justify-center ${
                  color === c.hex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#121216] scale-110"
                    : "opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Is Default Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="wallet-is-default-check"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-800 bg-[#09090b] text-blue-600 focus:ring-0"
          />
          <label
            htmlFor="wallet-is-default-check"
            className="text-xs text-zinc-300 font-mono cursor-pointer select-none"
          >
            Jadikan dompet utama (default)
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Catatan / Deskripsi (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan peruntukan dompet ini..."
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
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
              <span>{walletToEdit ? "Simpan Perubahan" : "Tambah Dompet"}</span>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function WalletModal({
  isOpen,
  onClose,
  onSuccess,
  walletToEdit = null,
}: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121216] shadow-2xl p-5">
        <WalletFormInner
          key={walletToEdit ? walletToEdit.id : "new"}
          onClose={onClose}
          onSuccess={onSuccess}
          walletToEdit={walletToEdit}
        />
      </div>
    </div>
  );
}
