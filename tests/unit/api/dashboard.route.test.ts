import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/account.service", () => ({
  getTotalBalance: vi.fn(),
}));

vi.mock("@/server/transaction.service", () => ({
  getMonthlySummary: vi.fn(),
}));

vi.mock("@/server/budget.service", () => ({
  getBudgetVsActual: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getTotalBalance } from "@/server/account.service";
import { getMonthlySummary } from "@/server/transaction.service";
import { getBudgetVsActual } from "@/server/budget.service";
import { GET } from "@/app/api/dashboard/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/dashboard", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns all dashboard data for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(15000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 5000000,
      expense: 3000000,
      balance: 2000000,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([
      {
        id: "b1",
        name: "Makan",
        budget: 2000000,
        spent: 1500000,
        remaining: 500000,
        pct: 75,
      },
      {
        id: "b2",
        name: "Transport",
        budget: 1000000,
        spent: 800000,
        remaining: 200000,
        pct: 80,
      },
    ]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      { categoryId: "cat1", _sum: { amount: new Decimal(1500000) } },
    ]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat1", name: "Makan" },
    ]);
    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        {
          id: "tx1",
          type: "EXPENSE",
          amount: new Decimal(50000),
          date: new Date("2026-08-04"),
        },
        {
          id: "tx2",
          type: "EXPENSE",
          amount: new Decimal(30000),
          date: new Date("2026-08-05"),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "tx1",
          description: "Makan siang",
          type: "EXPENSE",
          amount: new Decimal(50000),
          date: new Date(),
          category: { name: "Makan" },
          account: { name: "BCA" },
        },
      ]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalBalance).toBe(15000000);
    expect(data.summary.income).toBe(5000000);
    expect(data.summary.expense).toBe(3000000);
    expect(data.summary.balance).toBe(2000000);
    expect(data.summary.budgetPct).toBe(77);
    expect(data.monthlyData).toHaveLength(6);
    expect(data.breakdown).toHaveLength(1);
    expect(data.breakdown[0].name).toBe("Makan");
    expect(data.budgets).toHaveLength(2);
    expect(data.budgets[0].name).toBe("Makan");
    expect(data.dayBreakdown).toHaveLength(7);
    expect(data.recentTransactions).toHaveLength(1);
  });

  it("calculates budgetPct correctly", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([
      {
        id: "b1",
        name: "Makan",
        budget: 2000000,
        spent: 1000000,
        remaining: 1000000,
        pct: 50,
      },
    ]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.summary.budgetPct).toBe(50);
  });

  it("returns budgetPct 0 when no budgets", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.summary.budgetPct).toBe(0);
  });

  it("calculates dayBreakdown correctly", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        {
          id: "tx1",
          type: "EXPENSE",
          amount: new Decimal(100000),
          date: new Date("2026-08-04"),
        },
        {
          id: "tx2",
          type: "EXPENSE",
          amount: new Decimal(200000),
          date: new Date("2026-08-04"),
        },
        {
          id: "tx3",
          type: "EXPENSE",
          amount: new Decimal(150000),
          date: new Date("2026-08-05"),
        },
      ])
      .mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.dayBreakdown).toHaveLength(7);
    expect(data.dayBreakdown[2].day).toBe("Sel");
    expect(data.dayBreakdown[2].amount).toBe(300000);
    expect(data.dayBreakdown[3].day).toBe("Rab");
    expect(data.dayBreakdown[3].amount).toBe(150000);
  });

  it("returns top 3 budgets", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([
      {
        id: "b1",
        name: "Makan",
        budget: 2000000,
        spent: 1500000,
        remaining: 500000,
        pct: 75,
      },
      {
        id: "b2",
        name: "Transport",
        budget: 1000000,
        spent: 800000,
        remaining: 200000,
        pct: 80,
      },
      {
        id: "b3",
        name: "Hiburan",
        budget: 500000,
        spent: 200000,
        remaining: 300000,
        pct: 40,
      },
      {
        id: "b4",
        name: "Belanja",
        budget: 1500000,
        spent: 1000000,
        remaining: 500000,
        pct: 67,
      },
    ]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.budgets).toHaveLength(3);
    expect(data.budgets[0].name).toBe("Makan");
    expect(data.budgets[1].name).toBe("Transport");
    expect(data.budgets[2].name).toBe("Hiburan");
  });

  it("uses custom month parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/dashboard?month=2026-01-01");
    const response = await GET(req as any);

    expect(response.status).toBe(200);
    expect(getMonthlySummary).toHaveBeenCalledWith(
      "user1",
      new Date("2026-01-01"),
    );
  });

  it("returns recent transactions with account and category", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(1000000));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "tx1",
          description: "Makan siang",
          type: "EXPENSE",
          amount: new Decimal(50000),
          date: new Date(),
          category: { name: "Makan" },
          account: { name: "BCA" },
        },
        {
          id: "tx2",
          description: "Gaji",
          type: "INCOME",
          amount: new Decimal(5000000),
          date: new Date(),
          category: { name: "Gaji" },
          account: { name: "BCA" },
        },
      ]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.recentTransactions).toHaveLength(2);
    expect(data.recentTransactions[0].description).toBe("Makan siang");
    expect(data.recentTransactions[0].account.name).toBe("BCA");
    expect(data.recentTransactions[0].category.name).toBe("Makan");
  });

  it("returns empty arrays when no data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalBalance).mockResolvedValue(new Decimal(0));
    vi.mocked(getMonthlySummary).mockResolvedValue({
      income: 0,
      expense: 0,
      balance: 0,
    });
    vi.mocked(getBudgetVsActual).mockResolvedValue([]);
    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/dashboard");
    const response = await GET(req as any);
    const data = await response.json();

    expect(data.totalBalance).toBe(0);
    expect(data.breakdown).toHaveLength(0);
    expect(data.budgets).toHaveLength(0);
    expect(data.recentTransactions).toHaveLength(0);
    expect(data.dayBreakdown).toHaveLength(7);
    expect(data.dayBreakdown.every((d: any) => d.amount === 0)).toBe(true);
  });
});
