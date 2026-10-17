"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { savingService } from "@/services/saving.service";
import { SavingItem } from "@/lib/types";
import { X, Loader2, Target, AlertCircle } from "lucide-react";

interface SavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savingToEdit?: SavingItem | null;
}

const COLOR_OPTIONS = [
  { label: "Emerald", hex: "#10b981" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Violet", hex: "#8b5cf6" },
  { label: "Rose", hex: "#f43f5e" },
  { label: "Cyan", hex: "#06b6d4" },
];

function SavingFormInner({
  onClose,
  onSuccess,
  savingToEdit,
}: {
  onClose: () => void;
  onSuccess: () => void;
  savingToEdit: SavingItem | null;
}) {
  const { token } = useAuth();

  const [name, setName] = useState<string>(() => savingToEdit?.name || "");
  const [description, setDescription] = useState<string>(() => savingToEdit?.description || "");
  const [targetAmount, setTargetAmount] = useState<string>(
    () => (savingToEdit?.target_amount ? savingToEdit.target_amount.toString() : "")
  );
  const [currentAmount, setCurrentAmount] = useState<string>(
    () => (savingToEdit?.current_amount !== undefined ? savingToEdit.current_amount.toString() : "0")
  );
  const [targetDate, setTargetDate] = useState<string>(
    () => (savingToEdit?.target_date ? savingToEdit.target_date.split("T")[0] : "")
  );
  const [color, setColor] = useState<string>(() => savingToEdit?.color || "#3b82f6");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedTarget = parseFloat(targetAmount.replace(/[^0-9.]/g, ""));
    const parsedCurrent = parseFloat(currentAmount.replace(/[^0-9.]/g, "") || "0");

    if (!name.trim()) {
      setErrorMessage("Nama target tabungan wajib diisi.");
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMessage("Target nominal tabungan harus lebih dari 0.");
      return;
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setErrorMessage("Nominal terkumpul saat ini tidak boleh bernilai negatif.");
      return;
    }

    setSubmitting(true);

    try {
      if (savingToEdit) {
        await savingService.updateSaving(
          savingToEdit.id,
          {
            name: name.trim(),
            description: description.trim(),
            target_amount: parsedTarget,
            current_amount: parsedCurrent,
            target_date: targetDate || null,
            color,
          },
          token || undefined
        );
      } else {
        await savingService.createSaving(
          {
            name: name.trim(),
            description: description.trim(),
            target_amount: parsedTarget,
            current_amount: parsedCurrent,
            target_date: targetDate || null,
            color,
          },
          token || undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan data target tabungan.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-100">
            {savingToEdit ? "Ubah Target Tabungan" : "Buat Target Tabungan Baru"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
        {/* Saving Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Nama Target Tabungan <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Beli Laptop Baru, Dana Darurat"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Target Nominal Dana (Rp) <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min="1000"
            required
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Contoh: 15000000"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Current Collected Amount */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Saldo Awal / Dana Terkumpul Saat Ini (Rp)
          </label>
          <input
            type="number"
            min="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="Contoh: 0"
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Target Tanggal Tercapai (Opsional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
            Warna Aksen Indikator
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
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

        {/* Description */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Catatan / Keterangan (Opsional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan tujuan atau prioritas tabungan ini..."
            className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none resize-none"
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
            className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-1.5 text-xs transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{savingToEdit ? "Simpan Perubahan" : "Buat Target"}</span>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function SavingModal({
  isOpen,
  onClose,
  onSuccess,
  savingToEdit = null,
}: SavingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121216] shadow-2xl p-5">
        <SavingFormInner
          key={savingToEdit ? savingToEdit.id : "new"}
          onClose={onClose}
          onSuccess={onSuccess}
          savingToEdit={savingToEdit}
        />
      </div>
    </div>
  );
}
