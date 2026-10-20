"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { budgetService } from "@/services/budget.service";
import { CategoryItem, BudgetItem, BudgetPeriod } from "@/lib/types";
import { X, Tag, AlertCircle, Check, RotateCcw } from "lucide-react";

interface BudgetCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryItem[];
  budgetToEdit?: BudgetItem | null;
}

export default function BudgetCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  budgetToEdit = null,
}: BudgetCategoryModalProps) {
  const { token } = useAuth();

  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState<BudgetPeriod>("weekly");
  const [amountStr, setAmountStr] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.category_id || undefined);
        setPeriod(budgetToEdit.period || "weekly");
        setAmountStr(budgetToEdit.amount ? budgetToEdit.amount.toLocaleString("id-ID") : "");
        setDescription(budgetToEdit.description || "");
      } else {
        setCategoryId(expenseCategories[0]?.id || undefined);
        setPeriod("weekly");
        setAmountStr("");
        setDescription("");
      }
      setErrorMessage(null);
    }
  }, [isOpen, budgetToEdit, categories]);

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    const rawDigits = value.replace(/\D/g, "");
    if (!rawDigits) {
      setAmountStr("");
      return;
    }
    const num = parseInt(rawDigits, 10);
    setAmountStr(num.toLocaleString("id-ID"));
  };

  const parseNumber = (val: string): number => {
    const rawDigits = val.replace(/\D/g, "");
    return rawDigits ? parseInt(rawDigits, 10) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amount = parseNumber(amountStr);
    if (amount <= 0) {
      setErrorMessage("Nominal batas anggaran harus lebih besar dari 0.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Silakan pilih kategori pengeluaran.");
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);

    setLoading(true);

    try {
      if (budgetToEdit) {
        await budgetService.updateBudget(
          budgetToEdit.id,
          {
            amount,
            period,
            category_id: categoryId,
            category: selectedCat ? selectedCat.name : "",
            description: description.trim(),
          },
          token || undefined
        );
      } else {
        await budgetService.createBudget(
          {
            amount,
            period,
            category_id: categoryId,
            category: selectedCat ? selectedCat.name : "",
            description: description.trim(),
          },
          token || undefined
        );
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal menyimpan batas anggaran kategori."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#121216] shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950/60 border border-indigo-900/60 text-indigo-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                {budgetToEdit ? "Edit Batas Kategori" : "Batas Budget Kategori"}
              </h3>
              <p className="text-xs text-zinc-400">
                Tentukan alokasi maksimal untuk pos belanja tertentu
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Kategori Pengeluaran
            </label>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-[#09090b] px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none transition"
              required
            >
              <option value="" disabled>
                -- Pilih Kategori --
              </option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Periode Batasan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPeriod("daily")}
                className={`py-2 text-xs font-mono rounded-lg border transition ${
                  period === "daily"
                    ? "border-indigo-500 bg-indigo-950/60 text-indigo-300 font-bold"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setPeriod("weekly")}
                className={`py-2 text-xs font-mono rounded-lg border transition ${
                  period === "weekly"
                    ? "border-indigo-500 bg-indigo-950/60 text-indigo-300 font-bold"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={`py-2 text-xs font-mono rounded-lg border transition ${
                  period === "monthly"
                    ? "border-indigo-500 bg-indigo-950/60 text-indigo-300 font-bold"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Nominal Batas Maksimal
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-mono font-semibold text-zinc-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-zinc-800 bg-[#09090b] pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Deskripsi / Catatan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Batas jajan kopi & nongkrong"
              className="w-full rounded-lg border border-zinc-800 bg-[#09090b] px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition"
            />
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
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{budgetToEdit ? "Perbarui" : "Simpan Batas"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
