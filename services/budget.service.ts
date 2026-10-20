import { authApi } from "@/lib/api";
import {
  BudgetTrackerApiResponse,
  SetBudgetLimitsPayload,
  CreateBudgetPayload,
  BudgetsApiResponse,
  SingleBudgetApiResponse,
} from "@/lib/types";

export const budgetService = {
  /**
   * Mengambil data status ringkasan budget tracker (harian, mingguan, kategori)
   */
  async getTracker(date?: string, token?: string): Promise<BudgetTrackerApiResponse> {
    return authApi.getBudgetTracker(date, token);
  },

  /**
   * Mengambil data evaluasi cerdas AI Gemini untuk Budget Tracker
   */
  async getAITracker(date?: string, token?: string): Promise<BudgetTrackerApiResponse> {
    return authApi.getAIBudgetTracker(date, token);
  },

  /**
   * Mengatur atau memperbarui batas maksimal harian & mingguan secara cepat
   */
  async setLimits(payload: SetBudgetLimitsPayload, token?: string): Promise<BudgetTrackerApiResponse> {
    return authApi.setBudgetLimits(payload, token);
  },

  /**
   * Mengambil seluruh data budget (bisa difilter berdasarkan period atau tanggal)
   */
  async getBudgets(period?: string, date?: string, token?: string): Promise<BudgetsApiResponse> {
    return authApi.getBudgets(period, date, token);
  },

  /**
   * Mengambil rincian budget berdasarkan ID beserta kontribusi transaksinya
   */
  async getBudgetById(id: number, token?: string): Promise<SingleBudgetApiResponse> {
    return authApi.getBudgetById(id, token);
  },

  /**
   * Membuat target batas budget baru (harian/mingguan/bulanan/kategori)
   */
  async createBudget(payload: CreateBudgetPayload, token?: string): Promise<SingleBudgetApiResponse> {
    return authApi.createBudget(payload, token);
  },

  /**
   * Memperbarui target batas budget yang ada
   */
  async updateBudget(id: number, payload: Partial<CreateBudgetPayload>, token?: string): Promise<SingleBudgetApiResponse> {
    return authApi.updateBudget(id, payload, token);
  },

  /**
   * Menghapus batas budget
   */
  async deleteBudget(id: number, token?: string): Promise<{ status: "success" | "error"; message?: string }> {
    return authApi.deleteBudget(id, token);
  },
};
