import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  family: {
    create: vi.fn(),
  },
  transaction: {
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  account: {
    aggregate: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getFamilyByUser,
  createFamily,
  getFamilyMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  getFamilySummary,
  getFamilySharedBudgets,
} = await import("@/server/family.service");

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.user.findUnique.mockReset();
  mockPrisma.user.findFirst.mockReset();
  mockPrisma.user.findMany.mockReset();
  mockPrisma.user.update.mockReset();
  mockPrisma.family.create.mockReset();
  mockPrisma.transaction.aggregate.mockReset();
  mockPrisma.transaction.groupBy.mockReset();
  mockPrisma.account.aggregate.mockReset();
});

describe("getFamilyByUser", () => {
  it("returns family with members", async () => {
    const user = {
      id: "user1",
      family: { id: "f1", name: "Keluarga Budi", members: [] },
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await getFamilyByUser("user1");

    expect(result).toEqual(user.family);
  });

  it("returns null if user has no family", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user1", family: null });

    const result = await getFamilyByUser("user1");

    expect(result).toBeNull();
  });
});

describe("createFamily", () => {
  it("creates family and updates user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      familyId: null,
    });
    mockPrisma.family.create.mockResolvedValue({
      id: "f1",
      name: "Keluarga Budi",
    });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await createFamily("user1", "Keluarga Budi");

    expect(result.id).toBe("f1");
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { familyId: "f1", role: "OWNER" },
    });
  });

  it("throws if user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(createFamily("user999", "Test")).rejects.toThrow(
      "Pengguna tidak ditemukan",
    );
  });

  it("throws if user already has family", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      familyId: "f1",
    });

    await expect(createFamily("user1", "Test")).rejects.toThrow(
      "Sudah memiliki keluarga",
    );
  });
});

describe("getFamilyMembers", () => {
  it("returns members of a family", async () => {
    const members = [
      { id: "user1", name: "Budi", email: "budi@test.com", role: "OWNER" },
      { id: "user2", name: "Ani", email: "ani@test.com", role: "MEMBER" },
    ];
    mockPrisma.user.findMany.mockResolvedValue(members);

    const result = await getFamilyMembers("f1");

    expect(result).toEqual(members);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { familyId: "f1" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("inviteMember", () => {
  it("invites existing user to family", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user2",
      familyId: null,
    });
    mockPrisma.user.update.mockResolvedValue({
      id: "user2",
      familyId: "f1",
      role: "MEMBER",
    });

    const result = await inviteMember("f1", "user1", "ani@test.com", "MEMBER");

    expect(result.familyId).toBe("f1");
  });

  it("throws if inviter has no permission", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      inviteMember("f1", "user1", "ani@test.com", "MEMBER"),
    ).rejects.toThrow("Tidak memiliki izin untuk mengundang anggota");
  });

  it("throws if target user not registered", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      inviteMember("f1", "user1", "new@test.com", "MEMBER"),
    ).rejects.toThrow("Pengguna dengan email tersebut belum terdaftar");
  });

  it("throws if user already in family", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user2",
      familyId: "f1",
    });

    await expect(
      inviteMember("f1", "user1", "ani@test.com", "MEMBER"),
    ).rejects.toThrow("Pengguna sudah menjadi anggota keluarga");
  });
});

describe("removeMember", () => {
  it("removes member from family", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });
    mockPrisma.user.update.mockResolvedValue({});

    await removeMember("f1", "user1", "user2");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user2" },
      data: { familyId: null, role: "MEMBER" },
    });
  });

  it("throws if remover is not owner", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(removeMember("f1", "user1", "user2")).rejects.toThrow(
      "Hanya owner yang bisa menghapus anggota",
    );
  });

  it("throws if trying to remove self", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });

    await expect(removeMember("f1", "user1", "user1")).rejects.toThrow(
      "Tidak bisa menghapus diri sendiri",
    );
  });
});

describe("updateMemberRole", () => {
  it("updates member role", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "user1",
      role: "OWNER",
    });
    mockPrisma.user.update.mockResolvedValue({});

    await updateMemberRole("f1", "user1", "user2", "VIEWER");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user2" },
      data: { role: "VIEWER" },
    });
  });

  it("throws if updater is not owner", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      updateMemberRole("f1", "user1", "user2", "VIEWER"),
    ).rejects.toThrow("Hanya owner yang bisa mengubah role");
  });
});

describe("getFamilySummary", () => {
  it("returns per-member and total summaries", async () => {
    const members = [
      { id: "user1", name: "Budi" },
      { id: "user2", name: "Ani" },
    ];
    mockPrisma.user.findMany.mockResolvedValue(members);

    // Use mockImplementation to return consistent values per call
    let callCount = 0;
    mockPrisma.transaction.aggregate.mockImplementation(() => {
      callCount++;
      // member1: income=10M, expense=3M; member2: income=5M, expense=2M
      const values = [
        { _sum: { amount: new Decimal(10000000) } },
        { _sum: { amount: new Decimal(3000000) } },
        { _sum: { amount: new Decimal(5000000) } },
        { _sum: { amount: new Decimal(2000000) } },
      ];
      return Promise.resolve(values[(callCount - 1) % 4]);
    });

    mockPrisma.account.aggregate.mockResolvedValue({
      _sum: { balance: new Decimal(15000000) },
    });

    const result = await getFamilySummary("f1", new Date("2026-08-01"));

    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toHaveProperty("userId");
    expect(result.members[0]).toHaveProperty("name");
    expect(result.members[0]).toHaveProperty("income");
    expect(result.members[0]).toHaveProperty("expense");
    expect(result.members[0]).toHaveProperty("balance");
    expect(result).toHaveProperty("totalIncome");
    expect(result).toHaveProperty("totalExpense");
    expect(result).toHaveProperty("totalBalance");
    expect(result).toHaveProperty("netSavings");
  });
});

describe("getFamilySharedBudgets", () => {
  it("returns family budgets with spent amounts", async () => {
    const categories = [
      { id: "c1", name: "Makan", budget: new Decimal(2000000) },
      { id: "c2", name: "Transport", budget: new Decimal(500000) },
    ];
    const spent = [
      { categoryId: "c1", _sum: { amount: new Decimal(1500000) } },
    ];

    mockPrisma.category.findMany.mockResolvedValue(categories);
    mockPrisma.transaction.groupBy.mockResolvedValue(spent);

    const result = await getFamilySharedBudgets("f1", new Date("2026-08-01"));

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "c1",
      name: "Makan",
      budget: 2000000,
      spent: 1500000,
      remaining: 500000,
      pct: 75,
    });
    expect(result[1]).toEqual({
      id: "c2",
      name: "Transport",
      budget: 500000,
      spent: 0,
      remaining: 500000,
      pct: 0,
    });
  });

  it("returns empty array when no family budgets", async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await getFamilySharedBudgets("f1", new Date("2026-08-01"));

    expect(result).toEqual([]);
  });

  it("handles over-budget categories", async () => {
    const categories = [
      { id: "c1", name: "Makan", budget: new Decimal(1000000) },
    ];
    const spent = [
      { categoryId: "c1", _sum: { amount: new Decimal(1500000) } },
    ];

    mockPrisma.category.findMany.mockResolvedValue(categories);
    mockPrisma.transaction.groupBy.mockResolvedValue(spent);

    const result = await getFamilySharedBudgets("f1", new Date("2026-08-01"));

    expect(result[0].remaining).toBe(-500000);
    expect(result[0].pct).toBe(150);
  });
});
