import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function getTransactionsByUser(
  userId: string,
  opts?: {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  },
) {
  const where: Prisma.TransactionWhereInput = { userId };
  if (opts?.accountId) where.accountId = opts.accountId;
  if (opts?.categoryId) where.categoryId = opts.categoryId;
  if (opts?.type) where.type = opts.type;
  if (opts?.from || opts?.to) {
    where.date = {};
    if (opts?.from) where.date.gte = opts.from;
    if (opts?.to) where.date.lte = opts.to;
  }

  return prisma.transaction.findMany({
    where,
    include: { account: true, category: true },
    orderBy: { date: "desc" },
    take: opts?.limit ?? 50,
    skip: opts?.offset ?? 0,
  });
}

export async function createTransaction(data: {
  userId: string;
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  receiptUrl?: string;
  ocrData?: unknown;
}) {
  const tx = await prisma.transaction.create({
    data: {
      userId: data.userId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      receiptUrl: data.receiptUrl,
      ocrData: data.ocrData as Prisma.InputJsonValue | undefined,
    },
    include: { account: true, category: true },
  });

  if (data.type === "INCOME") {
    await prisma.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: data.amount } },
    });
  } else if (data.type === "EXPENSE") {
    await prisma.account.update({
      where: { id: data.accountId },
      data: { balance: { decrement: data.amount } },
    });
  }

  return tx;
}

export async function updateTransaction(
  id: string,
  userId: string,
  data: Partial<{
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description: string;
    date: Date;
  }>,
) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Transaksi tidak ditemukan");

  const oldAmount = Number(existing.amount);
  if (existing.type === "INCOME") {
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { decrement: oldAmount } },
    });
  } else if (existing.type === "EXPENSE") {
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: oldAmount } },
    });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
    },
  });

  const newAmount = Number(updated.amount);
  if (updated.type === "INCOME") {
    await prisma.account.update({
      where: { id: updated.accountId },
      data: { balance: { increment: newAmount } },
    });
  } else if (updated.type === "EXPENSE") {
    await prisma.account.update({
      where: { id: updated.accountId },
      data: { balance: { decrement: newAmount } },
    });
  }

  return updated;
}

export async function deleteTransaction(id: string, userId: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Transaksi tidak ditemukan");

  const oldAmount = Number(existing.amount);
  if (existing.type === "INCOME") {
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { decrement: oldAmount } },
    });
  } else if (existing.type === "EXPENSE") {
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: oldAmount } },
    });
  }

  return prisma.transaction.delete({ where: { id } });
}

export async function getMonthlySummary(userId: string, month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const income = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "INCOME",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  const expense = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  return {
    income: Number(income._sum.amount ?? 0),
    expense: Number(expense._sum.amount ?? 0),
    balance: Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0),
  };
}
