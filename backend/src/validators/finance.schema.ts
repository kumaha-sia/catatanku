import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    category_id: z.string().uuid(),
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive(),
    date: z.string().datetime(),
    note: z.string().optional()
  })
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    category_id: z.string().uuid().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().optional(),
    note: z.string().optional()
  })
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['INCOME', 'EXPENSE']),
    icon: z.string()
  })
});

export const setBudgetSchema = z.object({
  body: z.object({
    category_id: z.string().uuid(),
    amount: z.number().positive(),
    period_month: z.number().min(1).max(12),
    period_year: z.number().min(2000).max(2100)
  })
});
