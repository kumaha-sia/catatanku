import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  target_amount: z.number().positive('Target amount must be positive'),
  current_amount: z.number().nonnegative().optional(),
  household_id: z.string().uuid().optional().nullable(),
  target_date: z.string().datetime().optional().nullable(),
  icon: z.string().optional().nullable(),
  wallet_id: z.string().uuid().optional().nullable(),
});

export const getGoals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;

  let whereClause: any = {};
  if (householdId) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
    });
    if (!membership || membership.status !== 'ACTIVE') {
      res.status(403);
      throw new Error('Access denied to household');
    }
    whereClause = { household_id: householdId };
  } else {
    whereClause = { user_id: userId, household_id: null };
  }

  const goals = await prisma.goal.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' }
  });

  res.json({ status: 'success', data: goals });
});

export const createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const parsed = goalSchema.parse(req.body);

  if (parsed.household_id) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: parsed.household_id, user_id: userId! } }
    });
    if (!membership || membership.status !== 'ACTIVE') {
      res.status(403);
      throw new Error('Access denied to household');
    }
  }

  const currentAmount = parsed.current_amount || 0;
  const status = currentAmount >= parsed.target_amount ? 'ACHIEVED' : 'ACTIVE';

  const goal = await prisma.goal.create({
    data: {
      name: parsed.name,
      target_amount: parsed.target_amount,
      current_amount: currentAmount,
      target_date: parsed.target_date ? new Date(parsed.target_date) : null,
      icon: parsed.icon,
      wallet_id: parsed.wallet_id,
      household_id: parsed.household_id || null,
      user_id: parsed.household_id ? null : userId,
      status
    }
  });

  res.status(201).json({ status: 'success', data: goal });
});

export const updateGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const parsed = goalSchema.partial().parse(req.body);

  const existing = await prisma.goal.findUnique({ where: { id: id as string } });
  if (!existing) {
    res.status(404);
    throw new Error('Goal not found');
  }

  // Check authorization
  if (existing.household_id) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: existing.household_id, user_id: userId! } }
    });
    if (!membership || membership.status !== 'ACTIVE') {
      res.status(403);
      throw new Error('Access denied');
    }
  } else if (existing.user_id !== userId) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  const updateData: any = { ...parsed };
  if (parsed.target_date !== undefined) {
    updateData.target_date = parsed.target_date ? new Date(parsed.target_date) : null;
  }

  const targetAmount = parsed.target_amount !== undefined ? parsed.target_amount : existing.target_amount;
  const currentAmount = parsed.current_amount !== undefined ? parsed.current_amount : existing.current_amount;
  updateData.status = currentAmount >= targetAmount ? 'ACHIEVED' : 'ACTIVE';

  const goal = await prisma.goal.update({
    where: { id: id as string },
    data: updateData
  });

  res.json({ status: 'success', data: goal });
});

export const deleteGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  const existing = await prisma.goal.findUnique({ where: { id: id as string } });
  if (!existing) {
    res.status(404);
    throw new Error('Goal not found');
  }

  // Check authorization
  if (existing.household_id) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: existing.household_id, user_id: userId! } }
    });
    if (!membership || membership.status !== 'ACTIVE') {
      res.status(403);
      throw new Error('Access denied');
    }
  } else if (existing.user_id !== userId) {
    res.status(403);
    throw new Error('Access denied');
  }

  await prisma.goal.delete({ where: { id: id as string } });
  res.json({ status: 'success', message: 'Goal deleted' });
});
