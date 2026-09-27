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
exports.deleteWallet = exports.updateWallet = exports.createWallet = exports.getWallets = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const createWalletSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['CASH', 'BANK', 'EWALLET', 'CC', 'SAVINGS', 'OTHER']),
    scope: zod_1.z.enum(['PERSONAL', 'SHARED']),
    household_id: zod_1.z.string().uuid().optional(),
    currency: zod_1.z.string().default('IDR'),
    initial_balance: zod_1.z.number().default(0),
    icon: zod_1.z.string().optional(),
    color: zod_1.z.string().optional()
});
const updateWalletSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    type: zod_1.z.enum(['CASH', 'BANK', 'EWALLET', 'CC', 'SAVINGS', 'OTHER']).optional(),
    icon: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    is_archived: zod_1.z.boolean().optional()
});
exports.getWallets = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    // Personal wallets
    const personalWallets = yield db_1.default.wallet.findMany({
        where: { user_id: userId, scope: 'PERSONAL' }
    });
    // Shared wallets (from households where user is member)
    const memberships = yield db_1.default.householdMember.findMany({
        where: { user_id: userId }
    });
    const householdIds = memberships.map(m => m.household_id);
    const sharedWallets = yield db_1.default.wallet.findMany({
        where: { household_id: { in: householdIds }, scope: 'SHARED' }
    });
    res.status(200).json({ status: 'success', data: { personal: personalWallets, shared: sharedWallets } });
}));
exports.createWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = createWalletSchema.parse(req.body);
    if (data.scope === 'SHARED') {
        if (!data.household_id) {
            res.status(400);
            throw new Error('household_id is required for shared wallets');
        }
        // Verify membership
        const member = yield db_1.default.householdMember.findUnique({
            where: { household_id_user_id: { household_id: data.household_id, user_id: userId } }
        });
        if (!member) {
            res.status(403);
            throw new Error('Not a member of this household');
        }
    }
    const wallet = yield db_1.default.wallet.create({
        data: Object.assign(Object.assign({}, data), { user_id: data.scope === 'PERSONAL' ? userId : null })
    });
    res.status(201).json({ status: 'success', data: wallet });
}));
exports.updateWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const walletId = req.params.id;
    const data = updateWalletSchema.parse(req.body);
    const wallet = yield db_1.default.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
        res.status(404);
        throw new Error('Wallet not found');
    }
    // Check permissions
    if (wallet.scope === 'PERSONAL' && wallet.user_id !== userId) {
        res.status(403);
        throw new Error('Access denied');
    }
    if (wallet.scope === 'SHARED') {
        const member = yield db_1.default.householdMember.findUnique({
            where: { household_id_user_id: { household_id: wallet.household_id, user_id: userId } }
        });
        if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
            res.status(403);
            throw new Error('Only OWNER or ADMIN can edit shared wallets');
        }
    }
    const updatedWallet = yield db_1.default.wallet.update({
        where: { id: walletId },
        data
    });
    res.status(200).json({ status: 'success', data: updatedWallet });
}));
exports.deleteWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const walletId = req.params.id;
    const wallet = yield db_1.default.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
        res.status(404);
        throw new Error('Wallet not found');
    }
    // Check permissions
    if (wallet.scope === 'PERSONAL' && wallet.user_id !== userId) {
        res.status(403);
        throw new Error('Access denied');
    }
    if (wallet.scope === 'SHARED') {
        const member = yield db_1.default.householdMember.findUnique({
            where: { household_id_user_id: { household_id: wallet.household_id, user_id: userId } }
        });
        if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
            res.status(403);
            throw new Error('Only OWNER or ADMIN can delete shared wallets');
        }
    }
    yield db_1.default.wallet.delete({ where: { id: walletId } });
    res.status(200).json({ status: 'success', message: 'Wallet deleted' });
}));
