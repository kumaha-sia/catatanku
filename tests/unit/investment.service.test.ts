import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  investment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  investmentTransaction: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getInvestmentsByUser,
  getInvestmentById,
  createInvestment,
  updateInvestmentValue,
  deleteInvestment,
  addInvestmentTransaction,
  getInvestmentSummary,
} = await import("@/server/investment.service");

beforeEach(() => vi.clearAllMocks());

describe("getInvestmentsByUser", () => {
  it("returns investments with transactions", async () => {
    const invs = [{ id: "i1", instrument: "STOCK", transactions: [] }];
    mockPrisma.investment.findMany.mockResolvedValue(invs);

    const result = await getInvestmentsByUser("user1");

    expect(result).toEqual(invs);
    expect(mockPrisma.investment.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      include: { transactions: { orderBy: { date: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getInvestmentById", () => {
  it("returns investment by id", async () => {
    const inv = { id: "i1", instrument: "STOCK" };
    mockPrisma.investment.findFirst.mockResolvedValue(inv);

    const result = await getInvestmentById("i1", "user1");

    expect(result).toEqual(inv);
  });

  it("returns null if not found", async () => {
    mockPrisma.investment.findFirst.mockResolvedValue(null);

    const result = await getInvestmentById("i999", "user1");

    expect(result).toBeNull();
  });
});

describe("createInvestment", () => {
  it("creates investment with calculated returnPct", async () => {
    const inv = {
      id: "i1",
      instrument: "STOCK",
      units: 100,
      buyPrice: 1000,
      currentValue: 1200,
      returnPct: 20,
    };
    mockPrisma.investment.create.mockResolvedValue(inv);

    const result = await createInvestment({
      userId: "user1",
      instrument: "STOCK",
      units: 100,
      buyPrice: 1000,
      currentValue: 1200,
    });

    expect(result).toEqual(inv);
    expect(mockPrisma.investment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          returnPct: 20,
        }),
      }),
    );
  });
});

describe("updateInvestmentValue", () => {
  it("updates currentValue and recalculates returnPct", async () => {
    const inv = {
      id: "i1",
      buyPrice: new Decimal(1000),
      units: new Decimal(100),
    };
    mockPrisma.investment.findFirst.mockResolvedValue(inv);
    mockPrisma.investment.update.mockResolvedValue({
      ...inv,
      currentValue: 1500,
      returnPct: 50,
    });

    const result = await updateInvestmentValue("i1", "user1", 1500);

    expect(mockPrisma.investment.update).toHaveBeenCalledWith({
      where: { id: "i1" },
      data: { currentValue: 1500, returnPct: 50 },
    });
  });

  it("throws if investment not found", async () => {
    mockPrisma.investment.findFirst.mockResolvedValue(null);

    await expect(updateInvestmentValue("i999", "user1", 1000)).rejects.toThrow(
      "Investasi tidak ditemukan",
    );
  });
});

describe("deleteInvestment", () => {
  it("deletes investment", async () => {
    mockPrisma.investment.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteInvestment("i1", "user1");

    expect(result.count).toBe(1);
  });
});

describe("addInvestmentTransaction", () => {
  it("creates BUY transaction and updates units/price", async () => {
    const inv = {
      id: "i1",
      units: new Decimal(100),
      buyPrice: new Decimal(1000),
    };
    mockPrisma.investment.findFirst.mockResolvedValue(inv);
    mockPrisma.investmentTransaction.create.mockResolvedValue({
      id: "tx1",
      type: "BUY",
    });
    mockPrisma.investment.update.mockResolvedValue({});

    await addInvestmentTransaction("i1", "user1", {
      type: "BUY",
      units: 50,
      price: 1200,
      date: new Date(),
    });

    expect(mockPrisma.investment.update).toHaveBeenCalledWith({
      where: { id: "i1" },
      data: {
        units: 150,
        buyPrice: expect.closeTo(1066.67, 1),
      },
    });
  });

  it("creates SELL transaction and decrements units", async () => {
    const inv = {
      id: "i1",
      units: new Decimal(100),
      buyPrice: new Decimal(1000),
    };
    mockPrisma.investment.findFirst.mockResolvedValue(inv);
    mockPrisma.investmentTransaction.create.mockResolvedValue({
      id: "tx2",
      type: "SELL",
    });
    mockPrisma.investment.update.mockResolvedValue({});

    await addInvestmentTransaction("i1", "user1", {
      type: "SELL",
      units: 30,
      price: 1500,
      date: new Date(),
    });

    expect(mockPrisma.investment.update).toHaveBeenCalledWith({
      where: { id: "i1" },
      data: { units: 70 },
    });
  });

  it("throws if investment not found", async () => {
    mockPrisma.investment.findFirst.mockResolvedValue(null);

    await expect(
      addInvestmentTransaction("i999", "user1", {
        type: "BUY",
        units: 10,
        price: 1000,
        date: new Date(),
      }),
    ).rejects.toThrow("Investasi tidak ditemukan");
  });
});

describe("getInvestmentSummary", () => {
  it("calculates total buy, current, and gain/loss", async () => {
    const investments = [
      {
        buyPrice: new Decimal(1000),
        units: new Decimal(100),
        currentValue: new Decimal(1200),
      },
      {
        buyPrice: new Decimal(500),
        units: new Decimal(200),
        currentValue: new Decimal(400),
      },
    ];
    mockPrisma.investment.findMany.mockResolvedValue(investments);

    const result = await getInvestmentSummary("user1");

    expect(result.totalBuy).toBe(200000);
    expect(result.totalCurrent).toBe(200000);
    expect(result.gainLoss).toBe(0);
    expect(result.count).toBe(2);
  });
});
