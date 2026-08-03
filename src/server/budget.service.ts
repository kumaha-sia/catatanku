import { prisma } from "@/lib/prisma";

export async function setBudget(
  categoryId: string,
  userId: string,
  budget: number,
) {
  return prisma.category.updateMany({
    where: { id: categoryId, userId },
    data: { budget },
  });
}

export async function getBudgetVsActual(userId: string, month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const categories = await prisma.category.findMany({
    where: { userId, type: "EXPENSE", budget: { not: null } },
  });

  const spent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
      categoryId: { not: null },
    },
    _sum: { amount: true },
  });

  const spentMap = new Map(
    spent.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]),
  );

  return categories.map((c) => {
    const spentAmount = spentMap.get(c.id) ?? 0;
    const budgetAmount = Number(c.budget ?? 0);
    return {
      id: c.id,
      name: c.name,
      budget: budgetAmount,
      spent: spentAmount,
      remaining: budgetAmount - spentAmount,
      pct: budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0,
    };
  });
}
