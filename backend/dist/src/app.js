"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const householdRoutes_1 = __importDefault(require("./routes/householdRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/', apiLimiter);
// Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/households', householdRoutes_1.default);
app.use('/api/v1/wallets', walletRoutes_1.default);
app.use('/api/v1/transactions', transactionRoutes_1.default);
app.use('/api/v1/categories', categoryRoutes_1.default);
app.use('/api/v1/budgets', budgetRoutes_1.default);
app.use('/api/v1/reports', reportRoutes_1.default);
app.use('/api/v1/goals', goalRoutes_1.default);
app.get('/', (req, res) => {
    res.send('FinBareng API is running');
});
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
