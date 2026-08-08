import { prisma } from "@/lib/prisma";

export async function getSavingsByUser(userId: string) {
  const savings = await prisma.category.findMany({
    where: { userId, type: "SAVINGS" },
    orderBy: { name: "asc" },
  });

  if (savings.length === 0) return [];

  const categoryIds = savings.map((s) => s.id);

  const incomeByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      categoryId: { in: categoryIds },
      type: "INCOME",
    },
    _sum: { amount: true },
  });

  const expenseByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      categoryId: { in: categoryIds },
      type: "EXPENSE",
    },
    _sum: { amount: true },
  });

  const incomeMap = new Map(
    incomeByCategory
      .filter((r) => r.categoryId)
      .map((r) => [r.categoryId!, Number(r._sum.amount ?? 0)]),
  );

  const expenseMap = new Map(
    expenseByCategory
      .filter((r) => r.categoryId)
      .map((r) => [r.categoryId!, Number(r._sum.amount ?? 0)]),
  );

  return savings.map((s) => {
    const saved = incomeMap.get(s.id) ?? 0;
    const withdrawnAmount = expenseMap.get(s.id) ?? 0;
    const balance = saved - withdrawnAmount;
    const target = Number(s.budget ?? 0);
    const pct = target > 0 ? Math.min((balance / target) * 100, 100) : 0;

    return {
      id: s.id,
      name: s.name,
      target,
      saved: balance,
      pct,
      remaining: target > 0 ? Math.max(0, target - balance) : 0,
    };
  });
}

export async function setSavingsTarget(
  categoryId: string,
  userId: string,
  target: number,
) {
  return prisma.category.updateMany({
    where: { id: categoryId, userId, type: "SAVINGS" },
    data: { budget: target },
  });
}
