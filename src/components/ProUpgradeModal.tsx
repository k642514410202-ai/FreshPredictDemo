import React from 'react';
import { X, Sparkles, Check, Zap, Calendar, Bell, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { toggleUserPlan, currentUser } = useApp();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    await toggleUserPlan('PRO');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nâng tầm quán ăn của bạn</span>
          </div>

          <h2 className="text-2xl font-black mt-2">FreshPredict PRO</h2>
          <p className="text-amber-100 text-xs mt-1 max-w-sm">
            Tối ưu hóa lợi nhuận, dự báo khách chính xác tuyệt đối và loại bỏ hoàn toàn lãng phí thực phẩm tươi sống.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">199.000 đ</span>
            <span className="text-xs text-amber-200 font-medium">/ tháng (giả lập thanh toán)</span>
          </div>
        </div>

        {/* Feature list */}
        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Dự báo dài hạn 30 - 90 ngày</div>
                <p className="text-slate-500 text-[11px]">
                  Lên kế hoạch nhập hàng số lượng lớn, đàm phán giá tốt với nhà cung cấp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Tự động bù trừ dịp Lễ & Tết Việt Nam</div>
                <p className="text-slate-500 text-[11px]">
                  Tích hợp sẵn lịch Tết Nguyên Đán, Giỗ Tổ Hùng Vương, 30/4 - 1/5, Quốc Khánh 2/9.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Hệ thống cảnh báo tồn kho & hạn sử dụng</div>
                <p className="text-slate-500 text-[11px]">
                  Tự động thông báo khi nguyên liệu tươi sống (bánh phở, thịt tươi, sữa) sắp hết hoặc chạm hạn dùng.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Xuất file CSV danh sách đi chợ & In ấn</div>
                <p className="text-slate-500 text-[11px]">
                  Xuất bảng đi chợ cho nhân viên, in phiếu mua hàng rõ ràng, chi tiết từng định mức.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Để sau
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nâng cấp PRO Ngay (1-Click Miễn Phí)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
