import React from "react";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Masuk - CatatUang",
  description: "Masuk ke platform catatan pengeluaran & pemasukan.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mb-3">
          <Link
            href="/"
            id="back-to-home-link"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Beranda
          </Link>
        </div>

        <AuthForm initialMode="login" />

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
          <span>Sesi terenkripsi & terlindungi</span>
        </div>
      </main>
    </div>
  );
}
