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

const { setBudget, getBudgetVsActual } =
  await import("@/server/budget.service");

beforeEach(() => vi.clearAllMocks());

describe("setBudget", () => {
  it("updates budget for category", async () => {
    mockPrisma.category.updateMany.mockResolvedValue({ count: 1 });

    await setBudget("cat1", "user1", 5000000);

    expect(mockPrisma.category.updateMany).toHaveBeenCalledWith({
      where: { id: "cat1", userId: "user1" },
      data: { budget: 5000000 },
    });
  });
});

describe("getBudgetVsActual", () => {
  it("returns budget vs actual with percentages", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: "cat1", name: "Makan", budget: new Decimal(3000000) },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([
      { categoryId: "cat1", _sum: { amount: new Decimal(1500000) } },
    ]);

    const result = await getBudgetVsActual("user1", new Date("2026-08-01"));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Makan");
    expect(result[0].budget).toBe(3000000);
    expect(result[0].spent).toBe(1500000);
    expect(result[0].remaining).toBe(1500000);
    expect(result[0].pct).toBe(50);
  });

  it("handles categories with no spending", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: "cat1", name: "Hiburan", budget: new Decimal(1000000) },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([]);

    const result = await getBudgetVsActual("user1", new Date("2026-08-01"));

    expect(result[0].spent).toBe(0);
    expect(result[0].pct).toBe(0);
  });

  it("returns pct 0 when budget is 0", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: "cat1", name: "Lainnya", budget: new Decimal(0) },
    ]);
    mockPrisma.transaction.groupBy.mockResolvedValue([
      { categoryId: "cat1", _sum: { amount: new Decimal(500000) } },
    ]);

    const result = await getBudgetVsActual("user1", new Date("2026-08-01"));

    expect(result[0].budget).toBe(0);
    expect(result[0].spent).toBe(500000);
    expect(result[0].remaining).toBe(-500000);
    expect(result[0].pct).toBe(0);
  });
});
