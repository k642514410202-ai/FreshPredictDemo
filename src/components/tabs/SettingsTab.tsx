import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Check,
  Store,
  MapPin,
  Calendar,
  Shield,
  Layers,
  Zap,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShopCategory } from '@/lib/types';
import { VIETNAM_NATIONAL_HOLIDAYS } from '@/lib/holidays';

export const SettingsTab: React.FC = () => {
  const {
    currentShop,
    currentUser,
    toggleUserPlan,
    updateShopSettings,
    showToast,
  } = useApp();

  const [shopName, setShopName] = useState(currentShop?.name || '');
  const [category, setCategory] = useState<ShopCategory>(currentShop?.category || 'HOT_FOOD');
  const [city, setCity] = useState(currentShop?.city || 'Hà Nội');
  const [defaultBaseline, setDefaultBaseline] = useState(currentShop?.defaultBaseline || 120);
  const [bufferFactor, setBufferFactor] = useState(currentShop?.bufferFactor || 0.10);
  const [isSaving, setIsSaving] = useState(false);

  const isPro = currentUser?.plan === 'PRO';

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let lat = 21.0285;
    let lng = 105.8542;
    if (city === 'Hồ Chí Minh') {
      lat = 10.7769;
      lng = 106.7009;
    } else if (city === 'Đà Nẵng') {
      lat = 16.0544;
      lng = 108.2022;
    }

    try {
      await updateShopSettings({
        name: shopName,
        category,
        city,
        latitude: lat,
        longitude: lng,
        defaultBaseline: Number(defaultBaseline),
        bufferFactor: Number(bufferFactor),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Cài Đặt Quán & Gói Dịch Vụ</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý gói tài khoản (Free/Pro), cấu hình vị trí thời tiết và hệ số dự phòng nguyên liệu.
        </p>
      </div>

      {/* Plan Switcher Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Gói cước tài khoản</span>
            </h2>
            <p className="text-xs text-slate-500">
              Chuyển đổi tức thì giữa gói Miễn phí và Pro để kiểm tra các tính năng nâng cao.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Gói hiện tại:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPro
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPro ? '🌟 GÓI PRO' : 'GÓI FREE'}
            </span>
          </div>
        </div>

        {/* Pricing Table Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Card */}
          <div
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              !isPro
                ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Gói Cơ Bản (Free)</span>
                {!isPro && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Đang kích hoạt
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                0 đ <span className="text-xs font-normal text-slate-400">/ tháng</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dành cho quán ăn, quán cà phê nhỏ mới bắt đầu thử nghiệm.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dự báo lượng khách trong 7 ngày</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dữ liệu thời tiết Open-Meteo cập nhật mỗi giờ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gợi ý danh sách đi chợ theo ngày mai</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Theo dõi và nhập doanh thu hàng ngày</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => toggleUserPlan('FREE')}
              disabled={!isPro}
              className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                !isPro
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer'
              }`}
            >
              {!isPro ? 'Đang sử dụng gói này' : 'Chuyển về gói Miễn Phí'}
            </button>
          </div>

          {/* Pro Card */}
          <div
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              isPro
                ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
                : 'border-amber-200 bg-gradient-to-b from-amber-50/40 to-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Gói Chuyên Nghiệp (PRO)</span>
                </span>
                {isPro && (
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                    Đang kích hoạt
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                199.000 đ <span className="text-xs font-normal text-slate-400">/ tháng</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Giải pháp toàn diện tối ưu chi phí nguyên liệu và tránh lãng phí.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mở rộng dự báo dài hạn 14 - 30 ngày</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tự động bù trừ lễ hội & Tết Việt Nam (+30% - +60%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Hệ thống cảnh báo tồn kho và cận hạn sử dụng</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Xuất file CSV danh sách đi chợ & In ấn tiện lợi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tùy chỉnh hệ số an toàn và kịch bản thời tiết riêng</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => toggleUserPlan('PRO')}
              disabled={isPro}
              className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                isPro
                  ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 cursor-pointer'
              }`}
            >
              {isPro ? 'Đang sử dụng gói PRO' : '⚡ Bấm để nâng cấp PRO ngay (Thử nghiệm)'}
            </button>
          </div>
        </div>
      </div>

      {/* Shop Information & Location Settings Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Thông tin & Cấu hình quán</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cấu hình này ảnh hưởng trực tiếp đến dữ liệu Open-Meteo và độ nhạy thời tiết của mô hình.
          </p>
        </div>

        <form onSubmit={handleSaveShop} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên quán ăn / Quán cà phê
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mô hình kinh doanh
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ShopCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              >
                <option value="HOT_FOOD">Phở, bún, lẩu, súp nóng (Tăng khách khi trời lạnh)</option>
                <option value="COLD_DRINKS">Cà phê, trà sữa, chè, nước giải khát (Tăng khách khi nắng nóng)</option>
                <option value="STREET_FOOD">Quán ăn vặt vỉa hè, ốc, nướng (Nhạy cảm cao với mưa bão)</option>
                <option value="GENERAL_RESTAURANT">Quán cơm văn phòng, nhà hàng tổng hợp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thành phố / Vị trí thời tiết
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              >
                <option value="Hà Nội">Hà Nội (21.02°B, 105.85°Đ)</option>
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh (10.77°B, 106.70°Đ)</option>
                <option value="Đà Nẵng">Đà Nẵng (16.05°B, 108.20°Đ)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Baseline lượng khách mặc định
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={defaultBaseline}
                onChange={(e) => setDefaultBaseline(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Dùng khi chưa có đủ 3 ngày dữ liệu doanh thu
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hệ số dự phòng an toàn
              </label>
              <select
                value={bufferFactor}
                onChange={(e) => setBufferFactor(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-mono"
              >
                <option value="0.05">5% (Tiết kiệm tối đa)</option>
                <option value="0.10">10% (Khuyến nghị chuẩn F&B)</option>
                <option value="0.15">15% (An toàn cao)</option>
                <option value="0.20">20% (Dành cho dịp lễ)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt quán'}
            </button>
          </div>
        </form>
      </div>

      {/* Vietnam Holidays Reference */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span>Lịch ngày lễ & Hệ số kích hoạt tự động (Việt Nam)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Các ngày lễ lớn tại Việt Nam sẽ tự động kích hoạt hệ số nhân lượng khách trên bản Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIETNAM_NATIONAL_HOLIDAYS.map((holiday, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{holiday.name}</span>
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  +{Math.round((holiday.multiplier - 1) * 100)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {holiday.startDate} {holiday.startDate !== holiday.endDate ? `đến ${holiday.endDate}` : ''}
              </div>
              <p className="text-[11px] text-slate-600 pt-0.5">
                {holiday.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
