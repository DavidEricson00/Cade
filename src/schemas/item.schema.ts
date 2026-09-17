import { z } from 'zod';

export const itemSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    location: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});