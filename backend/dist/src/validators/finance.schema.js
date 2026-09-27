"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBudgetSchema = exports.createCategorySchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.string().uuid(),
        type: zod_1.z.enum(['INCOME', 'EXPENSE']),
        amount: zod_1.z.number().positive(),
        date: zod_1.z.string().datetime(),
        note: zod_1.z.string().optional()
    })
});
exports.updateTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        category_id: zod_1.z.string().uuid().optional(),
        type: zod_1.z.enum(['INCOME', 'EXPENSE']).optional(),
        amount: zod_1.z.number().positive().optional(),
        date: zod_1.z.string().datetime().optional(),
        note: zod_1.z.string().optional()
    })
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        type: zod_1.z.enum(['INCOME', 'EXPENSE']),
        icon: zod_1.z.string()
    })
});
exports.setBudgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        period_month: zod_1.z.number().min(1).max(12),
        period_year: zod_1.z.number().min(2000).max(2100)
    })
});
