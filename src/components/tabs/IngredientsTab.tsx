import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Ingredient } from '@/lib/types';
import { IngredientModal } from '../IngredientModal';

export const IngredientsTab: React.FC = () => {
  const { ingredients, deleteIngredient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const categories = Array.from(new Set(ingredients.map((i) => i.category || 'Khác')));

  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${name}"?`)) {
      await deleteIngredient(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>Quản Lý Nguyên Liệu & Tồn Kho</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Định mức sử dụng trên mỗi khách, hạn sử dụng bảo quản và đơn giá mua vào.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nguyên liệu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({ingredients.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tên nguyên liệu</th>
                <th className="py-3.5 px-4">Nhóm</th>
                <th className="py-3.5 px-4 text-center">Tồn kho hiện tại</th>
                <th className="py-3.5 px-4 text-center">Định mức / 1 khách</th>
                <th className="py-3.5 px-4 text-center">Hạn bảo quản</th>
                <th className="py-3.5 px-4 text-right">Đơn giá</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy nguyên liệu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((item) => {
                  const isLow =
                    item.minStockAlert && item.currentStock <= item.minStockAlert;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.name}
                        </div>
                        {isLow && (
                          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Tồn kho chạm ngưỡng tối thiểu ({item.minStockAlert} {item.unit})</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {item.category || 'Chưa phân nhóm'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-sm font-bold text-slate-800">
                          {item.currentStock} {item.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {item.usagePerCustomer} {item.unit} / khách
                      </td>

                      <td className="py-3.5 px-4 text-center">
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

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                        {formatVnd(item.unitPrice)}
                        <span className="text-slate-400 text-[10px]">/{item.unit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingredient Modal for Create / Edit */}
      {isModalOpen && (
        <IngredientModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
