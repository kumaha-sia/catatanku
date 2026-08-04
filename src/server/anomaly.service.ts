import { prisma } from "@/lib/prisma";

export async function detectAnomalies(userId: string) {
  const recent = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE" },
    orderBy: { date: "desc" },
    take: 200,
    include: { category: true },
  });

  const byCategory = new Map<string, { average: number; samples: number }>();
  for (const tx of recent) {
    const key = tx.categoryId ?? "__uncategorized";
    const bucket = byCategory.get(key) ?? { average: 0, samples: 0 };
    bucket.average += Number(tx.amount);
    bucket.samples += 1;
    byCategory.set(key, bucket);
  }

  for (const value of byCategory.values()) {
    if (value.samples > 0) value.average /= value.samples;
  }

  const anomalies: Array<{
    transactionId: string;
    description: string;
    amount: number;
    categoryId: string | null;
    categoryName: string | null;
    average: number;
    ratio: number;
  }> = [];

  for (const tx of recent.slice(0, 30)) {
    const key = tx.categoryId ?? "__uncategorized";
    const stats = byCategory.get(key);
    if (!stats || stats.samples < 3) continue;
    const ratio = Number(tx.amount) / stats.average;
    if (ratio >= 3) {
      anomalies.push({
        transactionId: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        categoryId: tx.categoryId,
        categoryName: tx.category?.name ?? null,
        average: Math.round(stats.average),
        ratio: Math.round(ratio * 100) / 100,
      });
    }
  }

  return anomalies;
}
