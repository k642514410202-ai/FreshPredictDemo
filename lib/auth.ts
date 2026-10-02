/**
 * FreshPredict - Authentication Service (lib/auth.ts)
 * Password hashing with bcrypt, session token generation, user validation
 */

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db';
import { User } from './types';

export const LoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  shopName: z.string().min(2, 'Tên quán tối thiểu 2 ký tự').optional(),
  category: z.enum(['HOT_FOOD', 'COLD_DRINKS', 'STREET_FOOD', 'GENERAL_RESTAURANT']).optional(),
  city: z.string().optional(),
});

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function authenticateUser(email: string, password: string):Promise<User | null> {
  const user = await db.findUserByEmail(email);
  if (!user) return null;

  const passwordHash = await db.getPasswordHash(email);
  if (!passwordHash) return null;

  const isValid = await verifyPassword(password, passwordHash);
  if (!isValid) return null;

  return user;
}
