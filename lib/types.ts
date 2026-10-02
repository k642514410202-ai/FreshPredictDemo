/**
 * FreshPredict - Core Type Definitions
 * Shared between frontend and backend modules
 */

export type UserPlan = 'FREE' | 'PRO';

export type ShopCategory = 'HOT_FOOD' | 'COLD_DRINKS' | 'STREET_FOOD' | 'GENERAL_RESTAURANT';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  createdAt: string;
}

export interface Shop {
  id: string;
  userId: string;
  name: string;
  category: ShopCategory;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  defaultBaseline: number; // baseline khách mặc định nếu chưa đủ dữ liệu
  bufferFactor: number; // hệ số dự phòng mặc định (ví dụ 0.10 = 10%)
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  shopId: string;
  name: string;
  unit: string; // kg, g, cái, lít, hộp, bó
  unitPrice: number; // giá mỗi đơn vị (VNĐ)
  shelfLifeDays: number; // hạn sử dụng (ngày)
  currentStock: number; // tồn kho hiện tại
  usagePerCustomer: number; // định mức dùng trên 1 khách (đơn vị/khách)
  minStockAlert?: number; // mức cảnh báo tồn kho tối thiểu
  category?: string; // Thịt, Rau củ, Gia vị, Đồ uống, Khác
  createdAt: string;
  updatedAt: string;
}

export interface RevenueEntry {
  id: string;
  shopId: string;
  date: string; // YYYY-MM-DD
  revenue: number; // Doanh thu (VNĐ)
  customerCount: number; // Số lượng khách
  notes?: string;
  weatherSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
  dayOfWeekName: string; // Thứ Hai, Thứ Ba...
  temperatureMax: number;
  temperatureMin: number;
  temperatureAvg: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  precipitationProbability: number; // 0 - 100%
  precipitationSum: number; // mm
  windSpeedMax: number; // km/h
}

export interface ForecastSteps {
  step1Baseline: number;
  step2AfterDow: number;
  step3AfterWeather: number;
  step4AfterHoliday: number;
  finalRounded: number;
}

export interface ForecastDayResult {
  date: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  weather: WeatherDay;
  baseline: number;
  baselineOrigin?: string; // e.g. "trung bình 60 ngày gần nhất" hoặc "giá trị chủ quán thiết lập"
  dayOfWeekMultiplier: number;
  weatherMultiplier: number;
  holidayMultiplier: number;
  holidayName?: string;
  predictedCustomers: number;
  lowerBound: number;
  upperBound: number;
  confidenceScore: number; // 0 - 100%
  explanation: {
    baselineReason: string;
    dayFactorReason: string;
    weatherReason: string;
    holidayReason?: string;
  };
  steps?: ForecastSteps;
}

export interface PurchaseItemSuggestion {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  shelfLifeDays: number;
  dailyUsagePerCustomer: number;
  predictedCustomerDemand: number; // Tổng số khách trong khoảng ngày tính toán
  totalConsumptionPredicted: number; // Lượng dùng dự báo = khách * định mức
  bufferedConsumption: number; // Lượng dùng có dự phòng = tiêu thụ * (1 + buffer)
  rawNeeded: number; // bufferedConsumption - currentStock
  suggestedPurchase: number; // Đã làm tròn lên và giới hạn hạn sử dụng
  maxShelfLifeLimit: number; // Hạn mức tối đa theo HSD = shelfLifeDays * dailyConsumption
  isLimitedByShelfLife: boolean;
  isUrgentStock: boolean; // Tồn kho hiện tại không đủ cho ngày mai
  estimatedCost: number; // suggestedPurchase * unitPrice
  purchaseDate: string; // Ngày nên mua
}

export interface HolidayEvent {
  id: string;
  shopId?: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  multiplier: number; // Ví dụ: 1.40 (+40%)
  description?: string;
  isNational: boolean;
}

export interface AppNotification {
  id: string;
  shopId: string;
  type: 'LOW_STOCK' | 'EXPIRED_SOON' | 'WEATHER_ALERT' | 'PRO_TRIAL';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
