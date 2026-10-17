"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { categoryService } from "@/services/category.service";
import { CategoryItem } from "@/lib/types";
import { X, Tag, Loader2, AlertCircle } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: CategoryItem | null;
  defaultType?: "expense" | "income";
}

const COLOR_PRESETS = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#10b981", // Emerald
  "#22c55e", // Green
  "#eab308", // Yellow
  "#f59e0b", // Amber
  "#64748b", // Slate
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
  defaultType = "expense",
}: CategoryModalProps) {
  const { token } = useAuth();

  const [name, setName] = useState<string>("");
  const [type, setType] = useState<"expense" | "income">(defaultType);
  const [color, setColor] = useState<string>("#f97316");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
        setColor(categoryToEdit.color || "#f97316");
        setDescription(categoryToEdit.description || "");
      } else {
        setName("");
        setType(defaultType);
        setColor(defaultType === "income" ? "#10b981" : "#f97316");
        setDescription("");
      }
      setErrorMessage(null);
    });
  }, [categoryToEdit, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Nama kategori tidak boleh kosong.");
      return;
    }

    setSubmitting(true);

    try {
      if (categoryToEdit) {
        await categoryService.updateCategory(
          categoryToEdit.id,
          {
            name: name.trim(),
            type,
            color,
            description: description.trim(),
          },
          token || undefined
        );
      } else {
        await categoryService.createCategory(
          {
            name: name.trim(),
            type,
            color,
            description: description.trim(),
          },
          token || undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan data kategori.";
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
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-sm font-semibold text-zinc-100">
              {categoryToEdit ? "Edit Kategori Transaksi" : "Tambah Kategori Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Category Type */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Jenis Kategori
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  if (color === "#10b981") setColor("#f97316");
                }}
                className={`py-2 text-xs font-semibold rounded border transition ${
                  type === "expense"
                    ? "bg-rose-950/60 border-rose-800 text-rose-300"
                    : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pengeluaran (Expense)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  if (color === "#f97316") setColor("#10b981");
                }}
                className={`py-2 text-xs font-semibold rounded border transition ${
                  type === "income"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pemasukan (Income)
              </button>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Nama Kategori
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Belanja Online, Bensin, Gaji"
                className="w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Picker Palette */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Pilihan Warna Label
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-white scale-110" : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Pilih warna ${c}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-6 w-6 rounded cursor-pointer bg-transparent border-0 p-0"
                title="Warna Kustom"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Deskripsi / Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan singkat tentang peruntukan kategori ini..."
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
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
                <span>{categoryToEdit ? "Simpan Perubahan" : "Buat Kategori"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
