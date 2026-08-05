import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  transaction: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { detectAnomalies } = await import("@/server/anomaly.service");

beforeEach(() => vi.clearAllMocks());

describe("detectAnomalies", () => {
  it("returns empty when no anomalies", async () => {
    const transactions = Array.from({ length: 20 }, (_, i) => ({
      id: `tx${i}`,
      description: `Makan ${i}`,
      amount: new Decimal(30000 + i * 1000),
      categoryId: "food",
      category: { name: "Makan" },
      date: new Date(`2026-08-${i + 1}`),
    }));
    mockPrisma.transaction.findMany.mockResolvedValue(transactions);

    const result = await detectAnomalies("user1");

    expect(result).toEqual([]);
  });

  it("detects anomaly when transaction is 3x average", async () => {
    const normalTxs = Array.from({ length: 10 }, (_, i) => ({
      id: `tx${i}`,
      description: `Makan ${i}`,
      amount: new Decimal(30000),
      categoryId: "food",
      category: { name: "Makan" },
      date: new Date(`2026-07-${i + 1}`),
    }));
    const anomalousTx = {
      id: "tx-anomaly",
      description: "Makan mahal",
      amount: new Decimal(500000),
      categoryId: "food",
      category: { name: "Makan" },
      date: new Date("2026-08-01"),
    };
    mockPrisma.transaction.findMany.mockResolvedValue([
      anomalousTx,
      ...normalTxs,
    ]);

    const result = await detectAnomalies("user1");

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].transactionId).toBe("tx-anomaly");
    expect(result[0].ratio).toBeGreaterThan(3);
  });

  it("ignores categories with fewer than 3 samples", async () => {
    const txs = [
      {
        id: "tx1",
        description: "Rare",
        amount: new Decimal(1000000),
        categoryId: "rare",
        category: { name: "Rare" },
        date: new Date(),
      },
      {
        id: "tx2",
        description: "Rare2",
        amount: new Decimal(50000),
        categoryId: "rare",
        category: { name: "Rare" },
        date: new Date(),
      },
    ];
    mockPrisma.transaction.findMany.mockResolvedValue(txs);

    const result = await detectAnomalies("user1");

    expect(result).toEqual([]);
  });
});
