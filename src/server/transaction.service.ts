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

export async function getTransactionById(id: string, userId: string) {
  return prisma.transaction.findFirst({
    where: { id, userId },
    include: { account: true, category: true },
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
  targetAccountId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { id: data.accountId, userId: data.userId },
    });
    if (!account) throw new Error("Rekening sumber tidak ditemukan");

    if (data.categoryId) {
      const category = await tx.category.findFirst({
        where: { id: data.categoryId, userId: data.userId },
      });
      if (!category) throw new Error("Kategori tidak ditemukan");
    }

    let targetAccount: { id: string } | null = null;
    if (data.type === "TRANSFER") {
      if (!data.targetAccountId) {
        throw new Error("Rekening tujuan wajib untuk transfer");
      }
      targetAccount = await tx.account.findFirst({
        where: { id: data.targetAccountId, userId: data.userId },
      });
      if (!targetAccount) throw new Error("Rekening tujuan tidak ditemukan");
      if (data.targetAccountId === data.accountId) {
        throw new Error("Rekening sumber dan tujuan tidak boleh sama");
      }
    }

    const created = await tx.transaction.create({
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
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === "EXPENSE") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
    } else if (data.type === "TRANSFER") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
      await tx.account.update({
        where: { id: data.targetAccountId! },
        data: { balance: { increment: data.amount } },
      });
    }

    return created;
  });
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
    targetAccountId: string;
  }>,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new Error("Transaksi tidak ditemukan");

    const oldAmount = Number(existing.amount);
    if (existing.type === "INCOME") {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: oldAmount } },
      });
    } else if (existing.type === "EXPENSE") {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldAmount } },
      });
    }

    const updated = await tx.transaction.update({
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
      await tx.account.update({
        where: { id: updated.accountId },
        data: { balance: { increment: newAmount } },
      });
    } else if (updated.type === "EXPENSE") {
      await tx.account.update({
        where: { id: updated.accountId },
        data: { balance: { decrement: newAmount } },
      });
    }

    return updated;
  });
}

export async function deleteTransaction(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new Error("Transaksi tidak ditemukan");

    const oldAmount = Number(existing.amount);
    if (existing.type === "INCOME") {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: oldAmount } },
      });
    } else if (existing.type === "EXPENSE") {
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldAmount } },
      });
    }

    return tx.transaction.delete({ where: { id } });
  });
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
