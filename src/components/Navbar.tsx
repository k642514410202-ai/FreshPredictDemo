import React, { useState } from 'react';
import {
  Store,
  Bell,
  Sparkles,
  ChevronDown,
  RefreshCw,
  User as UserIcon,
  Check,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeatherIcon } from './WeatherIcon';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenUpgrade,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const {
    currentUser,
    currentShop,
    shops,
    switchShop,
    weather,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    setHorizonDays,
    refreshAll,
    isLoading,
    toggleUserPlan,
  } = useApp();

  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const currentWeather = weather.length > 0 ? weather[0] : null;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="font-bold text-lg tracking-tight">FP</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                  FreshPredict
                </span>
                <span className="block text-[11px] font-medium text-slate-500 -mt-1">
                  Dự báo & Đi chợ F&B
                </span>
              </div>
            </div>

            {/* Shop Switcher */}
            {currentShop && (
              <div className="relative ml-2 sm:ml-4">
                <button
                  onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-sm font-semibold transition"
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentShop.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {shopDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Chọn quán ăn / quán cafe
                    </div>
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => {
                          switchShop(shop.id);
                          setShopDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-emerald-50 ${
                          currentShop.id === shop.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{shop.name}</div>
                          <div className="text-xs text-slate-500">{shop.city} • {shop.category === 'HOT_FOOD' ? 'Món súp nóng' : 'Đồ uống lạnh'}</div>
                        </div>
                        {currentShop.id === shop.id && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Weather, Plan, Notifications, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Weather pill */}
            {currentWeather && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
                <WeatherIcon name={currentWeather.weatherIcon} className="w-4 h-4" />
                <span>
                  {currentShop?.city}: <strong>{currentWeather.temperatureAvg}°C</strong> ({currentWeather.weatherDescription})
                </span>
                {currentWeather.precipitationProbability > 40 && (
                  <span className="text-blue-600 font-bold">
                    ☔ {currentWeather.precipitationProbability}%
                  </span>
                )}
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={refreshAll}
              disabled={isLoading}
              title="Cập nhật dữ liệu thời tiết & dự báo mới nhất"
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Plan Badge & Toggle */}
            {currentUser && (
              <div className="flex items-center gap-1.5">
                {currentUser.plan === 'PRO' ? (
                  <button
                    onClick={() => toggleUserPlan('FREE')}
                    title="Bấm để chuyển thử nghiệm sang Gói Free"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:opacity-90 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gói PRO</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenUpgrade}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nâng cấp PRO</span>
                  </button>
                )}
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span>Thông báo ({notifications.length})</span>
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                      >
                        Đọc tất cả ({unreadCount})
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Không có thông báo mới nào
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isLowStock = n.type === 'LOW_STOCK';
                        return (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition rounded-lg ${
                              !n.isRead
                                ? isLowStock
                                  ? 'bg-rose-50/80 border border-rose-100'
                                  : 'bg-amber-50/60 font-medium'
                                : 'text-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">
                                <AlertTriangle
                                  className={`w-4 h-4 shrink-0 ${
                                    isLowStock
                                      ? 'text-rose-600'
                                      : n.type === 'EXPIRED_SOON'
                                      ? 'text-amber-500'
                                      : 'text-blue-500'
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <div
                                    className={`font-bold ${
                                      isLowStock ? 'text-rose-950' : 'text-slate-900'
                                    }`}
                                  >
                                    {n.title}
                                  </div>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                                {/* Action button for Low Stock notification */}
                                {isLowStock && (
                                  <div className="mt-2.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationRead(n.id);
                                        setHorizonDays(3);
                                        setActiveTab('purchase');
                                        setNotifDropdownOpen(false);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" />
                                      <span>Lên đơn đi chợ 3 ngày tới &rarr;</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Account Switcher Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {currentUser?.name || 'Tài khoản'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
