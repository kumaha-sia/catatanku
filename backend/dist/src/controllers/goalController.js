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
exports.deleteGoal = exports.updateGoal = exports.createGoal = exports.getGoals = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const goalSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    target_amount: zod_1.z.number().positive('Target amount must be positive'),
    household_id: zod_1.z.string().uuid().optional().nullable(),
    target_date: zod_1.z.string().datetime().optional().nullable(),
    icon: zod_1.z.string().optional().nullable(),
    wallet_id: zod_1.z.string().uuid().optional().nullable(),
});
exports.getGoals = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.query.household_id;
    let whereClause = {};
    if (householdId) {
        whereClause = { household_id: householdId };
    }
    else {
        whereClause = { user_id: userId, household_id: null };
    }
    const goals = yield db_1.default.goal.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' }
    });
    res.json({ status: 'success', data: goals });
}));
exports.createGoal = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const parsed = goalSchema.parse(req.body);
    const goal = yield db_1.default.goal.create({
        data: {
            name: parsed.name,
            target_amount: parsed.target_amount,
            target_date: parsed.target_date ? new Date(parsed.target_date) : null,
            icon: parsed.icon,
            wallet_id: parsed.wallet_id,
            household_id: parsed.household_id || null,
            user_id: parsed.household_id ? null : userId,
        }
    });
    res.status(201).json({ status: 'success', data: goal });
}));
exports.updateGoal = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const parsed = goalSchema.partial().parse(req.body);
    const updateData = Object.assign({}, parsed);
    if (parsed.target_date !== undefined) {
        updateData.target_date = parsed.target_date ? new Date(parsed.target_date) : null;
    }
    const goal = yield db_1.default.goal.update({
        where: { id },
        data: updateData
    });
    res.json({ status: 'success', data: goal });
}));
exports.deleteGoal = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield db_1.default.goal.delete({ where: { id } });
    res.json({ status: 'success', message: 'Goal deleted' });
}));
