/**
 * FreshPredict - Forecasting Engine (lib/forecast.ts)
 * 
 * CORE FORMULA:
 * predicted_customers = Math.round(baseline * dayOfWeekMultiplier * weatherMultiplier * holidayMultiplier)
 * 
 * - baseline:
 *   Average customer count per day calculated from historical revenue/customer records (last 30-60 days).
 *   Falls back to shop.defaultBaseline if insufficient or no historical data.
 * 
 * - dayOfWeekMultiplier (Monday to Sunday):
 *   Computed from historical ratio of average customer count on each specific weekday divided by overall baseline.
 *   Uses default multipliers when history has less than 2 occurrences of that weekday.
 * 
 * - weatherMultiplier:
 *   Composite factor considering precipitation probability, precipitation amount (rain mm), and temperature.
 *   Varies dynamically by shop category (HOT_FOOD vs COLD_DRINKS vs STREET_FOOD vs GENERAL_RESTAURANT).
 * 
 * - holidayMultiplier:
 *   Special boost for national holidays (Tết, 30/4, 2/9, etc.) or custom user promotions.
 */

import { ForecastDayResult, HolidayEvent, RevenueEntry, Shop, WeatherDay } from './types';
import { getHolidayForDate } from './holidays';

// Default day of week multipliers for F&B in Vietnam (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
export const DEFAULT_DAY_MULTIPLIERS: Record<number, number> = {
  0: 1.30, // Chủ Nhật: gia đình đi ăn đông
  1: 0.85, // Thứ Hai: đầu tuần, lượng khách thấp nhất
  2: 0.90, // Thứ Ba: bình thường
  3: 0.95, // Thứ Tư: giữa tuần
  4: 1.00, // Thứ Năm: ổn định
  5: 1.15, // Thứ Sáu: tiệc tùng cuối tuần bắt đầu
  6: 1.35, // Thứ Bảy: cao điểm nhất trong tuần
};

/**
 * Computes baseline customer count from recent historical records
 * If historical records are fewer than 3, falls back to shop.defaultBaseline
 */
export function calculateBaseline(
  history: RevenueEntry[],
  fallbackBaseline: number = 100
): { baseline: number; historyCount: number; isFallback: boolean } {
  if (!history || history.length === 0) {
    return { baseline: fallbackBaseline, historyCount: 0, isFallback: true };
  }

  // Filter valid customer counts (must be > 0)
  const validEntries = history.filter((e) => typeof e.customerCount === 'number' && e.customerCount > 0);
  if (validEntries.length < 3) {
    return { baseline: fallbackBaseline, historyCount: validEntries.length, isFallback: true };
  }

  // Use recent entries (up to last 60 days) with slight weighting towards most recent 14 days
  const sorted = [...validEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentSlice = sorted.slice(0, 60);

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < recentSlice.length; i++) {
    // Weight decreases slightly with age: 1.5 for the first 14 days, 1.0 thereafter
    const weight = i < 14 ? 1.4 : 1.0;
    weightedSum += recentSlice[i].customerCount * weight;
    totalWeight += weight;
  }

  const baseline = Math.round(weightedSum / totalWeight);
  return {
    baseline: Math.max(10, baseline),
    historyCount: validEntries.length,
    isFallback: false,
  };
}

/**
 * Calculates day of week multipliers from historical data.
 * Blends historical ratios with default prior weights for statistical stability.
 */
export function calculateDayOfWeekMultipliers(
  history: RevenueEntry[],
  overallBaseline: number
): Record<number, number> {
  const multipliers: Record<number, number> = { ...DEFAULT_DAY_MULTIPLIERS };

  if (!history || history.length < 14 || overallBaseline <= 0) {
    return multipliers;
  }

  // Group customer counts by day of week (0 to 6)
  const dayGroups: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (const entry of history) {
    if (entry.customerCount > 0) {
      const d = new Date(entry.date);
      const dow = d.getDay();
      dayGroups[dow].push(entry.customerCount);
    }
  }

  for (let dow = 0; dow <= 6; dow++) {
    const counts = dayGroups[dow];
    if (counts.length >= 2) {
      const dayAverage = counts.reduce((sum, c) => sum + c, 0) / counts.length;
      const observedRatio = dayAverage / overallBaseline;

      // Bayesian smoothing: blend observed with default prior
      const defaultPrior = DEFAULT_DAY_MULTIPLIERS[dow];
      const weight = Math.min(counts.length / 8, 0.85); // Up to 85% observed weight
      const blended = observedRatio * weight + defaultPrior * (1 - weight);

      // Clamp multiplier between 0.50 and 2.00 to avoid extreme outliers
      multipliers[dow] = Math.round(Math.min(2.0, Math.max(0.5, blended)) * 100) / 100;
    }
  }

  return multipliers;
}

/**
 * Computes the weather multiplier based on precipitation and temperature
 * according to the shop's business category.
 */
export function calculateWeatherMultiplier(
  weather: WeatherDay,
  category: Shop['category'] = 'HOT_FOOD'
): { multiplier: number; reason: string } {
  let rainFactor = 1.0;
  let tempFactor = 1.0;
  const reasons: string[] = [];

  // --- Rain Impact ---
  const pop = weather.precipitationProbability;
  const rainMm = weather.precipitationSum;

  if (category === 'STREET_FOOD') {
    // Street food stalls suffer heavily in rain
    if (pop > 75 || rainMm > 10) {
      rainFactor = 0.50;
      reasons.push('Mưa to/khả năng mưa cao ảnh hưởng nặng quán vỉa hè (-50%)');
    } else if (pop > 40 || rainMm > 3) {
      rainFactor = 0.70;
      reasons.push('Trời có mưa làm giảm khách ngồi ngoài trời (-30%)');
    } else if (pop > 20 || rainMm > 0.5) {
      rainFactor = 0.88;
      reasons.push('Mưa rào nhẹ rải rác (-12%)');
    }
  } else {
    // Indoor/semi-indoor dining (Hot Food, Cafe, General)
    if (pop > 80 || rainMm > 15) {
      rainFactor = 0.75;
      reasons.push('Mưa lớn kéo dài làm giảm khách đi lại (-25%)');
    } else if (pop > 50 || rainMm > 5) {
      rainFactor = 0.85;
      reasons.push('Khả năng mưa rào vừa (-15%)');
    } else if (pop > 25 || rainMm > 1) {
      rainFactor = 0.94;
      reasons.push('Mưa lất phất nhẹ (-6%)');
    }
  }

  // --- Temperature Impact ---
  const avgTemp = weather.temperatureAvg;

  if (category === 'HOT_FOOD') {
    // Phở, bún, lẩu, cháo: cold weather boosts appetite significantly!
    if (avgTemp <= 18) {
      tempFactor = 1.25;
      reasons.push(`Trời se lạnh (${avgTemp}°C) kích thích ăn món nước nóng (+25%)`);
    } else if (avgTemp <= 23) {
      tempFactor = 1.12;
      reasons.push(`Nhiệt độ mát mẻ (${avgTemp}°C) thuận lợi cho món nóng (+12%)`);
    } else if (avgTemp >= 35) {
      tempFactor = 0.90;
      reasons.push(`Nắng nóng gắt (${avgTemp}°C) làm giảm nhu cầu ăn món nóng (-10%)`);
    }
  } else if (category === 'COLD_DRINKS') {
    // Cafe, milk tea, juice: hot weather surges demand!
    if (avgTemp >= 34) {
      tempFactor = 1.25;
      reasons.push(`Trời nắng nóng oi bức (${avgTemp}°C), nhu cầu đồ giải khát tăng vọt (+25%)`);
    } else if (avgTemp >= 29) {
      tempFactor = 1.10;
      reasons.push(`Thời tiết ấm áp (${avgTemp}°C) hút khách uống đồ lạnh (+10%)`);
    } else if (avgTemp <= 20) {
      tempFactor = 0.80;
      reasons.push(`Trời trở lạnh (${avgTemp}°C) làm giảm lượng uống đồ lạnh (-20%)`);
    }
  } else if (category === 'STREET_FOOD') {
    if (avgTemp >= 36) {
      tempFactor = 0.85;
      reasons.push(`Quá nóng bức (${avgTemp}°C) khiến khách ngại ngồi vỉa hè (-15%)`);
    } else if (avgTemp >= 22 && avgTemp <= 30 && rainFactor >= 0.95) {
      tempFactor = 1.08;
      reasons.push(`Thời tiết mát mẻ lý tưởng tụ tập vỉa hè (+8%)`);
    }
  }

  const combined = Math.round(rainFactor * tempFactor * 100) / 100;
  // Ensure sanity bounds (multiplier between 0.40 and 1.60)
  const clampedMultiplier = Math.min(1.60, Math.max(0.40, combined));

  return {
    multiplier: clampedMultiplier,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Thời tiết ôn hòa thuận lợi',
  };
}

/**
 * Computes prediction confidence score (0 to 100%)
 */
export function calculateConfidenceScore(
  historyCount: number,
  daysIntoFuture: number,
  precipitationProbability: number
): number {
  // Base from historical data completeness (up to 50 pts)
  const historyScore = Math.min(50, Math.max(15, (historyCount / 30) * 50));

  // Day horizon penalty: closest days are most accurate (up to 40 pts)
  // Day 0: 40 pts, Day 7: 25 pts, Day 30: 10 pts
  const horizonScore = Math.max(10, 40 - daysIntoFuture * 1.5);

  // Weather certainty factor (up to 10 pts)
  // High rain chance with moderate variance lowers score slightly
  const weatherScore = precipitationProbability > 70 ? 7 : 10;

  return Math.round(Math.min(98, Math.max(40, historyScore + horizonScore + weatherScore)));
}

/**
 * Tham số đầu vào cho việc tính lượng khách dự báo
 */
export interface ForecastCalculationParams {
  baseline: number;
  dayOfWeekMultiplier: number;
  weatherMultiplier: number;
  holidayMultiplier?: number;
}

export interface ForecastCalculationResult {
  predictedCustomers: number;
  rawPredicted: number;
  lowerBound: number;
  upperBound: number;
  step1Baseline: number;
  step2AfterDow: number;
  step3AfterWeather: number;
  step4AfterHoliday: number;
}

/**
 * Tính toán lượng khách dự báo theo đúng công thức chuẩn:
 * khách_dự_báo = baseline × hệ_số_thứ × hệ_số_thời_tiết × hệ_số_lễ_hội
 * 
 * @param params { baseline, dayOfWeekMultiplier, weatherMultiplier, holidayMultiplier }
 * @returns { predictedCustomers, rawPredicted, lowerBound, upperBound, step1Baseline, step2AfterDow, step3AfterWeather, step4AfterHoliday }
 */
export function calculatePredictedCustomers(
  params: ForecastCalculationParams
): ForecastCalculationResult {
  const {
    baseline,
    dayOfWeekMultiplier,
    weatherMultiplier,
    holidayMultiplier = 1.0,
  } = params;

  // Tính toán tích lũy từng bước để hiển thị bảng diễn giải minh bạch:
  // Bước 1: Baseline
  const step1Baseline = baseline;
  // Bước 2: Nhân hệ số thứ
  const step2AfterDow = Math.round(step1Baseline * dayOfWeekMultiplier * 100) / 100;
  // Bước 3: Nhân hệ số thời tiết
  const step3AfterWeather = Math.round(step2AfterDow * weatherMultiplier * 100) / 100;
  // Bước 4: Nhân hệ số lễ hội / sự kiện
  const step4AfterHoliday = Math.round(step3AfterWeather * holidayMultiplier * 100) / 100;

  // Công thức: khách_dự_báo = baseline × hệ_số_thứ × hệ_số_thời_tiết × hệ_số_lễ_hội
  const rawPredicted = baseline * dayOfWeekMultiplier * weatherMultiplier * holidayMultiplier;
  const predictedCustomers = Math.max(0, Math.round(rawPredicted));

  // Dải biên độ dao động xác suất ±12%
  const lowerBound = Math.round(predictedCustomers * 0.88);
  const upperBound = Math.round(predictedCustomers * 1.12);

  return {
    predictedCustomers,
    rawPredicted,
    lowerBound,
    upperBound,
    step1Baseline,
    step2AfterDow,
    step3AfterWeather,
    step4AfterHoliday,
  };
}

/**
 * Generates full forecast for a list of weather forecast days
 */
export function generateForecast(
  shop: Shop,
  history: RevenueEntry[],
  weatherForecast: WeatherDay[],
  customHolidays: HolidayEvent[] = []
): ForecastDayResult[] {
  const { baseline, historyCount, isFallback } = calculateBaseline(history, shop.defaultBaseline);
  const dayMultipliers = calculateDayOfWeekMultipliers(history, baseline);

  const baselineOrigin = isFallback
    ? 'giá trị chủ quán thiết lập'
    : `trung bình ${historyCount} ngày gần nhất`;

  return weatherForecast.map((weather, index) => {
    const dow = weather.dayOfWeek;
    const dowMultiplier = dayMultipliers[dow] ?? DEFAULT_DAY_MULTIPLIERS[dow] ?? 1.0;
    
    // An toàn: nếu không có thông tin thời tiết thì hệ số = 1.00
    const hasWeatherData = weather && typeof weather.temperatureAvg === 'number';
    const weatherImpact = hasWeatherData
      ? calculateWeatherMultiplier(weather, shop.category)
      : { multiplier: 1.0, reason: 'Chưa có dữ liệu thời tiết' };
    
    // Holiday check
    const holidayInfo = getHolidayForDate(weather.date, customHolidays);
    const holidayMultiplier = holidayInfo ? holidayInfo.multiplier : 1.0;

    // Tính toán lượng khách dự báo theo công thức chuẩn:
    // khách_dự_báo = baseline × hệ_số_thứ × hệ_số_thời_tiết × hệ_số_lễ_hội
    const {
      predictedCustomers,
      lowerBound,
      upperBound,
      step1Baseline,
      step2AfterDow,
      step3AfterWeather,
      step4AfterHoliday,
    } = calculatePredictedCustomers({
      baseline,
      dayOfWeekMultiplier: dowMultiplier,
      weatherMultiplier: weatherImpact.multiplier,
      holidayMultiplier,
    });

    const confidenceScore = calculateConfidenceScore(
      historyCount,
      index,
      weather.precipitationProbability
    );

    const baselineReason = isFallback
      ? `Sử dụng mức khách cơ bản do quán thiết lập (${baseline} khách/ngày)`
      : `Dựa trên dữ liệu ${historyCount} ngày lịch sử (TB ~${baseline} khách/ngày)`;

    const dayFactorReason = `${weather.dayOfWeekName}: hệ số ${dowMultiplier.toFixed(2)}x ${
      dowMultiplier > 1.0 ? '(ngày đông khách)' : dowMultiplier < 1.0 ? '(ngày vắng hơn)' : '(bình quân)'
    }`;

    return {
      date: weather.date,
      dayOfWeek: dow,
      dayOfWeekName: weather.dayOfWeekName,
      weather,
      baseline,
      baselineOrigin,
      dayOfWeekMultiplier: dowMultiplier,
      weatherMultiplier: weatherImpact.multiplier,
      holidayMultiplier,
      holidayName: holidayInfo?.holidayName,
      predictedCustomers,
      lowerBound,
      upperBound,
      confidenceScore,
      steps: {
        step1Baseline,
        step2AfterDow,
        step3AfterWeather,
        step4AfterHoliday,
        finalRounded: predictedCustomers,
      },
      explanation: {
        baselineReason,
        dayFactorReason,
        weatherReason: weatherImpact.reason,
        holidayReason: holidayInfo?.reason,
      },
    };
  });
}
