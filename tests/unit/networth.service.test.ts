import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockAccountService = {
  getTotalBalance: vi.fn(),
};
const mockDebtService = {
  getDebtSummary: vi.fn(),
};
const mockAssetService = {
  getAssetSummary: vi.fn(),
};
const mockInvestmentService = {
  getInvestmentSummary: vi.fn(),
};
const mockPrisma = {
  transaction: {
    aggregate: vi.fn(),
  },
};

vi.mock("@/server/account.service", () => mockAccountService);
vi.mock("@/server/debt.service", () => mockDebtService);
vi.mock("@/server/asset.service", () => mockAssetService);
vi.mock("@/server/investment.service", () => mockInvestmentService);
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { getNetWorth, getNetWorthHistory } =
  await import("@/server/networth.service");

beforeEach(() => {
  vi.clearAllMocks();
  mockAccountService.getTotalBalance.mockReset();
  mockDebtService.getDebtSummary.mockReset();
  mockAssetService.getAssetSummary.mockReset();
  mockInvestmentService.getInvestmentSummary.mockReset();
  mockPrisma.transaction.aggregate.mockReset();
});

describe("getNetWorth", () => {
  it("calculates net worth from all sources", async () => {
    mockAccountService.getTotalBalance.mockResolvedValue(10000000);
    mockDebtService.getDebtSummary.mockResolvedValue({
      totalDebt: 5000000,
      totalCredit: 2000000,
    });
    mockAssetService.getAssetSummary.mockResolvedValue({
      totalValue: 500000000,
    });
    mockInvestmentService.getInvestmentSummary.mockResolvedValue({
      totalCurrent: 50000000,
    });

    const result = await getNetWorth("user1");

    expect(result.totalAssets).toBe(560000000);
    expect(result.totalLiabilities).toBe(5000000);
    expect(result.netWorth).toBe(555000000);
    expect(result.breakdown.accounts).toBe(10000000);
    expect(result.breakdown.assets).toBe(500000000);
    expect(result.breakdown.investments).toBe(50000000);
  });
});

describe("getNetWorthHistory", () => {
  it("returns monthly net worth history", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(10000000) } })
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(3000000) } })
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(20000000) } })
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(5000000) } });

    const result = await getNetWorthHistory("user1", 2);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("month");
    expect(result[0]).toHaveProperty("netWorth");
    expect(result[0].netWorth).toBe(7000000);
    expect(result[1].netWorth).toBe(15000000);
  });

  it("handles null amounts", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    const result = await getNetWorthHistory("user1", 1);

    expect(result).toHaveLength(1);
    expect(result[0].netWorth).toBe(0);
  });
});
