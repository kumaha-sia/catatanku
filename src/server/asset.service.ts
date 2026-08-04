import { prisma } from "@/lib/prisma";
import { AssetType, Prisma } from "@prisma/client";

export async function getAssetsByUser(userId: string) {
  return prisma.asset.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAsset(data: {
  userId: string;
  type: AssetType;
  name: string;
  currentValue: number;
  purchasePrice: number;
  metadata?: unknown;
}) {
  return prisma.asset.create({
    data: {
      userId: data.userId,
      type: data.type,
      name: data.name,
      currentValue: data.currentValue,
      purchasePrice: data.purchasePrice,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function updateAsset(
  id: string,
  userId: string,
  data: Partial<{
    type: AssetType;
    name: string;
    currentValue: number;
    purchasePrice: number;
    metadata: unknown;
  }>,
) {
  const updateData: Record<string, unknown> = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.currentValue !== undefined)
    updateData.currentValue = data.currentValue;
  if (data.purchasePrice !== undefined)
    updateData.purchasePrice = data.purchasePrice;
  if (data.metadata !== undefined)
    updateData.metadata = data.metadata as Prisma.InputJsonValue;

  return prisma.asset.updateMany({ where: { id, userId }, data: updateData });
}

export async function deleteAsset(id: string, userId: string) {
  return prisma.asset.deleteMany({ where: { id, userId } });
}

export async function getAssetSummary(userId: string) {
  const assets = await prisma.asset.findMany({ where: { userId } });
  const totalValue = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);
  const totalPurchase = assets.reduce(
    (sum, a) => sum + Number(a.purchasePrice),
    0,
  );

  return {
    totalValue,
    totalPurchase,
    gainLoss: totalValue - totalPurchase,
    gainLossPct:
      totalPurchase > 0
        ? ((totalValue - totalPurchase) / totalPurchase) * 100
        : 0,
    count: assets.length,
  };
}
