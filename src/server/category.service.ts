import { prisma } from "@/lib/prisma";
import { CategoryType } from "@prisma/client";

export async function getCategoriesByUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    include: { children: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string, userId: string) {
  return prisma.category.findFirst({
    where: { id, userId },
    include: { children: true },
  });
}

export async function createCategory(data: {
  userId: string;
  name: string;
  type: CategoryType;
  budget?: number;
  parentId?: string;
}) {
  return prisma.category.create({
    data: {
      userId: data.userId,
      name: data.name,
      type: data.type,
      budget: data.budget,
      parentId: data.parentId,
    },
  });
}

export async function updateCategory(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    type: CategoryType;
    budget: number;
    parentId: string;
  }>,
) {
  return prisma.category.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteCategory(id: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id, userId },
  });
  if (!category) throw new Error("Kategori tidak ditemukan");

  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id },
  });

  if (transactionCount > 0) {
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
  }

  await prisma.category.deleteMany({
    where: { id, userId },
  });

  return { success: true, affectedTransactions: transactionCount };
}

export async function getBudgetStatus(userId: string, month: Date) {
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

  const spentByCategory = await prisma.transaction.groupBy({
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
    spentByCategory.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]),
  );

  return categories.map((c) => {
    const budget = Number(c.budget ?? 0);
    const spent = spentMap.get(c.id) ?? 0;
    return {
      id: c.id,
      name: c.name,
      budget,
      spent,
      remaining: budget - spent,
      pct: budget > 0 ? (spent / budget) * 100 : 0,
    };
  });
}
