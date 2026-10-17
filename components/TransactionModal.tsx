"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { transactionService } from "@/services/transaction.service";
import { categoryService, DEFAULT_CATEGORIES } from "@/services/category.service";
import { walletService } from "@/services/wallet.service";
import { CategoryItem, WalletItem } from "@/lib/types";
import {
  X,
  Loader2,
  PlusCircle,
  AlertCircle,
  Tag,
  Wallet,
  Plus,
  Check,
} from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: "expense" | "income";
}

const emptySubscribe = () => () => { };

function getTodayIso() {
  return new Date().toISOString().split("T")[0];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = "expense",
}: TransactionModalProps) {
  const { token } = useAuth();

  const clientToday = React.useSyncExternalStore(emptySubscribe, getTodayIso, () => "");
  const [type, setType] = useState<"expense" | "income">(initialType);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>("");
  const [customDate, setCustomDate] = useState<string>("");

  // Categories & Wallets state
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | undefined>(undefined);

  // Quick inline new category state
  const [isAddingNewCat, setIsAddingNewCat] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [addingCatLoading, setAddingCatLoading] = useState<boolean>(false);

  const activeDate = customDate || clientToday;

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load categories and wallets on open
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;

    categoryService.getCategories(token || undefined).then((res) => {
      if (isSubscribed && res.data) {
        setCategories(res.data);
      }
    });

    walletService.getWallets(token || undefined).then((res) => {
      if (isSubscribed && res.data) {
        setWallets(res.data);
        const defaultWallet = res.data.find((w) => w.is_default) || res.data[0];
        if (defaultWallet) {
          setSelectedWalletId(defaultWallet.id);
        }
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, token]);

  // Set default category when type or categories change
  useEffect(() => {
    Promise.resolve().then(() => {
      const matching = categories.filter((c) => c.type === type);
      if (matching.length > 0) {
        const alreadyMatches = matching.some((c) => c.name === category);
        if (!alreadyMatches) {
          setCategory(matching[0].name);
          setCategoryId(matching[0].id);
        }
      }
    });
  }, [type, categories, category]);

  if (!isOpen) return null;

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    const found = categories.find((c) => c.name === catName && c.type === type);
    setCategoryId(found ? found.id : undefined);
  };

  const handleCreateQuickCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCatLoading(true);
    try {
      const res = await categoryService.createCategory(
        {
          name: newCatName.trim(),
          type,
          color: type === "income" ? "#10b981" : "#ef4444",
        },
        token || undefined
      );

      if (res.data) {
        setCategories((prev) => [...prev, res.data!]);
        setCategory(res.data.name);
        setCategoryId(res.data.id);
        setNewCatName("");
        setIsAddingNewCat(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat kategori baru";
      setErrorMessage(msg);
    } finally {
      setAddingCatLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Nominal harus berupa angka lebih dari 0.");
      return;
    }

    if (!category.trim()) {
      setErrorMessage("Kategori wajib dipilih atau diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const finalDate = customDate || clientToday || new Date().toISOString().split("T")[0];
      await transactionService.createTransaction(
        {
          type,
          amount: parsedAmount,
          category: category.trim(),
          category_id: categoryId,
          wallet_id: selectedWalletId,
          description: description.trim(),
          date: finalDate,
        },
        token || undefined
      );

      // Reset form
      setAmount("");
      setDescription("");
      setCustomDate("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan data transaksi.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const availableCategories = categories.filter((c) => c.type === type);
  const currentCategoryObj = categories.find(
    (c) => c.name === category && c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121216] shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Catat Transaksi Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Error */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* Transaction Type Segment */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 text-xs font-semibold rounded border transition ${type === "expense"
                    ? "bg-rose-950/60 border-rose-800 text-rose-300"
                    : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                Pengeluaran (Expense)
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 text-xs font-semibold rounded border transition ${type === "income"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                Pemasukan (Income)
              </button>
            </div>
          </div>

          {/* Amount (Nominal) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Jumlah Nominal (Rp)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 50000"
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Category Selection with Dynamic Badges & Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-zinc-500" />
                <span>Kategori Transaksi</span>
              </label>

              <button
                type="button"
                onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>{isAddingNewCat ? "Pilih dari Daftar" : "Kategori Baru"}</span>
              </button>
            </div>

            {/* Quick Add Inline Input */}
            {isAddingNewCat ? (
              <div className="flex items-center gap-2 mb-2 p-2 rounded border border-blue-900/60 bg-blue-950/20">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ketik nama kategori baru..."
                  className="flex-1 rounded border border-zinc-700 bg-[#09090b] px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={addingCatLoading || !newCatName.trim()}
                  onClick={handleCreateQuickCategory}
                  className="rounded bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                >
                  {addingCatLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span>Simpan</span>
                </button>
              </div>
            ) : null}

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#121216] text-zinc-200">
                    {c.name} {c.description ? `(${c.description})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Pill Indicator */}
            {currentCategoryObj && (
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentCategoryObj.color || "#888" }}
                />
                <span className="text-[11px] font-mono text-zinc-400 truncate">
                  {currentCategoryObj.description || `Kategori ${currentCategoryObj.name}`}
                </span>
              </div>
            )}
          </div>

          {/* Wallet Selector (Optional/Integration) */}
          {wallets.length > 0 && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1.5">
                <Wallet className="h-3 w-3 text-zinc-500" />
                <span>Sumber Dana / Dompet</span>
              </label>
              <select
                value={selectedWalletId || ""}
                onChange={(e) =>
                  setSelectedWalletId(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#121216] text-zinc-200">
                    {w.name} (Saldo: Rp {w.balance.toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Makan siang di warung, Beli kopi"
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={activeDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
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
              className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-1.5 text-xs transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Transaksi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
