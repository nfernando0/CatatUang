export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthSuccessData {
  user: User;
  token: string;
}

export interface AuthApiResponse {
  status: "success" | "error";
  message: string;
  data?: AuthSuccessData;
}

export interface ProfileApiResponse {
  status: "success" | "error";
  message: string;
  data?: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateTransactionPayload {
  type: "income" | "expense";
  amount: number;
  category: string;
  category_id?: number;
  wallet_id?: number;
  description?: string;
  date?: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface TransactionItem {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  category_id?: number;
  wallet_id?: number;
  description: string;
  date: string;
  created_at?: string;
}

export interface CategoryItem {
  id: number;
  user_id?: number;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesApiResponse {
  status: "success" | "error";
  message?: string;
  data?: CategoryItem[];
}

export interface SingleCategoryApiResponse {
  status: "success" | "error";
  message?: string;
  data?: CategoryItem;
}

export interface CreateCategoryPayload {
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: "income" | "expense";
  color?: string;
  icon?: string;
  description?: string;
}

export interface SingleTransactionApiResponse {
  status: "success" | "error";
  message?: string;
  data?: TransactionItem;
  ai_budget_analysis?: AIBudgetAnalysis;
  budget_alerts?: string[];
}

export interface TransactionsApiResponse {
  status: "success" | "error";
  message?: string;
  data?: TransactionItem[];
  meta?: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface SummaryApiResponse {
  status: "success" | "error";
  message?: string;
  data?: TransactionSummary;
}

export interface SavingItem {
  id: number;
  user_id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  status: "active" | "completed";
  color: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingMeta {
  total_items: number;
  active_count: number;
  completed_count: number;
  total_target_amount: number;
  total_collected_amount: number;
  overall_progress_percent: number;
}

export interface SavingsApiResponse {
  status: "success" | "error";
  message?: string;
  data?: SavingItem[];
  meta?: SavingMeta;
}

export interface SingleSavingApiResponse {
  status: "success" | "error";
  message?: string;
  data?: SavingItem;
}

export interface CreateSavingPayload {
  name: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  color?: string;
  target_date?: string | null;
}

export interface UpdateSavingPayload {
  name?: string;
  description?: string;
  target_amount?: number;
  current_amount?: number;
  color?: string;
  target_date?: string | null;
  status?: "active" | "completed";
}

export type WalletType = "bank" | "ewallet" | "cash" | "investment" | "other";

export interface WalletItem {
  id: number;
  user_id?: number;
  name: string;
  type: WalletType;
  account_number?: string;
  balance: number;
  color: string;
  icon?: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WalletMeta {
  total_wallets: number;
  total_balance: number;
  primary_wallet_name?: string;
  bank_count: number;
  ewallet_count: number;
  cash_count: number;
}

export interface WalletsApiResponse {
  status: "success" | "error";
  message?: string;
  data?: WalletItem[];
  meta?: WalletMeta;
}

export interface SingleWalletApiResponse {
  status: "success" | "error";
  message?: string;
  data?: WalletItem;
}

export interface CreateWalletPayload {
  name: string;
  type: WalletType;
  account_number?: string;
  balance: number;
  color?: string;
  description?: string;
  is_default?: boolean;
}

export interface UpdateWalletPayload {
  name?: string;
  type?: WalletType;
  account_number?: string;
  balance?: number;
  color?: string;
  description?: string;
  is_default?: boolean;
}

export interface TransferPayload {
  from_wallet_id: number;
  to_wallet_id: number;
  amount: number;
  notes?: string;
}

export type NotificationType = "info" | "success" | "warning" | "danger";

export interface NotificationItem {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  is_read: boolean;
  link?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationPaginationMeta {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  unread_count?: number;
}

export interface NotificationsApiResponse {
  status: "success" | "error";
  message?: string;
  data?: NotificationItem[];
  meta?: NotificationPaginationMeta;
  unread_count?: number;
}

export interface SingleNotificationApiResponse {
  status: "success" | "error";
  message?: string;
  data?: NotificationItem;
}

export interface UnreadCountApiResponse {
  status: "success" | "error";
  message?: string;
  unread_count: number;
  data?: {
    unread_count: number;
  };
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  link?: string;
}

export interface NotificationFilterParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  unread_only?: boolean;
  type?: string;
  category?: string;
}

// ==========================================
// BUDGET TRACKER & AI GUARDIAN TYPES
// ==========================================

export type BudgetPeriod = "daily" | "weekly" | "monthly";
export type BudgetStatus = "safe" | "warning" | "exceeded" | "not_set";

export interface BudgetSummaryItem {
  budget_id: number | null;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  is_exceeded: boolean;
  status: BudgetStatus;
  date?: string;
  start_date?: string;
  end_date?: string;
  transactions_count: number;
}

export interface CategoryBudgetItem {
  budget_id: number;
  category_id: number;
  category_name: string;
  period: BudgetPeriod;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  is_exceeded: boolean;
  status: BudgetStatus;
}

export interface AIBudgetAnalysis {
  is_exceeded: boolean;
  status: "safe" | "warning" | "danger";
  period_impacted: "daily" | "weekly" | "both" | "none";
  headline: string;
  analysis: string;
  advice: string;
  smart_alert?: string;
  source: string; // "gemini" | "fallback"
}

export interface BudgetTrackerData {
  daily: BudgetSummaryItem;
  weekly: BudgetSummaryItem;
  category_budgets?: CategoryBudgetItem[];
  alerts?: string[];
  ai_analysis?: AIBudgetAnalysis;
}

export interface BudgetTrackerApiResponse {
  status: "success" | "error";
  message?: string;
  data?: BudgetTrackerData;
}

export interface SetBudgetLimitsPayload {
  daily_limit?: number;
  weekly_limit?: number;
}

export interface CreateBudgetPayload {
  period: BudgetPeriod;
  amount: number;
  category_id?: number | null;
  category?: string;
  description?: string;
}

export interface BudgetItem {
  id: number;
  user_id: number;
  category_id?: number | null;
  category?: string;
  period: BudgetPeriod;
  amount: number;
  description?: string;
  spent?: number;
  remaining?: number;
  percentage?: number;
  is_exceeded?: boolean;
  status?: BudgetStatus;
  created_at?: string;
  updated_at?: string;
  category_data?: CategoryItem;
}

export interface BudgetsApiResponse {
  status: "success" | "error";
  message?: string;
  data?: BudgetItem[];
}

export interface SingleBudgetApiResponse {
  status: "success" | "error";
  message?: string;
  data?: BudgetItem;
}
