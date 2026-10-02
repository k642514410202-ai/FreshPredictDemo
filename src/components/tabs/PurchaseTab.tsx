import React, { useState } from 'react';
import {
  ShoppingCart,
  Printer,
  Download,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PurchaseTab: React.FC = () => {
  const {
    currentShop,
    purchaseSuggestions,
    horizonDays,
    setHorizonDays,
    forecast,
    showToast,
  } = useApp();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const totalCost = purchaseSuggestions.reduce((sum, item) => sum + item.estimatedCost, 0);
  const itemsToBuy = purchaseSuggestions.filter((s) => s.suggestedPurchase > 0);
  const totalPredictedCustomers = forecast
    .slice(0, horizonDays)
    .reduce((sum, f) => sum + f.predictedCustomers, 0);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const allChecked = itemsToBuy.every((i) => checkedItems[i.ingredientId]);
    const nextState: Record<string, boolean> = {};
    if (!allChecked) {
      itemsToBuy.forEach((i) => {
        nextState[i.ingredientId] = true;
      });
    }
    setCheckedItems(nextState);
  };

  // Export CSV
  const exportCsv = () => {
    const headers = [
      'Tên Nguyên Liệu',
      'Đơn Vị',
      'Tồn Kho',
      'Lượng Dùng Dự Báo',
      'Số Lượng Cần Mua',
      'Đơn Giá (VNĐ)',
      'Thành Tiền (VNĐ)',
      'Hạn Sử Dụng (Ngày)',
      'Ghi Chú',
    ];

    const rows = purchaseSuggestions.map((item) => [
      `"${item.ingredientName}"`,
      item.unit,
      item.currentStock,
      item.bufferedConsumption,
      item.suggestedPurchase,
      item.unitPrice,
      item.estimatedCost,
      item.shelfLifeDays,
      item.isUrgentStock ? 'CẦN GẤP' : item.isLimitedByShelfLife ? 'Giới hạn theo HSD' : 'Bình thường',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Danh_Sach_Di_Cho_${currentShop?.name.replace(/\s+/g, '_')}_${horizonDays}ngay.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file CSV danh sách đi chợ');
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <span>Danh Sách Đi Chợ & Gợi Ý Nguyên Liệu</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tự động cân đối nhu cầu theo khách dự báo, trừ tồn kho và hạn mức bảo quản tươi sống.
          </p>
        </div>

        {/* Horizon Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setHorizonDays(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizonDays === 1
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ngày Mai (1 Ngày)
          </button>
          <button
            onClick={() => setHorizonDays(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizonDays === 3
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3 Ngày Tới
          </button>
          <button
            onClick={() => setHorizonDays(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizonDays === 7
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Ngày Tới
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tổng chi phí ước tính
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {formatVnd(totalCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Cho {itemsToBuy.length}/{purchaseSuggestions.length} nguyên liệu cần nhập
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Khách dự báo phục vụ
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {totalPredictedCustomers} khách
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Khoảng thời gian {horizonDays} ngày (+{Math.round((currentShop?.bufferFactor || 0.1) * 100)}% dự phòng)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Thao tác nhanh
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={exportCsv}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logic Documentation Note */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Công thức gợi ý mua:</strong>{' '}
          <code>cần_mua = khách_dự_báo × định_mức × (1 + hệ_số_dự_phòng) − tồn_kho_hiện_tại</code>.{' '}
          Hệ thống <strong>không gợi ý mua vượt quá hạn sử dụng</strong> để tránh hỏng lãng phí, và tự động làm tròn lên theo quy cách đóng gói hợp lý.
        </div>
      </div>

      {/* Shopping List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAll}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              {itemsToBuy.every((i) => checkedItems[i.ingredientId]) ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Chọn / Bỏ chọn tất cả</span>
            </button>
          </div>
          <span className="text-xs text-slate-400">
            Đã tích {Object.values(checkedItems).filter(Boolean).length}/{itemsToBuy.length} mặt hàng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center print:hidden">Xong</th>
                <th className="py-3.5 px-4">Tên nguyên liệu</th>
                <th className="py-3.5 px-4 text-center">Tồn kho hiện tại</th>
                <th className="py-3.5 px-4 text-center">Dự kiến dùng ({horizonDays} ngày)</th>
                <th className="py-3.5 px-4 text-center font-bold text-emerald-800">Cần mua</th>
                <th className="py-3.5 px-4 text-center">HSD bảo quản</th>
                <th className="py-3.5 px-4 text-right">Đơn giá</th>
                <th className="py-3.5 px-4 text-right">Thành tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseSuggestions.map((item) => {
                const isChecked = !!checkedItems[item.ingredientId];
                const needsBuy = item.suggestedPurchase > 0;

                return (
                  <tr
                    key={item.ingredientId}
                    className={`hover:bg-slate-50/80 transition ${
                      isChecked ? 'bg-slate-50/60 opacity-60' : ''
                    } ${item.isUrgentStock ? 'bg-rose-50/20' : ''}`}
                  >
                    <td className="py-3 px-4 text-center print:hidden">
                      <button
                        onClick={() => toggleCheck(item.ingredientId)}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className={`font-bold text-slate-900 text-sm ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {item.ingredientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Định mức: {item.dailyUsagePerCustomer} {item.unit}/khách
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {item.currentStock} {item.unit}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {item.bufferedConsumption} {item.unit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {needsBuy ? (
                        <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          +{item.suggestedPurchase} {item.unit}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Đã đủ</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                          item.shelfLifeDays <= 2
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : item.shelfLifeDays <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.shelfLifeDays} ngày</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatVnd(item.unitPrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatVnd(item.estimatedCost)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.isUrgentStock ? (
                        <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hết mai</span>
                        </span>
                      ) : item.isLimitedByShelfLife ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]" title="Đã giới hạn để không mua thừa quá hạn sử dụng">
                          Chạm trần HSD
                        </span>
                      ) : needsBuy ? (
                        <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded text-[10px]">
                          Cần mua
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Tồn đủ</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
