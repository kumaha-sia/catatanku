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
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactions = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const createTransactionSchema = zod_1.z.object({
    household_id: zod_1.z.string().uuid(),
    wallet_id: zod_1.z.string().uuid(),
    destination_wallet_id: zod_1.z.string().uuid().optional().nullable(),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    type: zod_1.z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().default('IDR'),
    date: zod_1.z.string().datetime(),
    note: zod_1.z.string().optional().nullable(),
    visibility: zod_1.z.enum(['PRIVATE', 'FAMILY']).default('FAMILY'),
    paid_by_member_id: zod_1.z.string().uuid().optional().nullable(),
    splits: zod_1.z.array(zod_1.z.object({
        member_id: zod_1.z.string().uuid(),
        amount: zod_1.z.number(),
        percentage: zod_1.z.number().optional().nullable(),
        note: zod_1.z.string().optional().nullable()
    })).optional().nullable()
});
exports.getTransactions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.query.household_id;
    const { limit = 20, page = 1 } = req.query;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;
    let whereClause = {
        OR: [
            { visibility: 'FAMILY' },
            { visibility: 'PRIVATE', created_by: userId }
        ]
    };
    if (householdId) {
        const membership = yield db_1.default.householdMember.findUnique({
            where: { household_id_user_id: { household_id: householdId, user_id: userId } }
        });
        if (!membership) {
            res.status(403);
            throw new Error('Access denied');
        }
        whereClause.household_id = householdId;
    }
    else {
        const memberships = yield db_1.default.householdMember.findMany({
            where: { user_id: userId },
            select: { household_id: true }
        });
        const householdIds = memberships.map(m => m.household_id);
        whereClause.household_id = { in: householdIds };
    }
    const transactions = yield db_1.default.transaction.findMany({
        where: whereClause,
        include: {
            category: true,
            wallet: true,
            destination_wallet: true,
            splits: true,
            creator: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' },
        take,
        skip
    });
    const total = yield db_1.default.transaction.count({
        where: whereClause
    });
    res.json({
        status: 'success',
        data: transactions,
        pagination: { total, page: Number(page), limit: take }
    });
}));
exports.createTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = createTransactionSchema.parse(req.body);
    const membership = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: data.household_id, user_id: userId } }
    });
    if (!membership) {
        res.status(403);
        throw new Error('Access denied to household');
    }
    if (data.type === 'TRANSFER' && !data.destination_wallet_id) {
        res.status(400);
        throw new Error('destination_wallet_id is required for transfers');
    }
    const transaction = yield db_1.default.transaction.create({
        data: {
            household_id: data.household_id,
            wallet_id: data.wallet_id,
            destination_wallet_id: data.destination_wallet_id,
            category_id: data.category_id,
            type: data.type,
            amount: data.amount,
            currency: data.currency,
            date: new Date(data.date),
            note: data.note,
            visibility: data.visibility,
            created_by: userId,
            paid_by_member_id: data.paid_by_member_id,
            splits: data.splits ? {
                create: data.splits.map(s => ({
                    member_id: s.member_id,
                    amount: s.amount,
                    percentage: s.percentage,
                    note: s.note
                }))
            } : undefined
        },
        include: { category: true, splits: true, wallet: true, destination_wallet: true }
    });
    res.status(201).json({ status: 'success', data: transaction });
}));
exports.updateTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const id = req.params.id;
    const data = createTransactionSchema.partial().parse(req.body);
    const existing = yield db_1.default.transaction.findUnique({ where: { id } });
    if (!existing) {
        res.status(404);
        throw new Error('Transaction not found');
    }
    if (existing.created_by !== userId) {
        res.status(403);
        throw new Error('Only the creator can edit this transaction');
    }
    const updated = yield db_1.default.transaction.update({
        where: { id },
        data: Object.assign(Object.assign({}, data), { date: data.date ? new Date(data.date) : undefined, splits: undefined // Handled separately or explicitly blocked
         }),
        include: { category: true, splits: true, wallet: true, destination_wallet: true }
    });
    res.status(200).json({ status: 'success', data: updated });
}));
exports.deleteTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const id = req.params.id;
    const existing = yield db_1.default.transaction.findUnique({ where: { id } });
    if (!existing) {
        res.status(404);
        throw new Error('Transaction not found');
    }
    if (existing.created_by !== userId) {
        res.status(403);
        throw new Error('Only the creator can delete this transaction');
    }
    yield db_1.default.transaction.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Transaction deleted' });
}));
