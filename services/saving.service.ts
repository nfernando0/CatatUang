import { authApi } from "@/lib/api";
import {
  CreateSavingPayload,
  SavingsApiResponse,
  SingleSavingApiResponse,
  UpdateSavingPayload,
} from "@/lib/types";

export const savingService = {
  async getSavings(token?: string): Promise<SavingsApiResponse> {
    return authApi.getSavings(token);
  },

  async getSavingById(id: number, token?: string): Promise<SingleSavingApiResponse> {
    return authApi.getSavingById(id, token);
  },

  async createSaving(
    payload: CreateSavingPayload,
    token?: string
  ): Promise<SingleSavingApiResponse> {
    return authApi.createSaving(payload, token);
  },

  async updateSaving(
    id: number,
    payload: UpdateSavingPayload,
    token?: string
  ): Promise<SingleSavingApiResponse> {
    return authApi.updateSaving(id, payload, token);
  },

  async deleteSaving(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authApi.deleteSaving(id, token);
  },
};
