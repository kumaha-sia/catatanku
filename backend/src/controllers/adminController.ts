import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';

// ==================== DASHBOARD STATS ====================

export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, newUsersThisMonth, totalHouseholds, totalTransactions, volumeAgg, activeDebts, debtVolumeAgg] = await Promise.all([
    prisma.user.count({ where: { deleted_at: null } }),
    prisma.user.count({ where: { created_at: { gte: startOfMonth }, deleted_at: null } }),
    prisma.household.count({ where: { deleted_at: null } }),
    prisma.transaction.count({ where: { created_at: { gte: startOfMonth } } }),
    prisma.transaction.aggregate({ where: { created_at: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.debt.count({ where: { status: 'ACTIVE' } }),
    prisma.debt.aggregate({ where: { status: 'ACTIVE' }, _sum: { remaining_amount: true } }),
  ]);

  res.json({
    status: 'success',
    data: {
      total_users: totalUsers,
      new_users_this_month: newUsersThisMonth,
      total_households: totalHouseholds,
      total_transactions_this_month: totalTransactions,
      total_volume_this_month: volumeAgg._sum.amount || 0,
      total_active_debts: activeDebts,
      total_debt_volume: debtVolumeAgg._sum.remaining_amount || 0,
    }
  });
});

// ==================== USER MANAGEMENT ====================

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { deleted_at: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, avatar_url: true,
        created_at: true, deleted_at: true,
        _count: { select: { households: true, transactions: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ status: 'success', data: { users, total, page, limit } });
});

export const getUserDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, avatar_url: true,
      created_at: true, deleted_at: true,
      households: {
        include: { household: { select: { id: true, name: true } } }
      },
      wallets: { select: { id: true, name: true, type: true, scope: true, initial_balance: true } },
      transactions: {
        take: 10,
        orderBy: { date: 'desc' },
        select: { id: true, type: true, amount: true, date: true, note: true, category: { select: { name: true } } }
      },
      debts: {
        where: { status: 'ACTIVE' },
        select: { id: true, type: true, person_name: true, amount: true, remaining_amount: true }
      },
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ status: 'success', data: user });
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Prevent self-demotion
  if (id === req.user?.userId && role !== 'ADMIN') {
    res.status(400);
    throw new Error('Cannot demote yourself');
  }

  const updated = await prisma.user.update({ where: { id }, data: { role } });
  res.json({ status: 'success', data: { id: updated.id, role: updated.role } });
});

export const suspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  if (id === req.user?.userId) {
    res.status(400);
    throw new Error('Cannot suspend yourself');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { deleted_at: user.deleted_at ? null : new Date() }
  });

  res.json({
    status: 'success',
    data: { id: updated.id, suspended: !!updated.deleted_at }
  });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  if (id === req.user?.userId) {
    res.status(400);
    throw new Error('Cannot delete yourself');
  }

  await prisma.user.delete({ where: { id } });
  res.json({ status: 'success', message: 'User deleted' });
});

// ==================== HOUSEHOLD MANAGEMENT ====================

export const getHouseholds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { deleted_at: null };
  if (search) {
    where.name = { contains: search };
  }

  const [households, total] = await Promise.all([
    prisma.household.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, transactions: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.household.count({ where }),
  ]);

  res.json({ status: 'success', data: { households, total, page, limit } });
});

export const getHouseholdDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { transactions: true, wallets: true, goals: true, budgets: true } }
    }
  });

  if (!household) {
    res.status(404);
    throw new Error('Household not found');
  }

  res.json({ status: 'success', data: household });
});

export const deleteHousehold = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.household.delete({ where: { id } });
  res.json({ status: 'success', message: 'Household deleted' });
});

// ==================== TRANSACTION MONITOR ====================

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const type = req.query.type as string;
  const search = req.query.search as string;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (type && type !== 'ALL') where.type = type;
  if (search) {
    where.OR = [
      { note: { contains: search } },
      { creator: { name: { contains: search } } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        category: { select: { name: true, icon: true } },
        wallet: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({ status: 'success', data: { transactions, total, page, limit } });
});

// ==================== SYSTEM CATEGORIES ====================

export const getSystemCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { user_id: null, household_id: null },
    orderBy: { sort_order: 'asc' }
  });
  res.json({ status: 'success', data: categories });
});

export const createSystemCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, type, icon } = req.body;
  const category = await prisma.category.create({
    data: { name, type, icon, is_default: true }
  });
  res.status(201).json({ status: 'success', data: category });
});

export const updateSystemCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { name, type, icon } = req.body;
  const category = await prisma.category.update({
    where: { id },
    data: { name, type, icon }
  });
  res.json({ status: 'success', data: category });
});

export const deleteSystemCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.category.delete({ where: { id } });
  res.json({ status: 'success', message: 'Category deleted' });
});

// ==================== DEBT MONITOR ====================

export const getDebts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status && status !== 'ALL') where.status = status;

  const [debts, total] = await Promise.all([
    prisma.debt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.debt.count({ where }),
  ]);

  res.json({ status: 'success', data: { debts, total, page, limit } });
});

// ==================== ANALYTICS ====================

export const getGrowthAnalytics = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const months: { month: string; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const count = await prisma.user.count({
      where: { created_at: { gte: start, lte: end }, deleted_at: null }
    });
    months.push({
      month: start.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }),
      count
    });
  }

  res.json({ status: 'success', data: months });
});

export const getTopCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const result = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: { type: 'EXPENSE', category_id: { not: null } },
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const categoryIds = result.map(r => r.category_id!).filter(Boolean);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true }
  });
  const catMap = new Map(categories.map(c => [c.id, c]));

  const data = result.map(r => ({
    category: catMap.get(r.category_id!) || { name: 'Unknown', icon: '❓' },
    count: r._count.id,
    total: r._sum.amount || 0,
  }));

  res.json({ status: 'success', data });
});

export const getActivityAnalytics = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59);
    const count = await prisma.transaction.count({
      where: { created_at: { gte: start, lte: end } }
    });
    days.push({
      date: start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      count
    });
  }

  res.json({ status: 'success', data: days });
});


export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.status(200).json({ status: 'success', data: settings });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settingsToUpdate = req.body.settings as { key: string; value: string }[];
    if (!settingsToUpdate || !Array.isArray(settingsToUpdate)) {
      return res.status(400).json({ status: 'error', message: 'Invalid settings format' });
    }

    // Update sequentially or use transaction
    const updates = settingsToUpdate.map(setting => 
      prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value }
      })
    );
    await prisma.$transaction(updates);

    res.status(200).json({ status: 'success', message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
