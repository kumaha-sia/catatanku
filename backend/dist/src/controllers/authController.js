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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = registerSchema.parse(req.body);
    const existingUser = yield db_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(400);
        throw new Error('Email already exists');
    }
    const password_hash = yield bcrypt_1.default.hash(password, 10);
    const result = yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: { name, email, password_hash }
        });
        const household = yield tx.household.create({
            data: {
                name: `${name}'s Household`,
                owner_id: user.id
            }
        });
        yield tx.householdMember.create({
            data: {
                household_id: household.id,
                user_id: user.id,
                role: 'OWNER',
                status: 'ACTIVE'
            }
        });
        const wallet = yield tx.wallet.create({
            data: {
                user_id: user.id,
                name: 'Main Wallet',
                type: 'CASH',
                scope: 'PERSONAL',
                currency: 'IDR'
            }
        });
        return { user, household, wallet };
    }));
    const token = jsonwebtoken_1.default.sign({ userId: result.user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
        status: 'success',
        data: {
            user: { id: result.user.id, name: result.user.name, email: result.user.email },
            token
        }
    });
}));
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = loginSchema.parse(req.body);
    const user = yield db_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
        status: 'success',
        data: {
            user: { id: user.id, name: user.name, email: user.email },
            token
        }
    });
}));
