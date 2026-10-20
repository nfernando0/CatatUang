import { authApi } from "@/lib/api";
import {
  CreateNotificationPayload,
  NotificationFilterParams,
  NotificationItem,
  NotificationsApiResponse,
  SingleNotificationApiResponse,
} from "@/lib/types";

const LOCAL_STORAGE_KEY = "catatuang_notifications_data";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Selamat Datang di CatatUang! 🎉",
    message: "Kelola keuangan pribadi Anda dengan mudah. Mulai catat pemasukan dan pengeluaran hari ini.",
    type: "info",
    category: "system",
    is_read: false,
    link: "/dashboard",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 2,
    title: "Pengingat Dompet Utama",
    message: "Rekening BCA Anda telah ditetapkan sebagai dompet utama transaksi harian.",
    type: "info",
    category: "wallet",
    is_read: false,
    link: "/wallets",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 3,
    title: "Tips Menghemat Pengeluaran",
    message: "Buat target tabungan dan pantau kemajuan tabungan Anda secara berkala di menu Target Tabungan.",
    type: "success",
    category: "saving",
    is_read: true,
    link: "/savings",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

function getLocalNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function saveLocalNotifications(items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export const notificationService = {
  /**
   * Mengambil daftar notifikasi dari backend dengan filter & fallback lokal
   */
  async getNotifications(
    params?: NotificationFilterParams,
    token?: string
  ): Promise<NotificationsApiResponse> {
    try {
      const apiRes = await authApi.getNotifications(params, token);
      if (apiRes && apiRes.status === "success" && Array.isArray(apiRes.data)) {
        saveLocalNotifications(apiRes.data);
        return apiRes;
      }
    } catch {
      // Backend route unreachable or network error, fallback to persistent local store
    }

    let items = getLocalNotifications();

    if (params?.unread_only) {
      items = items.filter((n) => !n.is_read);
    } else if (params?.is_read !== undefined) {
      items = items.filter((n) => n.is_read === params.is_read);
    }

    if (params?.type) {
      items = items.filter((n) => n.type.toLowerCase() === params.type?.toLowerCase());
    }

    if (params?.category) {
      items = items.filter((n) => n.category?.toLowerCase() === params.category?.toLowerCase());
    }

    // Sort newest first
    items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const totalItems = items.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    const unreadCount = getLocalNotifications().filter((n) => !n.is_read).length;

    return {
      status: "success",
      data: paginatedItems,
      meta: {
        current_page: page,
        limit,
        total_items: totalItems,
        total_pages: totalPages,
        unread_count: unreadCount,
      },
    };
  },

  /**
   * Mengambil jumlah notifikasi belum dibaca untuk badge
   */
  async getUnreadCount(token?: string): Promise<number> {
    try {
      const apiRes = await authApi.getUnreadNotificationCount(token);
      if (apiRes && apiRes.status === "success" && typeof apiRes.unread_count === "number") {
        return apiRes.unread_count;
      }
    } catch {
      // Fallback to local
    }

    const items = getLocalNotifications();
    return items.filter((n) => !n.is_read).length;
  },

  /**
   * Menandai 1 notifikasi sebagai telah dibaca
   */
  async markAsRead(id: number, token?: string): Promise<SingleNotificationApiResponse> {
    try {
      const apiRes = await authApi.markNotificationAsRead(id, token);
      if (apiRes && apiRes.status === "success") {
        const local = getLocalNotifications();
        const updated = local.map((n) => (n.id === id ? { ...n, is_read: true } : n));
        saveLocalNotifications(updated);
        return apiRes;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalNotifications();
    let targetItem: NotificationItem | undefined;
    const updated = local.map((n) => {
      if (n.id === id) {
        targetItem = { ...n, is_read: true };
        return targetItem;
      }
      return n;
    });
    saveLocalNotifications(updated);

    return {
      status: "success",
      message: "Notifikasi berhasil ditandai sebagai dibaca",
      data: targetItem,
    };
  },

  /**
   * Menandai semua notifikasi sebagai telah dibaca
   */
  async markAllAsRead(
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string; updated_count?: number }> {
    try {
      const apiRes = await authApi.markAllNotificationsAsRead(token);
      if (apiRes && apiRes.status === "success") {
        const local = getLocalNotifications();
        const updated = local.map((n) => ({ ...n, is_read: true }));
        saveLocalNotifications(updated);
        return apiRes;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalNotifications();
    const updated = local.map((n) => ({ ...n, is_read: true }));
    saveLocalNotifications(updated);

    return {
      status: "success",
      message: "Semua notifikasi berhasil ditandai sebagai dibaca",
      updated_count: local.filter((n) => !n.is_read).length,
    };
  },

  /**
   * Menghapus 1 notifikasi
   */
  async deleteNotification(
    id: number,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string }> {
    try {
      const apiRes = await authApi.deleteNotification(id, token);
      if (apiRes && apiRes.status === "success") {
        const local = getLocalNotifications();
        saveLocalNotifications(local.filter((n) => n.id !== id));
        return apiRes;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalNotifications();
    saveLocalNotifications(local.filter((n) => n.id !== id));

    return {
      status: "success",
      message: "Notifikasi berhasil dihapus",
    };
  },

  /**
   * Menghapus semua notifikasi (atau hanya yang sudah dibaca)
   */
  async deleteAll(
    onlyRead: boolean = false,
    token?: string
  ): Promise<{ status: "success" | "error"; message?: string; deleted_count?: number }> {
    try {
      const apiRes = await authApi.deleteAllNotifications(onlyRead, token);
      if (apiRes && apiRes.status === "success") {
        const local = getLocalNotifications();
        const next = onlyRead ? local.filter((n) => !n.is_read) : [];
        saveLocalNotifications(next);
        return apiRes;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalNotifications();
    const beforeCount = local.length;
    const next = onlyRead ? local.filter((n) => !n.is_read) : [];
    saveLocalNotifications(next);

    return {
      status: "success",
      message: onlyRead ? "Notifikasi yang telah dibaca berhasil dihapus" : "Semua notifikasi berhasil dibersihkan",
      deleted_count: beforeCount - next.length,
    };
  },

  /**
   * Membuat notifikasi baru
   */
  async createNotification(
    payload: CreateNotificationPayload,
    token?: string
  ): Promise<SingleNotificationApiResponse> {
    try {
      const apiRes = await authApi.createNotification(payload, token);
      if (apiRes && apiRes.status === "success" && apiRes.data) {
        const local = getLocalNotifications();
        saveLocalNotifications([apiRes.data, ...local]);
        return apiRes;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalNotifications();
    const newItem: NotificationItem = {
      id: Date.now(),
      title: payload.title,
      message: payload.message,
      type: payload.type || "info",
      category: payload.category || "system",
      link: payload.link,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    saveLocalNotifications([newItem, ...local]);

    return {
      status: "success",
      message: "Notifikasi berhasil dibuat",
      data: newItem,
    };
  },
};
