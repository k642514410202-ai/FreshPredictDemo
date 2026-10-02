import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { RevenueEntry } from '@/lib/types';

export const RevenueTab: React.FC = () => {
  const {
    revenueEntries,
    revenueStats,
    saveRevenueEntry,
    deleteRevenueEntry,
    showToast,
  } = useApp();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [revenueInput, setRevenueInput] = useState<string>('8500000');
  const [customerInput, setCustomerInput] = useState<string>('165');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'7' | '30' | 'all'>('30');

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filter entries
  const filteredEntries = [...revenueEntries]
    .filter((_, idx) => {
      if (timeFilter === '7') return idx < 7;
      if (timeFilter === '30') return idx < 30;
      return true;
    });

  // Chart data (chronological)
  const chartData = [...filteredEntries]
    .reverse()
    .map((e) => ({
      date: e.date.split('-').slice(1).reverse().join('/'),
      revenue: Math.round(e.revenue / 1000), // in thousand VNĐ
      customers: e.customerCount,
      notes: e.notes,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rev = parseFloat(revenueInput.replace(/,/g, ''));
    const cust = parseInt(customerInput, 10);

    if (isNaN(rev) || rev < 0) {
      showToast('❌ Vui lòng nhập số doanh thu hợp lệ');
      return;
    }
    if (isNaN(cust) || cust < 0) {
      showToast('❌ Vui lòng nhập số lượng khách hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveRevenueEntry({
        date,
        revenue: rev,
        customerCount: cust,
        notes: notes.trim() || undefined,
      });
      setNotes('');
    } catch (err) {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, entryDate: string) => {
    if (confirm(`Bạn có chắc muốn xóa bản ghi doanh thu ngày ${entryDate}?`)) {
      await deleteRevenueEntry(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" />
          <span>Nhập & Báo Cáo Doanh Thu Thực Tế</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu nhập vào sẽ tự động cập nhật hệ số baseline và phân tích thói quen khách theo thứ.
        </p>
      </div>

      {/* Input Form & KPI Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Ghi nhận ngày bán hàng</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày bán hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Doanh thu trong ngày (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                required
                placeholder="Ví dụ: 8500000"
                value={revenueInput}
                onChange={(e) => setRevenueInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-mono font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Tương đương: {formatVnd(Number(revenueInput) || 0)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số lượng khách thực tế <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="Ví dụ: 165"
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ghi chú ngày bán (tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Mưa rào cả ngày, cuối tuần khách du lịch đông..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white transition text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu doanh thu & Cập nhật mô hình'}
            </button>
          </form>
        </div>

        {/* 6 KPI Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Tổng doanh thu ({filteredEntries.length} ngày)
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
              {formatVnd(revenueStats?.totalRevenue || 0)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Lũy kế lịch sử quán</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Tổng lượng khách
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
              {revenueStats?.totalCustomers?.toLocaleString('vi-VN') || 0} khách
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Đã phục vụ</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Doanh thu TB / ngày
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
              {formatVnd(revenueStats?.avgDailyRevenue || 0)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Bình quân mỗi ngày</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Khách TB / ngày (Baseline)
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
              {revenueStats?.avgDailyCustomers || 0} khách
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1">Dùng cho thuật toán</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Ngày tốt nhất</span>
            </span>
            <div className="text-lg font-bold text-slate-900 mt-2 truncate">
              {revenueStats?.bestDay ? `${revenueStats.bestDay.customerCount} khách` : '—'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              {revenueStats?.bestDay?.date} ({formatVnd(revenueStats?.bestDay?.revenue || 0)})
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày thấp nhất</span>
            </span>
            <div className="text-lg font-bold text-slate-900 mt-2 truncate">
              {revenueStats?.worstDay ? `${revenueStats.worstDay.customerCount} khách` : '—'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              {revenueStats?.worstDay?.date} ({formatVnd(revenueStats?.worstDay?.revenue || 0)})
            </span>
          </div>
        </div>
      </div>

      {/* Composed Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Biểu đồ doanh thu & số lượng khách theo ngày</span>
            </h2>
            <p className="text-xs text-slate-500">
              Cột xanh: Doanh thu (nghìn VNĐ) | Đường tím: Số lượng khách
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setTimeFilter('7')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeFilter === '7' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('30')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeFilter === '30' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                timeFilter === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả ({revenueEntries.length} ngày)
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}tr`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#7c3aed' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-emerald-400">Ngày {data.date}</div>
                        <div>
                          Doanh thu: <strong>{(data.revenue * 1000).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div>
                          Lượng khách: <strong className="text-purple-300">{data.customers} khách</strong>
                        </div>
                        {data.notes && (
                          <div className="text-slate-300 text-[11px] italic">"{data.notes}"</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="revenue" name="Doanh thu (nghìn đ)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="customers" name="Số khách" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Lịch sử bán hàng ({filteredEntries.length} ngày gần nhất)
          </h3>
          <span className="text-xs text-slate-400">Nhấn biểu tượng thùng rác để xóa bản ghi</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4 text-right">Doanh thu</th>
                <th className="py-3 px-4 text-center">Số khách</th>
                <th className="py-3 px-4 text-right">TB / khách</th>
                <th className="py-3 px-4">Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {entry.date}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatVnd(entry.revenue)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                    {entry.customerCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {entry.customerCount > 0
                      ? formatVnd(Math.round(entry.revenue / entry.customerCount))
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {entry.notes || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(entry.id, entry.date)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
