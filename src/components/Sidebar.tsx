import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Boxes,
  DollarSign,
  Settings,
  Sparkles,
  CloudSun,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onOpenUpgrade: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenUpgrade,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { activeTab, setActiveTab, currentUser, purchaseSuggestions } = useApp();

  const urgentCount = purchaseSuggestions.filter((s) => s.isUrgentStock).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'forecast',
      label: 'Dự báo lượng khách',
      icon: TrendingUp,
      badge: currentUser?.plan === 'PRO' ? 'PRO' : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'purchase',
      label: 'Danh sách đi chợ',
      icon: ShoppingCart,
      badge: urgentCount > 0 ? `${urgentCount} gấp` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'ingredients',
      label: 'Quản lý nguyên liệu',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'revenue',
      label: 'Doanh thu & Lịch sử',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Cài đặt & Gói Pro',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Quản Trị
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Pro Card */}
        <div className="pt-4 border-t border-slate-100">
          {currentUser?.plan === 'PRO' ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/60">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gói Doanh Nghiệp PRO</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Dự báo 30 ngày, hệ số ngày lễ Việt Nam & cảnh báo tồn kho tự động.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Nâng cấp FreshPredict PRO</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 leading-snug">
                Mở khóa dự báo 30-90 ngày, tích hợp lịch Tết/Lễ hội và cảnh báo sớm.
              </p>
              <button
                onClick={onOpenUpgrade}
                className="mt-2.5 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Trải nghiệm PRO
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
