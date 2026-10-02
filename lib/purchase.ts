/**
 * FreshPredict - Ingredient Purchase & Procurement Logic (lib/purchase.ts)
 * 
 * CORE FORMULA:
 * cần_mua = (khách_dự_báo × định_mức × (1 + hệ_số_dự_phòng)) − tồn_kho_hiện_tại
 * 
 * RÀNG BUỘC HẠN SỬ DỤNG (SHELF-LIFE CONSTRAINT):
 * - Không gợi ý mua nhiều hơn lượng có thể tiêu thụ hết trong hạn sử dụng bảo quản.
 * - Giới hạn tồn trữ tối đa = hạn_sử_dụng (ngày) × lượng_dùng_dự_báo_mỗi_ngày
 * - Nếu (cần_mua + tồn_kho_hiện_tại > giới_hạn_tối_đa), lượng mua thực tế sẽ bị chặn trần:
 *   cần_mua_sau_chặn = Math.max(0, giới_hạn_tối_đa − tồn_kho_hiện_tại)
 * 
 * LÀM TRÒN THỰC TẾ:
 * - Tự động làm tròn lên theo quy cách đóng gói buôn bán (0.5kg, 1kg, số nguyên quả/cái/hộp/bó).
 */

import { ForecastDayResult, Ingredient, PurchaseItemSuggestion, Shop } from './types';

export interface SinglePurchaseCalculationParams {
  predictedCustomers: number;      // Số khách dự báo (hoặc tổng khách trong chu kỳ)
  usagePerCustomer: number;        // Định mức tiêu thụ trên 1 khách (đơn vị/khách)
  bufferFactor?: number;           // Hệ số dự phòng an toàn (ví dụ: 0.10 cho 10%)
  currentStock: number;            // Tồn kho thực tế hiện tại
  shelfLifeDays: number;           // Hạn sử dụng bảo quản tươi sống (ngày)
  planningDays?: number;           // Số ngày lên kế hoạch (mặc định: 1 ngày)
  unit?: string;                   // Đơn vị tính (kg, g, cái, lít...)
  unitPrice?: number;              // Đơn giá mua vào (VNĐ)
}

export interface SinglePurchaseCalculationResult {
  rawConsumption: number;          // Tiêu thụ cơ bản = khách_dự_báo × định_mức
  bufferedConsumption: number;     // Tiêu thụ có dự phòng = rawConsumption × (1 + buffer)
  rawNeeded: number;               // Nhu cầu thô = bufferedConsumption − currentStock
  dailyConsumptionRate: number;    // Tốc độ tiêu thụ trung bình mỗi ngày
  maxConsumableInShelfLife: number;// Lượng tối đa dùng hết trong HSD = shelfLifeDays × dailyConsumption
  isLimitedByShelfLife: boolean;   // Có bị giới hạn bởi hạn sử dụng hay không
  cappedPurchase: number;          // Lượng cần mua sau khi áp dụng trần HSD
  suggestedPurchase: number;       // Lượng mua cuối cùng sau khi làm tròn lên
  estimatedCost: number;           // Thành tiền ước tính = suggestedPurchase × unitPrice
  isUrgentStock: boolean;          // Cảnh báo tồn kho không đủ dùng cho ngày mai
}

/**
 * Hàm tính toán lượng mua nguyên liệu đơn lẻ theo đúng công thức chuẩn
 */
export function calculateSingleIngredientPurchase(
  params: SinglePurchaseCalculationParams
): SinglePurchaseCalculationResult {
  const {
    predictedCustomers,
    usagePerCustomer,
    bufferFactor = 0.10,
    currentStock,
    shelfLifeDays,
    planningDays = 1,
    unit = 'kg',
    unitPrice = 0,
  } = params;

  // 1. Tiêu thụ cơ bản = khách_dự_báo × định_mức
  const rawConsumption = Math.max(0, predictedCustomers * usagePerCustomer);

  // 2. Tiêu thụ có dự phòng = rawConsumption × (1 + hệ_số_dự_phòng)
  const bufferedConsumption = rawConsumption * (1 + Math.max(0, bufferFactor));

  // 3. Nhu cầu thô = bufferedConsumption − tồn_kho_hiện_tại
  const rawNeeded = Math.max(0, bufferedConsumption - currentStock);

  // 4. Tốc độ tiêu thụ trung bình theo ngày
  const days = Math.max(1, planningDays);
  const dailyConsumptionRate = bufferedConsumption / days;

  // 5. Giới hạn trần theo Hạn sử dụng (Shelf-life cap):
  // Tổng lượng nguyên liệu được phép tồn trữ = shelfLifeDays × dailyConsumptionRate
  const maxConsumableInShelfLife = Math.max(
    dailyConsumptionRate,
    shelfLifeDays * dailyConsumptionRate
  );

  let cappedPurchase = rawNeeded;
  let isLimitedByShelfLife = false;

  // Nếu (rawNeeded + tồn_kho_hiện_tại) vượt quá lượng có thể dùng hết trong hạn sử dụng:
  if (rawNeeded + currentStock > maxConsumableInShelfLife) {
    cappedPurchase = Math.max(0, maxConsumableInShelfLife - currentStock);
    isLimitedByShelfLife = true;
  }

  // 6. Làm tròn lên theo quy cách đóng gói thương mại
  const suggestedPurchase = roundUpToPracticalUnit(cappedPurchase, unit);

  // 7. Ước tính chi phí
  const estimatedCost = Math.round(suggestedPurchase * unitPrice);

  // 8. Đánh giá mức độ cấp bách (tồn kho hiện tại nhỏ hơn lượng dùng ngày mai)
  const immediateDailyDemand = (predictedCustomers / days) * usagePerCustomer;
  const isUrgentStock = currentStock < immediateDailyDemand;

  return {
    rawConsumption: Math.round(rawConsumption * 100) / 100,
    bufferedConsumption: Math.round(bufferedConsumption * 100) / 100,
    rawNeeded: Math.round(rawNeeded * 100) / 100,
    dailyConsumptionRate: Math.round(dailyConsumptionRate * 100) / 100,
    maxConsumableInShelfLife: Math.round(maxConsumableInShelfLife * 100) / 100,
    isLimitedByShelfLife,
    cappedPurchase: Math.round(cappedPurchase * 100) / 100,
    suggestedPurchase,
    estimatedCost,
    isUrgentStock,
  };
}

/**
 * Làm tròn lên theo đơn vị đóng gói thực tế (0.5 kg, số nguyên, etc.)
 */
export function roundUpToPracticalUnit(amount: number, unit: string): number {
  if (amount <= 0) return 0;

  const normalizedUnit = unit.trim().toLowerCase();

  switch (normalizedUnit) {
    case 'kg':
      // Dưới 2kg: làm tròn lên 0.1kg (vd: 0.65 -> 0.7kg)
      // Từ 2kg đến 10kg: làm tròn lên 0.5kg (vd: 3.2 -> 3.5kg)
      // Trên 10kg: làm tròn lên 1.0kg nguyên (vd: 14.1 -> 15kg)
      if (amount <= 2) {
        return Math.ceil(amount * 10) / 10;
      } else if (amount <= 10) {
        return Math.ceil(amount * 2) / 2;
      } else {
        return Math.ceil(amount);
      }

    case 'g':
      // Làm tròn lên bội số 50g
      return Math.ceil(amount / 50) * 50;

    case 'lít':
    case 'lit':
    case 'l':
      // Dưới 5 lít: làm tròn 0.5 lít; trên 5 lít làm tròn 1 lít
      if (amount <= 5) {
        return Math.ceil(amount * 2) / 2;
      }
      return Math.ceil(amount);

    case 'cái':
    case 'quả':
    case 'trái':
    case 'hộp':
    case 'lon':
    case 'bó':
    case 'gói':
    case 'chai':
    case 'túi':
    case 'bao':
    default:
      // Các đơn vị đếm nguyên chiếc phải là số nguyên dương
      return Math.ceil(amount);
  }
}

/**
 * Tạo danh sách gợi ý mua nguyên liệu cho toàn bộ danh mục của quán
 * Dựa trên mảng ngày dự báo khách
 */
export function generatePurchaseSuggestions(
  ingredients: Ingredient[],
  forecastDays: ForecastDayResult[],
  shop: Shop,
  purchaseDate?: string
): PurchaseItemSuggestion[] {
  if (!forecastDays || forecastDays.length === 0) {
    return [];
  }

  const horizonDays = forecastDays.length;
  // Tổng khách dự báo trong toàn bộ chu kỳ
  const totalPredictedCustomers = forecastDays.reduce((sum, f) => sum + f.predictedCustomers, 0);
  const defaultPurchaseDate = purchaseDate || forecastDays[0].date;
  const bufferFactor = typeof shop.bufferFactor === 'number' ? shop.bufferFactor : 0.10;

  return ingredients.map((item) => {
    const calc = calculateSingleIngredientPurchase({
      predictedCustomers: totalPredictedCustomers,
      usagePerCustomer: item.usagePerCustomer,
      bufferFactor: bufferFactor,
      currentStock: item.currentStock,
      shelfLifeDays: item.shelfLifeDays,
      planningDays: horizonDays,
      unit: item.unit,
      unitPrice: item.unitPrice,
    });

    return {
      ingredientId: item.id,
      ingredientName: item.name,
      unit: item.unit,
      unitPrice: item.unitPrice,
      currentStock: item.currentStock,
      shelfLifeDays: item.shelfLifeDays,
      dailyUsagePerCustomer: item.usagePerCustomer,
      predictedCustomerDemand: totalPredictedCustomers,
      totalConsumptionPredicted: calc.rawConsumption,
      bufferedConsumption: calc.bufferedConsumption,
      rawNeeded: calc.rawNeeded,
      suggestedPurchase: calc.suggestedPurchase,
      maxShelfLifeLimit: calc.maxConsumableInShelfLife,
      isLimitedByShelfLife: calc.isLimitedByShelfLife,
      isUrgentStock: calc.isUrgentStock,
      estimatedCost: calc.estimatedCost,
      purchaseDate: defaultPurchaseDate,
    };
  });
}
