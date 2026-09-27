import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';
import {
  getStats,
  getUsers, getUserDetail, updateUserRole, suspendUser, deleteUser,
  getHouseholds, getHouseholdDetail, deleteHousehold,
  getTransactions,
  getSystemCategories, createSystemCategory, updateSystemCategory, deleteSystemCategory,
  getDebts,
  getGrowthAnalytics, getTopCategories, getActivityAnalytics,
  getSettings, updateSettings
} from '../controllers/adminController';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate);
router.use(requireAdmin);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Dashboard
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

// Households
router.get('/households', getHouseholds);
router.get('/households/:id', getHouseholdDetail);
router.delete('/households/:id', deleteHousehold);

// Transactions
router.get('/transactions', getTransactions);

// System Categories
router.get('/categories', getSystemCategories);
router.post('/categories', createSystemCategory);
router.put('/categories/:id', updateSystemCategory);
router.delete('/categories/:id', deleteSystemCategory);

// Debts
router.get('/debts', getDebts);

// Analytics
router.get('/analytics/growth', getGrowthAnalytics);
router.get('/analytics/top-categories', getTopCategories);
router.get('/analytics/activity', getActivityAnalytics);

export default router;
