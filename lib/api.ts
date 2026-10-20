import {
  AuthApiResponse,
  CreateTransactionPayload,
  LoginPayload,
  ProfileApiResponse,
  RegisterPayload,
  SingleTransactionApiResponse,
  SummaryApiResponse,
  TransactionsApiResponse,
  CreateSavingPayload,
  SavingsApiResponse,
  SingleSavingApiResponse,
  UpdateSavingPayload,
  CreateWalletPayload,
  SingleWalletApiResponse,
  UpdateWalletPayload,
  WalletsApiResponse,
  TransferPayload,
  CategoriesApiResponse,
  SingleCategoryApiResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  NotificationsApiResponse,
  SingleNotificationApiResponse,
  UnreadCountApiResponse,
  CreateNotificationPayload,
  NotificationFilterParams,
  BudgetTrackerApiResponse,
  SetBudgetLimitsPayload,
  CreateBudgetPayload,
  BudgetsApiResponse,
  SingleBudgetApiResponse,
} from "./types";

export const TOKEN_STORAGE_KEY = "pengeluaran_auth_token";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If the browser accessed via 127.0.0.1, match it to prevent IP-to-domain CORS/Private Network restrictions
    if (window.location.hostname === "127.0.0.1") {
      return "http://127.0.0.1:8080";
    }
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8080"
  );
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Helper function to retrieve the stored JWT token from localStorage or cookie.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Check localStorage
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (localToken) return localToken;

  // 2. Fallback check cookie
  if (typeof document !== "undefined") {
    const match = document.cookie.match(
      new RegExp("(^|;\\s*)auth_token=([^;]+)")
    );
    if (match && match[2]) {
      return decodeURIComponent(match[2]);
    }
  }

  return null;
}

/**
 * Helper function that returns headers containing the JWT Authorization Bearer token.
 * @param customToken (Optional) Specific token to use; defaults to stored token.
 */
export function getAuthHeaders(customToken?: string): Record<string, string> {
  const token = customToken || getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }

  return headers;
}

/**
 * Base HTTP request helper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type");
    let responseData: Record<string, unknown> | null = null;

    if (contentType && contentType.includes("application/json")) {
      responseData = (await res.json()) as Record<string, unknown>;
    } else {
      const text = await res.text();
      responseData = { message: text };
    }

    if (!res.ok) {
      const errorMsg =
        typeof responseData?.message === "string"
          ? responseData.message
          : typeof responseData?.error === "string"
            ? responseData.error
            : `Permintaan gagal dengan status ${res.status}`;
      throw new ApiError(errorMsg, res.status);
    }

    return responseData as unknown as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network / offline error
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new ApiError(
        `Tidak dapat terhubung ke server backend di (${baseUrl}). Pastikan backend Go sedang berjalan (go run main.go).`
      );
    }

    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.";
    throw new ApiError(message);
  }
}

/**
 * Authenticated HTTP request helper that automatically injects the JWT token
 * into the Authorization header (Authorization: Bearer <token>).
 */
export async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  customToken?: string
): Promise<T> {
  const token = customToken || getStoredToken();

  if (!token) {
    throw new ApiError(
      "Token JWT tidak ditemukan. Silakan login terlebih dahulu untuk mengakses data ini.",
      401
    );
  }

  const existingHeaders = options.headers || {};
  const authHeaders = {
    ...getAuthHeaders(token),
    ...(existingHeaders instanceof Headers
      ? Object.fromEntries(existingHeaders.entries())
      : Array.isArray(existingHeaders)
        ? Object.fromEntries(existingHeaders)
        : existingHeaders),
  };

  return request<T>(endpoint, {
    ...options,
    headers: authHeaders,
  });
}

/**
 * API client methods
 */
export const authApi = {
  /**
   * Health check to test backend connection
   */
  async ping(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    try {
      const data = await request<{ message: string }>("/ping");
      const latencyMs = Math.round(performance.now() - start);
      return { ok: true, message: data.message || "pong", latencyMs };
    } catch {
      return { ok: false, message: "Server backend offline", latencyMs: 0 };
    }
  },

  /**
   * Login user: POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthApiResponse> {
    return request<AuthApiResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Register new user: POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthApiResponse> {
    return request<AuthApiResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get authenticated user profile: GET /api/auth/me
   * Mengirimkan Authorization: Bearer <token>
   */
  async getProfile(token?: string): Promise<ProfileApiResponse> {
    return authRequest<ProfileApiResponse>("/api/auth/me", { method: "GET" }, token);
  },

  /**
   * Get transaction summary: GET /api/transactions/summary
   * Mengirimkan Authorization: Bearer <token>
   */
  async getSummary(token?: string): Promise<SummaryApiResponse> {
    return authRequest<SummaryApiResponse>(
      "/api/transactions/summary",
      { method: "GET" },
      token
    );
  },

  /**
   * Get transaction list: GET /api/transactions?limit={limit}
   * Mengirimkan Authorization: Bearer <token>
   */
  async getTransactions(
    token?: string,
    limit: number = 5
  ): Promise<TransactionsApiResponse> {
    return authRequest<TransactionsApiResponse>(
      `/api/transactions?limit=${limit}`,
      { method: "GET" },
      token
    );
  },

  /**
   * Create a new transaction (income/expense): POST /api/transactions
   * Mengirimkan Authorization: Bearer <token>
   */
  async createTransaction(
    payload: CreateTransactionPayload,
    token?: string
  ): Promise<SingleTransactionApiResponse> {
    return authRequest<SingleTransactionApiResponse>(
      "/api/transactions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Get all savings goals & meta: GET /api/savings
   */
  async getSavings(token?: string): Promise<SavingsApiResponse> {
    return authRequest<SavingsApiResponse>("/api/savings", { method: "GET" }, token);
  },

  /**
   * Get single saving detail: GET /api/savings/:id
   */
  async getSavingById(id: number, token?: string): Promise<SingleSavingApiResponse> {
    return authRequest<SingleSavingApiResponse>(`/api/savings/${id}`, { method: "GET" }, token);
  },

  /**
   * Create new saving goal: POST /api/savings
   */
  async createSaving(
    payload: CreateSavingPayload,
    token?: string
  ): Promise<SingleSavingApiResponse> {
    return authRequest<SingleSavingApiResponse>(
      "/api/savings",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Update saving goal: PUT /api/savings/:id
   */
  async updateSaving(
    id: number,
    payload: UpdateSavingPayload,
    token?: string
  ): Promise<SingleSavingApiResponse> {
    return authRequest<SingleSavingApiResponse>(
      `/api/savings/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Delete saving goal: DELETE /api/savings/:id
   */
  async deleteSaving(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      `/api/savings/${id}`,
      { method: "DELETE" },
      token
    );
  },

  /**
   * Get all wallets: GET /api/wallets
   */
  async getWallets(token?: string): Promise<WalletsApiResponse> {
    return authRequest<WalletsApiResponse>("/api/wallets", { method: "GET" }, token);
  },

  /**
   * Get single wallet: GET /api/wallets/:id
   */
  async getWalletById(id: number, token?: string): Promise<SingleWalletApiResponse> {
    return authRequest<SingleWalletApiResponse>(`/api/wallets/${id}`, { method: "GET" }, token);
  },

  /**
   * Create new wallet: POST /api/wallets
   */
  async createWallet(
    payload: CreateWalletPayload,
    token?: string
  ): Promise<SingleWalletApiResponse> {
    return authRequest<SingleWalletApiResponse>(
      "/api/wallets",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Update wallet: PUT /api/wallets/:id
   */
  async updateWallet(
    id: number,
    payload: UpdateWalletPayload,
    token?: string
  ): Promise<SingleWalletApiResponse> {
    return authRequest<SingleWalletApiResponse>(
      `/api/wallets/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Delete wallet: DELETE /api/wallets/:id
   */
  async deleteWallet(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      `/api/wallets/${id}`,
      { method: "DELETE" },
      token
    );
  },

  /**
   * Transfer between wallets: POST /api/wallets/transfer
   */
  async transferWallet(
    payload: TransferPayload,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      "/api/wallets/transfer",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Get all categories: GET /api/categories
   */
  async getCategories(token?: string): Promise<CategoriesApiResponse> {
    return authRequest<CategoriesApiResponse>("/api/categories", { method: "GET" }, token);
  },

  /**
   * Get single category detail: GET /api/categories/:id
   */
  async getCategoryById(id: number, token?: string): Promise<SingleCategoryApiResponse> {
    return authRequest<SingleCategoryApiResponse>(`/api/categories/${id}`, { method: "GET" }, token);
  },

  /**
   * Create new category: POST /api/categories
   */
  async createCategory(
    payload: CreateCategoryPayload,
    token?: string
  ): Promise<SingleCategoryApiResponse> {
    return authRequest<SingleCategoryApiResponse>(
      "/api/categories",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Update category: PUT /api/categories/:id
   */
  async updateCategory(
    id: number,
    payload: UpdateCategoryPayload,
    token?: string
  ): Promise<SingleCategoryApiResponse> {
    return authRequest<SingleCategoryApiResponse>(
      `/api/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Delete category: DELETE /api/categories/:id
   */
  async deleteCategory(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      `/api/categories/${id}`,
      { method: "DELETE" },
      token
    );
  },

  /**
   * Get all notifications: GET /api/notifications
   */
  async getNotifications(
    params?: NotificationFilterParams,
    token?: string
  ): Promise<NotificationsApiResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.unread_only) query.set("unread_only", "true");
    if (params?.is_read !== undefined) query.set("is_read", String(params.is_read));
    if (params?.type) query.set("type", params.type);
    if (params?.category) query.set("category", params.category);

    const queryString = query.toString();
    const endpoint = queryString ? `/api/notifications?${queryString}` : "/api/notifications";
    return authRequest<NotificationsApiResponse>(endpoint, { method: "GET" }, token);
  },

  /**
   * Get unread notification count: GET /api/notifications/unread-count
   */
  async getUnreadNotificationCount(
    token?: string
  ): Promise<UnreadCountApiResponse> {
    return authRequest<UnreadCountApiResponse>(
      "/api/notifications/unread-count",
      { method: "GET" },
      token
    );
  },

  /**
   * Get notification by ID: GET /api/notifications/:id
   */
  async getNotificationById(
    id: number,
    token?: string
  ): Promise<SingleNotificationApiResponse> {
    return authRequest<SingleNotificationApiResponse>(
      `/api/notifications/${id}`,
      { method: "GET" },
      token
    );
  },

  /**
   * Create custom notification: POST /api/notifications
   */
  async createNotification(
    payload: CreateNotificationPayload,
    token?: string
  ): Promise<SingleNotificationApiResponse> {
    return authRequest<SingleNotificationApiResponse>(
      "/api/notifications",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Mark single notification as read: PATCH /api/notifications/:id/read
   */
  async markNotificationAsRead(
    id: number,
    token?: string
  ): Promise<SingleNotificationApiResponse> {
    return authRequest<SingleNotificationApiResponse>(
      `/api/notifications/${id}/read`,
      { method: "PATCH" },
      token
    );
  },

  /**
   * Mark all notifications as read: PATCH /api/notifications/read-all
   */
  async markAllNotificationsAsRead(
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string; updated_count?: number }> {
    return authRequest<{ status: "success" | "error"; message?: string; updated_count?: number }>(
      "/api/notifications/read-all",
      { method: "PATCH" },
      token
    );
  },

  /**
   * Delete single notification: DELETE /api/notifications/:id
   */
  async deleteNotification(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      `/api/notifications/${id}`,
      { method: "DELETE" },
      token
    );
  },

  /**
   * Delete all notifications: DELETE /api/notifications(?only_read=true)
   */
  async deleteAllNotifications(
    onlyRead: boolean = false,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string; deleted_count?: number }> {
    const endpoint = onlyRead ? "/api/notifications?only_read=true" : "/api/notifications";
    return authRequest<{ status: "success" | "error"; message?: string; deleted_count?: number }>(
      endpoint,
      { method: "DELETE" },
      token
    );
  },

  // ==========================================
  // BUDGET TRACKER & AI GUARDIAN APIS
  // ==========================================

  /**
   * Get budget tracker summary (daily, weekly, and category status): GET /api/budgets/tracker(?date=YYYY-MM-DD)
   */
  async getBudgetTracker(
    date?: string,
    token?: string
  ): Promise<BudgetTrackerApiResponse> {
    const endpoint = date ? `/api/budgets/tracker?date=${encodeURIComponent(date)}` : "/api/budgets/tracker";
    return authRequest<BudgetTrackerApiResponse>(endpoint, { method: "GET" }, token);
  },

  /**
   * Get AI-powered budget tracker evaluation: GET /api/budgets/ai-tracker(?date=YYYY-MM-DD)
   */
  async getAIBudgetTracker(
    date?: string,
    token?: string
  ): Promise<BudgetTrackerApiResponse> {
    const endpoint = date ? `/api/budgets/ai-tracker?date=${encodeURIComponent(date)}` : "/api/budgets/ai-tracker";
    return authRequest<BudgetTrackerApiResponse>(endpoint, { method: "GET" }, token);
  },

  /**
   * Set quick daily and weekly budget limits: POST /api/budgets/limits
   */
  async setBudgetLimits(
    payload: SetBudgetLimitsPayload,
    token?: string
  ): Promise<BudgetTrackerApiResponse> {
    return authRequest<BudgetTrackerApiResponse>(
      "/api/budgets/limits",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Get all budgets (with optional period or date filter): GET /api/budgets
   */
  async getBudgets(
    period?: string,
    date?: string,
    token?: string
  ): Promise<BudgetsApiResponse> {
    const params = new URLSearchParams();
    if (period && period !== "all") params.append("period", period);
    if (date) params.append("date", date);
    const queryString = params.toString();
    const endpoint = queryString ? `/api/budgets?${queryString}` : "/api/budgets";
    return authRequest<BudgetsApiResponse>(endpoint, { method: "GET" }, token);
  },

  /**
   * Get budget details by ID: GET /api/budgets/:id
   */
  async getBudgetById(
    id: number,
    token?: string
  ): Promise<SingleBudgetApiResponse> {
    return authRequest<SingleBudgetApiResponse>(
      `/api/budgets/${id}`,
      { method: "GET" },
      token
    );
  },

  /**
   * Create new budget: POST /api/budgets
   */
  async createBudget(
    payload: CreateBudgetPayload,
    token?: string
  ): Promise<SingleBudgetApiResponse> {
    return authRequest<SingleBudgetApiResponse>(
      "/api/budgets",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Update budget: PUT /api/budgets/:id
   */
  async updateBudget(
    id: number,
    payload: Partial<CreateBudgetPayload>,
    token?: string
  ): Promise<SingleBudgetApiResponse> {
    return authRequest<SingleBudgetApiResponse>(
      `/api/budgets/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token
    );
  },

  /**
   * Delete budget: DELETE /api/budgets/:id
   */
  async deleteBudget(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    return authRequest<{ status: "success" | "error"; message?: string }>(
      `/api/budgets/${id}`,
      { method: "DELETE" },
      token
    );
  },
};
