"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Terminal,
  ArrowRight,
} from "lucide-react";

interface AuthFormProps {
  initialMode?: "login" | "register";
}

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Silakan isi semua bidang yang diperlukan.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter.");
      return;
    }

    setSubmitting(true);
    console.log(`[AuthForm] ${mode} attempt:`, { email: email.trim() });

    try {
      if (mode === "login") {
        const res = await login({ email: email.trim(), password });
        console.log("[AuthForm] login result:", res);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            router.push("/");
          }, 600);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        console.log("[AuthForm] register result:", res);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            router.push("/");
          }, 800);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: unknown) {
      console.error("[AuthForm] error caught:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (type: "demo" | "new") => {
    setErrorMessage(null);
    if (type === "demo") {
      setEmail("nando_test@example.com");
      setPassword("password123");
      if (mode === "register") {
        setName("Nando Pratama");
      }
    } else {
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      setName(`User Test ${randomId}`);
      setEmail(`user${randomId}@example.com`);
      setPassword("password123");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Enterprise Solid Box */}
      <div className="rounded-lg border border-zinc-800 bg-[#121215] p-6 shadow-sm">
        {/* Top Header / Mode Switcher */}
        <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
              {mode === "login" ? "Autentikasi Akun" : "Registrasi Akun Baru"}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === "login"
                ? "Masukkan kredensial terdaftar untuk mengakses dashboard"
                : "Daftarkan identitas baru ke database backend Go"}
            </p>
          </div>

          {/* Minimalist Segment Control */}
          <div className="flex rounded border border-zinc-800 bg-[#09090b] p-0.5 text-xs font-mono">
            <button
              type="button"
              id="tab-login-btn"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`rounded px-2.5 py-1 transition ${
                mode === "login"
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              id="tab-register-btn"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`rounded px-2.5 py-1 transition ${
                mode === "register"
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Register
            </button>
          </div>
        </div>


        {/* Error Notification */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className="mb-4 flex items-start gap-2.5 rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-rose-300 font-mono"
          >
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div
            id="auth-success-banner"
            className="mb-4 flex items-start gap-2.5 rounded border border-emerald-900/60 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 font-mono"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Success: </span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="space-y-3.5"
        >
          {/* Name Field (Register Mode Only) */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="register-name-input"
                className="block text-[11px] font-mono uppercase text-zinc-400 mb-1"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                </div>
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nando Pratama"
                  className="block w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-[11px] font-mono uppercase text-zinc-400 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="auth-password-input"
                className="block text-[11px] font-mono uppercase text-zinc-400"
              >
                Password
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Min. 6 Karakter</span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <input
                id="auth-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-9 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Extra options for login */}
          {mode === "login" && (
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0"
                />
                <span className="text-[11px] text-zinc-400">Ingat sesi</span>
              </label>
            </div>
          )}

          {/* Submit Button (Solid Minimalist) */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded border border-zinc-200 bg-zinc-100 hover:bg-white py-2 text-xs font-semibold text-zinc-950 transition disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses Permintaan...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === "login" ? "Masuk ke Dashboard" : "Daftarkan Akun"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* High-Density Quick Fill Telemetry */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3 text-zinc-400" />
              Quick Fill (Preset Pengujian):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              id="fill-demo-account-btn"
              onClick={() => handleQuickFill("demo")}
              className="flex items-center justify-center rounded border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 py-1.5 px-2 text-[11px] text-zinc-300 transition"
            >
              nando_test
            </button>
            <button
              type="button"
              id="fill-new-account-btn"
              onClick={() => {
                setMode("register");
                handleQuickFill("new");
              }}
              className="flex items-center justify-center rounded border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 py-1.5 px-2 text-[11px] text-zinc-300 transition"
            >
              + Akun Acak
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="mt-4 text-center text-xs text-zinc-500">
          {mode === "login" ? (
            <p>
              Belum punya akun?{" "}
              <button
                type="button"
                id="switch-to-register-link"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-zinc-300 hover:text-white underline underline-offset-2 transition"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun?{" "}
              <button
                type="button"
                id="switch-to-login-link"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-zinc-300 hover:text-white underline underline-offset-2 transition"
              >
                Kembali ke login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
