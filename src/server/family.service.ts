import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getFamilyByUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { family: { include: { members: true } } },
  });
  return user?.family ?? null;
}

export async function createFamily(userId: string, name: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");
  if (user.familyId) throw new Error("Sudah memiliki keluarga");

  const family = await prisma.family.create({
    data: {
      name,
      members: { connect: { id: userId } },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { familyId: family.id, role: "OWNER" },
  });

  return family;
}

export async function getFamilyMembers(familyId: string) {
  return prisma.user.findMany({
    where: { familyId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteMember(
  familyId: string,
  inviterId: string,
  email: string,
  role: Role,
) {
  const inviter = await prisma.user.findFirst({
    where: { id: inviterId, familyId },
  });
  if (!inviter || (inviter.role !== "OWNER" && inviter.role !== "MEMBER")) {
    throw new Error("Tidak memiliki izin untuk mengundang anggota");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing)
    throw new Error("Pengguna dengan email tersebut belum terdaftar");

  if (existing.familyId === familyId) {
    throw new Error("Pengguna sudah menjadi anggota keluarga");
  }

  return prisma.user.update({
    where: { id: existing.id },
    data: { familyId, role },
  });
}

export async function removeMember(
  familyId: string,
  removerId: string,
  memberId: string,
) {
  const remover = await prisma.user.findFirst({
    where: { id: removerId, familyId },
  });
  if (!remover || remover.role !== "OWNER") {
    throw new Error("Hanya owner yang bisa menghapus anggota");
  }
  if (memberId === removerId)
    throw new Error("Tidak bisa menghapus diri sendiri");

  return prisma.user.update({
    where: { id: memberId },
    data: { familyId: null, role: "MEMBER" },
  });
}

export async function updateMemberRole(
  familyId: string,
  updaterId: string,
  memberId: string,
  role: Role,
) {
  const updater = await prisma.user.findFirst({
    where: { id: updaterId, familyId },
  });
  if (!updater || updater.role !== "OWNER") {
    throw new Error("Hanya owner yang bisa mengubah role");
  }

  return prisma.user.update({
    where: { id: memberId },
    data: { role },
  });
}

export async function getFamilySummary(familyId: string, month: Date) {
  const members = await prisma.user.findMany({
    where: { familyId },
    select: { id: true, name: true },
  });

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const memberSummaries = await Promise.all(
    members.map(async (member) => {
      const income = await prisma.transaction.aggregate({
        where: {
          userId: member.id,
          type: "INCOME",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });
      const expense = await prisma.transaction.aggregate({
        where: {
          userId: member.id,
          type: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });
      const accounts = await prisma.account.aggregate({
        where: { userId: member.id },
        _sum: { balance: true },
      });
      return {
        userId: member.id,
        name: member.name,
        income: Number(income._sum.amount ?? 0),
        expense: Number(expense._sum.amount ?? 0),
        balance: Number(accounts._sum.balance ?? 0),
      };
    }),
  );

  const totalIncome = memberSummaries.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = memberSummaries.reduce((sum, m) => sum + m.expense, 0);
  const totalBalance = memberSummaries.reduce((sum, m) => sum + m.balance, 0);

  return {
    members: memberSummaries,
    totalIncome,
    totalExpense,
    totalBalance,
    netSavings: totalIncome - totalExpense,
  };
}

export async function getFamilySharedBudgets(familyId: string, month: Date) {
  const categories = await prisma.category.findMany({
    where: { familyId, type: "EXPENSE", budget: { not: null } },
  });

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const spent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      category: { familyId },
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
    const budget = Number(c.budget ?? 0);
    const spentAmount = spentMap.get(c.id) ?? 0;
    return {
      id: c.id,
      name: c.name,
      budget,
      spent: spentAmount,
      remaining: budget - spentAmount,
      pct: budget > 0 ? (spentAmount / budget) * 100 : 0,
    };
  });
}
