"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "./api";
import { LoginPayload, RegisterPayload, User } from "./types";

interface BackendStatus {
  isOnline: boolean;
  checking: boolean;
  latencyMs: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  backendStatus: BackendStatus;
  checkBackend: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message: string }>;
  register: (
    payload: RegisterPayload
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "pengeluaran_auth_token";
const USER_KEY = "pengeluaran_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with uniform SSR-safe defaults to prevent hydration mismatch
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isOnline: false,
    checking: false,
    latencyMs: 0,
  });

  // Check backend server availability
  const checkBackend = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const result = await authApi.ping();
    setBackendStatus({
      isOnline: result.ok,
      checking: false,
      latencyMs: result.latencyMs,
    });
  }, []);

  // Sync token to cookie for SSR/Middleware compatibility
  const syncCookie = (val: string | null) => {
    if (typeof document === "undefined") return;
    if (val) {
      document.cookie = `auth_token=${encodeURIComponent(
        val
      )}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    }
  };

  // Verify stored session and check backend on mount
  useEffect(() => {
    let isSubscribed = true;

    // Check backend connection
    authApi.ping().then((result) => {
      if (isSubscribed) {
        setBackendStatus({
          isOnline: result.ok,
          checking: false,
          latencyMs: result.latencyMs,
        });
      }
    });

    // Restore authentication session asynchronously to avoid synchronous effect setState
    Promise.resolve().then(async () => {
      if (!isSubscribed) return;
      const activeToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (activeToken) {
        setToken(activeToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore corrupted JSON
          }
        }

        try {
          const res = await authApi.getProfile(activeToken);
          if (isSubscribed && res.data) {
            setUser(res.data);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          }
        } catch {
          if (isSubscribed) {
            setToken(null);
            setUser(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            syncCookie(null);
          }
        } finally {
          if (isSubscribed) {
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Login handler
  const login = async (payload: LoginPayload) => {
    try {
      const response = await authApi.login(payload);
      if (response.data?.token && response.data?.user) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        syncCookie(newToken);
        return {
          success: true,
          message: response.message || "Login berhasil! Selamat datang kembali.",
        };
      }
      return {
        success: false,
        message: response.message || "Gagal mendapatkan data login.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat login.";
      return {
        success: false,
        message,
      };
    }
  };

  // Register handler
  const register = async (payload: RegisterPayload) => {
    try {
      const response = await authApi.register(payload);
      if (response.data?.token && response.data?.user) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        syncCookie(newToken);
        return {
          success: true,
          message:
            response.message || "Registrasi berhasil! Akun Anda telah siap.",
        };
      }
      return {
        success: false,
        message: response.message || "Gagal mendaftarkan akun.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi.";
      return {
        success: false,
        message,
      };
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    syncCookie(null);
  }, []);

  // Refresh profile handler
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authApi.getProfile(token);
      if (res.data) {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        backendStatus,
        checkBackend,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return context;
}
