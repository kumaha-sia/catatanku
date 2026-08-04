import { prisma } from "@/lib/prisma";

export async function getSavingsByUser(userId: string) {
  const savings = await prisma.category.findMany({
    where: { userId, type: "SAVINGS" },
    orderBy: { name: "asc" },
  });

  const result = await Promise.all(
    savings.map(async (s) => {
      const transactions = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: s.id,
          type: "INCOME",
        },
        _sum: { amount: true },
      });

      const withdrawn = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: s.id,
          type: "EXPENSE",
        },
        _sum: { amount: true },
      });

      const saved = Number(transactions._sum.amount ?? 0);
      const withdrawnAmount = Number(withdrawn._sum.amount ?? 0);
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
    }),
  );

  return result;
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
