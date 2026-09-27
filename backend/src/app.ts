import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetRoutes from './routes/budgetRoutes';
import reportRoutes from './routes/reportRoutes';
import householdRoutes from './routes/householdRoutes';
import walletRoutes from './routes/walletRoutes';
import goalRoutes from './routes/goalRoutes';
import notificationRoutes from './routes/notificationRoutes';
import debtRoutes from './routes/debtRoutes';
import adminRoutes from './routes/adminRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { startReminderCron } from './cron/reminderCron';

import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// Start background jobs
startReminderCron();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/households', householdRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/debts', debtRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.send('FinBareng API is running');
});

app.use(notFound);
app.use(errorHandler);

export default app;
