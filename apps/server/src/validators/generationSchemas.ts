import { z } from 'zod';

export const generationInputSchema = z.object({
  prompt: z.string().min(3).max(280),
  style: z
    .enum(['Avant-garde', 'Streetwear', 'Minimalist', 'Formal', 'Retro'])
    .default('Minimalist'),
});

export const generationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((value) => Number(value ?? 5))
    .pipe(z.number().min(1).max(20)),
});
