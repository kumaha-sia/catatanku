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
exports.inviteMember = exports.getMembers = exports.getHouseholds = void 0;
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
exports.getHouseholds = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const memberships = yield db_1.default.householdMember.findMany({
        where: { user_id: userId },
        include: { household: true }
    });
    const households = memberships.map(m => (Object.assign(Object.assign({}, m.household), { role: m.role })));
    res.status(200).json({ status: 'success', data: households });
}));
exports.getMembers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.params.householdId;
    // Check if user is in this household
    const membership = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: householdId, user_id: userId } }
    });
    if (!membership) {
        res.status(403);
        throw new Error('Access denied');
    }
    const members = yield db_1.default.householdMember.findMany({
        where: { household_id: householdId },
        include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(200).json({ status: 'success', data: members });
}));
const inviteSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});
exports.inviteMember = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const householdId = req.params.householdId;
    const { email, role } = inviteSchema.parse(req.body);
    // Must be OWNER or ADMIN to invite
    const inviter = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: householdId, user_id: userId } }
    });
    if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
        res.status(403);
        throw new Error('Not authorized to invite');
    }
    const targetUser = yield db_1.default.user.findUnique({ where: { email } });
    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }
    const existingMember = yield db_1.default.householdMember.findUnique({
        where: { household_id_user_id: { household_id: householdId, user_id: targetUser.id } }
    });
    if (existingMember) {
        res.status(400);
        throw new Error('User is already a member');
    }
    const newMember = yield db_1.default.householdMember.create({
        data: {
            household_id: householdId,
            user_id: targetUser.id,
            role,
            status: 'ACTIVE'
        }
    });
    res.status(201).json({ status: 'success', data: newMember });
}));
