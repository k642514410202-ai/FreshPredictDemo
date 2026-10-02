/**
 * FreshPredict - Holidays and Events Module
 * Handles Vietnamese national holidays and seasonal multiplier factors
 */

import { HolidayEvent } from './types';

export const VIETNAM_NATIONAL_HOLIDAYS: Omit<HolidayEvent, 'id'>[] = [
  {
    name: 'Tết Dương Lịch',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    multiplier: 1.35,
    description: 'Nghỉ Tết Dương Lịch, nhu cầu ăn uống & tụ họp tăng cao',
    isNational: true,
  },
  {
    name: 'Tết Nguyên Đán (Tết Âm Lịch)',
    startDate: '2026-02-15',
    endDate: '2026-02-23',
    multiplier: 1.60,
    description: 'Dịp Tết Nguyên Đán, khách tụ họp gia đình, du xuân',
    isNational: true,
  },
  {
    name: 'Giỗ Tổ Hùng Vương (10/3 Âm Lịch)',
    startDate: '2026-04-26',
    endDate: '2026-04-26',
    multiplier: 1.30,
    description: 'Ngày nghỉ lễ toàn quốc',
    isNational: true,
  },
  {
    name: 'Kỷ niệm Giải phóng miền Nam & Quốc tế Lao Động (30/4 - 1/5)',
    startDate: '2026-04-30',
    endDate: '2026-05-03',
    multiplier: 1.50,
    description: 'Kỳ nghỉ lễ dài ngày, khách du lịch & gia đình ăn ngoài tăng vọt',
    isNational: true,
  },
  {
    name: 'Quốc Khánh 2/9',
    startDate: '2026-09-01',
    endDate: '2026-09-03',
    multiplier: 1.45,
    description: 'Nghỉ lễ Quốc Khánh 2/9',
    isNational: true,
  },
  {
    name: 'Tết Trung Thu',
    startDate: '2026-09-25',
    endDate: '2026-09-26',
    multiplier: 1.25,
    description: 'Lễ hội Trung Thu, giới trẻ và gia đình đi chơi đông',
    isNational: true,
  },
  {
    name: 'Lễ Giáng Sinh & Năm Mới',
    startDate: '2026-12-24',
    endDate: '2026-12-25',
    multiplier: 1.40,
    description: 'Đêm Noel và Giáng Sinh, quán ăn & cafe luôn kín chỗ',
    isNational: true,
  },
];

/**
 * Check if a date falls into a holiday or event
 */
export function getHolidayForDate(
  dateStr: string,
  customHolidays: HolidayEvent[] = []
): { holidayName: string; multiplier: number; reason: string } | null {
  const allHolidays = [
    ...VIETNAM_NATIONAL_HOLIDAYS.map((h, i) => ({ ...h, id: `nat_${i}` })),
    ...customHolidays,
  ];

  for (const h of allHolidays) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) {
      return {
        holidayName: h.name,
        multiplier: h.multiplier,
        reason: `${h.name} (${h.description || 'Ngày lễ tăng lượng khách'})`,
      };
    }
  }

  return null;
}
