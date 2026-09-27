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
exports.getSummary = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getSummary = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.query.household_id;
    const { month, year } = req.query;
    if (!householdId) {
        res.status(400);
        throw new Error('household_id is required');
    }
    const membership = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: householdId, user_id: userId } }
    });
    if (!membership) {
        res.status(403);
        throw new Error('Access denied to household');
    }
    let startDate, endDate;
    const now = new Date();
    const y = year ? Number(year) : now.getFullYear();
    const isMonthly = !!month && month !== 'all';
    if (isMonthly) {
        startDate = new Date(y, Number(month) - 1, 1);
        endDate = new Date(y, Number(month), 0, 23, 59, 59);
    }
    else {
        startDate = new Date(y, 0, 1);
        endDate = new Date(y, 11, 31, 23, 59, 59);
    }
    const whereClause = {
        household_id: householdId,
        date: { gte: startDate, lte: endDate }
    };
    const allTransactions = yield db_1.default.transaction.findMany({
        where: whereClause,
        include: { category: true }
    });
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const cashflowMap = {};
    if (isMonthly) {
        for (let i = 1; i <= 5; i++) {
            cashflowMap[`Mgg ${i}`] = { name: `Mgg ${i}`, income: 0, expense: 0 };
        }
    }
    else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        months.forEach(m => {
            cashflowMap[m] = { name: m, income: 0, expense: 0 };
        });
    }
    allTransactions.forEach(t => {
        var _a, _b;
        if (t.type === 'INCOME')
            totalIncome += t.amount;
        if (t.type === 'EXPENSE') {
            totalExpense += t.amount;
            const catName = ((_a = t.category) === null || _a === void 0 ? void 0 : _a.name) || 'Lainnya';
            const catColor = ((_b = t.category) === null || _b === void 0 ? void 0 : _b.color) || '#cccccc';
            if (!categoryMap[catName])
                categoryMap[catName] = { name: catName, value: 0, color: catColor };
            categoryMap[catName].value += t.amount;
        }
        if (isMonthly) {
            const week = Math.ceil(t.date.getDate() / 7);
            const wkKey = `Mgg ${week > 5 ? 5 : week}`;
            if (t.type === 'INCOME')
                cashflowMap[wkKey].income += t.amount;
            if (t.type === 'EXPENSE')
                cashflowMap[wkKey].expense += t.amount;
        }
        else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const mKey = months[t.date.getMonth()];
            if (t.type === 'INCOME')
                cashflowMap[mKey].income += t.amount;
            if (t.type === 'EXPENSE')
                cashflowMap[mKey].expense += t.amount;
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: totalIncome - totalExpense,
            spending_by_category: Object.values(categoryMap),
            cashflow: Object.values(cashflowMap)
        }
    });
}));
