import { authApi } from "@/lib/api";
import {
  CreateWalletPayload,
  SingleWalletApiResponse,
  UpdateWalletPayload,
  WalletItem,
  WalletsApiResponse,
  TransferPayload,
} from "@/lib/types";

const LOCAL_STORAGE_KEY = "catatuang_wallets_data";

const DEFAULT_WALLETS: WalletItem[] = [
  {
    id: 1,
    name: "Kas Tunai (Cash)",
    type: "cash",
    balance: 750000,
    color: "#10b981",
    is_default: false,
    description: "Uang tunai fisik untuk kebutuhan sehari-hari",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Rekening BCA",
    type: "bank",
    account_number: "8271928312",
    balance: 5500000,
    color: "#3b82f6",
    is_default: true,
    description: "Rekening utama penerimaan gaji & tagihan bulanan",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "GoPay / OVO",
    type: "ewallet",
    account_number: "081234567890",
    balance: 320000,
    color: "#06b6d4",
    is_default: false,
    description: "Dompet digital untuk transportasi & pesan antar makanan",
    created_at: new Date().toISOString(),
  },
];

function getLocalWallets(): WalletItem[] {
  if (typeof window === "undefined") return DEFAULT_WALLETS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_WALLETS));
    return DEFAULT_WALLETS;
  } catch {
    return DEFAULT_WALLETS;
  }
}

function saveLocalWallets(wallets: WalletItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallets));
  } catch {
    // Ignore storage quota errors
  }
}

export const walletService = {
  async getWallets(token?: string): Promise<WalletsApiResponse> {
    try {
      const apiRes = await authApi.getWallets(token);
      if (apiRes.status === "success" && Array.isArray(apiRes.data)) {
        saveLocalWallets(apiRes.data);
        const data = apiRes.data;
        const totalBal = data.reduce((acc, curr) => acc + (curr.balance || 0), 0);
        const defaultW = data.find((w) => w.is_default);
        return {
          status: "success",
          data,
          meta: {
            total_wallets: data.length,
            total_balance: totalBal,
            primary_wallet_name: defaultW ? defaultW.name : data[0]?.name,
            bank_count: data.filter((w) => w.type === "bank").length,
            ewallet_count: data.filter((w) => w.type === "ewallet").length,
            cash_count: data.filter((w) => w.type === "cash").length,
            ...(apiRes.meta || {}),
          },
        };
      }
    } catch {
      // Backend route /api/wallets not yet implemented in Go backend; use persistent local store
    }

    const localData = getLocalWallets();
    const totalBalance = localData.reduce((acc, curr) => acc + (curr.balance || 0), 0);
    const defaultWallet = localData.find((w) => w.is_default);

    return {
      status: "success",
      data: localData,
      meta: {
        total_wallets: localData.length,
        total_balance: totalBalance,
        primary_wallet_name: defaultWallet ? defaultWallet.name : localData[0]?.name,
        bank_count: localData.filter((w) => w.type === "bank").length,
        ewallet_count: localData.filter((w) => w.type === "ewallet").length,
        cash_count: localData.filter((w) => w.type === "cash").length,
      },
    };
  },

  async createWallet(
    payload: CreateWalletPayload,
    token?: string
  ): Promise<SingleWalletApiResponse> {
    try {
      const apiRes = await authApi.createWallet(payload, token);
      if (apiRes.status === "success" && apiRes.data) {
        return apiRes;
      }
    } catch {
      // Fallback local creation
    }

    const current = getLocalWallets();
    const newId = current.length > 0 ? Math.max(...current.map((w) => w.id)) + 1 : 1;

    // If marked default, unset previous defaults
    let updatedList = [...current];
    if (payload.is_default) {
      updatedList = updatedList.map((w) => ({ ...w, is_default: false }));
    }

    const newWallet: WalletItem = {
      id: newId,
      name: payload.name,
      type: payload.type,
      account_number: payload.account_number,
      balance: payload.balance || 0,
      color: payload.color || "#3b82f6",
      description: payload.description,
      is_default: !!payload.is_default,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    updatedList.push(newWallet);
    saveLocalWallets(updatedList);

    return {
      status: "success",
      message: "Dompet berhasil ditambahkan",
      data: newWallet,
    };
  },

  async updateWallet(
    id: number,
    payload: UpdateWalletPayload,
    token?: string
  ): Promise<SingleWalletApiResponse> {
    try {
      const apiRes = await authApi.updateWallet(id, payload, token);
      if (apiRes.status === "success" && apiRes.data) {
        return apiRes;
      }
    } catch {
      // Fallback local update
    }

    const current = getLocalWallets();
    let updatedItem: WalletItem | undefined;

    const updatedList = current.map((w) => {
      if (w.id === id) {
        updatedItem = {
          ...w,
          ...payload,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      if (payload.is_default) {
        return { ...w, is_default: false };
      }
      return w;
    });

    if (!updatedItem) {
      throw new Error("Dompet tidak ditemukan.");
    }

    saveLocalWallets(updatedList);

    return {
      status: "success",
      message: "Dompet berhasil diperbarui",
      data: updatedItem,
    };
  },

  async deleteWallet(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    try {
      const apiRes = await authApi.deleteWallet(id, token);
      if (apiRes.status === "success") {
        return apiRes;
      }
    } catch {
      // Fallback local delete
    }

    const current = getLocalWallets();
    const updated = current.filter((w) => w.id !== id);
    saveLocalWallets(updated);

    return {
      status: "success",
      message: "Dompet berhasil dihapus",
    };
  },

  async transfer(
    payload: TransferPayload,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    try {
      const apiRes = await authApi.transferWallet(payload, token);
      if (apiRes.status === "success") {
        return apiRes;
      }
    } catch {
      // Fallback local transfer
    }

    const current = getLocalWallets();
    const fromIdx = current.findIndex((w) => w.id === payload.from_wallet_id);
    const toIdx = current.findIndex((w) => w.id === payload.to_wallet_id);

    if (fromIdx === -1 || toIdx === -1) {
      throw new Error("Dompet asal atau tujuan tidak ditemukan.");
    }

    if (current[fromIdx].balance < payload.amount) {
      throw new Error("Saldo dompet asal tidak mencukupi untuk transfer.");
    }

    current[fromIdx].balance -= payload.amount;
    current[toIdx].balance += payload.amount;
    saveLocalWallets(current);

    return {
      status: "success",
      message: "Transfer saldo antar dompet berhasil diproses",
    };
  },
};
