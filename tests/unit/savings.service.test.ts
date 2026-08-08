import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  category: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  transaction: {
    groupBy: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { getSavingsByUser, setSavingsTarget } =
  await import("@/server/savings.service");

beforeEach(() => vi.clearAllMocks());

describe("getSavingsByUser", () => {
  it("returns savings with calculated balance from transactions", async () => {
    const savings = [
      { id: "s1", name: "Dana Darurat", budget: new Decimal(50000000) },
      { id: "s2", name: "Liburan", budget: new Decimal(10000000) },
    ];
    const incomeByCategory = [
      { categoryId: "s1", _sum: { amount: new Decimal(20000000) } },
      { categoryId: "s2", _sum: { amount: new Decimal(5000000) } },
    ];
    const expenseByCategory = [
      { categoryId: "s1", _sum: { amount: new Decimal(2000000) } },
    ];

    mockPrisma.category.findMany.mockResolvedValue(savings);
    mockPrisma.transaction.groupBy
      .mockResolvedValueOnce(incomeByCategory)
      .mockResolvedValueOnce(expenseByCategory);

    const result = await getSavingsByUser("user1");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "s1",
      name: "Dana Darurat",
      target: 50000000,
      saved: 18000000,
      pct: 36,
      remaining: 32000000,
    });
    expect(result[1]).toEqual({
      id: "s2",
      name: "Liburan",
      target: 10000000,
      saved: 5000000,
      pct: 50,
      remaining: 5000000,
    });
  });

  it("returns empty array if no savings categories", async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);

    const result = await getSavingsByUser("user1");

    expect(result).toEqual([]);
    expect(mockPrisma.transaction.groupBy).not.toHaveBeenCalled();
  });

  it("handles savings with no transactions", async () => {
    const savings = [
      { id: "s1", name: "Dana Darurat", budget: new Decimal(50000000) },
    ];
    mockPrisma.category.findMany.mockResolvedValue(savings);
    mockPrisma.transaction.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await getSavingsByUser("user1");

    expect(result[0].saved).toBe(0);
    expect(result[0].pct).toBe(0);
    expect(result[0].remaining).toBe(50000000);
  });

  it("caps pct at 100", async () => {
    const savings = [
      { id: "s1", name: "Tabungan", budget: new Decimal(1000000) },
    ];
    mockPrisma.category.findMany.mockResolvedValue(savings);
    mockPrisma.transaction.groupBy
      .mockResolvedValueOnce([
        { categoryId: "s1", _sum: { amount: new Decimal(2000000) } },
      ])
      .mockResolvedValueOnce([]);

    const result = await getSavingsByUser("user1");

    expect(result[0].pct).toBe(100);
  });
});

describe("setSavingsTarget", () => {
  it("updates budget for savings category", async () => {
    mockPrisma.category.updateMany.mockResolvedValue({ count: 1 });

    const result = await setSavingsTarget("s1", "user1", 10000000);

    expect(mockPrisma.category.updateMany).toHaveBeenCalledWith({
      where: { id: "s1", userId: "user1", type: "SAVINGS" },
      data: { budget: 10000000 },
    });
  });
});
