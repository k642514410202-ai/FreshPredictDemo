import React, { useState } from 'react';
import {
  Users,
  ShoppingCart,
  CloudRain,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Activity,
  Layers,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { WeatherIcon } from '../WeatherIcon';

export const DashboardTab: React.FC = () => {
  const {
    currentShop,
    forecast,
    purchaseSuggestions,
    revenueEntries,
    revenueStats,
    setActiveTab,
    setHorizonDays,
    currentUser,
  } = useApp();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [trendViewMode, setTrendViewMode] = useState<'timeline' | 'cycle'>('timeline');

  const tomorrowForecast = forecast.length > 0 ? forecast[0] : null;
  const urgentItems = purchaseSuggestions.filter((s) => s.isUrgentStock);
  const totalTomorrowCost = purchaseSuggestions.reduce((sum, item) => sum + item.estimatedCost, 0);

  // Format currency
  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const chartData = forecast.slice(0, 7).map((f) => ({
    name: f.dayOfWeekName.replace('Thứ ', 'T'),
    fullDay: f.dayOfWeekName,
    date: f.date.split('-').slice(1).reverse().join('/'),
    customers: f.predictedCustomers,
    lower: f.lowerBound,
    upper: f.upperBound,
    temp: f.weather.temperatureAvg,
    rainPop: f.weather.precipitationProbability,
    weatherDesc: f.weather.weatherDescription,
  }));

  const activeDay = forecast[selectedDayIndex] || tomorrowForecast;

  // 30-Day Trend Analysis Computation
  const last30DaysEntries = [...revenueEntries].slice(0, 30).reverse();

  const trendTimelineData = last30DaysEntries.map((e) => {
    const d = new Date(e.date);
    const dow = d.getDay();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const isWeekend = dow === 0 || dow === 6;

    return {
      date: e.date.split('-').slice(1).reverse().join('/'),
      fullDate: e.date,
      dayName: dayNames[dow],
      customers: e.customerCount,
      revenue: e.revenue,
      notes: e.notes,
      weatherSummary: e.weatherSummary,
      isWeekend,
    };
  });

  const total30Cust = last30DaysEntries.reduce((s, e) => s + e.customerCount, 0);
  const avg30Cust = last30DaysEntries.length > 0 ? Math.round(total30Cust / last30DaysEntries.length) : 0;

  // Day of week cycle breakdown (Thứ 2 đến Chủ Nhật)
  const dowAgg: Record<number, { sum: number; count: number; name: string }> = {
    1: { sum: 0, count: 0, name: 'Thứ 2' },
    2: { sum: 0, count: 0, name: 'Thứ 3' },
    3: { sum: 0, count: 0, name: 'Thứ 4' },
    4: { sum: 0, count: 0, name: 'Thứ 5' },
    5: { sum: 0, count: 0, name: 'Thứ 6' },
    6: { sum: 0, count: 0, name: 'Thứ 7' },
    0: { sum: 0, count: 0, name: 'Chủ Nhật' },
  };

  for (const e of last30DaysEntries) {
    const dow = new Date(e.date).getDay();
    if (dowAgg[dow]) {
      dowAgg[dow].sum += e.customerCount;
      dowAgg[dow].count += 1;
    }
  }

  const dowCycleData = [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const item = dowAgg[dow];
    const avg = item.count > 0 ? Math.round(item.sum / item.count) : 0;
    return {
      name: item.name,
      avgCustomers: avg,
      count: item.count,
      isWeekend: dow === 0 || dow === 6,
    };
  });

  const sortedByAvg = [...dowCycleData].sort((a, b) => b.avgCustomers - a.avgCustomers);
  const peakDow = sortedByAvg[0] || { name: 'Thứ 7', avgCustomers: 0 };
  const lowestDow = sortedByAvg[sortedByAvg.length - 1] || { name: 'Thứ 2', avgCustomers: 0 };

  const weekendDays = dowCycleData.filter((d) => d.isWeekend);
  const weekdayDays = dowCycleData.filter((d) => !d.isWeekend);
  const avgWeekend = weekendDays.length > 0
    ? Math.round(weekendDays.reduce((s, d) => s + d.avgCustomers, 0) / weekendDays.length)
    : 0;
  const avgWeekday = weekdayDays.length > 0
    ? Math.round(weekdayDays.reduce((s, d) => s + d.avgCustomers, 0) / weekdayDays.length)
    : 0;
  const weekendUpliftPercent = avgWeekday > 0 ? Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <span>Trung tâm dự báo thông minh</span>
            <span>•</span>
            <span>{currentShop?.city || 'Hà Nội'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {currentShop?.name}
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Tự động tính toán lượng khách dự báo dựa trên dữ liệu bán hàng lịch sử và diễn biến thời tiết Open-Meteo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setHorizonDays(1);
              setActiveTab('purchase');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Lên đơn đi chợ ngày mai</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Khách ngày mai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Khách dự báo ngày mai
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {tomorrowForecast ? `${tomorrowForecast.predictedCustomers} khách` : '—'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">
                {tomorrowForecast ? `${tomorrowForecast.confidenceScore}% tin cậy` : ''}
              </span>
              <span>•</span>
              <span>Dao động {tomorrowForecast?.lowerBound} - {tomorrowForecast?.upperBound}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Thời tiết ngày mai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Thời tiết ngày mai
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              {tomorrowForecast ? (
                <WeatherIcon name={tomorrowForecast.weather.weatherIcon} className="w-5 h-5" />
              ) : (
                <CloudRain className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {tomorrowForecast ? `${tomorrowForecast.weather.temperatureAvg}°C` : '—'}
            </div>
            <div className="text-xs text-slate-600 mt-1 truncate">
              {tomorrowForecast?.weather.weatherDescription || 'Đang cập nhật...'}
              {tomorrowForecast && tomorrowForecast.weather.precipitationProbability > 20 && (
                <span className="text-blue-600 font-semibold ml-1">
                  (Mưa {tomorrowForecast.weather.precipitationProbability}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 3: Chi phí đi chợ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ước tính tiền đi chợ (1 ngày)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 truncate">
              {formatVnd(totalTomorrowCost)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cho {purchaseSuggestions.length} mặt hàng nguyên liệu
            </div>
          </div>
        </div>

        {/* KPI 4: Cảnh báo tồn kho */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cảnh báo tồn kho
            </span>
            <div className={`p-2 rounded-xl ${urgentItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {urgentItems.length > 0 ? (
                <span className="text-rose-600">{urgentItems.length} món</span>
              ) : (
                <span className="text-emerald-600">Đầy đủ</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {urgentItems.length > 0 ? 'Tồn hiện tại không đủ ngày mai!' : 'Tồn kho đủ mức an toàn'}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Cards Carousel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Dự báo 7 ngày tới</span>
            </h2>
            <p className="text-xs text-slate-500">
              Nhấp vào từng ngày để xem giải trình công thức dự báo chi tiết
            </p>
          </div>

          <button
            onClick={() => setActiveTab('forecast')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Xem chi tiết chuyên sâu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.slice(0, 7).map((f, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isTodayOrTomorrow = idx === 0;

            return (
              <div
                key={f.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {f.dayOfWeekName}
                    </span>
                    {isTodayOrTomorrow && (
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Mai
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {f.date.split('-').slice(1).reverse().join('/')}
                  </div>

                  <div className="my-3 flex flex-col items-center justify-center">
                    <WeatherIcon name={f.weather.weatherIcon} className="w-8 h-8" />
                    <span className="text-xs font-semibold text-slate-700 mt-1">
                      {f.weather.temperatureAvg}°C
                    </span>
                    {f.weather.precipitationProbability > 25 && (
                      <span className="text-[10px] text-blue-600 font-bold mt-0.5">
                        ☔ {f.weather.precipitationProbability}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-center">
                  <div className="text-lg font-black text-slate-900">
                    {f.predictedCustomers}
                  </div>
                  <div className="text-[10px] text-slate-500">khách</div>
                  <div className="mt-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        f.confidenceScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.confidenceScore}% tin cậy
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Explanation Box */}
        {activeDay && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-800 text-sm">
                Giải trình dự báo: {activeDay.dayOfWeekName} ({activeDay.date})
              </span>
              <span className="text-slate-600">
                Công thức: <strong>{activeDay.baseline}</strong> (baseline) ×{' '}
                <strong>{activeDay.dayOfWeekMultiplier}x</strong> (thứ) ×{' '}
                <strong>{activeDay.weatherMultiplier}x</strong> (thời tiết){' '}
                {activeDay.holidayMultiplier > 1 && (
                  <>× <strong>{activeDay.holidayMultiplier}x</strong> (lễ hội)</>
                )}{' '}
                ={' '}
                <strong className="text-emerald-700 text-sm">
                  {activeDay.predictedCustomers} khách
                </strong>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-600 pt-1">
              <div>
                <span className="font-semibold text-slate-700">Cơ sở lịch sử: </span>
                {activeDay.explanation.baselineReason}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Yếu tố ngày: </span>
                {activeDay.explanation.dayFactorReason}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Tác động thời tiết: </span>
                {activeDay.explanation.weatherReason}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Biểu đồ xu hướng khách 7 ngày</span>
            </h2>
            <p className="text-xs text-slate-500">
              Đường lượng khách dự báo kèm dải dao động xác suất
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="customerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-emerald-400">
                          {data.fullDay} ({data.date})
                        </div>
                        <div>
                          Dự báo: <strong className="text-base text-white">{data.customers} khách</strong>
                        </div>
                        <div className="text-slate-300">
                          Khoảng dao động: {data.lower} - {data.upper} khách
                        </div>
                        <div className="text-slate-300">
                          Thời tiết: {data.temp}°C, {data.weatherDesc}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#customerGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Analysis Section: 30-Day Customer Patterns & Business Cycle */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Phân Tích Xu Hướng Lượng Khách (Trend Analysis)</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                    30 ngày lịch sử
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khám phá quy luật tiêu dùng, ngày cao điểm và chu kỳ kinh doanh thực tế của quán
                </p>
              </div>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setTrendViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                trendViewMode === 'timeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Chuỗi 30 ngày (Timeline)</span>
            </button>
            <button
              onClick={() => setTrendViewMode('cycle')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                trendViewMode === 'cycle'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Chu kỳ Thứ (T2 - CN)</span>
            </button>
          </div>
        </div>

        {/* 4 Pattern Insight Pill Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Ngày đông khách nhất</span>
            </div>
            <div className="text-lg font-black text-amber-950 mt-1">
              {peakDow.name} (~{peakDow.avgCustomers} khách)
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5">
              Cao điểm phục vụ tuần
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ngày vắng khách nhất
            </div>
            <div className="text-lg font-black text-slate-800 mt-1">
              {lowestDow.name} (~{lowestDow.avgCustomers} khách)
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Đầu tuần cần điều chỉnh định mức
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Tăng trưởng cuối tuần
            </div>
            <div className="text-lg font-black text-emerald-950 mt-1">
              +{weekendUpliftPercent}%
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              Cuối tuần (~{avgWeekend}k) vs Ngày thường (~{avgWeekday}k)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
            <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
              Trung bình khách (30 ngày)
            </div>
            <div className="text-lg font-black text-indigo-950 mt-1">
              {avg30Cust} khách/ngày
            </div>
            <p className="text-[10px] text-indigo-700 mt-0.5">
              Đường chuẩn Baseline của quán
            </p>
          </div>
        </div>

        {/* View 1: 30-Day Timeline BarChart */}
        {trendViewMode === 'timeline' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                  <span>Ngày trong tuần</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                  <span>Cuối tuần (T7, CN)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-400 inline-block" />
                  <span>Ngày mưa rào</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
                  <span>Đường trung bình (Baseline: {avg30Cust})</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendTimelineData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    y={avg30Cust}
                    stroke="#4f46e5"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `TB: ${avg30Cust}`,
                      position: 'insideTopRight',
                      fill: '#4f46e5',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const diffVsAvg = data.customers - avg30Cust;
                        const percentDiff = Math.round((diffVsAvg / avg30Cust) * 100);

                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1">
                              <span className="font-bold text-amber-300">
                                {data.dayName} ({data.date})
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  data.isWeekend ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {data.isWeekend ? 'Cuối tuần' : 'Ngày thường'}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-slate-300">Lượng khách:</span>
                              <strong className="text-sm text-white">{data.customers} khách</strong>
                            </div>

                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-slate-300">So với trung bình:</span>
                              <span
                                className={`font-bold ${
                                  diffVsAvg >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {diffVsAvg >= 0 ? `+${diffVsAvg}` : diffVsAvg} khách ({percentDiff >= 0 ? `+${percentDiff}` : percentDiff}%)
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-slate-300">Doanh thu:</span>
                              <span className="text-emerald-300 font-mono">
                                {formatVnd(data.revenue)}
                              </span>
                            </div>

                            {data.weatherSummary && (
                              <div className="text-[11px] text-blue-300 pt-0.5 border-t border-slate-800">
                                Thời tiết: {data.weatherSummary}
                              </div>
                            )}

                            {data.notes && (
                              <div className="text-[11px] text-slate-400 italic">
                                "{data.notes}"
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                    {trendTimelineData.map((entry, index) => {
                      const isRain = entry.weatherSummary?.toLowerCase().includes('mưa');
                      const fillColor = isRain
                        ? '#60a5fa' // Blue for rainy days
                        : entry.isWeekend
                        ? '#f59e0b' // Amber for weekends
                        : '#10b981'; // Emerald for standard weekdays
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* View 2: Day of Week Cycle BarChart (T2 - CN) */
          <div className="space-y-3">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dowCycleData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    y={avg30Cust}
                    stroke="#4f46e5"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `TB: ${avg30Cust} khách`,
                      position: 'insideTopRight',
                      fill: '#4f46e5',
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const diffPercent = Math.round(((data.avgCustomers - avg30Cust) / avg30Cust) * 100);

                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                            <div className="font-bold text-amber-300 text-sm">{data.name}</div>
                            <div>
                              Lượng khách trung bình: <strong>{data.avgCustomers} khách/ngày</strong>
                            </div>
                            <div className="text-slate-300">
                              Mức chênh lệch:{' '}
                              <strong className={diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {diffPercent >= 0 ? `+${diffPercent}` : diffPercent}%
                              </strong>{' '}
                              so với baseline
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              Thống kê từ {data.count} tuần bán hàng
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgCustomers" name="Khách TB" radius={[6, 6, 0, 0]}>
                    {dowCycleData.map((entry, index) => {
                      const isPeak = entry.name === peakDow.name;
                      const isLowest = entry.name === lowestDow.name;
                      const fillColor = isPeak
                        ? '#ea580c' // Orange for absolute peak
                        : entry.isWeekend
                        ? '#f59e0b' // Amber for weekend
                        : isLowest
                        ? '#94a3b8' // Slate for slowest day
                        : '#10b981'; // Emerald for standard weekdays
                      return <Cell key={`dow-cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Business Cycle Recommendation Footer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Quy luật kinh doanh:</strong> Lượng khách chạm đáy vào <strong>{lowestDow.name}</strong>, sau đó tăng dần đều qua giữa tuần và bùng nổ mạnh nhất vào <strong>{peakDow.name}</strong> (+{weekendUpliftPercent}%).
                </span>
              </div>
              <button
                onClick={() => {
                  setHorizonDays(3);
                  setActiveTab('purchase');
                }}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 shrink-0 underline cursor-pointer"
              >
                Lên đơn đón cao điểm cuối tuần &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Urgent Procurement Banner if any */}
      {urgentItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-950 text-sm">
                Cần đi chợ bổ sung {urgentItems.length} nguyên liệu gấp cho ngày mai!
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Các nguyên liệu như:{' '}
                <strong>{urgentItems.slice(0, 3).map((i) => i.ingredientName).join(', ')}</strong>{' '}
                hiện có tồn kho thấp hơn lượng tiêu thụ dự báo.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setHorizonDays(1);
              setActiveTab('purchase');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer self-start sm:self-auto"
          >
            Xem danh sách đi chợ ngay
          </button>
        </div>
      )}
    </div>
  );
};
