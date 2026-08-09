import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTotalBalance } from "@/server/account.service";
import { getMonthlySummary } from "@/server/transaction.service";
import { getBudgetVsActual } from "@/server/budget.service";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month");
  const month = monthParam ? new Date(monthParam) : new Date();

  const totalBalance = Number(await getTotalBalance(session.user.id));
  const summary = await getMonthlySummary(session.user.id, month);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(month.getFullYear(), month.getMonth() - (5 - i), 1);
    return d;
  });

  const monthlyData = await Promise.all(
    last6Months.map(async (d) => {
      const s = await getMonthlySummary(session.user.id, d);
      return {
        month: d.toLocaleDateString("id-ID", { month: "short" }),
        income: Number(s.income),
        expense: Number(s.expense),
      };
    }),
  );

  const categoryBreakdown = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: {
        gte: new Date(month.getFullYear(), month.getMonth(), 1),
        lte: new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59),
      },
      categoryId: { not: null },
    },
    _sum: { amount: true },
  });

  const categoryIds = categoryBreakdown
    .map((c) => c.categoryId)
    .filter((id): id is string => id !== null);

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const breakdown = categoryBreakdown.map((c) => {
    const cat = categories.find((k) => k.id === c.categoryId);
    return {
      name: cat?.name ?? "Lainnya",
      value: Number(c._sum.amount ?? 0),
    };
  });

  const budgetVsActual = await getBudgetVsActual(session.user.id, month);
  const totalBudget = budgetVsActual.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetVsActual.reduce((sum, b) => sum + b.spent, 0);
  const budgetPct =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const budgets = budgetVsActual.slice(0, 3).map((b) => ({
    id: b.id,
    name: b.name,
    budget: b.budget,
    spent: b.spent,
  }));

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const expenseTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { date: true, amount: true },
  });

  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const tx of expenseTransactions) {
    const dayOfWeek = new Date(tx.date).getDay();
    dayTotals[dayOfWeek] += Number(tx.amount);
  }

  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dayBreakdown = dayLabels.map((day, i) => ({
    day,
    amount: dayTotals[i],
  }));

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { account: true, category: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalBalance,
    summary: {
      income: Number(summary.income),
      expense: Number(summary.expense),
      balance: Number(summary.balance),
      budgetPct,
    },
    monthlyData,
    breakdown,
    budgets,
    dayBreakdown,
    recentTransactions,
  });
}
