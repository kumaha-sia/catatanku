import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  category: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  transaction: {
    count: vi.fn(),
    updateMany: vi.fn(),
    groupBy: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getCategoriesByUser,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getBudgetStatus,
} = await import("@/server/category.service");

beforeEach(() => vi.clearAllMocks());

describe("getCategoriesByUser", () => {
  it("returns categories with children", async () => {
    const cats = [
      { id: "c1", name: "Makan", children: [] },
      { id: "c2", name: "Transport", children: [] },
    ];
    mockPrisma.category.findMany.mockResolvedValue(cats);

    const result = await getCategoriesByUser("user1");

    expect(result).toEqual(cats);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      include: { children: true },
      orderBy: { name: "asc" },
    });
  });
});

describe("getCategoryById", () => {
  it("returns category by id and userId", async () => {
    const cat = { id: "c1", name: "Makan", children: [] };
    mockPrisma.category.findFirst.mockResolvedValue(cat);

    const result = await getCategoryById("c1", "user1");

    expect(result).toEqual(cat);
    expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user1" },
      include: { children: true },
    });
  });

  it("returns null if not found", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);

    const result = await getCategoryById("c999", "user1");

    expect(result).toBeNull();
  });
});

describe("createCategory", () => {
  it("creates category with provided data", async () => {
    const cat = { id: "c1", name: "Makan", type: "EXPENSE", budget: 1000000 };
    mockPrisma.category.create.mockResolvedValue(cat);

    const result = await createCategory({
      userId: "user1",
      name: "Makan",
      type: "EXPENSE",
      budget: 1000000,
    });

    expect(result).toEqual(cat);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        userId: "user1",
        name: "Makan",
        type: "EXPENSE",
        budget: 1000000,
        parentId: undefined,
      },
    });
  });
});

describe("updateCategory", () => {
  it("updates category by id and userId", async () => {
    mockPrisma.category.updateMany.mockResolvedValue({ count: 1 });

    const result = await updateCategory("c1", "user1", { name: "Makan Enak" });

    expect(result.count).toBe(1);
    expect(mockPrisma.category.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user1" },
      data: { name: "Makan Enak" },
    });
  });
});

describe("deleteCategory", () => {
  it("deletes category and detaches transactions", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ id: "c1" });
    mockPrisma.transaction.count.mockResolvedValue(3);
    mockPrisma.transaction.updateMany.mockResolvedValue({ count: 3 });
    mockPrisma.category.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteCategory("c1", "user1");

    expect(result).toEqual({ success: true, affectedTransactions: 3 });
    expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith({
      where: { categoryId: "c1" },
      data: { categoryId: null },
    });
    expect(mockPrisma.category.deleteMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user1" },
    });
  });

  it("deletes category without transactions", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ id: "c1" });
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.category.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteCategory("c1", "user1");

    expect(result).toEqual({ success: true, affectedTransactions: 0 });
    expect(mockPrisma.transaction.updateMany).not.toHaveBeenCalled();
  });

  it("throws if category not found", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);

    await expect(deleteCategory("c999", "user1")).rejects.toThrow(
      "Kategori tidak ditemukan",
    );
  });
});

describe("getBudgetStatus", () => {
  it("returns budget status for expense categories", async () => {
    const categories = [
      { id: "c1", name: "Makan", budget: 2000000 },
      { id: "c2", name: "Transport", budget: 500000 },
    ];
    const spentByCategory = [{ categoryId: "c1", _sum: { amount: 1500000 } }];

    mockPrisma.category.findMany.mockResolvedValue(categories);
    mockPrisma.transaction.groupBy.mockResolvedValue(spentByCategory);

    const result = await getBudgetStatus("user1", new Date("2026-08-01"));

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

  it("returns pct 0 when budget is 0", async () => {
    const categories = [{ id: "c1", name: "Lainnya", budget: 0 }];
    const spentByCategory = [{ categoryId: "c1", _sum: { amount: 1000000 } }];

    mockPrisma.category.findMany.mockResolvedValue(categories);
    mockPrisma.transaction.groupBy.mockResolvedValue(spentByCategory);

    const result = await getBudgetStatus("user1", new Date("2026-08-01"));

    expect(result[0].budget).toBe(0);
    expect(result[0].spent).toBe(1000000);
    expect(result[0].remaining).toBe(-1000000);
    expect(result[0].pct).toBe(0);
  });
});
