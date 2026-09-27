import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const setBudgetSchema = z.object({
  household_id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  period: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  period_month: z.number().int().min(1).max(12).optional(),
  period_year: z.number().int().min(2000).optional(),
  amount: z.number().positive(),
  alert_threshold: z.number().min(0).max(100).default(80)
});

export const getBudgets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;
  const { month, year } = req.query;

  if (!month || !year || !householdId) {
    res.status(400);
    throw new Error('household_id, month, and year are required');
  }

  const periodMonth = Number(month);
  const periodYear = Number(year);

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });
  if (!membership) {
    res.status(403);
    throw new Error('Access denied to household');
  }

  const budgets = await prisma.budget.findMany({
    where: {
      household_id: householdId,
      period_month: periodMonth,
      period_year: periodYear
    },
    include: { category: true }
  });

  const startDate = new Date(periodYear, periodMonth - 1, 1);
  const endDate = new Date(periodYear, periodMonth, 0, 23, 59, 59, 999);

  const allMembers = await prisma.householdMember.findMany({
    where: { household_id: householdId }
  });
  const memberIds = allMembers.map(m => m.user_id);

  const transactions = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      created_by: { in: memberIds },
      type: 'EXPENSE',
      date: { gte: startDate, lte: endDate }
    },
    _sum: { amount: true }
  });

  const spentMap = new Map();
  for (const t of transactions) {
    if (t.category_id) {
      spentMap.set(t.category_id, t._sum.amount || 0);
    }
  }

  const responseData = budgets.map(b => {
    const spent = spentMap.get(b.category_id) || 0;
    return {
      id: b.id,
      category_id: b.category_id,
      category_name: b.category.name,
      amount: b.amount,
      spent: spent,
      percentage: (spent / b.amount) * 100
    };
  });

  res.status(200).json({ status: 'success', data: responseData });
});

export const setBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = setBudgetSchema.parse(req.body);

  if (!data.household_id) {
    res.status(400);
    throw new Error('household_id is required');
  }

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: data.household_id, user_id: userId! } }
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    res.status(403);
    throw new Error('Only OWNER or ADMIN can set household budgets');
  }

  const existing = await prisma.budget.findFirst({
    where: {
      household_id: data.household_id,
      category_id: data.category_id,
      period: data.period,
      period_month: data.period_month,
      period_year: data.period_year
    }
  });

  let budget;
  if (existing) {
    budget = await prisma.budget.update({
      where: { id: existing.id },
      data: { amount: data.amount, alert_threshold: data.alert_threshold }
    });
  } else {
    budget = await prisma.budget.create({
      data: {
        household_id: data.household_id,
        user_id: userId,
        category_id: data.category_id,
        period: data.period,
        period_month: data.period_month,
        period_year: data.period_year,
        amount: data.amount,
        alert_threshold: data.alert_threshold
      }
    });
  }

  res.status(201).json({ status: 'success', data: budget });
});

export const rolloverBudgets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { household_id, month, year } = req.body;

  if (!household_id || !month || !year) {
    res.status(400);
    throw new Error('household_id, month, and year are required');
  }

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id, user_id: userId! } }
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    res.status(403);
    throw new Error('Access denied to rollover budgets');
  }

  const currentMonth = Number(month);
  const currentYear = Number(year);

  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prevBudgets = await prisma.budget.findMany({
    where: {
      household_id,
      period_month: prevMonth,
      period_year: prevYear
    }
  });

  if (prevBudgets.length === 0) {
    res.status(404);
    throw new Error('Tidak ada anggaran di bulan sebelumnya untuk disalin.');
  }

  const existingBudgets = await prisma.budget.count({
    where: {
      household_id,
      period_month: currentMonth,
      period_year: currentYear
    }
  });

  if (existingBudgets > 0) {
    res.status(400);
    throw new Error('Bulan ini sudah memiliki anggaran. Tidak dapat menyalin.');
  }

  const newBudgetsData = prevBudgets.map(b => ({
    household_id: b.household_id,
    user_id: b.user_id,
    category_id: b.category_id,
    period: b.period,
    period_month: currentMonth,
    period_year: currentYear,
    amount: b.amount,
    alert_threshold: b.alert_threshold,
    is_active: b.is_active
  }));

  const result = await prisma.budget.createMany({
    data: newBudgetsData
  });

  res.status(201).json({
    status: 'success',
    data: {
      copied: result.count
    }
  });
});


// trigger restart 2
