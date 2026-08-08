import { prisma } from "@/lib/prisma";
import { getTotalBalance } from "@/server/account.service";
import { getDebtSummary } from "@/server/debt.service";
import { getAssetSummary } from "@/server/asset.service";
import { getInvestmentSummary } from "@/server/investment.service";

export async function getNetWorth(userId: string) {
  const accountBalance = Number(await getTotalBalance(userId));
  const debtSummary = await getDebtSummary(userId);
  const assetSummary = await getAssetSummary(userId);
  const investmentSummary = await getInvestmentSummary(userId);

  const totalAssets =
    accountBalance + assetSummary.totalValue + investmentSummary.totalCurrent;
  const totalLiabilities = debtSummary.totalDebt;
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    breakdown: {
      accounts: accountBalance,
      assets: assetSummary.totalValue,
      investments: investmentSummary.totalCurrent,
      debts: debtSummary.totalDebt,
      credits: debtSummary.totalCredit,
    },
  };
}

export async function getNetWorthHistory(userId: string, months = 12) {
  const now = new Date();
  const history = [];

  for (let i = months - 1; i >= 0; i--) {
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
    );

    const income = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        date: { lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const expenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: { lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const netWorth =
      Number(income._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0);

    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    history.push({
      month: monthDate.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      }),
      netWorth,
    });
  }

  return history;
}
