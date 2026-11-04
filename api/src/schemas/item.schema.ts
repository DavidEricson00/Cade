import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  location: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateItemSchema = itemSchema.partial();
