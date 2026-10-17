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
