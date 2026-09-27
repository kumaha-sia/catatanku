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
exports.createCategory = exports.getCategories = void 0;
const db_1 = __importDefault(require("../db"));
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }
        // Get system default categories (user_id = null) and user's custom categories
        const categories = yield db_1.default.category.findMany({
            where: {
                OR: [
                    { user_id: null },
                    { user_id: userId }
                ]
            }
        });
        res.status(200).json({ status: 'success', data: categories });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
exports.getCategories = getCategories;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }
        const { name, type, icon } = req.body;
        const category = yield db_1.default.category.create({
            data: {
                user_id: userId,
                name,
                type,
                icon
            }
        });
        res.status(201).json({ status: 'success', data: category });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
exports.createCategory = createCategory;
