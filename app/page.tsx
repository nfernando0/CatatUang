"use client";

import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TransactionModal from "@/components/TransactionModal";
import SavingModal from "@/components/SavingModal";
import DepositSavingModal from "@/components/DepositSavingModal";
import WalletModal from "@/components/WalletModal";
import TransferModal from "@/components/TransferModal";
import AdjustBalanceModal from "@/components/AdjustBalanceModal";
import CategoryModal from "@/components/CategoryModal";
import NotificationCenter from "@/components/NotificationCenter";
import CreateNotificationModal from "@/components/CreateNotificationModal";
import BudgetLimitsModal from "@/components/BudgetLimitsModal";
import BudgetCategoryModal from "@/components/BudgetCategoryModal";
import BudgetTrackerView from "@/components/BudgetTrackerView";
import DashboardBudgetWidget from "@/components/DashboardBudgetWidget";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/auth.service";
import { transactionService } from "@/services/transaction.service";
import { savingService } from "@/services/saving.service";
import { walletService } from "@/services/wallet.service";
import { categoryService } from "@/services/category.service";
import { notificationService } from "@/services/notification.service";
import { budgetService } from "@/services/budget.service";
import {
  TransactionSummary,
  TransactionItem,
  SavingItem,
  SavingMeta,
  WalletItem,
  WalletMeta,
  WalletType,
  CategoryItem,
  NotificationItem,
  BudgetTrackerData,
  BudgetItem,
  AIBudgetAnalysis,
} from "@/lib/types";
import {
  DollarSign,
  LogOut,
  RefreshCw,
  ArrowDownLeft,
  Search,
  Receipt,
  Plus,
  ChevronRight,
  ChevronLeft,
  PiggyBank,
  Target,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Wallet,
  ArrowRightLeft,
  Coins,
  Building2,
  Smartphone,
  Banknote,
  Star,
  Tag,
  X,
} from "lucide-react";

export default function Home() {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  // Tab navigation state: 'dashboard' | 'transactions' | 'wallets' | 'savings' | 'reports' | 'categories' | 'profile'
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);

  // Financial Data State
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [savings, setSavings] = useState<SavingItem[]>([]);
  const [savingMeta, setSavingMeta] = useState<SavingMeta | null>(null);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [walletMeta, setWalletMeta] = useState<WalletMeta | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Wallets Modal States
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [walletToEdit, setWalletToEdit] = useState<WalletItem | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferDefaultFromId, setTransferDefaultFromId] = useState<number | undefined>(undefined);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [walletToAdjust, setWalletToAdjust] = useState<WalletItem | null>(null);
  const [walletFilterType, setWalletFilterType] = useState<"all" | WalletType>("all");
  const [walletSearch, setWalletSearch] = useState<string>("");

  // Savings Modal States
  const [isSavingModalOpen, setIsSavingModalOpen] = useState<boolean>(false);
  const [savingToEdit, setSavingToEdit] = useState<SavingItem | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [savingForDeposit, setSavingForDeposit] = useState<SavingItem | null>(null);
  const [savingFilterStatus, setSavingFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [savingSearch, setSavingSearch] = useState<string>("");

  // Categories Modal States
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);
  const [categoryFilterType, setCategoryFilterType] = useState<"all" | "expense" | "income">("all");
  const [categorySearch, setCategorySearch] = useState<string>("");

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);
  const [isCreateNotifModalOpen, setIsCreateNotifModalOpen] = useState<boolean>(false);

  // Budget States
  const [trackerData, setTrackerData] = useState<BudgetTrackerData | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<BudgetItem[]>([]);
  const [loadingBudget, setLoadingBudget] = useState<boolean>(false);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState<boolean>(false);
  const [isBudgetCategoryModalOpen, setIsBudgetCategoryModalOpen] = useState<boolean>(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetItem | null>(null);
  const [aiAlertBanner, setAiAlertBanner] = useState<{
    headline: string;
    advice: string;
    status: string;
  } | null>(null);

  // Filters & Search for Transactions
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination for Transactions Table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Account Verification State
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  // Fetch all initial data when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let isMounted = true;
    Promise.all([
      transactionService.getSummary(token).catch(() => null),
      transactionService.getTransactions(token, 100).catch(() => null),
      savingService.getSavings(token).catch(() => null),
      walletService.getWallets(token).catch(() => null),
      categoryService.getCategories(token).catch(() => null),
      notificationService.getNotifications({ limit: 50 }, token).catch(() => null),
      notificationService.getUnreadCount(token).catch(() => 0),
      budgetService.getTracker(undefined, token).catch(() => null),
      budgetService.getBudgets(undefined, undefined, token).catch(() => null),
    ])
      .then(([sumRes, transRes, savRes, walRes, catRes, notifRes, unreadRes, budTrackerRes, budListRes]) => {
        if (!isMounted) return;
        if (sumRes?.data) setSummary(sumRes.data);
        if (transRes?.data) setTransactions(transRes.data);
        if (savRes?.data) {
          setSavings(savRes.data);
          if (savRes.meta) setSavingMeta(savRes.meta);
        }
        if (walRes?.data) {
          setWallets(walRes.data);
          if (walRes.meta) setWalletMeta(walRes.meta);
        }
        if (catRes?.data) {
          setCategories(catRes.data);
        }
        if (notifRes?.data) {
          setNotifications(notifRes.data);
        }
        if (typeof unreadRes === "number") {
          setUnreadNotifCount(unreadRes);
        }
        if (budTrackerRes?.data) {
          setTrackerData(budTrackerRes.data);
        }
        if (budListRes?.data) {
          setCategoryBudgets(budListRes.data);
        }
        setLastRefreshed(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  const refreshData = () => {
    if (!token) return;
    setLoadingData(true);
    setLoadingBudget(true);
    Promise.all([
      transactionService.getSummary(token).catch(() => null),
      transactionService.getTransactions(token, 100).catch(() => null),
      savingService.getSavings(token).catch(() => null),
      walletService.getWallets(token).catch(() => null),
      categoryService.getCategories(token).catch(() => null),
      notificationService.getNotifications({ limit: 50 }, token).catch(() => null),
      notificationService.getUnreadCount(token).catch(() => 0),
      budgetService.getTracker(undefined, token).catch(() => null),
      budgetService.getBudgets(undefined, undefined, token).catch(() => null),
    ])
      .then(([sumRes, transRes, savRes, walRes, catRes, notifRes, unreadRes, budTrackerRes, budListRes]) => {
        if (sumRes?.data) setSummary(sumRes.data);
        if (transRes?.data) setTransactions(transRes.data);
        if (savRes?.data) {
          setSavings(savRes.data);
          if (savRes.meta) setSavingMeta(savRes.meta);
        }
        if (walRes?.data) {
          setWallets(walRes.data);
          if (walRes.meta) setWalletMeta(walRes.meta);
        }
        if (catRes?.data) {
          setCategories(catRes.data);
        }
        if (notifRes?.data) {
          setNotifications(notifRes.data);
        }
        if (typeof unreadRes === "number") {
          setUnreadNotifCount(unreadRes);
        }
        if (budTrackerRes?.data) {
          setTrackerData(budTrackerRes.data);
        }
        if (budListRes?.data) {
          setCategoryBudgets(budListRes.data);
        }
        setLastRefreshed(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      })
      .finally(() => {
        setLoadingData(false);
        setLoadingBudget(false);
      });
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoadingNotifs(true);
      const [notifRes, unread] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }, token),
        notificationService.getUnreadCount(token),
      ]);
      if (notifRes?.data) {
        setNotifications(notifRes.data);
      }
      setUnreadNotifCount(unread);
    } catch {
      // Ignore
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkNotifAsRead = async (id: number) => {
    await notificationService.markAsRead(id, token || undefined);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadNotifCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllNotifsAsRead = async () => {
    await notificationService.markAllAsRead(token || undefined);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotifCount(0);
  };

  const handleDeleteNotif = async (id: number) => {
    await notificationService.deleteNotification(id, token || undefined);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const unread = await notificationService.getUnreadCount(token || undefined);
    setUnreadNotifCount(unread);
  };

  const handleClearReadNotifs = async () => {
    await notificationService.deleteAll(true, token || undefined);
    setNotifications((prev) => prev.filter((n) => !n.is_read));
  };

  const handleTransactionSuccess = (
    aiAnalysis?: AIBudgetAnalysis,
    budgetAlerts?: string[]
  ) => {
    refreshData();
    if (aiAnalysis && (aiAnalysis.is_exceeded || aiAnalysis.status !== "safe" || aiAnalysis.smart_alert)) {
      setAiAlertBanner({
        headline: aiAnalysis.headline || "Peringatan Batas Anggaran AI",
        advice: aiAnalysis.smart_alert || aiAnalysis.advice,
        status: aiAnalysis.status,
      });
    } else if (budgetAlerts && budgetAlerts.length > 0) {
      setAiAlertBanner({
        headline: "Peringatan Batas Anggaran",
        advice: budgetAlerts.join(". "),
        status: "warning",
      });
    }
  };

  const handleLimitsSuccess = (data?: BudgetTrackerData) => {
    if (data) {
      setTrackerData(data);
    }
    refreshData();
  };

  const handleCategoryBudgetSuccess = () => {
    refreshData();
  };

  const handleDeleteCategoryBudget = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`Hapus batas budget kategori "${name}"?`)) return;
    try {
      await budgetService.deleteBudget(id, token);
      refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus budget.");
    }
  };

  const fetchAITracker = async () => {
    if (!token) return;
    setLoadingAI(true);
    try {
      const res = await budgetService.getAITracker(undefined, token);
      if (res.data) {
        setTrackerData(res.data);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengambil evaluasi AI.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSavingSuccess = () => {
    refreshData();
  };

  const handleWalletSuccess = () => {
    refreshData();
  };

  const handleOpenCreateSaving = () => {
    setSavingToEdit(null);
    setIsSavingModalOpen(true);
  };

  const handleOpenEditSaving = (item: SavingItem) => {
    setSavingToEdit(item);
    setIsSavingModalOpen(true);
  };

  const handleOpenDeposit = (item: SavingItem) => {
    setSavingForDeposit(item);
    setIsDepositModalOpen(true);
  };

  const handleDeleteSaving = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`Hapus target tabungan "${name}"?`)) return;
    try {
      await savingService.deleteSaving(id, token);
      refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus target tabungan.");
    }
  };

  // Wallet Actions
  const handleOpenCreateWallet = () => {
    setWalletToEdit(null);
    setIsWalletModalOpen(true);
  };

  const handleOpenEditWallet = (item: WalletItem) => {
    setWalletToEdit(item);
    setIsWalletModalOpen(true);
  };

  const handleOpenTransfer = (fromId?: number) => {
    setTransferDefaultFromId(fromId);
    setIsTransferModalOpen(true);
  };

  const handleOpenAdjust = (item: WalletItem) => {
    setWalletToAdjust(item);
    setIsAdjustModalOpen(true);
  };

  const handleDeleteWallet = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`Hapus akun dompet "${name}"?`)) return;
    try {
      await walletService.deleteWallet(id, token);
      refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus akun dompet.");
    }
  };

  const handleSetDefaultWallet = async (wallet: WalletItem) => {
    if (!token) return;
    try {
      await walletService.updateWallet(wallet.id, { is_default: true }, token);
      refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengatur dompet utama.");
    }
  };

  // Category Actions
  const handleOpenCreateCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (item: CategoryItem) => {
    setCategoryToEdit(item);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!token) return;
    if (!window.confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await categoryService.deleteCategory(id, token);
      refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kategori.");
    }
  };

  const handleCategorySuccess = () => {
    refreshData();
  };

  const handleVerifyAccount = async () => {
    if (!token) return;
    setVerifying(true);
    setVerifiedStatus(null);
    try {
      const res = await authService.getProfile(token);
      if (res.status === "success" && res.data) {
        setVerifiedStatus("Sesi token JWT valid & data tersinkronisasi.");
      } else {
        setVerifiedStatus("Status sesi tidak valid, silakan login ulang.");
      }
    } catch {
      setVerifiedStatus("Koneksi gagal, silakan coba beberapa saat lagi.");
    } finally {
      setVerifying(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.category.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  // Filtered savings
  const filteredSavings = useMemo(() => {
    return savings.filter((item) => {
      if (savingFilterStatus !== "all" && item.status !== savingFilterStatus) return false;
      if (savingSearch.trim()) {
        const q = savingSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [savings, savingFilterStatus, savingSearch]);

  // Filtered wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      if (walletFilterType !== "all" && w.type !== walletFilterType) return false;
      if (walletSearch.trim()) {
        const q = walletSearch.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          (w.account_number && w.account_number.toLowerCase().includes(q)) ||
          (w.description && w.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [wallets, walletFilterType, walletSearch]);

  const totalWalletBalance = useMemo(() => {
    return wallets.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  }, [wallets]);

  const defaultWallet = useMemo(() => {
    return wallets.find((w) => w.is_default) || wallets[0];
  }, [wallets]);

  // Pagination slice for transactions
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // Statistics calculation
  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const balance = summary?.balance || 0;

  // Expense burn rate percentage
  const burnRatePct = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;
  const savingsRatePct = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Unique categories for transaction filter dropdown
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => set.add(c.name));
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [categories, transactions]);

  // Category usage breakdown from transactions
  const categoryUsageMap = useMemo(() => {
    const map: Record<string, { total: number; count: number; type: string }> = {};
    transactions.forEach((t) => {
      if (!map[t.category]) {
        map[t.category] = { total: 0, count: 0, type: t.type };
      }
      map[t.category].total += t.amount;
      map[t.category].count += 1;
    });
    return map;
  }, [transactions]);

  // Filtered categories for Category Management Tab
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (categoryFilterType !== "all" && c.type !== categoryFilterType) return false;
      if (categorySearch.trim()) {
        const q = categorySearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [categories, categoryFilterType, categorySearch]);

  const expenseCategoriesCount = useMemo(() => {
    return categories.filter((c) => c.type === "expense").length;
  }, [categories]);

  const incomeCategoriesCount = useMemo(() => {
    return categories.filter((c) => c.type === "income").length;
  }, [categories]);

  // Wallet helpers
  const getWalletTypeIcon = (type: WalletType) => {
    switch (type) {
      case "bank":
        return <Building2 className="h-4 w-4" />;
      case "ewallet":
        return <Smartphone className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "investment":
        return <Coins className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getWalletTypeLabel = (type: WalletType) => {
    switch (type) {
      case "bank":
        return "BANK";
      case "ewallet":
        return "E-WALLET";
      case "cash":
        return "KAS TUNAI";
      case "investment":
        return "INVESTASI";
      default:
        return "LAINNYA";
    }
  };

  // Tab Title
  const getTabTitle = () => {
    switch (currentTab) {
      case "transactions":
        return "Daftar Transaksi";
      case "budget":
        return "Budget Tracker & AI Guard";
      case "wallets":
        return "Dompet & Rekening";
      case "savings":
        return "Target Tabungan";
      case "reports":
        return "Laporan & Rasio Keuangan";
      case "categories":
        return "Kategori Biaya";
      case "notifications":
        return "Pusat Notifikasi";
      case "profile":
        return "Profil Akun";
      default:
        return "Catatan Uang";
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white antialiased">
      {/* Laravel Style Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        openNewTxModal={() => setIsTxModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        unreadNotificationsCount={unreadNotifCount}
        isBudgetExceeded={Boolean(trackerData?.daily?.is_exceeded || trackerData?.weekly?.is_exceeded)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header
          breadcrumbTitle={getTabTitle()}
          onOpenNewTx={isAuthenticated ? () => setIsTxModalOpen(true) : undefined}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          notifications={notifications}
          unreadCount={unreadNotifCount}
          loadingNotifications={loadingNotifs}
          onMarkAsRead={handleMarkNotifAsRead}
          onMarkAllAsRead={handleMarkAllNotifsAsRead}
          onDeleteNotification={handleDeleteNotif}
          onClearReadNotifications={handleClearReadNotifs}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenCreateNotificationModal={() => setIsCreateNotifModalOpen(true)}
        />

        {/* Dashboard Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {isLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              <p className="text-xs font-mono text-zinc-400">
                MEMERIKSA SESI PENGGUNA...
              </p>
            </div>
          ) : isAuthenticated && user ? (
            /* ======================================================== */
            /* AUTHENTICATED USER: FULL LARAVEL DASHBOARD PORTAL        */
            /* ======================================================== */
            <>
              {/* TAB 1: DASHBOARD (OVERVIEW) */}
              {currentTab === "dashboard" && (
                <div className="space-y-6">
                  {/* AI Budget Alert Banner if triggered */}
                  {aiAlertBanner && (
                    <div
                      className={`rounded-xl p-4 border flex items-start justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 ${
                        aiAlertBanner.status === "danger"
                          ? "bg-rose-950/70 border-rose-800 text-rose-100"
                          : aiAlertBanner.status === "warning"
                          ? "bg-amber-950/70 border-amber-800 text-amber-100"
                          : "bg-emerald-950/70 border-emerald-800 text-emerald-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold font-mono flex items-center gap-2">
                            {aiAlertBanner.headline}
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase">
                              AI Evaluasi
                            </span>
                          </h4>
                          <p className="text-xs leading-relaxed opacity-90">
                            {aiAlertBanner.advice}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAiAlertBanner(null)}
                        className="p-1 rounded text-white/70 hover:text-white transition"
                        title="Tutup Peringatan"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Top Welcome & Quick Actions Bar */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
                          Selamat Datang, {user.name}
                        </h1>
                        <span className="rounded border border-emerald-900/80 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Catatan Uang harian Anda. {lastRefreshed ? `Sinkronisasi terakhir pukul ${lastRefreshed} WIB.` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={refreshData}
                        id="refresh-data-btn"
                        disabled={loadingData}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
                        <span>Perbarui</span>
                      </button>
                      <button
                        onClick={() => setIsTxModalOpen(true)}
                        id="dashboard-new-tx-btn"
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Catat Transaksi</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Laravel KPI Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Saldo Kas Bersih */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>SALDO KAS BERSIH</span>
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                          <DollarSign className="h-3.5 w-3.5 text-zinc-300" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                          {loadingData ? "..." : formatRupiah(balance)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={balance >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                          {balance >= 0 ? "● Arus Kas Sehat" : "● Peringatan Defisit"}
                        </span>
                        <span className="text-zinc-500">Net Akumulasi</span>
                      </div>
                    </div>

                    {/* Stat 2: Total Saldo Dompet */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TOTAL DOMPET (KAS)</span>
                        <div className="p-1.5 rounded bg-blue-950/40 border border-blue-900/60">
                          <Wallet className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400 tracking-tight">
                          {loadingData ? "..." : formatRupiah(totalWalletBalance)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-blue-400">{wallets.length} Akun Terdaftar</span>
                        <span className="text-zinc-500">Likuiditas</span>
                      </div>
                    </div>

                    {/* Stat 3: Total Pemasukan */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TOTAL PEMASUKAN</span>
                        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-900/60">
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                          {loadingData ? "..." : formatRupiah(totalIncome)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400">{incomeCount} transaksi masuk</span>
                        <span className="text-zinc-500">Pendapatan</span>
                      </div>
                    </div>

                    {/* Stat 4: Total Tabungan Terkumpul */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TARGET TABUNGAN</span>
                        <div className="p-1.5 rounded bg-purple-950/40 border border-purple-900/60">
                          <PiggyBank className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 tracking-tight">
                          {loadingData ? "..." : formatRupiah(savingMeta?.total_collected_amount || 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-purple-400">{savings.length} Target Aktif</span>
                        <span className="text-zinc-500">{savingMeta?.overall_progress_percent || 0}% Capaian</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Budget Guardian Mini Widget */}
                  <DashboardBudgetWidget
                    trackerData={trackerData}
                    loading={loadingBudget}
                    onNavigateToBudget={() => setCurrentTab("budget")}
                    onOpenLimitsModal={() => setIsLimitsModalOpen(true)}
                  />

                  {/* Main Grid: Recent Transactions Table & Financial Widgets */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left (8 cols): Recent Transactions Table */}
                    <div className="lg:col-span-8 rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div>
                        {/* Table Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-zinc-400" />
                            <h2 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                              Transaksi Terkini
                            </h2>
                            <span className="rounded border border-zinc-800 bg-[#09090b] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                              {filteredTransactions.length} Baris
                            </span>
                          </div>

                          {/* Filter Pills */}
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <button
                              onClick={() => setFilterType("all")}
                              className={`rounded px-2.5 py-1 transition ${filterType === "all"
                                ? "bg-zinc-800 text-zinc-100 font-semibold"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                              Semua
                            </button>
                            <button
                              onClick={() => setFilterType("income")}
                              className={`rounded px-2.5 py-1 transition ${filterType === "income"
                                ? "bg-emerald-950/70 text-emerald-400 font-semibold border border-emerald-900/60"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                              Pemasukan
                            </button>
                            <button
                              onClick={() => setFilterType("expense")}
                              className={`rounded px-2.5 py-1 transition ${filterType === "expense"
                                ? "bg-rose-950/70 text-rose-400 font-semibold border border-rose-900/60"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                              Pengeluaran
                            </button>
                          </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="overflow-x-auto mt-3 border border-zinc-800/80 rounded-md">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-[#09090b] text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                              <tr>
                                <th className="py-2.5 px-3">ID</th>
                                <th className="py-2.5 px-3">Tanggal</th>
                                <th className="py-2.5 px-3">Kategori</th>
                                <th className="py-2.5 px-3">Keterangan</th>
                                <th className="py-2.5 px-3 text-center">Jenis</th>
                                <th className="py-2.5 px-3 text-right">Nominal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60">
                              {filteredTransactions.length > 0 ? (
                                filteredTransactions.slice(0, 8).map((tx) => (
                                  <tr
                                    key={tx.id}
                                    className="hover:bg-zinc-900/50 transition"
                                  >
                                    <td className="py-2.5 px-3 text-zinc-500">#{tx.id}</td>
                                    <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                                      {formatDate(tx.date)}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-zinc-200">
                                      {tx.category}
                                    </td>
                                    <td className="py-2.5 px-3 text-zinc-400 max-w-[150px] truncate">
                                      {tx.description || "-"}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span
                                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${tx.type === "income"
                                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                                          : "bg-rose-950/60 text-rose-400 border border-rose-900/60"
                                          }`}
                                      >
                                        {tx.type === "income" ? "INCOME" : "EXPENSE"}
                                      </span>
                                    </td>
                                    <td
                                      className={`py-2.5 px-3 text-right font-semibold font-mono ${tx.type === "income"
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                        }`}
                                    >
                                      {tx.type === "income" ? "+" : "-"}
                                      {formatRupiah(tx.amount)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="py-10 text-center text-zinc-500"
                                  >
                                    <p className="text-xs">Belum ada catatan transaksi.</p>
                                    <button
                                      onClick={() => setIsTxModalOpen(true)}
                                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-300 underline hover:text-white"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Catat transaksi pertama Anda
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Footer Link to full transactions tab */}
                      <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">
                          Menampilkan {Math.min(8, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                        </span>
                        <button
                          onClick={() => setCurrentTab("transactions")}
                          id="view-all-tx-link"
                          className="flex items-center gap-1 text-zinc-300 hover:text-white font-medium transition"
                        >
                          <span>Buka Seluruh Transaksi</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right (4 cols): Wallets Quick Widget & Financial Ratio */}
                    <div className="lg:col-span-4 space-y-4">
                      {/* Widget 1: Dompet & Likuiditas Kas */}
                      <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5 text-blue-400" />
                            <h3 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                              Dompet & Rekening Kas
                            </h3>
                          </div>
                          <button
                            onClick={() => setCurrentTab("wallets")}
                            className="text-[10px] font-mono text-zinc-400 hover:text-white transition flex items-center gap-0.5"
                          >
                            <span>Kelola</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {wallets.length > 0 ? (
                          <div className="space-y-2.5">
                            {wallets.slice(0, 3).map((w) => (
                              <div
                                key={w.id}
                                className="p-2.5 rounded bg-[#09090b] border border-zinc-800/80 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="p-1.5 rounded text-white"
                                    style={{ backgroundColor: w.color || "#3b82f6" }}
                                  >
                                    {getWalletTypeIcon(w.type)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-xs text-zinc-200 truncate">
                                        {w.name}
                                      </span>
                                      {w.is_default && (
                                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500 block truncate">
                                      {w.account_number || getWalletTypeLabel(w.type)}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-zinc-100">
                                  {formatRupiah(w.balance)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-xs font-mono text-zinc-500">
                              Belum ada akun dompet terdaftar.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Widget 2: Progres Target Tabungan */}
                      <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
                          <div className="flex items-center gap-1.5">
                            <PiggyBank className="h-3.5 w-3.5 text-purple-400" />
                            <h3 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                              Target Tabungan
                            </h3>
                          </div>
                          <button
                            onClick={() => setCurrentTab("savings")}
                            className="text-[10px] font-mono text-zinc-400 hover:text-white transition flex items-center gap-0.5"
                          >
                            <span>Lihat</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {savings.length > 0 ? (
                          <div className="space-y-3">
                            {savings.slice(0, 2).map((s) => (
                              <div
                                key={s.id}
                                className="p-2.5 rounded bg-[#09090b] border border-zinc-800/80 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="font-semibold text-zinc-200 truncate max-w-[140px]">
                                    {s.name}
                                  </span>
                                  <span className="text-purple-400 font-bold">
                                    {s.progress_percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(100, s.progress_percentage)}%`,
                                      backgroundColor: s.color || "#8b5cf6",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-mono text-zinc-500 text-center py-2">
                            Belum ada target tabungan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BUDGET TRACKER & AI FINANCIAL GUARD */}
              {currentTab === "budget" && (
                <BudgetTrackerView
                  trackerData={trackerData}
                  categoryBudgets={categoryBudgets}
                  categories={categories}
                  loading={loadingBudget}
                  onRefresh={refreshData}
                  onRefreshAI={fetchAITracker}
                  loadingAI={loadingAI}
                  onOpenLimitsModal={() => setIsLimitsModalOpen(true)}
                  onOpenCreateCategoryBudget={() => {
                    setBudgetToEdit(null);
                    setIsBudgetCategoryModalOpen(true);
                  }}
                  onOpenEditCategoryBudget={(item) => {
                    setBudgetToEdit(item);
                    setIsBudgetCategoryModalOpen(true);
                  }}
                  onDeleteCategoryBudget={handleDeleteCategoryBudget}
                  onOpenNewTxModal={() => setIsTxModalOpen(true)}
                />
              )}

              {/* TAB 2: DAFTAR TRANSAKSI (FULL DATA TABLE) */}
              {currentTab === "transactions" && (
                <div className="space-y-4">
                  {/* Table Control Header */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-zinc-100">
                        Daftar Seluruh Transaksi Keuangan
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Kelola, filter, dan telusuri riwayat transaksi pengeluaran dan pemasukan kas Anda.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsTxModalOpen(true)}
                      className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-3.5 py-1.5 text-xs shadow-sm transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Catat Transaksi Baru</span>
                    </button>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 max-w-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Cari berdasarkan kategori atau keterangan..."
                        className="w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Category Filter */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="rounded border border-zinc-800 bg-[#09090b] px-3 py-1.5 text-xs font-mono text-zinc-300 focus:border-zinc-600 focus:outline-none"
                      >
                        <option value="all">Semua Kategori</option>
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      {/* Type Filter Buttons */}
                      <div className="flex items-center rounded border border-zinc-800 bg-[#09090b] p-0.5 text-xs font-mono">
                        <button
                          onClick={() => {
                            setFilterType("all");
                            setCurrentPage(1);
                          }}
                          className={`rounded px-2.5 py-1 transition ${filterType === "all"
                            ? "bg-zinc-800 text-zinc-100 font-semibold"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => {
                            setFilterType("income");
                            setCurrentPage(1);
                          }}
                          className={`rounded px-2.5 py-1 transition ${filterType === "income"
                            ? "bg-emerald-950/70 text-emerald-400 font-semibold"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                          Pemasukan
                        </button>
                        <button
                          onClick={() => {
                            setFilterType("expense");
                            setCurrentPage(1);
                          }}
                          className={`rounded px-2.5 py-1 transition ${filterType === "expense"
                            ? "bg-rose-950/70 text-rose-400 font-semibold"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                          Pengeluaran
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Full High-Density Data Table */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#09090b] text-[10px] uppercase text-zinc-400 border-b border-zinc-800">
                          <tr>
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3 px-4">Tanggal Transaksi</th>
                            <th className="py-3 px-4">Kategori Biaya</th>
                            <th className="py-3 px-4">Keterangan / Catatan</th>
                            <th className="py-3 px-4 text-center">Tipe Transaksi</th>
                            <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70">
                          {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map((tx) => (
                              <tr
                                key={tx.id}
                                className="hover:bg-zinc-900/60 transition"
                              >
                                <td className="py-3 px-4 text-zinc-500 font-mono">#{tx.id}</td>
                                <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                                  {formatDate(tx.date)}
                                </td>
                                <td className="py-3 px-4 font-medium text-zinc-100">
                                  {tx.category}
                                </td>
                                <td className="py-3 px-4 text-zinc-400 max-w-[260px] truncate">
                                  {tx.description || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-semibold ${tx.type === "income"
                                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                                      : "bg-rose-950/60 text-rose-400 border border-rose-900/60"
                                      }`}
                                  >
                                    {tx.type === "income" ? "PEMASUKAN" : "PENGELUARAN"}
                                  </span>
                                </td>
                                <td
                                  className={`py-3 px-4 text-right font-semibold font-mono text-sm ${tx.type === "income"
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                    }`}
                                >
                                  {tx.type === "income" ? "+" : "-"}
                                  {formatRupiah(tx.amount)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-12 text-center text-zinc-500"
                              >
                                <p className="text-sm font-semibold text-zinc-400">Tidak ada transaksi ditemukan.</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  Coba ubah kata kunci pencarian atau reset filter di bagian atas.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Pagination Footer */}
                    <div className="p-3.5 border-t border-zinc-800 bg-[#09090b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-zinc-500">
                        Menampilkan {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} total transaksi
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 rounded border border-zinc-800 bg-[#121216] px-2.5 py-1 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Sebelumnya</span>
                        </button>
                        <span className="px-2 text-zinc-400">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="flex items-center gap-1 rounded border border-zinc-800 bg-[#121216] px-2.5 py-1 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                        >
                          <span>Berikutnya</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DOMPET & REKENING (WALLETS) */}
              {currentTab === "wallets" && (
                <div className="space-y-6">
                  {/* Top Header & CTA */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-400" />
                        <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                          Dompet & Akun Keuangan (Wallets)
                        </h2>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Kelola rekening bank, saldo dompet digital (e-wallet), dan kas fisik Anda secara terpusat serta lakukan mutasi transfer.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleOpenTransfer()}
                        id="open-transfer-modal-btn"
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 transition"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />
                        <span>Transfer Saldo</span>
                      </button>
                      <button
                        onClick={handleOpenCreateWallet}
                        id="create-new-wallet-btn"
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs shadow-sm transition active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Dompet</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 KPI Stat Cards for Wallets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Total Saldo Semua Dompet */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TOTAL SALDO SELURUH AKUN</span>
                        <div className="p-1.5 rounded bg-blue-950/40 border border-blue-900/60">
                          <DollarSign className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400 tracking-tight">
                          {formatRupiah(
                            walletMeta?.total_balance !== undefined && !isNaN(walletMeta.total_balance)
                              ? walletMeta.total_balance
                              : totalWalletBalance
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-blue-400">
                          {walletMeta?.total_wallets !== undefined && !isNaN(walletMeta.total_wallets)
                            ? walletMeta.total_wallets
                            : wallets.length} Akun Terdaftar
                        </span>
                        <span className="text-zinc-500">Total Likuiditas</span>
                      </div>
                    </div>

                    {/* Stat 2: Dompet Utama */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>DOMPET UTAMA (DEFAULT)</span>
                        <div className="p-1.5 rounded bg-amber-950/40 border border-amber-900/60">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-lg font-bold font-mono text-zinc-100 truncate">
                          {defaultWallet ? defaultWallet.name : "Belum Diatur"}
                        </div>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          {defaultWallet ? formatRupiah(defaultWallet.balance) : "Rp 0"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">{defaultWallet ? getWalletTypeLabel(defaultWallet.type) : "-"}</span>
                        <span className="text-zinc-500">Prioritas</span>
                      </div>
                    </div>

                    {/* Stat 3: Rekening Bank */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>REKENING BANK</span>
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                          <Building2 className="h-3.5 w-3.5 text-zinc-300" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                          {walletMeta?.bank_count !== undefined && !isNaN(walletMeta.bank_count)
                            ? walletMeta.bank_count
                            : wallets.filter((w) => w.type === "bank").length} Rekening
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">
                          {formatRupiah(
                            wallets
                              .filter((w) => w.type === "bank")
                              .reduce((acc, c) => acc + (c.balance || 0), 0)
                          )}
                        </span>
                        <span className="text-zinc-500">Perbankan</span>
                      </div>
                    </div>

                    {/* Stat 4: E-Wallet & Kas */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>E-WALLET & KAS</span>
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                          <Smartphone className="h-3.5 w-3.5 text-zinc-300" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                          {((walletMeta?.ewallet_count !== undefined && !isNaN(walletMeta.ewallet_count)
                            ? walletMeta.ewallet_count
                            : wallets.filter((w) => w.type === "ewallet").length) +
                            (walletMeta?.cash_count !== undefined && !isNaN(walletMeta.cash_count)
                              ? walletMeta.cash_count
                              : wallets.filter((w) => w.type === "cash").length))} Akun
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">
                          {formatRupiah(
                            wallets
                              .filter((w) => w.type === "ewallet" || w.type === "cash")
                              .reduce((acc, c) => acc + (c.balance || 0), 0)
                          )}
                        </span>
                        <span className="text-zinc-500">Harian</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar for Wallets */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        value={walletSearch}
                        onChange={(e) => setWalletSearch(e.target.value)}
                        placeholder="Cari nama dompet, no rekening, atau catatan..."
                        className="w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 rounded border border-zinc-800 bg-[#09090b] p-0.5 text-xs font-mono">
                      <button
                        onClick={() => setWalletFilterType("all")}
                        className={`rounded px-2.5 py-1 transition ${walletFilterType === "all"
                          ? "bg-zinc-800 text-zinc-100 font-semibold"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Semua ({wallets.length})
                      </button>
                      <button
                        onClick={() => setWalletFilterType("bank")}
                        className={`rounded px-2.5 py-1 transition ${walletFilterType === "bank"
                          ? "bg-blue-950/70 text-blue-400 font-semibold"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Bank ({wallets.filter((w) => w.type === "bank").length})
                      </button>
                      <button
                        onClick={() => setWalletFilterType("ewallet")}
                        className={`rounded px-2.5 py-1 transition ${walletFilterType === "ewallet"
                          ? "bg-cyan-950/70 text-cyan-400 font-semibold"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        E-Wallet ({wallets.filter((w) => w.type === "ewallet").length})
                      </button>
                      <button
                        onClick={() => setWalletFilterType("cash")}
                        className={`rounded px-2.5 py-1 transition ${walletFilterType === "cash"
                          ? "bg-emerald-950/70 text-emerald-400 font-semibold"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Kas Tunai ({wallets.filter((w) => w.type === "cash").length})
                      </button>
                    </div>
                  </div>

                  {/* Wallets Cards Grid */}
                  {filteredWallets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWallets.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between relative overflow-hidden transition hover:border-zinc-700"
                        >
                          {/* Top accent color bar */}
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: item.color || "#3b82f6" }}
                          />

                          <div>
                            {/* Card Top Row */}
                            <div className="flex items-start justify-between gap-2 pt-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="p-1.5 rounded text-white flex items-center justify-center"
                                  style={{ backgroundColor: item.color || "#3b82f6" }}
                                >
                                  {getWalletTypeIcon(item.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="font-semibold text-sm text-zinc-100 tracking-tight">
                                      {item.name}
                                    </h3>
                                    {item.is_default ? (
                                      <span className="rounded border border-amber-900/60 bg-amber-950/40 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 flex items-center gap-0.5">
                                        <Star className="h-2 w-2 fill-amber-400" />
                                        <span>UTAMA</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleSetDefaultWallet(item)}
                                        title="Jadikan Dompet Utama"
                                        className="rounded border border-zinc-800 bg-[#09090b] hover:border-amber-800/80 hover:bg-amber-950/20 text-zinc-400 hover:text-amber-400 text-[9px] font-mono px-1.5 py-0.5 flex items-center gap-1 transition"
                                      >
                                        <Star className="h-2.5 w-2.5" />
                                        <span>Set Utama</span>
                                      </button>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                                    {getWalletTypeLabel(item.type)}
                                    {item.account_number ? ` • ${item.account_number}` : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Balance Display */}
                            <div className="my-4 p-3 rounded bg-[#09090b] border border-zinc-800/80">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                                Saldo Dompet
                              </span>
                              <div className="text-xl font-bold font-mono text-zinc-100 tracking-tight">
                                {formatRupiah(item.balance)}
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Action Button Strip */}
                          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              className="flex-1 flex items-center justify-center gap-1 rounded bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 py-1.5 text-xs font-mono text-zinc-200 transition"
                            >
                              <Coins className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Kelola Saldo</span>
                            </button>

                            <button
                              onClick={() => handleOpenTransfer(item.id)}
                              className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-950/30 hover:bg-blue-950/50 text-blue-300 border border-blue-900/60 py-1.5 text-xs font-mono transition"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                              <span>Transfer</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditWallet(item)}
                              title="Edit Dompet"
                              className="p-1.5 rounded border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteWallet(item.id, item.name)}
                              title="Hapus Dompet"
                              className="p-1.5 rounded border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-12 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        Tidak Ada Dompet Ditemukan
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Mulai daftarkan rekening bank, akun e-wallet, atau kas fisik Anda untuk mengorganisir arus keuangan.
                      </p>
                      <button
                        onClick={handleOpenCreateWallet}
                        className="inline-flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs transition shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Dompet Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: TARGET TABUNGAN (SAVINGS) */}
              {currentTab === "savings" && (
                <div className="space-y-6">
                  {/* Top Header & CTA */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-purple-400" />
                        <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                          Target Tabungan & Rencana Masa Depan
                        </h2>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Tetapkan impian tabungan, catat setoran dana berkala, dan pantau persentase progres menuju target Anda.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreateSaving}
                      id="create-new-saving-btn"
                      className="flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs shadow-sm transition active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Target Baru</span>
                    </button>
                  </div>

                  {/* 4 KPI Stat Cards for Savings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Total Dana Terkumpul */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TOTAL TERKUMPUL</span>
                        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-900/60">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                          {formatRupiah(savingMeta?.total_collected_amount || 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400">Akumulasi Saldo</span>
                        <span className="text-zinc-500">
                          {savingMeta?.overall_progress_percent || 0}% Terpenuhi
                        </span>
                      </div>
                    </div>

                    {/* Stat 2: Total Target Nominal */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TOTAL TARGET DANA</span>
                        <div className="p-1.5 rounded bg-purple-950/40 border border-purple-900/60">
                          <Target className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                          {formatRupiah(savingMeta?.total_target_amount || 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-purple-400">{savings.length} Pos Tabungan</span>
                        <span className="text-zinc-500">Kebutuhan</span>
                      </div>
                    </div>

                    {/* Stat 3: Progres Keseluruhan */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>PROGRES KESELURUHAN</span>
                        <div className="p-1.5 rounded bg-purple-950/40 border border-purple-900/60">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 tracking-tight">
                          {savingMeta?.overall_progress_percent || 0}%
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800 mt-2">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, savingMeta?.overall_progress_percent || 0)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-purple-400">Rata-rata Realisasi</span>
                        <span className="text-zinc-500">Semua Target</span>
                      </div>
                    </div>

                    {/* Stat 4: Status Target */}
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>TARGET TERCAPAI</span>
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="my-2.5">
                        <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                          {savingMeta?.completed_count || 0} / {savingMeta?.total_items || 0}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400">{savingMeta?.active_count || 0} Sedang Berjalan</span>
                        <span className="text-zinc-500">Status</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar for Savings */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        value={savingSearch}
                        onChange={(e) => setSavingSearch(e.target.value)}
                        placeholder="Cari nama tabungan atau catatan..."
                        className="w-full rounded border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center rounded border border-zinc-800 bg-[#09090b] p-0.5 text-xs font-mono">
                      <button
                        onClick={() => setSavingFilterStatus("all")}
                        className={`rounded px-2.5 py-1 transition ${savingFilterStatus === "all"
                          ? "bg-zinc-800 text-zinc-100 font-semibold"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Semua ({savings.length})
                      </button>
                      <button
                        onClick={() => setSavingFilterStatus("active")}
                        className={`rounded px-2.5 py-1 transition ${savingFilterStatus === "active"
                          ? "bg-purple-950/70 text-purple-400 font-semibold border border-purple-900/60"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Sedang Berjalan ({savings.filter((s) => s.status === "active").length})
                      </button>
                      <button
                        onClick={() => setSavingFilterStatus("completed")}
                        className={`rounded px-2.5 py-1 transition ${savingFilterStatus === "completed"
                          ? "bg-emerald-950/70 text-emerald-400 font-semibold border border-emerald-900/60"
                          : "text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        Tercapai ({savings.filter((s) => s.status === "completed").length})
                      </button>
                    </div>
                  </div>

                  {/* Savings Cards Grid */}
                  {filteredSavings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSavings.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between relative overflow-hidden transition hover:border-zinc-700"
                        >
                          {/* Accent Color Strip Top */}
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: item.color || "#8b5cf6" }}
                          />

                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 pt-1">
                              <div>
                                <h3 className="font-semibold text-sm text-zinc-100 tracking-tight">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold whitespace-nowrap ${item.status === "completed"
                                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                                  : "bg-purple-950/80 text-purple-400 border border-purple-800/80"
                                  }`}
                              >
                                {item.status === "completed" ? "TERCAPAI 🎉" : "AKTIF"}
                              </span>
                            </div>

                            {/* Target Date Pill if available */}
                            {item.target_date && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mt-2">
                                <Calendar className="h-3 w-3 text-zinc-500" />
                                <span>Target: {formatDate(item.target_date)}</span>
                              </div>
                            )}

                            {/* Progress Section */}
                            <div className="my-3.5 space-y-1.5">
                              <div className="flex items-baseline justify-between font-mono">
                                <span className="text-[11px] text-zinc-400">Capaian Progres:</span>
                                <span className="text-base font-bold text-zinc-100">
                                  {item.progress_percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, item.progress_percentage)}%`,
                                    backgroundColor: item.color || "#8b5cf6",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Financial Details Row */}
                            <div className="p-2.5 rounded bg-[#09090b] border border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Terkumpul</span>
                                <span className="font-semibold text-emerald-400 block mt-0.5 text-[11px] truncate">
                                  {formatRupiah(item.current_amount)}
                                </span>
                              </div>
                              <div className="border-x border-zinc-800/80 px-1">
                                <span className="text-[10px] text-zinc-500 block">Target</span>
                                <span className="font-semibold text-zinc-200 block mt-0.5 text-[11px] truncate">
                                  {formatRupiah(item.target_amount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 block">Sisa Dana</span>
                                <span className="font-semibold text-zinc-400 block mt-0.5 text-[11px] truncate">
                                  {formatRupiah(item.remaining_amount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3.5 mt-3.5 border-t border-zinc-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleOpenDeposit(item)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-900/60 py-1.5 text-xs font-mono font-semibold transition"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Setor Dana</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditSaving(item)}
                              title="Edit Target"
                              className="p-1.5 rounded border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSaving(item.id, item.name)}
                              title="Hapus Target"
                              className="p-1.5 rounded border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-12 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <PiggyBank className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        Belum Ada Target Tabungan
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Mulai rencanakan tujuan keuangan Anda seperti dana darurat, beli rumah, kendaraan, atau liburan.
                      </p>
                      <button
                        onClick={handleOpenCreateSaving}
                        className="inline-flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs transition shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Buat Target Tabungan Pertama</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LAPORAN & RASIO KEUANGAN */}
              {currentTab === "reports" && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5">
                    <h2 className="text-base font-bold text-zinc-100">
                      Laporan & Analisis Rasio Finansial
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Analisis komprehensif struktur arus kas, tingkat tabungan, dan efisiensi pengeluaran.
                    </p>
                  </div>

                  {/* 3 Metric Cards for Reports */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">
                        Tingkat Tabungan (Savings Rate)
                      </span>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                        {savingsRatePct}%
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Persentase dana masuk yang berhasil disisihkan
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">
                        Rasio Pengeluaran (Burn Rate)
                      </span>
                      <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
                        {burnRatePct}%
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Persentase pendapatan yang dihabiskan untuk biaya
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">
                        Rata-Rata Pengeluaran per Transaksi
                      </span>
                      <div className="text-2xl font-bold font-mono text-zinc-200 mt-2">
                        {expenseCount > 0
                          ? formatRupiah(Math.round(totalExpense / expenseCount))
                          : "Rp 0"}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Dihitung dari {expenseCount} catatan pengeluaran
                      </p>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-5 space-y-4">
                    <h3 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                      Komparasi Pemasukan vs Pengeluaran
                    </h3>
                    <div className="overflow-x-auto border border-zinc-800 rounded">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#09090b] text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                          <tr>
                            <th className="py-2.5 px-4">Komponen Arus Kas</th>
                            <th className="py-2.5 px-4 text-center">Jumlah Transaksi</th>
                            <th className="py-2.5 px-4 text-right">Total Nominal</th>
                            <th className="py-2.5 px-4 text-right">Rasio Terhadap Pemasukan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                          <tr>
                            <td className="py-3 px-4 font-semibold text-emerald-400">Pemasukan (Cash Inflow)</td>
                            <td className="py-3 px-4 text-center">{incomeCount} kali</td>
                            <td className="py-3 px-4 text-right font-semibold text-emerald-400">{formatRupiah(totalIncome)}</td>
                            <td className="py-3 px-4 text-right">100%</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-semibold text-rose-400">Pengeluaran (Cash Outflow)</td>
                            <td className="py-3 px-4 text-center">{expenseCount} kali</td>
                            <td className="py-3 px-4 text-right font-semibold text-rose-400">{formatRupiah(totalExpense)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{burnRatePct}%</td>
                          </tr>
                          <tr className="bg-[#09090b] font-bold">
                            <td className="py-3 px-4 text-zinc-100">Saldo Akhir Bersih</td>
                            <td className="py-3 px-4 text-center">{transactions.length} kali</td>
                            <td className={`py-3 px-4 text-right ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {formatRupiah(balance)}
                            </td>
                            <td className="py-3 px-4 text-right">{savingsRatePct}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: KATEGORI TRANSAKSI (CATEGORIES) */}
              {currentTab === "categories" && (
                <div className="space-y-6">
                  {/* Top Header & Quick Actions */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-amber-400" />
                        <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                          Manajemen Kategori Transaksi
                        </h2>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Atur dan kustomisasi pos pengeluaran & sumber pemasukan untuk klasifikasi pembukuan yang presisi.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={handleOpenCreateCategory}
                        id="categories-add-btn"
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs transition shadow-sm active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Kategori</span>
                      </button>
                      <button
                        onClick={() => setIsTxModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-[#09090b] hover:bg-zinc-800 px-3.5 py-2 text-xs font-mono text-zinc-300 transition"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Catat Transaksi</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Metric KPI Cards for Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-zinc-400">
                          Total Kategori
                        </span>
                        <Tag className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-zinc-100 mt-2">
                        {categories.length}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Pos klasifikasi keuangan aktif
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-zinc-400">
                          Pos Pengeluaran
                        </span>
                        <div className="h-2 w-2 rounded-full bg-rose-400" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
                        {expenseCategoriesCount}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Kebutuhan, belanja & tagihan
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-zinc-400">
                          Pos Pemasukan
                        </span>
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                        {incomeCategoriesCount}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Gaji, omset usaha & dividen
                      </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-zinc-400">
                          Total Transaksi Terlacak
                        </span>
                        <Receipt className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-zinc-200 mt-2">
                        {transactions.length}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Terpetakan ke berbagai kategori
                      </p>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 max-w-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Cari kategori atau deskripsi..."
                        className="w-full rounded-md border border-zinc-800 bg-[#09090b] pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>

                    {/* Type Filter Buttons */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                      <button
                        onClick={() => setCategoryFilterType("all")}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${categoryFilterType === "all"
                          ? "bg-zinc-800 text-zinc-100 font-semibold"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                      >
                        Semua ({categories.length})
                      </button>
                      <button
                        onClick={() => setCategoryFilterType("expense")}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${categoryFilterType === "expense"
                          ? "bg-rose-950/80 text-rose-300 font-semibold border border-rose-900/60"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                      >
                        Pengeluaran ({expenseCategoriesCount})
                      </button>
                      <button
                        onClick={() => setCategoryFilterType("income")}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${categoryFilterType === "income"
                          ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-900/60"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                      >
                        Pemasukan ({incomeCategoriesCount})
                      </button>
                    </div>
                  </div>

                  {/* Categories Cards Grid */}
                  {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCategories.map((item) => {
                        const usage = categoryUsageMap[item.name] || { total: 0, count: 0 };
                        const isIncome = item.type === "income";

                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between hover:border-zinc-700 transition"
                          >
                            <div>
                              {/* Top Row: Color Badge & Type */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color || (isIncome ? "#10b981" : "#ef4444") }}
                                  />
                                  <h3 className="font-semibold text-sm text-zinc-100 truncate">
                                    {item.name}
                                  </h3>
                                </div>
                                <span
                                  className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase flex-shrink-0 ${isIncome
                                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                                    : "bg-rose-950/60 text-rose-400 border border-rose-900/60"
                                    }`}
                                >
                                  {item.type}
                                </span>
                              </div>

                              {/* Description */}
                              {item.description && (
                                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              {/* Accumulation Stats Box */}
                              <div className="my-3 p-2.5 rounded bg-[#09090b] border border-zinc-800/80">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                                  Akumulasi Transaksi
                                </span>
                                <div
                                  className={`text-base font-bold font-mono tracking-tight ${isIncome ? "text-emerald-400" : "text-zinc-100"
                                    }`}
                                >
                                  {formatRupiah(usage.total)}
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
                                  {usage.count} transaksi tercatat
                                </span>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCategory(item.name);
                                  setCurrentTab("transactions");
                                }}
                                className="flex-1 flex items-center justify-center gap-1 rounded bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 py-1.5 text-xs font-mono text-zinc-300 hover:text-white transition"
                              >
                                <span>Filter Transaksi →</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditCategory(item)}
                                title="Edit Kategori"
                                className="p-1.5 rounded border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteCategory(item.id, item.name)}
                                title="Hapus Kategori"
                                className="p-1.5 rounded border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-zinc-800 bg-[#121216] p-12 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Tag className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        Tidak Ada Kategori Ditemukan
                      </h3>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        {categorySearch
                          ? `Tidak ada kategori yang cocok dengan pencarian "${categorySearch}".`
                          : "Belum ada kategori yang terdaftar pada filter ini."}
                      </p>
                      <button
                        onClick={handleOpenCreateCategory}
                        className="inline-flex items-center gap-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold px-4 py-2 text-xs transition shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Kategori Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PROFIL AKUN */}
              {currentTab === "profile" && (
                <div className="max-w-2xl space-y-6">
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4 sm:p-5">
                    <h2 className="text-base font-bold text-zinc-100">
                      Informasi Profil & Keamanan Akun
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Kelola identitas akun dan periksa status validitas sesi terotentikasi Anda.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-5 space-y-4">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-lg font-bold text-zinc-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">{user.name}</h3>
                        <p className="text-xs font-mono text-zinc-400">{user.email}</p>
                        <span className="inline-block mt-1 rounded border border-emerald-900/80 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          STATUS: TEROTENTIKASI AKTIF
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="flex items-center justify-between p-2.5 rounded bg-[#09090b] border border-zinc-800">
                        <span className="text-zinc-500">ID Pengguna</span>
                        <span className="text-zinc-200 font-semibold">#{user.id}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-[#09090b] border border-zinc-800">
                        <span className="text-zinc-500">Waktu Bergabung</span>
                        <span className="text-zinc-200">{formatDate(user.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-[#09090b] border border-zinc-800">
                        <span className="text-zinc-500">Sesi JWT</span>
                        <span className="text-emerald-400 font-medium">Aktif & Terlindungi</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleVerifyAccount}
                        disabled={verifying}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-mono text-zinc-200 transition"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} />
                        <span>Verifikasi Sesi Akun</span>
                      </button>
                      <button
                        onClick={logout}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/50 py-2 text-xs font-mono text-rose-300 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>

                    {verifiedStatus && (
                      <div className="rounded border border-zinc-800 bg-[#09090b] p-3 text-xs font-mono text-zinc-300">
                        {verifiedStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: PUSAT NOTIFIKASI */}
              {currentTab === "notifications" && (
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={unreadNotifCount}
                  loading={loadingNotifs}
                  onRefresh={fetchNotifications}
                  onMarkAsRead={handleMarkNotifAsRead}
                  onMarkAllAsRead={handleMarkAllNotifsAsRead}
                  onDeleteNotification={handleDeleteNotif}
                  onClearRead={handleClearReadNotifs}
                  onOpenCreateModal={() => setIsCreateNotifModalOpen(true)}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}
            </>
          ) : (
            /* ======================================================== */
            /* GUEST VIEW: LARAVEL STYLE AUTHENTICATION PORTAL          */
            /* ======================================================== */
            <div className="max-w-5xl mx-auto space-y-6 py-4">
              {/* Top Banner */}
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
                  <span>PORTAL MANAJEMEN KEUANGAN</span>
                  <span>•</span>
                  <span className="text-emerald-400">LARAVEL STYLE DASHBOARD</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                  Sistem Pencatatan Pemasukan, Pengeluaran & Dompet Kas
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Silakan masuk menggunakan akun terdaftar atau buat akun baru untuk mengakses seluruh metrik finansial, dompet digital, target tabungan, dan mutasi saldo.
                </p>
              </div>

              {/* Bento Grid: Left Auth Form, Right System Features */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <AuthForm initialMode="login" />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {/* Feature Table */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
                      <h2 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                        Fitur Utama Platform
                      </h2>
                      <span className="rounded border border-zinc-800 bg-[#09090b] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        KAPABILITAS
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-zinc-800/80 rounded">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#09090b] text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                          <tr>
                            <th className="py-2.5 px-3">Modul</th>
                            <th className="py-2.5 px-3">Fungsi</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">Dompet & Rekening (Wallets)</td>
                            <td className="py-2.5 px-3 text-zinc-400">Kelola bank, e-wallet, kas fisik, & transfer saldo</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">Tersedia</td>
                          </tr>
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">Target Tabungan (Savings)</td>
                            <td className="py-2.5 px-3 text-zinc-400">Atur tujuan tabungan, tenggat waktu, & setoran dana</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">Tersedia</td>
                          </tr>
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">Pencatatan Pemasukan</td>
                            <td className="py-2.5 px-3 text-zinc-400">Catat gaji, pendapatan usaha, & dividen</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">Tersedia</td>
                          </tr>
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">Pencatatan Pengeluaran</td>
                            <td className="py-2.5 px-3 text-zinc-400">Kelompokkan pengeluaran harian & tagihan</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">Tersedia</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Security Highlights */}
                  <div className="rounded-lg border border-zinc-800 bg-[#121216] p-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
                      <h2 className="text-xs font-mono uppercase font-semibold text-zinc-200">
                        Keamanan & Privasi Akun
                      </h2>
                      <span className="text-[10px] font-mono text-zinc-500">
                        TERENKRIPSI
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-zinc-800/80 rounded">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#09090b] text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                          <tr>
                            <th className="py-2 px-3">Standar</th>
                            <th className="py-2 px-3">Deskripsi</th>
                            <th className="py-2 px-3 text-right">Proteksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2 px-3 font-semibold text-zinc-200">Enkripsi Kata Sandi</td>
                            <td className="py-2 px-3 text-zinc-400">Password di-hash satu arah dengan bcrypt</td>
                            <td className="py-2 px-3 text-right text-emerald-400">Aktif</td>
                          </tr>
                          <tr className="hover:bg-zinc-900/60">
                            <td className="py-2 px-3 font-semibold text-zinc-200">Isolasi Data Pengguna</td>
                            <td className="py-2 px-3 text-zinc-400">Catatan transaksi privat per akun masing-masing</td>
                            <td className="py-2 px-3 text-right text-emerald-400">Aktif</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Laravel Minimal Dashboard Footer */}
        <footer className="border-t border-zinc-800/80 px-6 py-3 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#09090b]">
          <span>CatatUang • Sistem Manajemen Keuangan Personal</span>
          <span>Hak Cipta © 2026 CatatUang</span>
        </footer>
      </div>

      {/* Modal for Recording New Transaction */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Modal for Creating / Editing Saving Target */}
      <SavingModal
        isOpen={isSavingModalOpen}
        onClose={() => {
          setIsSavingModalOpen(false);
          setSavingToEdit(null);
        }}
        onSuccess={handleSavingSuccess}
        savingToEdit={savingToEdit}
      />

      {/* Modal for Depositing into Saving Target */}
      <DepositSavingModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSavingForDeposit(null);
        }}
        onSuccess={handleSavingSuccess}
        saving={savingForDeposit}
      />

      {/* Modal for Creating / Editing Wallet */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setWalletToEdit(null);
        }}
        onSuccess={handleWalletSuccess}
        walletToEdit={walletToEdit}
      />

      {/* Modal for Transfer Between Wallets */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleWalletSuccess}
        wallets={wallets}
        defaultFromWalletId={transferDefaultFromId}
      />

      {/* Modal for Adjusting Wallet Balance */}
      <AdjustBalanceModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setWalletToAdjust(null);
        }}
        onSuccess={handleWalletSuccess}
        wallet={walletToAdjust}
      />

      {/* Modal for Creating / Editing Category */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSuccess={handleCategorySuccess}
        categoryToEdit={categoryToEdit}
      />

      {/* Modal for Creating / Testing Notification */}
      <CreateNotificationModal
        isOpen={isCreateNotifModalOpen}
        onClose={() => setIsCreateNotifModalOpen(false)}
        onSuccess={() => {
          fetchNotifications();
        }}
      />

      {/* Modal for Setting Daily & Weekly Budget Limits */}
      <BudgetLimitsModal
        isOpen={isLimitsModalOpen}
        onClose={() => setIsLimitsModalOpen(false)}
        onSuccess={handleLimitsSuccess}
        initialDailyLimit={trackerData?.daily?.limit || 0}
        initialWeeklyLimit={trackerData?.weekly?.limit || 0}
      />

      {/* Modal for Creating / Editing Category Budget */}
      <BudgetCategoryModal
        isOpen={isBudgetCategoryModalOpen}
        onClose={() => {
          setIsBudgetCategoryModalOpen(false);
          setBudgetToEdit(null);
        }}
        onSuccess={handleCategoryBudgetSuccess}
        categories={categories}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
}
