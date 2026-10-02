import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ingredient } from '@/lib/types';

interface IngredientModalProps {
  isOpen: boolean;
  initialData: Ingredient | null;
  onClose: () => void;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  initialData,
  onClose,
}) => {
  const { saveIngredient, updateIngredient } = useApp();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState<number>(50000);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(3);
  const [currentStock, setCurrentStock] = useState<number>(5);
  const [usagePerCustomer, setUsagePerCustomer] = useState<number>(0.1);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [category, setCategory] = useState('Rau củ tươi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUnit(initialData.unit);
      setUnitPrice(initialData.unitPrice);
      setShelfLifeDays(initialData.shelfLifeDays);
      setCurrentStock(initialData.currentStock);
      setUsagePerCustomer(initialData.usagePerCustomer);
      setMinStockAlert(initialData.minStockAlert || 0);
      setCategory(initialData.category || 'Khác');
    } else {
      setName('');
      setUnit('kg');
      setUnitPrice(50000);
      setShelfLifeDays(3);
      setCurrentStock(5);
      setUsagePerCustomer(0.1);
      setMinStockAlert(2);
      setCategory('Rau củ tươi');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên nguyên liệu');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      unit: unit.trim(),
      unitPrice: Number(unitPrice),
      shelfLifeDays: Number(shelfLifeDays),
      currentStock: Number(currentStock),
      usagePerCustomer: Number(usagePerCustomer),
      minStockAlert: Number(minStockAlert),
      category,
    };

    try {
      if (initialData) {
        await updateIngredient(initialData.id, payload);
      } else {
        await saveIngredient(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu nguyên liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {initialData ? 'Sửa thông tin nguyên liệu' : 'Thêm nguyên liệu mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên nguyên liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bánh phở tươi, Thịt bò tái..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đơn vị tính <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Gram)</option>
                <option value="lít">lít (Lít)</option>
                <option value="cái">cái (Cái/Quả)</option>
                <option value="hộp">hộp (Hộp/Lon)</option>
                <option value="bó">bó (Bó)</option>
                <option value="gói">gói (Gói/Túi)</option>
                <option value="bao">bao (Bao)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nhóm danh mục
              </label>
              <input
                type="text"
                placeholder="Thịt, Rau củ, Gia vị..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đơn giá nhập vào (VNĐ / {unit})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn sử dụng bảo quản (ngày) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tồn kho hiện tại ({unit})
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Định mức / 1 khách ({unit})
              </label>
              <input
                type="number"
                min="0.001"
                step="0.005"
                value={usagePerCustomer}
                onChange={(e) => setUsagePerCustomer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngưỡng cảnh báo tồn ({unit})
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm nguyên liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
