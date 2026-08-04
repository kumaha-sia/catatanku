import { prisma } from "@/lib/prisma";
import { DebtType } from "@prisma/client";

export async function getDebtsByUser(userId: string) {
  return prisma.debt.findMany({
    where: { userId },
    include: { installments: { orderBy: { dueDate: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDebt(data: {
  userId: string;
  type: DebtType;
  counterpartyName: string;
  totalAmount: number;
  paidAmount?: number;
}) {
  const remaining = data.totalAmount - (data.paidAmount ?? 0);
  return prisma.debt.create({
    data: {
      userId: data.userId,
      type: data.type,
      counterpartyName: data.counterpartyName,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount ?? 0,
      remaining,
    },
    include: { installments: true },
  });
}

export async function updateDebt(
  id: string,
  userId: string,
  data: Partial<{
    type: DebtType;
    counterpartyName: string;
    totalAmount: number;
    paidAmount: number;
  }>,
) {
  const existing = await prisma.debt.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Hutang tidak ditemukan");

  const total = data.totalAmount ?? Number(existing.totalAmount);
  const paid = data.paidAmount ?? Number(existing.paidAmount);
  const remaining = total - paid;

  return prisma.debt.update({
    where: { id },
    data: { ...data, remaining },
  });
}

export async function deleteDebt(id: string, userId: string) {
  return prisma.debt.deleteMany({ where: { id, userId } });
}

export async function addInstallment(
  debtId: string,
  userId: string,
  data: { amount: number; dueDate: Date },
) {
  const debt = await prisma.debt.findFirst({ where: { id: debtId, userId } });
  if (!debt) throw new Error("Hutang tidak ditemukan");

  const installment = await prisma.installment.create({
    data: { debtId, amount: data.amount, dueDate: data.dueDate },
  });

  return installment;
}

export async function payInstallment(installmentId: string, userId: string) {
  const installment = await prisma.installment.findFirst({
    where: { id: installmentId },
    include: { debt: true },
  });
  if (!installment || installment.debt.userId !== userId) {
    throw new Error("Cicilan tidak ditemukan");
  }

  const updated = await prisma.installment.update({
    where: { id: installmentId },
    data: { paid: true, paidAt: new Date() },
  });

  const newPaidAmount =
    Number(installment.debt.paidAmount) + Number(installment.amount);
  const newRemaining = Number(installment.debt.totalAmount) - newPaidAmount;

  await prisma.debt.update({
    where: { id: installment.debt.id },
    data: { paidAmount: newPaidAmount, remaining: newRemaining },
  });

  return updated;
}

export async function getDebtSummary(userId: string) {
  const debts = await prisma.debt.findMany({ where: { userId, type: "DEBT" } });
  const credits = await prisma.debt.findMany({
    where: { userId, type: "CREDIT" },
  });

  const totalDebt = debts.reduce((sum, d) => sum + Number(d.remaining), 0);
  const totalCredit = credits.reduce((sum, d) => sum + Number(d.remaining), 0);

  return {
    totalDebt,
    totalCredit,
    netDebt: totalDebt - totalCredit,
    debtCount: debts.length,
    creditCount: credits.length,
  };
}
