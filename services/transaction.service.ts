import { authApi } from "@/lib/api";
import {
  CreateTransactionPayload,
  SingleTransactionApiResponse,
  SummaryApiResponse,
  TransactionsApiResponse,
} from "@/lib/types";

export const transactionService = {
  async getSummary(token?: string): Promise<SummaryApiResponse> {
    return authApi.getSummary(token);
  },

  async getTransactions(
    token?: string,
    limit: number = 20
  ): Promise<TransactionsApiResponse> {
    return authApi.getTransactions(token, limit);
  },

  async createTransaction(
    payload: CreateTransactionPayload,
    token?: string
  ): Promise<SingleTransactionApiResponse> {
    return authApi.createTransaction(payload, token);
  },
};
