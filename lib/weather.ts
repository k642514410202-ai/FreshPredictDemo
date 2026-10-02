/**
 * FreshPredict - Weather Service Module
 * Integrates with Open-Meteo API (free, no key required) with 1-hour cache
 */

import { WeatherDay } from './types';

interface WeatherCacheEntry {
  timestamp: number;
  data: WeatherDay[];
}

const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DAY_NAMES_VI = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export interface WmoCodeInfo {
  description: string;
  icon: string;
  rainFactor: number; // default base rain intensity impact
}

export function translateWmoCode(code: number): WmoCodeInfo {
  switch (code) {
    case 0:
      return { description: 'Trời quang, nắng đẹp', icon: 'Sun', rainFactor: 1.0 };
    case 1:
      return { description: 'Hầu như không mây', icon: 'Sun', rainFactor: 1.0 };
    case 2:
      return { description: 'Có mây rải rác', icon: 'CloudSun', rainFactor: 1.0 };
    case 3:
      return { description: 'Trời nhiều mây, râm mát', icon: 'Cloud', rainFactor: 0.98 };
    case 45:
    case 48:
      return { description: 'Có sương mù, se lạnh', icon: 'CloudFog', rainFactor: 0.95 };
    case 51:
    case 53:
      return { description: 'Mưa phùn nhỏ hạt', icon: 'CloudDrizzle', rainFactor: 0.92 };
    case 55:
      return { description: 'Mưa phùn dày hạt', icon: 'CloudDrizzle', rainFactor: 0.88 };
    case 61:
      return { description: 'Mưa rào nhẹ', icon: 'CloudRain', rainFactor: 0.88 };
    case 63:
      return { description: 'Mưa rào vừa', icon: 'CloudRain', rainFactor: 0.80 };
    case 65:
      return { description: 'Mưa to nặng hạt', icon: 'CloudRainWind', rainFactor: 0.70 };
    case 80:
    case 81:
      return { description: 'Mưa rào từng cơn', icon: 'CloudRain', rainFactor: 0.82 };
    case 82:
      return { description: 'Mưa rào dữ dội', icon: 'CloudRainWind', rainFactor: 0.65 };
    case 95:
      return { description: 'Dông bão, có sấm sét', icon: 'CloudLightning', rainFactor: 0.60 };
    case 96:
    case 99:
      return { description: 'Bão dông nguy hiểm', icon: 'CloudLightning', rainFactor: 0.50 };
    default:
      return { description: 'Thời tiết bình thường', icon: 'Sun', rainFactor: 1.0 };
  }
}

/**
 * Fetch 7 to 16 days weather forecast from Open-Meteo with caching
 */
export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  forecastDays: number = 7
): Promise<WeatherDay[]> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}_${forecastDays}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max&timezone=Asia%2FBangkok&forecast_days=${Math.min(forecastDays, 16)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily;
    const result: WeatherDay[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const d = new Date(dateStr);
      const dayOfWeek = d.getDay();
      const code = daily.weathercode[i];
      const wmo = translateWmoCode(code);
      const tempMax = Math.round(daily.temperature_2m_max[i] * 10) / 10;
      const tempMin = Math.round(daily.temperature_2m_min[i] * 10) / 10;
      const tempAvg = Math.round(((tempMax + tempMin) / 2) * 10) / 10;

      result.push({
        date: dateStr,
        dayOfWeek,
        dayOfWeekName: DAY_NAMES_VI[dayOfWeek],
        temperatureMax: tempMax,
        temperatureMin: tempMin,
        temperatureAvg: tempAvg,
        weatherCode: code,
        weatherDescription: wmo.description,
        weatherIcon: wmo.icon,
        precipitationProbability: daily.precipitation_probability_max?.[i] ?? 0,
        precipitationSum: daily.precipitation_sum?.[i] ?? 0,
        windSpeedMax: daily.windspeed_10m_max?.[i] ?? 0,
      });
    }

    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });

    return result;
  } catch (error) {
    console.warn('Weather fetch failed, falling back to realistic simulation:', error);
    return generateFallbackWeather(latitude, longitude, forecastDays);
  }
}

/**
 * Fallback weather generator in case Open-Meteo is offline or rate-limited
 */
export function generateFallbackWeather(
  _latitude: number,
  _longitude: number,
  days: number = 7
): WeatherDay[] {
  const result: WeatherDay[] = [];
  const today = new Date();

  // Typical Vietnam climate pattern
  const weatherPool = [
    { code: 0, max: 32, min: 24, pop: 10, rain: 0 },
    { code: 2, max: 31, min: 23, pop: 20, rain: 0 },
    { code: 3, max: 29, min: 22, pop: 35, rain: 0.5 },
    { code: 61, max: 27, min: 21, pop: 70, rain: 4.5 },
    { code: 1, max: 33, min: 25, pop: 15, rain: 0 },
    { code: 80, max: 28, min: 22, pop: 85, rain: 12.0 },
    { code: 2, max: 30, min: 23, pop: 25, rain: 0 },
  ];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const pattern = weatherPool[i % weatherPool.length];
    const wmo = translateWmoCode(pattern.code);

    result.push({
      date: dateStr,
      dayOfWeek,
      dayOfWeekName: DAY_NAMES_VI[dayOfWeek],
      temperatureMax: pattern.max,
      temperatureMin: pattern.min,
      temperatureAvg: Math.round(((pattern.max + pattern.min) / 2) * 10) / 10,
      weatherCode: pattern.code,
      weatherDescription: wmo.description,
      weatherIcon: wmo.icon,
      precipitationProbability: pattern.pop,
      precipitationSum: pattern.rain,
      windSpeedMax: 12,
    });
  }

  return result;
}
