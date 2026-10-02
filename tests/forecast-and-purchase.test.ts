/**
 * FreshPredict - Comprehensive Unit Tests
 * Tests for lib/forecast.ts and lib/purchase.ts
 * Run with: npm test
 */

import {
  calculateBaseline,
  calculateDayOfWeekMultipliers,
  calculateWeatherMultiplier,
  calculatePredictedCustomers,
  generateForecast,
  DEFAULT_DAY_MULTIPLIERS,
} from '../lib/forecast';
import {
  generatePurchaseSuggestions,
  calculateSingleIngredientPurchase,
  roundUpToPracticalUnit,
} from '../lib/purchase';
import { Ingredient, RevenueEntry, Shop, WeatherDay } from '../lib/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('\n=== RUNNING FRESHPREDICT UNIT TESTS ===\n');

// ----------------------------------------------------
// 1. Forecast Baseline Tests
// ----------------------------------------------------
console.log('--- Test Suite 1: Baseline Calculation ---');
{
  const emptyHistory: RevenueEntry[] = [];
  const resEmpty = calculateBaseline(emptyHistory, 120);
  assert(resEmpty.baseline === 120 && resEmpty.isFallback === true, 'Baseline falls back to default when history is empty');

  const sampleHistory: RevenueEntry[] = [
    { id: '1', shopId: 's1', date: '2026-09-01', revenue: 5000000, customerCount: 100, createdAt: '', updatedAt: '' },
    { id: '2', shopId: 's1', date: '2026-09-02', revenue: 5500000, customerCount: 110, createdAt: '', updatedAt: '' },
    { id: '3', shopId: 's1', date: '2026-09-03', revenue: 6000000, customerCount: 120, createdAt: '', updatedAt: '' },
    { id: '4', shopId: 's1', date: '2026-09-04', revenue: 4500000, customerCount: 90, createdAt: '', updatedAt: '' },
  ];
  const resSample = calculateBaseline(sampleHistory, 50);
  assert(resSample.isFallback === false, 'Baseline uses historical data when >= 3 valid records exist');
  assert(resSample.baseline >= 95 && resSample.baseline <= 115, `Baseline correctly computes weighted average (${resSample.baseline})`);
}

// ----------------------------------------------------
// 2. Day of Week Multipliers Tests
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Day of Week Multipliers ---');
{
  const multipliers = calculateDayOfWeekMultipliers([], 100);
  assert(multipliers[1] === DEFAULT_DAY_MULTIPLIERS[1], 'Monday multiplier matches default when no history (0.85)');
  assert(multipliers[6] === DEFAULT_DAY_MULTIPLIERS[6], 'Saturday multiplier matches default (1.35)');
  assert(multipliers[0] === DEFAULT_DAY_MULTIPLIERS[0], 'Sunday multiplier matches default (1.30)');
}

// ----------------------------------------------------
// 3. Weather Multiplier Tests by Category
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Weather Multiplier & Shop Categories ---');
{
  // Test Hot Food (Phở/Súp) in cold weather
  const coldSunnyWeather: WeatherDay = {
    date: '2026-10-02',
    dayOfWeek: 5,
    dayOfWeekName: 'Thứ Sáu',
    temperatureMax: 18,
    temperatureMin: 14,
    temperatureAvg: 16,
    weatherCode: 0,
    weatherDescription: 'Trời se lạnh',
    weatherIcon: 'Sun',
    precipitationProbability: 5,
    precipitationSum: 0,
    windSpeedMax: 10,
  };
  const hotFoodColdResult = calculateWeatherMultiplier(coldSunnyWeather, 'HOT_FOOD');
  assert(hotFoodColdResult.multiplier >= 1.20, `Hot food in cold weather receives boost (got ${hotFoodColdResult.multiplier})`);

  // Test Hot Food in hot summer
  const hotSummerWeather: WeatherDay = {
    ...coldSunnyWeather,
    temperatureMax: 38,
    temperatureMin: 32,
    temperatureAvg: 35,
  };
  const hotFoodSummerResult = calculateWeatherMultiplier(hotSummerWeather, 'HOT_FOOD');
  assert(hotFoodSummerResult.multiplier < 1.0, `Hot food in extreme heat has reduced demand (got ${hotFoodSummerResult.multiplier})`);

  // Test Cold Drinks (Cafe/Trà sữa) in hot weather
  const coldDrinksSummerResult = calculateWeatherMultiplier(hotSummerWeather, 'COLD_DRINKS');
  assert(coldDrinksSummerResult.multiplier >= 1.20, `Cold drinks in hot weather receives boost (got ${coldDrinksSummerResult.multiplier})`);

  // Test Street food in heavy rain
  const rainyWeather: WeatherDay = {
    ...coldSunnyWeather,
    temperatureAvg: 25,
    precipitationProbability: 90,
    precipitationSum: 25,
  };
  const streetFoodRainResult = calculateWeatherMultiplier(rainyWeather, 'STREET_FOOD');
  assert(streetFoodRainResult.multiplier <= 0.60, `Street food stalls suffer heavy drop during heavy rain (got ${streetFoodRainResult.multiplier})`);
}

// ----------------------------------------------------
// 3.5. Forecast Formula: baseline × dow × weather × holiday
// ----------------------------------------------------
console.log('\n--- Test Suite 3.5: Core Forecast Formula (baseline × dow × weather × holiday) ---');
{
  // Test Case A: Baseline 100, Thứ Bảy (1.35), Se lạnh (+25% = 1.25), Ngày thường (1.0)
  // Expected: 100 * 1.35 * 1.25 * 1.0 = 168.75 -> 169 khách
  const resultA = calculatePredictedCustomers({
    baseline: 100,
    dayOfWeekMultiplier: 1.35,
    weatherMultiplier: 1.25,
    holidayMultiplier: 1.0,
  });
  assert(resultA.predictedCustomers === 169, `Expected 169 customers for weekend cold day (got ${resultA.predictedCustomers})`);
  assert(resultA.lowerBound === Math.round(169 * 0.88), 'Lower bound matches -12%');
  assert(resultA.upperBound === Math.round(169 * 1.12), 'Upper bound matches +12%');

  // Test Case B: Baseline 150, Thứ Hai (0.85), Mưa to (-25% = 0.75), Lễ hội Tết (1.40)
  // Expected: 150 * 0.85 * 0.75 * 1.40 = 133.875 -> 134 khách
  const resultB = calculatePredictedCustomers({
    baseline: 150,
    dayOfWeekMultiplier: 0.85,
    weatherMultiplier: 0.75,
    holidayMultiplier: 1.40,
  });
  assert(resultB.predictedCustomers === 134, `Expected 134 customers for holiday rain Monday (got ${resultB.predictedCustomers})`);

  // Test Case C: Default holiday multiplier = 1.0 when omitted
  const resultC = calculatePredictedCustomers({
    baseline: 200,
    dayOfWeekMultiplier: 1.0,
    weatherMultiplier: 1.0,
  });
  assert(resultC.predictedCustomers === 200, `Expected 200 customers when multipliers are 1.0 (got ${resultC.predictedCustomers})`);
}

// ----------------------------------------------------
// 4. Practical Unit Rounding Tests
// ----------------------------------------------------
console.log('\n--- Test Suite 4: Practical Unit Rounding ---');
{
  assert(roundUpToPracticalUnit(0.63, 'kg') === 0.7, 'Round 0.63 kg -> 0.7 kg');
  assert(roundUpToPracticalUnit(3.2, 'kg') === 3.5, 'Round 3.2 kg -> 3.5 kg');
  assert(roundUpToPracticalUnit(12.3, 'kg') === 13, 'Round 12.3 kg -> 13 kg');
  assert(roundUpToPracticalUnit(120, 'g') === 150, 'Round 120 g -> 150 g (50g increment)');
  assert(roundUpToPracticalUnit(4.2, 'cái') === 5, 'Round 4.2 cái -> 5 cái (whole integer)');
  assert(roundUpToPracticalUnit(1.3, 'lít') === 1.5, 'Round 1.3 lít -> 1.5 lít');
}

// ----------------------------------------------------
// 5. Purchase Suggestion & Shelf-life Constraint Tests
// ----------------------------------------------------
console.log('\n--- Test Suite 5: Purchase Suggestion & Shelf-life Capping ---');
{
  const mockShop: Shop = {
    id: 's1',
    userId: 'u1',
    name: 'Phở Bò Gia Truyền',
    category: 'HOT_FOOD',
    address: '10 Hàng Nón, Hà Nội',
    city: 'Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
    defaultBaseline: 150,
    bufferFactor: 0.10, // 10% safety buffer
    createdAt: '',
    updatedAt: '',
  };

  const mockForecast = [
    {
      date: '2026-10-02',
      dayOfWeek: 5,
      dayOfWeekName: 'Thứ Sáu',
      weather: {} as WeatherDay,
      baseline: 150,
      dayOfWeekMultiplier: 1.0,
      weatherMultiplier: 1.0,
      holidayMultiplier: 1.0,
      predictedCustomers: 150,
      lowerBound: 135,
      upperBound: 165,
      confidenceScore: 85,
      explanation: { baselineReason: '', dayFactorReason: '', weatherReason: '' },
    },
  ];

  // Ingredient 1: Standard Beef - 0.15kg per guest, 150 guests => 22.5kg needed (+10% buffer = 24.75kg)
  // Current stock = 5kg => Raw needed = 19.75kg. Rounded = 20kg.
  const ingredients: Ingredient[] = [
    {
      id: 'i1',
      shopId: 's1',
      name: 'Thịt Bò Tái',
      unit: 'kg',
      unitPrice: 280000,
      shelfLifeDays: 3,
      currentStock: 5,
      usagePerCustomer: 0.15,
      createdAt: '',
      updatedAt: '',
    },
    // Ingredient 2: Fresh rice noodles (Bánh phở tươi) - short shelf life (1 day max!)
    // Usage 0.2 kg/guest. With current stock 50 kg already in fridge!
    // Daily demand = 150 * 0.2 = 30 kg.
    // Max allowable shelf life = 1 day * 30 kg * 1.10 = 33 kg.
    // Since current stock is 50 kg (already exceeding shelf life), suggested purchase should be 0!
    {
      id: 'i2',
      shopId: 's1',
      name: 'Bánh Phở Tươi',
      unit: 'kg',
      unitPrice: 20000,
      shelfLifeDays: 1,
      currentStock: 50,
      usagePerCustomer: 0.20,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const suggestions = generatePurchaseSuggestions(ingredients, mockForecast, mockShop);
  const beefSuggestion = suggestions.find((s) => s.ingredientId === 'i1')!;
  const noodleSuggestion = suggestions.find((s) => s.ingredientId === 'i2')!;

  assert(beefSuggestion.suggestedPurchase >= 19.5 && beefSuggestion.suggestedPurchase <= 20.0,
    `Beef suggested purchase matches formula with buffer (got ${beefSuggestion.suggestedPurchase} kg)`);
  assert(beefSuggestion.estimatedCost === beefSuggestion.suggestedPurchase * 280000,
    'Beef estimated cost is calculated accurately');
  assert(beefSuggestion.isUrgentStock === true,
    'Beef flagged urgent because 5kg < tomorrow usage of 22.5kg');

  assert(noodleSuggestion.suggestedPurchase === 0,
    `Noodle purchase capped to 0 because existing stock already exceeds shelf life (got ${noodleSuggestion.suggestedPurchase} kg)`);
  assert(noodleSuggestion.isLimitedByShelfLife === true,
    'Noodle flagged as isLimitedByShelfLife');

  // Test single purchase calculation function directly:
  // Formula: (khách_dự_báo × định_mức × (1 + hệ_số_dự_phòng)) − tồn_kho_hiện_tại
  // 100 khách, định mức 0.2kg, buffer 10% => 22kg buffered demand.
  // Current stock 10kg => raw needed = 12kg.
  // Shelf life 2 days => max allowed = 2 * 22kg = 44kg (> 22kg, no cap).
  const singleCalc = calculateSingleIngredientPurchase({
    predictedCustomers: 100,
    usagePerCustomer: 0.2,
    bufferFactor: 0.1,
    currentStock: 10,
    shelfLifeDays: 2,
    unit: 'kg',
    unitPrice: 50000,
  });
  assert(singleCalc.rawConsumption === 20, 'calculateSingleIngredientPurchase: rawConsumption = 20kg');
  assert(singleCalc.bufferedConsumption === 22, 'calculateSingleIngredientPurchase: bufferedConsumption = 22kg');
  assert(singleCalc.rawNeeded === 12, 'calculateSingleIngredientPurchase: rawNeeded = 12kg');
  assert(singleCalc.suggestedPurchase === 12, 'calculateSingleIngredientPurchase: suggestedPurchase = 12kg');
  assert(singleCalc.isLimitedByShelfLife === false, 'calculateSingleIngredientPurchase: not capped by shelf life');

  // Test when stock + purchase exceeds shelf life (Shelf life = 1 day only)
  // Max allowable = 1 day * 22kg = 22kg.
  // If current stock is 20kg => max additional purchase is 2kg, even if demand was higher!
  const singleCapCalc = calculateSingleIngredientPurchase({
    predictedCustomers: 200,
    usagePerCustomer: 0.2,
    bufferFactor: 0.1, // buffered demand = 44kg
    currentStock: 20, // rawNeeded = 24kg
    shelfLifeDays: 1, // max allowable holding = 1 * 44kg = 44kg => capped = 44 - 20 = 24kg
    unit: 'kg',
  });
  assert(singleCapCalc.suggestedPurchase === 24, 'calculateSingleIngredientPurchase respects 1-day shelf life max');
}

console.log('\n========================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
