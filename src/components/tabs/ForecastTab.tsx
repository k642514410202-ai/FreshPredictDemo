import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Lock,
  Calendar,
  CloudRain,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  Info,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Calculator,
  Flame,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WeatherIcon } from '../WeatherIcon';

export const ForecastTab: React.FC = () => {
  const { currentShop, forecast, currentUser, toggleUserPlan, isLoading, error } = useApp();

  const [activeHorizon, setActiveHorizon] = useState<number>(7);
  const [testMultiplier, setTestMultiplier] = useState<number>(1.0);
  const [filterOption, setFilterOption] = useState<'all' | 'weekend' | 'rainy'>('all');
  const [selectedFormulaDayIndex, setSelectedFormulaDayIndex] = useState<number>(0);

  const isPro = currentUser?.plan === 'PRO';

  // Selected day for formula inspector (defaults to tomorrow = index 0)
  const selectedFormulaDay =
    forecast.length > 0
      ? forecast[Math.min(selectedFormulaDayIndex, forecast.length - 1)] || forecast[0]
      : null;

  // Filter items
  const filteredForecast = forecast.filter((item) => {
    if (filterOption === 'weekend') return item.dayOfWeek === 0 || item.dayOfWeek === 6;
    if (filterOption === 'rainy') return item.weather.precipitationProbability > 30;
    return true;
  });

  // Intermediate step values for calculation table
  const baselineVal = selectedFormulaDay ? selectedFormulaDay.baseline : 0;
  const dowVal = selectedFormulaDay ? selectedFormulaDay.dayOfWeekMultiplier : 1.0;
  const weatherVal = selectedFormulaDay ? selectedFormulaDay.weatherMultiplier : 1.0;
  const holidayVal = selectedFormulaDay ? selectedFormulaDay.holidayMultiplier : 1.0;

  const step1 = baselineVal;
  const step2 = selectedFormulaDay?.steps?.step2AfterDow ?? Math.round(step1 * dowVal * 100) / 100;
  const step3 = selectedFormulaDay?.steps?.step3AfterWeather ?? Math.round(step2 * weatherVal * 100) / 100;
  const step4 = selectedFormulaDay?.steps?.step4AfterHoliday ?? Math.round(step3 * holidayVal * 100) / 100;
  const finalPredicted = selectedFormulaDay ? selectedFormulaDay.predictedCustomers : 0;

  // Helper to render factor badge with color and arrow
  const renderFactorBadge = (multiplier: number) => {
    if (multiplier > 1.0) {
      const percent = Math.round((multiplier - 1) * 100);
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
          <ArrowUp className="w-3 h-3 text-emerald-600" />
          <span>+{percent}%</span>
        </span>
      );
    }
    if (multiplier < 1.0) {
      const percent = Math.round((1 - multiplier) * 100);
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
          <ArrowDown className="w-3 h-3 text-amber-600" />
          <span>-{percent}%</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 shrink-0">
        <Minus className="w-3 h-3 text-slate-400" />
        <span>1.00x</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>Dự Báo Lượng Khách Chuyên Sâu</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mô hình dự báo khách tự động: Baseline × Hệ số Thứ × Thời tiết Open-Meteo × Lễ hội
          </p>
        </div>

        {/* Horizon Selector (7 Days Free vs 14/30 Days Pro) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveHorizon(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeHorizon === 7
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Ngày (Cơ bản)
          </button>

          <button
            onClick={() => {
              if (!isPro) {
                toggleUserPlan('PRO');
              } else {
                setActiveHorizon(14);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeHorizon === 14 && isPro
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 bg-amber-100 hover:bg-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPro ? '14 - 30 Ngày (PRO)' : 'Mở khóa 30 Ngày'}</span>
            {!isPro && <Lock className="w-3 h-3 text-amber-700" />}
          </button>
        </div>
      </div>

      {/* Pro Teaser Banner if user is Free */}
      {!isPro && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Tính Năng Dự Báo Nâng Cao Dành Cho Gói PRO</span>
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  Khuyến nghị
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tự động tích hợp lịch Tết Nguyên Đán, Giỗ Tổ Hùng Vương, 30/4 - 1/5, Quốc Khánh 2/9,
                dự báo dài hạn đến 30 ngày và cảnh báo sớm biến động thời tiết cực đoan.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleUserPlan('PRO')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer shrink-0"
          >
            Thử nghiệm Gói PRO 1-Click
          </button>
        </div>
      )}

      {/* Upgraded Formula & Real-Data Calculation Engine Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Header & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Công Thức Dự Báo & Minh Bạch Phép Tính Thực Tế</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Dữ liệu thật
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem chi tiết từng bước nhân hệ số thực tế để ra con số khách dự báo cho từng ngày
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto self-start sm:self-auto">
            khách_dự_báo = baseline × hệ_số_thứ × hệ_số_thời_tiết × hệ_số_lễ_hội
          </div>
        </div>

        {/* 1. Date Selector (7 upcoming days) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Chọn ngày xem diễn giải phép tính:</span>
            </label>
            {selectedFormulaDay && (
              <span className="text-xs text-slate-500">
                Đang chọn: <strong>{selectedFormulaDay.dayOfWeekName} ({selectedFormulaDay.date})</strong>
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Đang tính toán mô hình dự báo...</span>
            </div>
          ) : forecast.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chưa có dữ liệu dự báo cho quán. Vui lòng tải lại trang.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {forecast.slice(0, 7).map((item, index) => {
                const isSelected = selectedFormulaDayIndex === index;
                const isTomorrow = index === 0;
                const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                const dateShort = item.date.split('-').slice(1).reverse().join('/');

                return (
                  <button
                    key={item.date}
                    onClick={() => setSelectedFormulaDayIndex(index)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {isTomorrow ? 'Ngày mai' : item.dayOfWeekName.replace('Thứ ', 'T')}
                      </span>
                      {isWeekend && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Cuối tuần
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={isSelected ? 'text-emerald-100' : 'text-slate-500'}>
                        {dateShort}
                      </span>
                      <strong className={`text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.predictedCustomers}
                      </strong>
                    </div>

                    <div
                      className={`text-[10px] flex items-center gap-1 truncate ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      <WeatherIcon name={item.weather?.weatherIcon || 'Sun'} className="w-3 h-3" />
                      <span>{item.weather?.temperatureAvg ?? '--'}°C</span>
                      {item.weather?.precipitationProbability > 30 && <span>☔{item.weather.precipitationProbability}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Four Cards Displaying Real Factor Values of the Selected Day */}
        {selectedFormulaDay && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Baseline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span>1. Baseline (Cơ sở)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      Gốc
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {baselineVal} <span className="text-xs font-semibold text-slate-500">khách/ngày</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Nguồn dữ liệu: </span>
                  {selectedFormulaDay.baselineOrigin || selectedFormulaDay.explanation.baselineReason}
                </div>
              </div>

              {/* Card 2: Day of Week Multiplier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span>2. Hệ số thứ</span>
                    {renderFactorBadge(dowVal)}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                    <span>{dowVal.toFixed(2)}x</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({selectedFormulaDay.dayOfWeekName})
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Đặc điểm: </span>
                  {selectedFormulaDay.explanation.dayFactorReason}
                </div>
              </div>

              {/* Card 3: Weather Multiplier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span>3. Thời tiết</span>
                    {renderFactorBadge(weatherVal)}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                    <span>{weatherVal.toFixed(2)}x</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({selectedFormulaDay.weather?.temperatureAvg ?? '--'}°C)
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <div className="truncate">
                    <span className="font-semibold text-slate-700">Điều kiện: </span>
                    {selectedFormulaDay.weather?.weatherDescription || 'Chưa có dữ liệu'}
                    {selectedFormulaDay.weather && ` (mưa ${selectedFormulaDay.weather.precipitationProbability}%, ${selectedFormulaDay.weather.precipitationSum}mm)`}
                  </div>
                  <div className="mt-0.5 text-slate-500 italic">
                    {selectedFormulaDay.explanation.weatherReason || 'Thời tiết ổn định'}
                  </div>
                </div>
              </div>

              {/* Card 4: Holiday & Events Multiplier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span>4. Lễ hội & Sự kiện</span>
                    {renderFactorBadge(holidayVal)}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                    <span>{holidayVal.toFixed(2)}x</span>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">
                      {selectedFormulaDay.holidayName || 'Ngày thường'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Tác động: </span>
                  {selectedFormulaDay.holidayName
                    ? `${selectedFormulaDay.holidayName} (áp dụng hệ số ${holidayVal.toFixed(2)}x)`
                    : 'Không có sự kiện → 1.00x'}
                </div>
              </div>
            </div>

            {/* 3. Step-by-Step Calculation Table (Cách tính ra số khách) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm tracking-wide text-white">
                    Bảng Phép Tính Từng Bước (Cách tính ra {finalPredicted} khách ngày {selectedFormulaDay.date})
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Thực thi tự động từ logic lõi <code className="text-emerald-400 font-mono">lib/forecast.ts</code>
                </span>
              </div>

              {/* Step Multiplication Rows */}
              <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                {/* Row 1: Baseline */}
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-500 font-mono font-bold">B1</span>
                    <div>
                      <span className="text-white font-semibold">Baseline xuất phát điểm</span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        ({selectedFormulaDay.baselineOrigin || 'Từ lịch sử quán'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                    <span className="text-slate-300 font-bold">{step1}</span>
                    <span className="text-emerald-400 font-semibold">→ {step1.toFixed(2)} khách</span>
                  </div>
                </div>

                {/* Row 2: Day of Week */}
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-500 font-mono font-bold">B2</span>
                    <div>
                      <span className="text-white font-semibold">
                        × Hệ số thứ ({selectedFormulaDay.dayOfWeekName})
                      </span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        ({dowVal > 1.0 ? 'ngày đông khách cuối tuần' : dowVal < 1.0 ? 'ngày đầu tuần vắng hơn' : 'bình quân'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        dowVal > 1.0
                          ? 'text-emerald-400'
                          : dowVal < 1.0
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {dowVal > 1.0 ? '↑' : dowVal < 1.0 ? '↓' : '='} {dowVal.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-semibold">→ {step2.toFixed(2)} khách</span>
                  </div>
                </div>

                {/* Row 3: Weather */}
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-500 font-mono font-bold">B3</span>
                    <div>
                      <span className="text-white font-semibold">× Hệ số thời tiết</span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        ({selectedFormulaDay.weather ? `${selectedFormulaDay.weather.temperatureAvg}°C, ${selectedFormulaDay.weather.weatherDescription}` : 'Chưa có dữ liệu thời tiết'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        weatherVal > 1.0
                          ? 'text-emerald-400'
                          : weatherVal < 1.0
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {weatherVal > 1.0 ? '↑' : weatherVal < 1.0 ? '↓' : '='} {weatherVal.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-semibold">→ {step3.toFixed(2)} khách</span>
                  </div>
                </div>

                {/* Row 4: Holiday & Events */}
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-500 font-mono font-bold">B4</span>
                    <div>
                      <span className="text-white font-semibold">× Hệ số lễ hội & sự kiện</span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        ({selectedFormulaDay.holidayName || 'Không có sự kiện → 1.00'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        holidayVal > 1.0
                          ? 'text-emerald-400'
                          : holidayVal < 1.0
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {holidayVal > 1.0 ? '↑' : holidayVal < 1.0 ? '↓' : '='} {holidayVal.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-semibold">→ {step4.toFixed(2)} khách</span>
                  </div>
                </div>
              </div>

              {/* Final Result Summary Box */}
              <div className="pt-3 border-t-2 border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30">
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
                    Kết Quả Dự Báo Chính Thức ({selectedFormulaDay.dayOfWeekName}, {selectedFormulaDay.date})
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                    <span>Làm tròn từ <strong>{step4.toFixed(2)} khách</strong></span>
                    <span>•</span>
                    <span>Khoảng dao động (±12%): <strong>{selectedFormulaDay.lowerBound} – {selectedFormulaDay.upperBound} khách</strong></span>
                    <span>•</span>
                    <span className="text-emerald-300 font-semibold">Độ tin cậy: {selectedFormulaDay.confidenceScore}%</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 self-start sm:self-auto">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 drop-shadow-sm font-mono">
                    {finalPredicted}
                  </span>
                  <span className="text-sm font-bold text-emerald-200 uppercase">khách</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Lọc danh sách:</span>
        <button
          onClick={() => setFilterOption('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterOption === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Tất cả các ngày
        </button>
        <button
          onClick={() => setFilterOption('weekend')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterOption === 'weekend'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Chỉ cuối tuần (T7, CN)
        </button>
        <button
          onClick={() => setFilterOption('rainy')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterOption === 'rainy'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Ngày có khả năng mưa &gt;30%
        </button>
      </div>

      {/* Detailed Forecast Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Ngày / Thứ</th>
                <th className="py-3.5 px-4">Thời tiết Open-Meteo</th>
                <th className="py-3.5 px-4 text-center">Baseline</th>
                <th className="py-3.5 px-4 text-center">Hệ số Thứ</th>
                <th className="py-3.5 px-4 text-center">Hệ số Thời tiết</th>
                <th className="py-3.5 px-4 text-center">Lễ hội / Sự kiện</th>
                <th className="py-3.5 px-4 text-right">Khách dự báo</th>
                <th className="py-3.5 px-4 text-center">Độ tin cậy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForecast.map((f, index) => {
                const isWeekend = f.dayOfWeek === 0 || f.dayOfWeek === 6;
                const isRainy = f.weather.precipitationProbability > 40;

                return (
                  <tr
                    key={f.date}
                    className={`hover:bg-slate-50/80 transition ${
                      isWeekend ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {f.dayOfWeekName}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {f.date.split('-').slice(1).reverse().join('/')}
                        {index === 0 && (
                          <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Ngày mai
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <WeatherIcon name={f.weather.weatherIcon} className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {f.weather.temperatureAvg}°C ({f.weather.temperatureMin}° - {f.weather.temperatureMax}°)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {f.weather.weatherDescription}
                            {f.weather.precipitationProbability > 0 && (
                              <span className={`ml-1 font-semibold ${isRainy ? 'text-blue-600' : 'text-slate-400'}`}>
                                • Mưa {f.weather.precipitationProbability}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                      {f.baseline}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          f.dayOfWeekMultiplier > 1.1
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.dayOfWeekMultiplier < 0.95
                            ? 'bg-slate-100 text-slate-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {f.dayOfWeekMultiplier.toFixed(2)}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          f.weatherMultiplier > 1.05
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.weatherMultiplier < 0.9
                            ? 'bg-rose-100 text-rose-800'
                            : 'text-slate-700'
                        }`}
                        title={f.explanation.weatherReason}
                      >
                        {f.weatherMultiplier.toFixed(2)}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {f.holidayMultiplier > 1 ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {f.holidayName || 'Ngày Lễ'} ({f.holidayMultiplier.toFixed(2)}x)
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="text-base font-black text-slate-900">
                        {f.predictedCustomers}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {f.lowerBound} - {f.upperBound}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-1 rounded-full text-[10px] ${
                          f.confidenceScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.confidenceScore}%
                      </span>
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
