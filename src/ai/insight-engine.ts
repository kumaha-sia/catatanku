import { prisma } from "@/lib/prisma";
import { generateInsight } from "@/lib/ai";
import { getBudgetVsActual } from "@/server/budget.service";
import { getMonthlySummary } from "@/server/transaction.service";

export async function runInsightEngine(userId: string, month?: Date) {
  const reference = month ?? new Date();
  const summary = await getMonthlySummary(userId, reference);
  const budgets = await getBudgetVsActual(userId, reference);

  const insightText = await generateInsight({
    userId,
    month: reference,
    summary: {
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
    },
    budgets,
  });

  const startOfMonth = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const existing = await prisma.insight.findFirst({
    where: {
      userId,
      type: "SPENDING_PATTERN",
      title: "Ringkasan keuangan bulanan",
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  if (existing) {
    await prisma.insight.update({
      where: { id: existing.id },
      data: {
        content: insightText,
        severity: summary.balance >= 0 ? "POSITIVE" : "WARNING",
      },
    });
  } else {
    await prisma.insight.create({
      data: {
        userId,
        type: "SPENDING_PATTERN",
        title: "Ringkasan keuangan bulanan",
        content: insightText,
        severity: summary.balance >= 0 ? "POSITIVE" : "WARNING",
      },
    });
  }

  return insightText;
}
