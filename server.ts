/**
 * FreshPredict - Full-stack Express Backend & Dev Server
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { db } from './lib/db';
import { authenticateUser, hashPassword, LoginSchema, RegisterSchema } from './lib/auth';
import { fetchWeatherForecast } from './lib/weather';
import { generateForecast } from './lib/forecast';
import { generatePurchaseSuggestions } from './lib/purchase';
import { Shop, UserPlan } from './lib/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize database
await db.init();

// ----------------------------------------------------------------------
// Auth Routes
// ----------------------------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' });
    }

    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const shops = await db.getShopsByUserId(user.id);
    return res.json({ user, shops });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Lỗi đăng nhập hệ thống' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' });
    }

    const existing = await db.findUserByEmail(parsed.data.email);
    if (existing) {
      return res.status(409).json({ error: 'Email này đã được đăng ký trong hệ thống' });
    }

    const pHash = await hashPassword(parsed.data.password);
    const userId = `user_${Date.now()}`;
    const newUser = {
      id: userId,
      email: parsed.data.email,
      name: parsed.data.name,
      plan: 'FREE' as UserPlan,
      createdAt: new Date().toISOString(),
    };

    await db.createUser(newUser, pHash);

    // Create primary shop for user
    const shopId = `shop_${Date.now()}`;
    const city = parsed.data.city || 'Hà Nội';
    const isHcm = city.includes('Hồ Chí Minh') || city.includes('HCM') || city.includes('Sài Gòn');
    const isDanang = city.includes('Đà Nẵng');

    const newShop: Shop = {
      id: shopId,
      userId: userId,
      name: parsed.data.shopName || `Quán của ${parsed.data.name}`,
      category: parsed.data.category || 'HOT_FOOD',
      address: `123 Đường Trung Tâm, ${city}`,
      city: city,
      latitude: isHcm ? 10.7769 : isDanang ? 16.0544 : 21.0285,
      longitude: isHcm ? 106.7009 : isDanang ? 108.2022 : 105.8542,
      defaultBaseline: 100,
      bufferFactor: 0.10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createShop(newShop);

    return res.status(201).json({ user: newUser, shops: [newShop] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Lỗi đăng ký tài khoản' });
  }
});

app.post('/api/user/plan', async (req: Request, res: Response) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || (plan !== 'FREE' && plan !== 'PRO')) {
      return res.status(400).json({ error: 'Thông tin gói không hợp lệ' });
    }
    const updated = await db.updateUserPlan(userId, plan);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    return res.json({ success: true, user: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Shops Routes
// ----------------------------------------------------------------------
app.get('/api/shops', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (userId) {
      const userShops = await db.getShopsByUserId(userId);
      return res.json(userShops);
    }
    const all = await db.getAllShops();
    return res.json(all);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/shops/:id', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });
    return res.json(shop);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/shops/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateShop(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy quán' });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Weather & Forecast Routes
// ----------------------------------------------------------------------
app.get('/api/weather/:shopId', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const days = parseInt(req.query.days as string) || 7;
    const weather = await fetchWeatherForecast(shop.latitude, shop.longitude, days);
    return res.json({ shop, weather });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/forecast/:shopId', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const days = parseInt(req.query.days as string) || 7;
    const history = await db.getRevenueByShop(shop.id);
    const customHolidays = await db.getHolidays(shop.id);
    const weather = await fetchWeatherForecast(shop.latitude, shop.longitude, days);

    const forecast = generateForecast(shop, history, weather, customHolidays);
    return res.json({
      shop,
      forecast,
      horizonDays: forecast.length,
      baseline: forecast[0]?.baseline || shop.defaultBaseline,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Revenue Routes
// ----------------------------------------------------------------------
const RevenueSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo định dạng YYYY-MM-DD'),
  revenue: z.number().min(0, 'Doanh thu không được âm'),
  customerCount: z.number().int().min(0, 'Số khách không được âm'),
  notes: z.string().optional(),
});

app.get('/api/revenue/:shopId', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const entries = await db.getRevenueByShop(shop.id);

    // Compute metrics
    const totalRevenue = entries.reduce((s, e) => s + e.revenue, 0);
    const totalCustomers = entries.reduce((s, e) => s + e.customerCount, 0);
    const avgDailyRevenue = entries.length > 0 ? Math.round(totalRevenue / entries.length) : 0;
    const avgDailyCustomers = entries.length > 0 ? Math.round(totalCustomers / entries.length) : 0;
    const avgTicket = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    let bestDay: any = null;
    let worstDay: any = null;

    if (entries.length > 0) {
      const sortedByCust = [...entries].sort((a, b) => b.customerCount - a.customerCount);
      bestDay = sortedByCust[0];
      worstDay = sortedByCust[sortedByCust.length - 1];
    }

    return res.json({
      entries,
      stats: {
        totalRevenue,
        totalCustomers,
        avgDailyRevenue,
        avgDailyCustomers,
        avgTicket,
        bestDay,
        worstDay,
        recordedDays: entries.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/revenue/:shopId', async (req: Request, res: Response) => {
  try {
    const parsed = RevenueSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const newEntry = {
      id: `rev_${Date.now()}`,
      shopId: shop.id,
      date: parsed.data.date,
      revenue: parsed.data.revenue,
      customerCount: parsed.data.customerCount,
      notes: parsed.data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createRevenueEntry(newEntry);
    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/revenue/:shopId/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateRevenueEntry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy bản ghi doanh thu' });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/revenue/:shopId/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteRevenueEntry(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy bản ghi' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Ingredients Routes
// ----------------------------------------------------------------------
const IngredientSchema = z.object({
  name: z.string().min(2, 'Tên nguyên liệu tối thiểu 2 ký tự'),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  unitPrice: z.number().min(0, 'Giá không được âm'),
  shelfLifeDays: z.number().int().min(1, 'Hạn sử dụng tối thiểu 1 ngày'),
  currentStock: z.number().min(0, 'Tồn kho không được âm'),
  usagePerCustomer: z.number().min(0.0001, 'Định mức dùng phải lớn hơn 0'),
  minStockAlert: z.number().optional(),
  category: z.string().optional(),
});

app.get('/api/ingredients/:shopId', async (req: Request, res: Response) => {
  try {
    const items = await db.getIngredientsByShop(req.params.shopId);
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ingredients/:shopId', async (req: Request, res: Response) => {
  try {
    const parsed = IngredientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const newIng = {
      id: `ing_${Date.now()}`,
      shopId: shop.id,
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createIngredient(newIng);
    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/ingredients/:shopId/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateIngredient(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/ingredients/:shopId/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteIngredient(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Purchase Suggestions Route
// ----------------------------------------------------------------------
app.get('/api/purchase/:shopId', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    const days = parseInt(req.query.days as string) || 1;
    const ingredients = await db.getIngredientsByShop(shop.id);
    const history = await db.getRevenueByShop(shop.id);
    const customHolidays = await db.getHolidays(shop.id);
    const weather = await fetchWeatherForecast(shop.latitude, shop.longitude, Math.max(days, 3));

    const forecast = generateForecast(shop, history, weather, customHolidays);
    const slicedForecast = forecast.slice(0, days);

    const suggestions = generatePurchaseSuggestions(ingredients, slicedForecast, shop);
    const totalEstimatedCost = suggestions.reduce((sum, item) => sum + item.estimatedCost, 0);

    return res.json({
      shop,
      suggestions,
      totalEstimatedCost,
      horizonDays: days,
      targetDates: slicedForecast.map((f) => f.date),
      totalPredictedCustomers: slicedForecast.reduce((s, f) => s + f.predictedCustomers, 0),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Notifications Route
// ----------------------------------------------------------------------
app.get('/api/notifications/:shopId', async (req: Request, res: Response) => {
  try {
    const shop = await db.getShopById(req.params.shopId);
    if (!shop) return res.status(404).json({ error: 'Không tìm thấy quán' });

    // Automatically evaluate if current stock of any ingredient is lower than 3-day projected demand
    try {
      const ingredients = await db.getIngredientsByShop(shop.id);
      const history = await db.getRevenueByShop(shop.id);
      const customHolidays = await db.getHolidays(shop.id);
      const weather = await fetchWeatherForecast(shop.latitude, shop.longitude, 3);
      const forecast = generateForecast(shop, history, weather, customHolidays);
      const next3Days = forecast.slice(0, 3);
      const total3DayCustomers = next3Days.reduce((sum, f) => sum + f.predictedCustomers, 0);
      const bufferFactor = typeof shop.bufferFactor === 'number' ? shop.bufferFactor : 0.10;

      const existingNotifs = await db.getNotifications(shop.id);

      for (const item of ingredients) {
        const needed3Days = total3DayCustomers * item.usagePerCustomer * (1 + bufferFactor);
        if (item.currentStock < needed3Days) {
          const shortage = Math.max(0, Math.round((needed3Days - item.currentStock) * 10) / 10);
          const neededRounded = Math.round(needed3Days * 10) / 10;

          // Check if an unread LOW_STOCK notification for this specific ingredient already exists
          const hasUnread = existingNotifs.some(
            (n) => !n.isRead && n.type === 'LOW_STOCK' && n.title.includes(item.name)
          );

          if (!hasUnread) {
            await db.createNotification({
              id: `notif_low_${item.id}_${Date.now()}`,
              shopId: shop.id,
              type: 'LOW_STOCK',
              title: `Cảnh báo thiếu hụt: ${item.name}`,
              message: `Tồn kho hiện tại (${item.currentStock} ${item.unit}) thấp hơn định mức sử dụng dự báo cho 3 ngày tới (${neededRounded} ${item.unit}). Thiếu hụt khoảng ${shortage} ${item.unit}. Hãy nhập hàng ngay!`,
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (evalErr) {
      console.warn('Could not auto-evaluate 3-day low-stock notifications:', evalErr);
    }

    const notifications = await db.getNotifications(shop.id);
    return res.json(notifications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    await db.markNotificationRead(req.params.id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:shopId/read-all', async (req: Request, res: Response) => {
  try {
    await db.markAllNotificationsRead(req.params.shopId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// Vite Middleware / Static serving
// ----------------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FreshPredict] Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('[FreshPredict] Server startup failed:', err);
});
