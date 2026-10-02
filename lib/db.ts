/**
 * FreshPredict - Database Access Layer
 * Provides data operations matching the Prisma schema interface
 * Initialized from realistic seed data and persists in memory
 */

import {
  AppNotification,
  HolidayEvent,
  Ingredient,
  RevenueEntry,
  Shop,
  User,
  UserPlan,
} from './types';
import { createInitialSeedData } from '../prisma/seed';

class DatabaseStore {
  private initialized = false;
  private users: User[] = [];
  private passwords: Record<string, string> = {};
  private shops: Shop[] = [];
  private ingredients: Ingredient[] = [];
  private revenueEntries: RevenueEntry[] = [];
  private notifications: AppNotification[] = [];
  private holidays: HolidayEvent[] = [];

  public async init() {
    if (this.initialized) return;
    const seed = await createInitialSeedData();
    this.users = seed.users;
    this.passwords = seed.passwords;
    this.shops = seed.shops;
    this.ingredients = seed.ingredients;
    this.revenueEntries = seed.revenueEntries;
    this.notifications = seed.notifications;
    this.initialized = true;
  }

  // --- Users ---
  public async findUserByEmail(email: string): Promise<User | undefined> {
    await this.init();
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async findUserById(id: string): Promise<User | undefined> {
    await this.init();
    return this.users.find((u) => u.id === id);
  }

  public async getPasswordHash(email: string): Promise<string | undefined> {
    await this.init();
    return this.passwords[email.toLowerCase()];
  }

  public async createUser(user: User, passwordHash: string): Promise<User> {
    await this.init();
    this.users.push(user);
    this.passwords[user.email.toLowerCase()] = passwordHash;
    return user;
  }

  public async updateUserPlan(userId: string, plan: UserPlan): Promise<User | undefined> {
    await this.init();
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.plan = plan;
    }
    return user;
  }

  // --- Shops ---
  public async getShopsByUserId(userId: string): Promise<Shop[]> {
    await this.init();
    return this.shops.filter((s) => s.userId === userId);
  }

  public async getAllShops(): Promise<Shop[]> {
    await this.init();
    return [...this.shops];
  }

  public async getShopById(shopId: string): Promise<Shop | undefined> {
    await this.init();
    return this.shops.find((s) => s.id === shopId);
  }

  public async createShop(shop: Shop): Promise<Shop> {
    await this.init();
    this.shops.push(shop);
    return shop;
  }

  public async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop | undefined> {
    await this.init();
    const index = this.shops.findIndex((s) => s.id === shopId);
    if (index !== -1) {
      this.shops[index] = {
        ...this.shops[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.shops[index];
    }
    return undefined;
  }

  // --- Ingredients ---
  public async getIngredientsByShop(shopId: string): Promise<Ingredient[]> {
    await this.init();
    return this.ingredients.filter((i) => i.shopId === shopId);
  }

  public async getIngredientById(id: string): Promise<Ingredient | undefined> {
    await this.init();
    return this.ingredients.find((i) => i.id === id);
  }

  public async createIngredient(ingredient: Ingredient): Promise<Ingredient> {
    await this.init();
    this.ingredients.push(ingredient);
    return ingredient;
  }

  public async updateIngredient(
    id: string,
    updates: Partial<Ingredient>
  ): Promise<Ingredient | undefined> {
    await this.init();
    const index = this.ingredients.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.ingredients[index] = {
        ...this.ingredients[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.ingredients[index];
    }
    return undefined;
  }

  public async deleteIngredient(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.ingredients.length;
    this.ingredients = this.ingredients.filter((i) => i.id !== id);
    return this.ingredients.length < initialLen;
  }

  // --- Revenue Entries ---
  public async getRevenueByShop(shopId: string): Promise<RevenueEntry[]> {
    await this.init();
    return this.revenueEntries
      .filter((r) => r.shopId === shopId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async createRevenueEntry(entry: RevenueEntry): Promise<RevenueEntry> {
    await this.init();
    // Check if entry for this date already exists; if so, update it
    const existingIndex = this.revenueEntries.findIndex(
      (r) => r.shopId === entry.shopId && r.date === entry.date
    );

    if (existingIndex !== -1) {
      this.revenueEntries[existingIndex] = {
        ...this.revenueEntries[existingIndex],
        ...entry,
        updatedAt: new Date().toISOString(),
      };
      return this.revenueEntries[existingIndex];
    }

    this.revenueEntries.push(entry);
    return entry;
  }

  public async updateRevenueEntry(
    id: string,
    updates: Partial<RevenueEntry>
  ): Promise<RevenueEntry | undefined> {
    await this.init();
    const index = this.revenueEntries.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.revenueEntries[index] = {
        ...this.revenueEntries[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.revenueEntries[index];
    }
    return undefined;
  }

  public async deleteRevenueEntry(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.revenueEntries.length;
    this.revenueEntries = this.revenueEntries.filter((r) => r.id !== id);
    return this.revenueEntries.length < initialLen;
  }

  // --- Notifications ---
  public async getNotifications(shopId: string): Promise<AppNotification[]> {
    await this.init();
    return this.notifications.filter((n) => n.shopId === shopId);
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.init();
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) n.isRead = true;
  }

  public async markAllNotificationsRead(shopId: string): Promise<void> {
    await this.init();
    this.notifications.forEach((n) => {
      if (n.shopId === shopId) n.isRead = true;
    });
  }

  public async createNotification(notification: AppNotification): Promise<AppNotification> {
    await this.init();
    this.notifications.unshift(notification);
    return notification;
  }

  // --- Holidays ---
  public async getHolidays(shopId?: string): Promise<HolidayEvent[]> {
    await this.init();
    if (!shopId) return [...this.holidays];
    return this.holidays.filter((h) => !h.shopId || h.shopId === shopId);
  }

  public async createHoliday(holiday: HolidayEvent): Promise<HolidayEvent> {
    await this.init();
    this.holidays.push(holiday);
    return holiday;
  }
}

export const db = new DatabaseStore();
