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

  const goal = await prisma.goal.create({
    data: {
      name: parsed.name,
      target_amount: parsed.target_amount,
      target_date: parsed.target_date ? new Date(parsed.target_date) : null,
      icon: parsed.icon,
      wallet_id: parsed.wallet_id,
      household_id: parsed.household_id || null,
      user_id: parsed.household_id ? null : userId,
    }
  });

  res.status(201).json({ status: 'success', data: goal });
});

export const updateGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parsed = goalSchema.partial().parse(req.body);
  
  const updateData: any = { ...parsed };
  if (parsed.target_date !== undefined) {
    updateData.target_date = parsed.target_date ? new Date(parsed.target_date) : null;
  }

  const goal = await prisma.goal.update({
    where: { id: id as string },
    data: updateData
  });

  res.json({ status: 'success', data: goal });
});

export const deleteGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.goal.delete({ where: { id: id as string } });
  res.json({ status: 'success', message: 'Goal deleted' });
});
