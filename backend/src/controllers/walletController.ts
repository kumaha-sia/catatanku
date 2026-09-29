import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const createWalletSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['CASH', 'BANK', 'EWALLET', 'CC', 'SAVINGS', 'OTHER']),
  scope: z.enum(['PERSONAL', 'SHARED']),
  household_id: z.string().uuid().optional(),
  initial_balance: z.number().default(0),
  icon: z.string().optional(),
  color: z.string().optional()
});

const updateWalletSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['CASH', 'BANK', 'EWALLET', 'CC', 'SAVINGS', 'OTHER']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_archived: z.boolean().optional()
});

export const getWallets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  // Personal wallets
  const personalWallets = await prisma.wallet.findMany({
    where: { user_id: userId, scope: 'PERSONAL' }
  });

  // Shared wallets (from households where user is member)
  const memberships = await prisma.householdMember.findMany({
    where: { user_id: userId }
  });
  const householdIds = memberships.map(m => m.household_id);

  // Get family members' personal balances
  const otherMemberships = await prisma.householdMember.findMany({
    where: { household_id: { in: householdIds }, user_id: { not: userId } },
    include: { user: true }
  });
  
  const familyUsersMap = new Map();
  otherMemberships.forEach(m => {
     if (!familyUsersMap.has(m.user_id)) {
       familyUsersMap.set(m.user_id, { id: m.user.id, name: m.user.name, total_balance: 0, wallets: [] });
     }
  });

  const familyUserIds = Array.from(familyUsersMap.keys());
  const familyWallets = await prisma.wallet.findMany({
    where: { user_id: { in: familyUserIds }, scope: 'PERSONAL' }
  });

  const allWalletsToEnrich = [...personalWallets, ...familyWallets];
  const walletIds = allWalletsToEnrich.map(w => w.id);

  // Fetch all aggregations in 2 queries instead of 2 per wallet
  const originAgg = await prisma.transaction.groupBy({
    by: ['wallet_id', 'type'],
    where: { wallet_id: { in: walletIds }, status: 'COMPLETED' },
    _sum: { amount: true }
  });

  const destAgg = await prisma.transaction.groupBy({
    by: ['destination_wallet_id'],
    where: { destination_wallet_id: { in: walletIds }, type: 'TRANSFER', status: 'COMPLETED' },
    _sum: { amount: true }
  });

  // Map aggregations by wallet
  const balanceMap = new Map<string, number>();
  
  allWalletsToEnrich.forEach(w => {
    balanceMap.set(w.id, w.initial_balance || 0);
  });

  originAgg.forEach(group => {
    const wId = group.wallet_id;
    let current = balanceMap.get(wId) || 0;
    if (group.type === 'INCOME') current += (group._sum.amount || 0);
    else if (group.type === 'EXPENSE') current -= (group._sum.amount || 0);
    else if (group.type === 'TRANSFER') current -= (group._sum.amount || 0);
    balanceMap.set(wId, current);
  });

  destAgg.forEach(group => {
    if (!group.destination_wallet_id) return;
    const wId = group.destination_wallet_id;
    let current = balanceMap.get(wId) || 0;
    current += (group._sum.amount || 0);
    balanceMap.set(wId, current);
  });

  const enrichedPersonal = personalWallets.map(w => ({ ...w, balance: balanceMap.get(w.id) || 0 }));
  
  for (const w of familyWallets) {
     const balance = balanceMap.get(w.id) || 0;
     const enriched = { ...w, balance };
     const u = familyUsersMap.get(w.user_id!);
     if (u) {
       u.total_balance += balance;
       u.wallets.push(enriched);
     }
  }
  
  const familyMembers = Array.from(familyUsersMap.values());

  res.status(200).json({ status: 'success', data: { personal: enrichedPersonal, family_members: familyMembers } });
});

export const createWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = createWalletSchema.parse(req.body);

  const wallet = await prisma.wallet.create({
    data: {
      ...data,
      scope: 'PERSONAL',
      user_id: userId
    }
  });

  res.status(201).json({ status: 'success', data: wallet });
});

export const updateWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const walletId = req.params.id as string;
  const data = updateWalletSchema.parse(req.body);

  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Check permissions
  if (wallet.user_id !== userId) {
    res.status(403);
    throw new Error('Access denied');
  }

  const updatedWallet = await prisma.wallet.update({
    where: { id: walletId },
    data
  });

  res.status(200).json({ status: 'success', data: updatedWallet });
});

export const deleteWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const walletId = req.params.id as string;

  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Check permissions
  if (wallet.user_id !== userId) {
    res.status(403);
    throw new Error('Access denied');
  }

  // Check if wallet has transactions
  const txCount = await prisma.transaction.count({
    where: {
      OR: [
        { wallet_id: walletId },
        { destination_wallet_id: walletId }
      ]
    }
  });

  if (txCount > 0) {
    res.status(400);
    throw new Error('Dompet tidak dapat dihapus karena memiliki riwayat transaksi. Anda dapat mengedit nama atau mengarsipkannya.');
  }

  await prisma.wallet.delete({ where: { id: walletId } });

  res.status(200).json({ status: 'success', message: 'Wallet deleted' });
});
