import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const verifyTwoFactorSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/),
});