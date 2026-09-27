import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const createDebtSchema = z.object({
  household_id: z.string().uuid().optional().nullable(),
  wallet_id: z.string().uuid(),
  type: z.enum(['LEND', 'BORROW']),
  person_name: z.string().min(1, 'Name is required'),
  amount: z.number().positive(),
  due_date: z.string().datetime().optional().nullable(),
  note: z.string().optional().nullable()
});

const payDebtSchema = z.object({
  amount: z.number().positive(),
  wallet_id: z.string().uuid(),
  note: z.string().optional().nullable()
});

// Helper to ensure system categories for debts exist
const ensureDebtCategories = async () => {
  const categoriesToEnsure = [
    { name: 'Utang', type: 'INCOME', icon: '📥' },
    { name: 'Piutang', type: 'EXPENSE', icon: '📤' },
    { name: 'Bayar Utang', type: 'EXPENSE', icon: '💸' },
    { name: 'Terima Piutang', type: 'INCOME', icon: '💰' },
  ];

  for (const cat of categoriesToEnsure) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, user_id: null }
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          user_id: null,
          is_default: true,
          icon: cat.icon
        }
      });
    }
  }
};

const getCategoryId = async (name: string) => {
  const cat = await prisma.category.findFirst({
    where: { name, user_id: null }
  });
  return cat?.id;
};

export const getDebts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.query.household_id as string | undefined;

  let whereClause: any = {};
  if (householdId) {
    whereClause = { household_id: householdId };
  } else {
    whereClause = { user_id: userId, household_id: null };
  }

  const debts = await prisma.debt.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' }
  });

  res.json({ status: 'success', data: debts });
});

export const createDebt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = createDebtSchema.parse(req.body);

  if (!userId) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  // Ensure household access
  let targetHouseholdId = data.household_id;
  if (targetHouseholdId) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: targetHouseholdId, user_id: userId } }
    });
    if (!membership) {
      res.status(403);
      throw new Error('Access denied to household');
    }
  } else {
    // If no household specified, find the user's personal household
    const personalHousehold = await prisma.household.findFirst({
      where: { owner_id: userId, members: { some: { user_id: userId, role: 'OWNER' } } }
    });
    if (personalHousehold) {
      targetHouseholdId = personalHousehold.id;
    } else {
      res.status(400);
      throw new Error('No personal household found');
    }
  }

  // Check wallet exists
  const wallet = await prisma.wallet.findUnique({ where: { id: data.wallet_id } });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  await ensureDebtCategories();

  // Create Debt AND Transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    const debt = await tx.debt.create({
      data: {
        household_id: data.household_id || null, // UI specific
        user_id: data.household_id ? null : userId,
        type: data.type,
        person_name: data.person_name,
        amount: data.amount,
        remaining_amount: data.amount,
        due_date: data.due_date ? new Date(data.due_date) : null,
        note: data.note
      }
    });

    const isBorrow = data.type === 'BORROW'; // Utang
    const catName = isBorrow ? 'Utang' : 'Piutang';
    const txType = isBorrow ? 'INCOME' : 'EXPENSE';
    const catId = await getCategoryId(catName);

    await tx.transaction.create({
      data: {
        household_id: targetHouseholdId!,
        wallet_id: data.wallet_id,
        category_id: catId,
        debt_id: debt.id,
        type: txType,
        amount: data.amount,
        date: new Date(),
        note: `Pencatatan awal ${catName} ${isBorrow ? 'dari' : 'kepada'} ${data.person_name}`,
        visibility: 'FAMILY',
        created_by: userId
      }
    });

    return debt;
  });

  res.status(201).json({ status: 'success', data: result });
});

export const payDebt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const data = payDebtSchema.parse(req.body);

  if (!userId) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const existing = await prisma.debt.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Debt not found');
  }

  // Authorization check
  let targetHouseholdId: string;
  if (existing.household_id) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: existing.household_id, user_id: userId } }
    });
    if (!membership) {
      res.status(403);
      throw new Error('Access denied');
    }
    targetHouseholdId = existing.household_id;
  } else {
    if (existing.user_id !== userId) {
      res.status(403);
      throw new Error('Access denied');
    }
    const personalHousehold = await prisma.household.findFirst({
      where: { owner_id: userId, members: { some: { user_id: userId, role: 'OWNER' } } }
    });
    targetHouseholdId = personalHousehold!.id;
  }

  // Check wallet exists
  const wallet = await prisma.wallet.findUnique({ where: { id: data.wallet_id } });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  await ensureDebtCategories();

  const payAmount = data.amount > existing.remaining_amount ? existing.remaining_amount : data.amount;

  const result = await prisma.$transaction(async (tx) => {
    const newRemaining = existing.remaining_amount - payAmount;
    
    const updatedDebt = await tx.debt.update({
      where: { id },
      data: {
        remaining_amount: newRemaining,
        status: newRemaining <= 0 ? 'PAID' : 'ACTIVE'
      }
    });

    const isBorrow = existing.type === 'BORROW'; // Utang
    const catName = isBorrow ? 'Bayar Utang' : 'Terima Piutang';
    const txType = isBorrow ? 'EXPENSE' : 'INCOME';
    const catId = await getCategoryId(catName);

    await tx.transaction.create({
      data: {
        household_id: targetHouseholdId,
        wallet_id: data.wallet_id,
        category_id: catId,
        debt_id: existing.id,
        type: txType,
        amount: payAmount,
        date: new Date(),
        note: data.note || `Cicilan ${isBorrow ? 'utang ke' : 'piutang dari'} ${existing.person_name}`,
        visibility: 'FAMILY',
        created_by: userId
      }
    });

    return updatedDebt;
  });

  res.status(200).json({ status: 'success', data: result });
});

export const updateDebt = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Hanya melayani pengeditan note/tanggal dll, tidak dengan mutasi nominal.
  // Untuk mutasi nominal (cicilan) gunakan payDebt
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const updateDebtSchema = z.object({
    person_name: z.string().min(1).optional(),
    due_date: z.string().datetime().optional().nullable(),
    note: z.string().optional().nullable()
  });
  
  const data = updateDebtSchema.parse(req.body);

  const existing = await prisma.debt.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Debt not found');
  }

  const updated = await prisma.debt.update({
    where: { id },
    data: {
      ...data,
      due_date: data.due_date !== undefined ? (data.due_date ? new Date(data.due_date) : null) : undefined,
    }
  });

  res.status(200).json({ status: 'success', data: updated });
});

export const deleteDebt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;

  const existing = await prisma.debt.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Debt not found');
  }

  if (existing.household_id) {
    const membership = await prisma.householdMember.findUnique({
      where: { household_id_user_id: { household_id: existing.household_id, user_id: userId! } }
    });
    if (!membership) {
      res.status(403);
      throw new Error('Access denied');
    }
  } else if (existing.user_id !== userId) {
    res.status(403);
    throw new Error('Access denied');
  }

  await prisma.debt.delete({ where: { id } });
  res.status(200).json({ status: 'success', message: 'Debt deleted' });
});
