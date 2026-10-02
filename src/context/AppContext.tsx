/**
 * FreshPredict - App Global State Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppNotification,
  ForecastDayResult,
  Ingredient,
  PurchaseItemSuggestion,
  RevenueEntry,
  Shop,
  User,
  WeatherDay,
} from '@/lib/types';

interface AppContextType {
  currentUser: User | null;
  currentShop: Shop | null;
  shops: Shop[];
  weather: WeatherDay[];
  forecast: ForecastDayResult[];
  purchaseSuggestions: PurchaseItemSuggestion[];
  ingredients: Ingredient[];
  revenueEntries: RevenueEntry[];
  revenueStats: any;
  notifications: AppNotification[];
  horizonDays: number;
  setHorizonDays: (days: number) => void;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshAll: () => Promise<void>;
  switchShop: (shopId: string) => Promise<void>;
  switchUser: (email: string) => Promise<void>;
  toggleUserPlan: (plan: 'FREE' | 'PRO') => Promise<void>;
  saveRevenueEntry: (data: { date: string; revenue: number; customerCount: number; notes?: string }) => Promise<void>;
  deleteRevenueEntry: (id: string) => Promise<void>;
  saveIngredient: (data: any) => Promise<void>;
  updateIngredient: (id: string, data: any) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  updateShopSettings: (data: Partial<Shop>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [forecast, setForecast] = useState<ForecastDayResult[]>([]);
  const [purchaseSuggestions, setPurchaseSuggestions] = useState<PurchaseItemSuggestion[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [horizonDays, setHorizonDays] = useState<number>(1); // 1 = ngày mai, 3 = 3 ngày, 7 = 7 ngày
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      try {
        // Fetch all shops
        const resShops = await fetch('/api/shops');
        const shopsData: Shop[] = await resShops.json();
        setShops(shopsData);

        if (shopsData.length > 0) {
          const defaultShop = shopsData[0];
          setCurrentShop(defaultShop);

          // Find default user (Bác Sáng)
          const mockUser: User = {
            id: defaultShop.userId,
            email: defaultShop.id.includes('pho') ? 'chusan@freshpredict.vn' : 'caphesuada@freshpredict.vn',
            name: defaultShop.id.includes('pho') ? 'Bác Sáng - Quán Phở 1986' : 'Anh Nam - Quán Cà Phê',
            plan: defaultShop.id.includes('pho') ? 'PRO' : 'FREE',
            createdAt: defaultShop.createdAt,
          };
          setCurrentUser(mockUser);

          await loadShopData(defaultShop.id, 1);
        }
      } catch (err: any) {
        console.error('Init error:', err);
        setError('Không thể kết nối đến máy chủ. Vui lòng tải lại trang.');
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  // Reload purchase suggestions when horizonDays changes
  useEffect(() => {
    if (currentShop) {
      loadPurchase(currentShop.id, horizonDays);
    }
  }, [horizonDays]);

  const loadPurchase = async (shopId: string, days: number) => {
    try {
      const res = await fetch(`/api/purchase/${shopId}?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setPurchaseSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error('Failed to load purchase suggestions', e);
    }
  };

  const loadShopData = async (shopId: string, days: number = horizonDays) => {
    try {
      setError(null);
      const [resWeather, resForecast, resIngredients, resRevenue, resNotif, resPurchase] = await Promise.all([
        fetch(`/api/weather/${shopId}?days=7`),
        fetch(`/api/forecast/${shopId}?days=${currentUser?.plan === 'PRO' ? 14 : 7}`),
        fetch(`/api/ingredients/${shopId}`),
        fetch(`/api/revenue/${shopId}`),
        fetch(`/api/notifications/${shopId}`),
        fetch(`/api/purchase/${shopId}?days=${days}`),
      ]);

      if (resWeather.ok) {
        const d = await resWeather.json();
        setWeather(d.weather || []);
      }
      if (resForecast.ok) {
        const d = await resForecast.json();
        setForecast(d.forecast || []);
      }
      if (resIngredients.ok) {
        const d = await resIngredients.json();
        setIngredients(d || []);
      }
      if (resRevenue.ok) {
        const d = await resRevenue.json();
        setRevenueEntries(d.entries || []);
        setRevenueStats(d.stats || null);
      }
      if (resNotif.ok) {
        const d = await resNotif.json();
        setNotifications(d || []);
      }
      if (resPurchase.ok) {
        const d = await resPurchase.json();
        setPurchaseSuggestions(d.suggestions || []);
      }
    } catch (err: any) {
      console.error('Load shop data error:', err);
      setError('Lỗi khi tải dữ liệu quán');
    }
  };

  const refreshAll = async () => {
    if (currentShop) {
      setIsLoading(true);
      await loadShopData(currentShop.id, horizonDays);
      setIsLoading(false);
      showToast('Đã làm mới dữ liệu mới nhất');
    }
  };

  const switchShop = async (shopId: string) => {
    const target = shops.find((s) => s.id === shopId);
    if (!target) return;
    setIsLoading(true);
    setCurrentShop(target);

    // Switch corresponding user plan
    const isPho = target.id.includes('pho');
    setCurrentUser({
      id: target.userId,
      email: isPho ? 'chusan@freshpredict.vn' : 'caphesuada@freshpredict.vn',
      name: isPho ? 'Bác Sáng - Quán Phở 1986' : 'Anh Nam - Quán Cà Phê',
      plan: isPho ? 'PRO' : 'FREE',
      createdAt: target.createdAt,
    });

    await loadShopData(target.id, horizonDays);
    setIsLoading(false);
    showToast(`Đã chuyển sang quán: ${target.name}`);
  };

  const switchUser = async (email: string) => {
    const isPho = email.includes('pho') || email.includes('chusan');
    const targetShop = shops.find((s) => (isPho ? s.id.includes('pho') : s.id.includes('cafe')));
    if (targetShop) {
      await switchShop(targetShop.id);
    }
  };

  const toggleUserPlan = async (newPlan: 'FREE' | 'PRO') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, plan: newPlan }),
      });
      if (res.ok) {
        setCurrentUser({ ...currentUser, plan: newPlan });
        showToast(
          newPlan === 'PRO'
            ? '🎉 Đã nâng cấp thành công gói PRO! Tất cả tính năng cao cấp đã mở khóa.'
            : 'Đã chuyển về gói FREE cơ bản.'
        );
        if (currentShop) {
          await loadShopData(currentShop.id);
        }
      }
    } catch (e) {
      showToast('Lỗi khi cập nhật gói dịch vụ');
    }
  };

  const saveRevenueEntry = async (data: { date: string; revenue: number; customerCount: number; notes?: string }) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/revenue/${currentShop.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi khi lưu doanh thu');
      }
      await loadShopData(currentShop.id);
      showToast(`Đã lưu doanh thu ngày ${data.date}`);
    } catch (e: any) {
      showToast(`❌ ${e.message}`);
      throw e;
    }
  };

  const deleteRevenueEntry = async (id: string) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/revenue/${currentShop.id}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadShopData(currentShop.id);
        showToast('Đã xóa bản ghi doanh thu');
      }
    } catch (e) {
      showToast('Lỗi khi xóa bản ghi');
    }
  };

  const saveIngredient = async (data: any) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/ingredients/${currentShop.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi thêm nguyên liệu');
      }
      await loadShopData(currentShop.id);
      showToast(`Đã thêm nguyên liệu: ${data.name}`);
    } catch (e: any) {
      showToast(`❌ ${e.message}`);
      throw e;
    }
  };

  const updateIngredient = async (id: string, data: any) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/ingredients/${currentShop.id}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi cập nhật nguyên liệu');
      }
      await loadShopData(currentShop.id);
      showToast('Đã cập nhật nguyên liệu');
    } catch (e: any) {
      showToast(`❌ ${e.message}`);
      throw e;
    }
  };

  const deleteIngredient = async (id: string) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/ingredients/${currentShop.id}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadShopData(currentShop.id);
        showToast('Đã xóa nguyên liệu');
      }
    } catch (e) {
      showToast('Lỗi khi xóa nguyên liệu');
    }
  };

  const updateShopSettings = async (data: Partial<Shop>) => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/shops/${currentShop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentShop(updated);
        setShops(shops.map((s) => (s.id === updated.id ? updated : s)));
        await loadShopData(updated.id);
        showToast('Đã lưu cấu hình quán');
      }
    } catch (e) {
      showToast('Lỗi lưu cấu hình quán');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!currentShop) return;
    try {
      const res = await fetch(`/api/notifications/${currentShop.id}/read-all`, { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast('Đã đánh dấu tất cả thông báo là đã đọc');
      }
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentShop,
        shops,
        weather,
        forecast,
        purchaseSuggestions,
        ingredients,
        revenueEntries,
        revenueStats,
        notifications,
        horizonDays,
        setHorizonDays,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        refreshAll,
        switchShop,
        switchUser,
        toggleUserPlan,
        saveRevenueEntry,
        deleteRevenueEntry,
        saveIngredient,
        updateIngredient,
        deleteIngredient,
        updateShopSettings,
        markNotificationRead,
        markAllNotificationsRead,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
