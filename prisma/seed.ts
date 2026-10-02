/**
 * FreshPredict - Prisma Database Seed Script
 * File: prisma/seed.ts
 * 
 * Generates realistic seed data for F&B operations in Vietnam:
 * 1. 2 Users (Chủ quán Phở Hà Nội - Gói PRO, Chủ quán Cà Phê Đà Nẵng - Gói FREE)
 * 2. 2 Shops with real GPS coordinates for Open-Meteo weather integration
 * 3. 18 Ingredients with shelf-life (HSD), current stock, unit price, usage per customer
 * 4. 60 Days of realistic historical revenue & customer counts for Phở Bò (with T2-CN patterns & weather impacts)
 * 5. 45 Days of historical revenue & customer counts for Cà Phê Muối Đà Nẵng
 * 6. Sample low-stock & expiry notifications
 * 
 * Usage:
 *   npm run seed
 *   npx tsx prisma/seed.ts
 */

import bcrypt from 'bcryptjs';
import { Ingredient, RevenueEntry, Shop, User, AppNotification, HolidayEvent } from '../lib/types';

export async function createInitialSeedData() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const cafePasswordHash = await bcrypt.hash('cafe123', 10);

  // --------------------------------------------------------------------------
  // 1. Users
  // --------------------------------------------------------------------------
  const user1: User = {
    id: 'user_pho_hanoi',
    email: 'chusan@freshpredict.vn',
    name: 'Bác Sáng - Chủ Quán Phở',
    plan: 'PRO',
    createdAt: new Date().toISOString(),
  };

  const user2: User = {
    id: 'user_cafe_danang',
    email: 'caphesuada@freshpredict.vn',
    name: 'Anh Nam - Chủ Cà Phê Muối',
    plan: 'FREE',
    createdAt: new Date().toISOString(),
  };

  // --------------------------------------------------------------------------
  // 2. Shops
  // --------------------------------------------------------------------------
  const shop1: Shop = {
    id: 'shop_pho_1986',
    userId: user1.id,
    name: 'Phở Bò Gia Truyền 1986',
    category: 'HOT_FOOD',
    address: '10 Hàng Nón, P. Hàng Gai, Hoàn Kiếm',
    city: 'Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
    defaultBaseline: 165,
    bufferFactor: 0.10, // 10% an toàn
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const shop2: Shop = {
    id: 'shop_cafe_muoi',
    userId: user2.id,
    name: 'Cà Phê Muối & Trà Sữa Đà Nẵng',
    category: 'COLD_DRINKS',
    address: '42 Bạch Đằng, P. Thạch Thang, Hải Châu',
    city: 'Đà Nẵng',
    latitude: 16.0544,
    longitude: 108.2022,
    defaultBaseline: 110,
    bufferFactor: 0.12, // 12% an toàn
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // --------------------------------------------------------------------------
  // 3. Realistic Ingredients for Phở Bò Gia Truyền 1986 (10 items)
  // --------------------------------------------------------------------------
  const ingredientsShop1: Ingredient[] = [
    {
      id: 'ing_pho_1',
      shopId: shop1.id,
      name: 'Bánh phở tươi Hà Nội',
      unit: 'kg',
      unitPrice: 18000,
      shelfLifeDays: 1, // HSD 1 ngày, dễ hỏng, cần mua tươi mỗi ngày
      currentStock: 12.0,
      usagePerCustomer: 0.18, // 180g mỗi bát
      minStockAlert: 15.0,
      category: 'Bột & Bánh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_2',
      shopId: shop1.id,
      name: 'Thịt thăn bò tươi (làm tái)',
      unit: 'kg',
      unitPrice: 290000,
      shelfLifeDays: 3,
      currentStock: 5.5,
      usagePerCustomer: 0.08, // 80g mỗi bát
      minStockAlert: 6.0,
      category: 'Thịt tươi sống',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_3',
      shopId: shop1.id,
      name: 'Nạm gầu bò chín',
      unit: 'kg',
      unitPrice: 260000,
      shelfLifeDays: 4,
      currentStock: 7.0,
      usagePerCustomer: 0.07, // 70g mỗi bát
      minStockAlert: 8.0,
      category: 'Thịt tươi sống',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_4',
      shopId: shop1.id,
      name: 'Xương ống bò hầm nước dùng',
      unit: 'kg',
      unitPrice: 75000,
      shelfLifeDays: 5,
      currentStock: 28.0,
      usagePerCustomer: 0.20, // 200g xương / 1 bát nước dùng
      minStockAlert: 20.0,
      category: 'Thịt tươi sống',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_5',
      shopId: shop1.id,
      name: 'Hành lá, ngò gai & hành hoa',
      unit: 'kg',
      unitPrice: 35000,
      shelfLifeDays: 3,
      currentStock: 2.4,
      usagePerCustomer: 0.025, // 25g / bát
      minStockAlert: 3.0,
      category: 'Rau củ tươi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_6',
      shopId: shop1.id,
      name: 'Chanh quả tươi mọng nước',
      unit: 'kg',
      unitPrice: 28000,
      shelfLifeDays: 7,
      currentStock: 6.0,
      usagePerCustomer: 0.03, // 30g / khách
      minStockAlert: 4.0,
      category: 'Rau củ tươi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_7',
      shopId: shop1.id,
      name: 'Ớt sừng chỉ thiên',
      unit: 'kg',
      unitPrice: 45000,
      shelfLifeDays: 7,
      currentStock: 1.2,
      usagePerCustomer: 0.01,
      minStockAlert: 1.0,
      category: 'Rau củ tươi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_8',
      shopId: shop1.id,
      name: 'Quẩy giòn ăn kèm phở',
      unit: 'cái',
      unitPrice: 1500,
      shelfLifeDays: 2,
      currentStock: 110,
      usagePerCustomer: 1.2, // 1.2 cái / khách
      minStockAlert: 100,
      category: 'Đồ ăn kèm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_9',
      shopId: shop1.id,
      name: 'Gừng già & hành củ nướng thơm',
      unit: 'kg',
      unitPrice: 40000,
      shelfLifeDays: 14,
      currentStock: 9.0,
      usagePerCustomer: 0.02,
      minStockAlert: 5.0,
      category: 'Gia vị thảo mộc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_pho_10',
      shopId: shop1.id,
      name: 'Gói gia vị phở (hồi, quế, thảo quả, đinh hương)',
      unit: 'gói',
      unitPrice: 32000,
      shelfLifeDays: 90,
      currentStock: 18,
      usagePerCustomer: 0.015,
      minStockAlert: 10,
      category: 'Gia vị thảo mộc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // --------------------------------------------------------------------------
  // 4. Ingredients for Cà Phê Muối & Trà Sữa Đà Nẵng (8 items)
  // --------------------------------------------------------------------------
  const ingredientsShop2: Ingredient[] = [
    {
      id: 'ing_cafe_1',
      shopId: shop2.id,
      name: 'Hạt cà phê Robusta Buôn Ma Thuột mộc',
      unit: 'kg',
      unitPrice: 220000,
      shelfLifeDays: 60,
      currentStock: 15.0,
      usagePerCustomer: 0.025, // 25g/ly
      minStockAlert: 8.0,
      category: 'Cà phê & Trà',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_2',
      shopId: shop2.id,
      name: 'Sữa đặc Ngôi Sao Phương Nam lon 1.28kg',
      unit: 'lon',
      unitPrice: 65000,
      shelfLifeDays: 90,
      currentStock: 8,
      usagePerCustomer: 0.03,
      minStockAlert: 5,
      category: 'Sữa & Kem',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_3',
      shopId: shop2.id,
      name: 'Kem béo Rich lùn đánh màng kem muối',
      unit: 'hộp',
      unitPrice: 38000,
      shelfLifeDays: 14,
      currentStock: 6,
      usagePerCustomer: 0.04,
      minStockAlert: 4,
      category: 'Sữa & Kem',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_4',
      shopId: shop2.id,
      name: 'Sữa tươi thanh trùng Đà Lạt Milk',
      unit: 'lít',
      unitPrice: 36000,
      shelfLifeDays: 7,
      currentStock: 5.5,
      usagePerCustomer: 0.05,
      minStockAlert: 6.0,
      category: 'Sữa & Kem',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_5',
      shopId: shop2.id,
      name: 'Trà Oolong Bảo Lộc ủ trà sữa',
      unit: 'kg',
      unitPrice: 180000,
      shelfLifeDays: 180,
      currentStock: 6.0,
      usagePerCustomer: 0.015,
      minStockAlert: 3.0,
      category: 'Cà phê & Trà',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_6',
      shopId: shop2.id,
      name: 'Trân châu đen hoàng kim',
      unit: 'kg',
      unitPrice: 42000,
      shelfLifeDays: 2,
      currentStock: 2.0,
      usagePerCustomer: 0.04,
      minStockAlert: 3.0,
      category: 'Topping',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_7',
      shopId: shop2.id,
      name: 'Chanh dây tươi Đà Lạt',
      unit: 'kg',
      unitPrice: 32000,
      shelfLifeDays: 6,
      currentStock: 4.0,
      usagePerCustomer: 0.03,
      minStockAlert: 3.0,
      category: 'Trái cây tươi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ing_cafe_8',
      shopId: shop2.id,
      name: 'Đá viên tinh khiết (bao 25kg)',
      unit: 'bao',
      unitPrice: 15000,
      shelfLifeDays: 1,
      currentStock: 2,
      usagePerCustomer: 0.04,
      minStockAlert: 3,
      category: 'Khác',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // --------------------------------------------------------------------------
  // 5. 60 Days of Realistic Historical Revenue for Phở Bò Gia Truyền 1986
  // --------------------------------------------------------------------------
  const revenueShop1: RevenueEntry[] = [];
  const today = new Date();

  for (let i = 60; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay(); // 0 = Chủ Nhật, 6 = Thứ Bảy

    // Realistic day multiplier based on real Vietnamese dining patterns
    let dayMultiplier = 1.0;
    if (dow === 0) dayMultiplier = 1.35;      // Chủ nhật: cả nhà đi ăn sáng ~225 khách
    else if (dow === 6) dayMultiplier = 1.40; // Thứ bảy: cao điểm nhất tuần ~230 khách
    else if (dow === 5) dayMultiplier = 1.15; // Thứ sáu: tan sở đi ăn sớm ~190 khách
    else if (dow === 1) dayMultiplier = 0.85; // Thứ hai: đầu tuần ~140 khách
    else if (dow === 2) dayMultiplier = 0.90; // Thứ ba ~150 khách
    else if (dow === 3) dayMultiplier = 0.95; // Thứ tư ~158 khách
    else if (dow === 4) dayMultiplier = 1.02; // Thứ năm ~168 khách

    // Random variance ±7%
    const randomVariance = 0.93 + Math.random() * 0.14;

    // Simulate weather effect: every ~11 days had rain
    const isRainy = i % 11 === 3;
    const isChilly = i % 14 === 2; // ngày trời rét se lạnh -> món phở nóng bán cực chạy
    const weatherFactor = isRainy ? 0.82 : isChilly ? 1.22 : 1.0;

    const customerCount = Math.round(165 * dayMultiplier * randomVariance * weatherFactor);
    // Ticket price ~48k - 56k / khách (bát phở 45k + quẩy / trứng chần / trà đá)
    const avgTicket = 48000 + Math.floor(Math.random() * 8000);
    const revenue = customerCount * avgTicket;

    let notes = '';
    let weatherSummary = 'Nắng ráo 29°C';
    if (isRainy) {
      notes = 'Trời mưa to cả buổi chiều, khách ngại ra đường';
      weatherSummary = 'Mưa rào 25°C';
    } else if (isChilly) {
      notes = 'Trời trở lạnh se se rét, khách xếp hàng dài ăn phở nóng';
      weatherSummary = 'Se lạnh 17°C';
    } else if (dow === 0 || dow === 6) {
      notes = 'Cuối tuần đông đúc, hết sớm thịt tái lúc 12h15';
      weatherSummary = 'Trời nắng đẹp 28°C';
    } else if (dow === 1) {
      notes = 'Thứ hai đầu tuần, lượng khách đều ổn định';
    }

    revenueShop1.push({
      id: `rev_pho_${i}`,
      shopId: shop1.id,
      date: dateStr,
      revenue,
      customerCount,
      notes: notes || undefined,
      weatherSummary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // 6. 45 Days of Historical Revenue for Cà Phê Muối Đà Nẵng
  // --------------------------------------------------------------------------
  const revenueShop2: RevenueEntry[] = [];
  for (let i = 45; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();

    let dayMultiplier = 1.0;
    if (dow === 0 || dow === 6) dayMultiplier = 1.45;
    else if (dow === 5) dayMultiplier = 1.20;
    else if (dow === 1) dayMultiplier = 0.80;
    else dayMultiplier = 0.95;

    const randomVariance = 0.92 + Math.random() * 0.16;
    const customerCount = Math.round(110 * dayMultiplier * randomVariance);
    const avgTicket = 32000 + Math.floor(Math.random() * 6000); // 32k - 38k/ly
    const revenue = customerCount * avgTicket;

    revenueShop2.push({
      id: `rev_cafe_${i}`,
      shopId: shop2.id,
      date: dateStr,
      revenue,
      customerCount,
      notes: dow === 0 ? 'Khách ghé uống cafe sáng cuối tuần đông' : undefined,
      weatherSummary: 'Nắng đẹp 32°C',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // 7. In-App Notifications
  // --------------------------------------------------------------------------
  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      shopId: shop1.id,
      type: 'LOW_STOCK',
      title: 'Cảnh báo tồn kho thấp',
      message: 'Bánh phở tươi chỉ còn 12 kg, không đủ phục vụ ngày mai dự báo 175 khách (cần tối thiểu ~31.5 kg).',
      createdAt: new Date().toISOString(),
      isRead: false,
    },
    {
      id: 'notif_2',
      shopId: shop1.id,
      type: 'EXPIRED_SOON',
      title: 'Lưu ý hạn sử dụng nguyên liệu',
      message: 'Bánh phở tươi có HSD 1 ngày, khuyến nghị chỉ mua vừa đủ cho buổi bán hàng trong ngày.',
      createdAt: new Date().toISOString(),
      isRead: false,
    },
    {
      id: 'notif_3',
      shopId: shop1.id,
      type: 'WEATHER_ALERT',
      title: 'Dự báo mưa cuối tuần',
      message: 'Thứ Bảy tuần này dự báo có mưa rào rải rác (xác suất 65%), hệ số khách đã được tự động điều chỉnh.',
      createdAt: new Date().toISOString(),
      isRead: false,
    },
  ];

  return {
    users: [user1, user2],
    passwords: {
      [user1.email]: passwordHash,
      [user2.email]: cafePasswordHash,
    },
    shops: [shop1, shop2],
    ingredients: [...ingredientsShop1, ...ingredientsShop2],
    revenueEntries: [...revenueShop1, ...revenueShop2],
    notifications,
  };
}

// ----------------------------------------------------------------------------
// Standalone Runner (CLI Execution)
// ----------------------------------------------------------------------------
async function runStandaloneSeed() {
  console.log('\n======================================================');
  console.log('🌱 FRESHPREDICT: BẮT ĐẦU SEEDING DỮ LIỆU MẪU THỰC TẾ');
  console.log('======================================================\n');

  const seed = await createInitialSeedData();

  console.log(`✅ Đã tạo ${seed.users.length} tài khoản người dùng:`);
  seed.users.forEach((u) => {
    console.log(`   - ${u.name} (${u.email}) [${u.plan}]`);
  });

  console.log(`\n✅ Đã tạo ${seed.shops.length} cơ sở kinh doanh:`);
  seed.shops.forEach((s) => {
    console.log(`   - ${s.name} (${s.city}) - Baseline mặc định: ${s.defaultBaseline} khách/ngày`);
  });

  console.log(`\n✅ Đã tạo ${seed.ingredients.length} nguyên liệu chuẩn F&B:`);
  console.log(`   - Quán Phở Hà Nội: ${seed.ingredients.filter((i) => i.shopId === 'shop_pho_1986').length} mặt hàng (Bánh phở, thăn bò, nạm gầu, xương ống...)`);
  console.log(`   - Quán Cà Phê Đà Nẵng: ${seed.ingredients.filter((i) => i.shopId === 'shop_cafe_muoi').length} mặt hàng (Hạt cà phê, sữa đặc, kem béo, trân châu...)`);

  const phoRevs = seed.revenueEntries.filter((r) => r.shopId === 'shop_pho_1986');
  const cafeRevs = seed.revenueEntries.filter((r) => r.shopId === 'shop_cafe_muoi');

  console.log(`\n✅ Đã tạo lịch sử doanh thu & khách giả lập:`);
  console.log(`   - Quán Phở 1986: ${phoRevs.length} ngày liên tục (từ ${phoRevs[phoRevs.length - 1].date} đến ${phoRevs[0].date})`);
  console.log(`   - Quán Cà Phê: ${cafeRevs.length} ngày liên tục (từ ${cafeRevs[cafeRevs.length - 1].date} đến ${cafeRevs[0].date})`);

  console.log(`\n✅ Đã tạo ${seed.notifications.length} thông báo cảnh báo mẫu.`);
  console.log('\n======================================================');
  console.log('🎉 SEEDING HOÀN TẤT! HỆ THỐNG ĐÃ SẴN SÀNG TRẢI NGHIỆM DỰ BÁO.');
  console.log('======================================================\n');
}

// Automatically run when executed via `npm run seed` or `tsx prisma/seed.ts`
if (process.argv[1]?.includes('seed')) {
  runStandaloneSeed().catch((err) => {
    console.error('❌ Lỗi khi chạy seed:', err);
    process.exit(1);
  });
}
