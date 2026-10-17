import { authApi } from "@/lib/api";
import {
  CategoriesApiResponse,
  CategoryItem,
  CreateCategoryPayload,
  SingleCategoryApiResponse,
  UpdateCategoryPayload,
} from "@/lib/types";

const LOCAL_STORAGE_KEY = "catatuang_categories_data";

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Pengeluaran (Expense)
  {
    id: 1,
    name: "Makanan & Minuman",
    type: "expense",
    color: "#f97316", // Orange
    icon: "Utensils",
    description: "Makan sehari-hari, restoran, kafe, jajanan",
  },
  {
    id: 2,
    name: "Transportasi",
    type: "expense",
    color: "#06b6d4", // Cyan
    icon: "Car",
    description: "Bensin, parkir, ojek online, tol, servis kendaraan",
  },
  {
    id: 3,
    name: "Tagihan & Utilitas",
    type: "expense",
    color: "#ef4444", // Red
    icon: "Zap",
    description: "Listrik, air, internet, pulsa, sewa",
  },
  {
    id: 4,
    name: "Belanja Kebutuhan",
    type: "expense",
    color: "#8b5cf6", // Purple
    icon: "ShoppingBag",
    description: "Belanja bulanan, pakaian, kebutuhan rumah tangga",
  },
  {
    id: 5,
    name: "Hiburan & Rekreasi",
    type: "expense",
    color: "#ec4899", // Pink
    icon: "Film",
    description: "Bioskop, liburan, streaming, hobi, games",
  },
  {
    id: 6,
    name: "Kesehatan & Medis",
    type: "expense",
    color: "#14b8a6", // Teal
    icon: "HeartPulse",
    description: "Obat-obatan, konsultasi dokter, vitamin, asuransi",
  },
  {
    id: 7,
    name: "Pendidikan & Kursus",
    type: "expense",
    color: "#3b82f6", // Blue
    icon: "GraduationCap",
    description: "Buku, kursus online, pelatihan, SPP",
  },
  {
    id: 8,
    name: "Keluarga & Donasi",
    type: "expense",
    color: "#eab308", // Yellow
    icon: "Users",
    description: "Bantuan keluarga, sedekah, zakat, hadiah orang lain",
  },
  {
    id: 9,
    name: "Lainnya (Pengeluaran)",
    type: "expense",
    color: "#71717a", // Zinc
    icon: "HelpCircle",
    description: "Pengeluaran tak terduga lainnya",
  },

  // Pemasukan (Income)
  {
    id: 10,
    name: "Gaji / Upah",
    type: "income",
    color: "#10b981", // Emerald
    icon: "Briefcase",
    description: "Gaji bulanan utama dan lembur",
  },
  {
    id: 11,
    name: "Pendapatan Usaha",
    type: "income",
    color: "#22c55e", // Green
    icon: "Store",
    description: "Penjualan produk, omset toko, proyek lepas/freelance",
  },
  {
    id: 12,
    name: "Investasi & Dividen",
    type: "income",
    color: "#6366f1", // Indigo
    icon: "TrendingUp",
    description: "Bunga deposito, dividen saham, reksadana, capital gain",
  },
  {
    id: 13,
    name: "Hadiah & Bonus",
    type: "income",
    color: "#f59e0b", // Amber
    icon: "Gift",
    description: "THR, bonus tahunan, hadiah uang tunai",
  },
  {
    id: 14,
    name: "Lainnya (Pemasukan)",
    type: "income",
    color: "#64748b", // Slate
    icon: "Coins",
    description: "Sumber pemasukan tambahan lainnya",
  },
];

function getLocalCategories(): CategoryItem[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveLocalCategories(cats: CategoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
  } catch {
    // Ignore quota errors
  }
}

export const categoryService = {
  /**
   * Get all categories from backend API with local cache fallback
   */
  async getCategories(token?: string): Promise<CategoriesApiResponse> {
    try {
      if (token) {
        const response = await authApi.getCategories(token);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          saveLocalCategories(response.data);
          return response;
        }
      }
    } catch {
      // Backend not yet returning categories, use local categories
    }

    const localList = getLocalCategories();
    return {
      status: "success",
      data: localList,
    };
  },

  /**
   * Create new category
   */
  async createCategory(
    payload: CreateCategoryPayload,
    token?: string
  ): Promise<SingleCategoryApiResponse> {
    try {
      if (token) {
        const response = await authApi.createCategory(payload, token);
        if (response.data) {
          const current = getLocalCategories();
          saveLocalCategories([...current, response.data]);
          return response;
        }
      }
    } catch {
      // Fallback local storage
    }

    const current = getLocalCategories();
    const newId = current.length > 0 ? Math.max(...current.map((c) => c.id)) + 1 : 1;
    const newCategory: CategoryItem = {
      id: newId,
      name: payload.name.trim(),
      type: payload.type,
      color: payload.color || (payload.type === "income" ? "#10b981" : "#ef4444"),
      icon: payload.icon || "Tag",
      description: payload.description?.trim() || "",
      created_at: new Date().toISOString(),
    };

    const updated = [...current, newCategory];
    saveLocalCategories(updated);

    return {
      status: "success",
      message: "Kategori baru berhasil ditambahkan",
      data: newCategory,
    };
  },

  /**
   * Update category
   */
  async updateCategory(
    id: number,
    payload: UpdateCategoryPayload,
    token?: string
  ): Promise<SingleCategoryApiResponse> {
    try {
      if (token) {
        const response = await authApi.updateCategory(id, payload, token);
        if (response.data) {
          const current = getLocalCategories();
          const next = current.map((c) => (c.id === id ? response.data! : c));
          saveLocalCategories(next);
          return response;
        }
      }
    } catch {
      // Fallback local storage
    }

    const current = getLocalCategories();
    const idx = current.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error("Kategori tidak ditemukan");
    }

    const updatedItem: CategoryItem = {
      ...current[idx],
      name: payload.name !== undefined ? payload.name.trim() : current[idx].name,
      type: payload.type !== undefined ? payload.type : current[idx].type,
      color: payload.color !== undefined ? payload.color : current[idx].color,
      icon: payload.icon !== undefined ? payload.icon : current[idx].icon,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : current[idx].description,
      updated_at: new Date().toISOString(),
    };

    current[idx] = updatedItem;
    saveLocalCategories(current);

    return {
      status: "success",
      message: "Kategori berhasil diperbarui",
      data: updatedItem,
    };
  },

  /**
   * Delete category
   */
  async deleteCategory(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    try {
      if (token) {
        await authApi.deleteCategory(id, token);
      }
    } catch {
      // Proceed with local deletion
    }

    const current = getLocalCategories();
    const filtered = current.filter((c) => c.id !== id);
    saveLocalCategories(filtered);

    return {
      status: "success",
      message: "Kategori berhasil dihapus",
    };
  },
};
