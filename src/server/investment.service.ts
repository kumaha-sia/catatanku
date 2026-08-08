import { prisma } from "@/lib/prisma";
import { InvestmentInstrument } from "@prisma/client";

export async function getInvestmentsByUser(userId: string) {
  return prisma.investment.findMany({
    where: { userId },
    include: { transactions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvestmentById(id: string, userId: string) {
  return prisma.investment.findFirst({
    where: { id, userId },
    include: { transactions: { orderBy: { date: "desc" } } },
  });
}

export async function createInvestment(data: {
  userId: string;
  instrument: InvestmentInstrument;
  units: number;
  buyPrice: number;
  currentValue?: number;
  assetId?: string;
}) {
  const currentValue = data.currentValue ?? data.buyPrice;
  const returnPct =
    data.buyPrice > 0
      ? ((currentValue - data.buyPrice) / data.buyPrice) * 100
      : 0;

  return prisma.investment.create({
    data: {
      userId: data.userId,
      assetId: data.assetId,
      instrument: data.instrument,
      units: data.units,
      buyPrice: data.buyPrice,
      currentValue,
      returnPct,
    },
    include: { transactions: true },
  });
}

export async function updateInvestmentValue(
  id: string,
  userId: string,
  currentValue: number,
) {
  const inv = await prisma.investment.findFirst({ where: { id, userId } });
  if (!inv) throw new Error("Investasi tidak ditemukan");

  const returnPct =
    Number(inv.buyPrice) > 0
      ? ((currentValue - Number(inv.buyPrice)) / Number(inv.buyPrice)) * 100
      : 0;

  return prisma.investment.update({
    where: { id },
    data: { currentValue, returnPct },
  });
}

export async function deleteInvestment(id: string, userId: string) {
  return prisma.investment.deleteMany({ where: { id, userId } });
}

export async function addInvestmentTransaction(
  investmentId: string,
  userId: string,
  data: {
    type: "BUY" | "SELL" | "DIVIDEND";
    units: number;
    price: number;
    date: Date;
  },
) {
  const inv = await prisma.investment.findFirst({
    where: { id: investmentId, userId },
  });
  if (!inv) throw new Error("Investasi tidak ditemukan");

  const tx = await prisma.investmentTransaction.create({
    data: {
      investmentId,
      type: data.type,
      units: data.units,
      price: data.price,
      date: data.date,
    },
  });

  if (data.type === "BUY") {
    const newUnits = Number(inv.units) + data.units;
    const newBuyPrice =
      (Number(inv.buyPrice) * Number(inv.units) + data.price * data.units) /
      newUnits;
    await prisma.investment.update({
      where: { id: investmentId },
      data: { units: newUnits, buyPrice: newBuyPrice },
    });
  } else if (data.type === "SELL") {
    const newUnits = Math.max(0, Number(inv.units) - data.units);
    await prisma.investment.update({
      where: { id: investmentId },
      data: { units: newUnits },
    });
  }

  return tx;
}

export async function getInvestmentSummary(userId: string) {
  const investments = await prisma.investment.findMany({ where: { userId } });
  const totalBuy = investments.reduce(
    (sum, i) => sum + Number(i.buyPrice) * Number(i.units),
    0,
  );
  const totalCurrent = investments.reduce(
    (sum, i) => sum + Number(i.currentValue) * Number(i.units),
    0,
  );

  return {
    totalBuy,
    totalCurrent,
    gainLoss: totalCurrent - totalBuy,
    gainLossPct:
      totalBuy > 0 ? ((totalCurrent - totalBuy) / totalBuy) * 100 : 0,
    count: investments.length,
  };
}
