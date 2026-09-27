"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBudget = exports.getBudgets = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const setBudgetSchema = zod_1.z.object({
    household_id: zod_1.z.string().uuid().optional(),
    category_id: zod_1.z.string().uuid(),
    period: zod_1.z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
    period_month: zod_1.z.number().int().min(1).max(12).optional(),
    period_year: zod_1.z.number().int().min(2000).optional(),
    amount: zod_1.z.number().positive(),
    alert_threshold: zod_1.z.number().min(0).max(100).default(80)
});
exports.getBudgets = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.query.household_id;
    const { month, year } = req.query;
    if (!month || !year || !householdId) {
        res.status(400);
        throw new Error('household_id, month, and year are required');
    }
    const periodMonth = Number(month);
    const periodYear = Number(year);
    const membership = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: householdId, user_id: userId } }
    });
    if (!membership) {
        res.status(403);
        throw new Error('Access denied to household');
    }
    const budgets = yield db_1.default.budget.findMany({
        where: {
            household_id: householdId,
            period_month: periodMonth,
            period_year: periodYear
        },
        include: { category: true }
    });
    const startDate = new Date(periodYear, periodMonth - 1, 1);
    const endDate = new Date(periodYear, periodMonth, 0);
    const transactions = yield db_1.default.transaction.groupBy({
        by: ['category_id'],
        where: {
            household_id: householdId,
            type: 'EXPENSE',
            date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
    });
    const spentMap = new Map();
    for (const t of transactions) {
        if (t.category_id) {
            spentMap.set(t.category_id, t._sum.amount || 0);
        }
    }
    const responseData = budgets.map(b => {
        const spent = spentMap.get(b.category_id) || 0;
        return {
            id: b.id,
            category_id: b.category_id,
            category_name: b.category.name,
            limit_amount: b.amount,
            spent_amount: spent,
            percentage: (spent / b.amount) * 100
        };
    });
    res.status(200).json({ status: 'success', data: responseData });
}));
exports.setBudget = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = setBudgetSchema.parse(req.body);
    if (!data.household_id) {
        res.status(400);
        throw new Error('household_id is required');
    }
    const membership = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: data.household_id, user_id: userId } }
    });
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        res.status(403);
        throw new Error('Only OWNER or ADMIN can set household budgets');
    }
    const existing = yield db_1.default.budget.findFirst({
        where: {
            household_id: data.household_id,
            category_id: data.category_id,
            period: data.period,
            period_month: data.period_month,
            period_year: data.period_year
        }
    });
    let budget;
    if (existing) {
        budget = yield db_1.default.budget.update({
            where: { id: existing.id },
            data: { amount: data.amount, alert_threshold: data.alert_threshold }
        });
    }
    else {
        budget = yield db_1.default.budget.create({
            data: {
                household_id: data.household_id,
                user_id: userId,
                category_id: data.category_id,
                period: data.period,
                period_month: data.period_month,
                period_year: data.period_year,
                amount: data.amount,
                alert_threshold: data.alert_threshold
            }
        });
    }
    res.status(201).json({ status: 'success', data: budget });
}));
