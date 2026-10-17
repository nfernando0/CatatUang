import { authApi, getAuthHeaders, getStoredToken } from "@/lib/api";
import {
  AuthApiResponse,
  LoginPayload,
  ProfileApiResponse,
  RegisterPayload,
} from "@/lib/types";

export const authService = {
  getStoredToken,
  getAuthHeaders,

  async login(payload: LoginPayload): Promise<AuthApiResponse> {
    return authApi.login(payload);
  },

  async register(payload: RegisterPayload): Promise<AuthApiResponse> {
    return authApi.register(payload);
  },

  async getProfile(token?: string): Promise<ProfileApiResponse> {
    return authApi.getProfile(token);
  },

  async ping(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    return authApi.ping();
  },

  async verifySession(token: string): Promise<boolean> {
    try {
      const res = await authApi.getProfile(token);
      return res.status === "success" && !!res.data;
    } catch {
      return false;
    }
  },
};
