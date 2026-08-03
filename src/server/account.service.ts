import { prisma } from "@/lib/prisma";
import { AccountType } from "@prisma/client";

export async function getAccountsByUser(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAccountById(id: string, userId: string) {
  return prisma.account.findFirst({
    where: { id, userId },
    include: { transactions: { orderBy: { date: "desc" }, take: 10 } },
  });
}

export async function createAccount(data: {
  userId: string;
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
}) {
  return prisma.account.create({
    data: {
      userId: data.userId,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? "IDR",
    },
  });
}

export async function updateAccount(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
  }>,
) {
  return prisma.account.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteAccount(id: string, userId: string) {
  return prisma.account.deleteMany({
    where: { id, userId },
  });
}

export async function getTotalBalance(userId: string) {
  const result = await prisma.account.aggregate({
    where: { userId },
    _sum: { balance: true },
  });
  return result._sum.balance ?? 0;
}
