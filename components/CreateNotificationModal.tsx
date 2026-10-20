"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Send,
} from "lucide-react";
import { CreateNotificationPayload, NotificationType } from "@/lib/types";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/lib/auth-context";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TEMPLATES: Array<{
  label: string;
  title: string;
  message: string;
  type: NotificationType;
  category: string;
  link: string;
}> = [
  {
    label: "Gaji Masuk",
    title: "Gaji Bulanan Telah Masuk! 💰",
    message: "Gaji telah dikreditkan ke Rekening BCA Anda. Jangan lupa alokasikan ke tabungan.",
    type: "success",
    category: "wallet",
    link: "/wallets",
  },
  {
    label: "Bayar Tagihan",
    title: "Pengingat: Tagihan Listrik & WiFi",
    message: "Jatuh tempo pembayaran tagihan utilitas tinggal 2 hari lagi.",
    type: "warning",
    category: "transaction",
    link: "/transactions",
  },
  {
    label: "Target Tabungan",
    title: "Tabungan Liburan Tercapai! 🏖️",
    message: "Selamat! Target tabungan liburan sebesar Rp 5.000.000 telah 100% terkumpul.",
    type: "success",
    category: "saving",
    link: "/savings",
  },
  {
    label: "Saldo Menipis",
    title: "Peringatan Saldo Dompet",
    message: "Saldo kas tunai Anda kurang dari batas minimum Rp 100.000.",
    type: "danger",
    category: "wallet",
    link: "/wallets",
  },
];

export default function CreateNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateNotificationModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [category, setCategory] = useState("system");
  const [link, setLink] = useState("/dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
    setCategory(tpl.category);
    setLink(tpl.link);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Judul dan pesan notifikasi wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateNotificationPayload = {
        title: title.trim(),
        message: message.trim(),
        type,
        category: category.trim() || "system",
        link: link.trim() || undefined,
      };

      const res = await notificationService.createNotification(payload, token || undefined);
      if (res && res.status === "success") {
        onSuccess();
        onClose();
        // Reset form
        setTitle("");
        setMessage("");
        setType("info");
        setCategory("system");
        setLink("/dashboard");
      } else {
        setError(res?.message || "Gagal membuat notifikasi");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="create-notification-modal-card"
        className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 shadow-2xl relative text-zinc-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 tracking-tight">
                Buat / Uji Notifikasi Baru
              </h2>
              <p className="text-[11px] text-zinc-400">
                Kirim pemberitahuan langsung ke API Notifikasi backend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-2">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>PILIH CONTOH / TEMPLATE CEPAT:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition active:scale-95"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 rounded-lg border border-rose-900/80 bg-rose-950/40 p-2.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Judul Notifikasi */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Judul Notifikasi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengingat Tagihan Bulanan"
              className="w-full rounded-md border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {/* Pesan Notifikasi */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Pesan / Isi Pemberitahuan <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan keterangan detail pemberitahuan..."
              className="w-full rounded-md border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none resize-none"
            />
          </div>

          {/* Grid Tipe & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tipe Notifikasi */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Tipe Notifikasi
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["info", "success", "warning", "danger"] as NotificationType[]).map((t) => {
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md border text-[11px] font-medium capitalize transition ${
                        isSelected
                          ? t === "success"
                            ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                            : t === "warning"
                            ? "border-amber-500 bg-amber-950/40 text-amber-300"
                            : t === "danger"
                            ? "border-rose-500 bg-rose-950/40 text-rose-300"
                            : "border-blue-500 bg-blue-950/40 text-blue-300"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {t === "success" && <CheckCircle2 className="h-3 w-3" />}
                      {t === "warning" && <AlertTriangle className="h-3 w-3" />}
                      {t === "danger" && <AlertCircle className="h-3 w-3" />}
                      {t === "info" && <Info className="h-3 w-3" />}
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
              >
                <option value="system">System (Umum)</option>
                <option value="wallet">Wallet (Dompet)</option>
                <option value="saving">Saving (Tabungan)</option>
                <option value="transaction">Transaction (Transaksi)</option>
              </select>
            </div>
          </div>

          {/* Tautan Navigasi (Link) */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Tautan Navigasi Tab (Opsional)
            </label>
            <select
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
            >
              <option value="/dashboard">Dashboard (/dashboard)</option>
              <option value="/transactions">Daftar Transaksi (/transactions)</option>
              <option value="/wallets">Dompet & Rekening (/wallets)</option>
              <option value="/savings">Target Tabungan (/savings)</option>
              <option value="/reports">Laporan & Rasio (/reports)</option>
              <option value="/categories">Kategori (/categories)</option>
              <option value="/profile">Profil Akun (/profile)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              id="submit-create-notification-btn"
              className="flex items-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-1.5 text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "Mengirim..." : "Kirim Notifikasi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
