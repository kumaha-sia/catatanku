import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  $transaction: vi.fn(async (fn: Function) => fn(mockPrisma)),
  transaction: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
} = await import("@/server/transaction.service");

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.$transaction.mockImplementation(async (fn: Function) =>
    fn(mockPrisma),
  );
});

describe("getTransactionsByUser", () => {
  it("returns transactions with default options", async () => {
    const mockTxs = [{ id: "1", amount: new Decimal(1000) }];
    mockPrisma.transaction.findMany.mockResolvedValue(mockTxs);

    const result = await getTransactionsByUser("user1");

    expect(result).toEqual(mockTxs);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      include: { account: true, category: true },
      orderBy: { date: "desc" },
      take: 50,
      skip: 0,
    });
  });

  it("applies filters correctly", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await getTransactionsByUser("user1", {
      accountId: "acc1",
      categoryId: "cat1",
      type: "EXPENSE",
      limit: 10,
    });

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user1",
          accountId: "acc1",
          categoryId: "cat1",
          type: "EXPENSE",
        },
        take: 10,
      }),
    );
  });

  it("applies date range filters", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    const from = new Date("2026-01-01");
    const to = new Date("2026-01-31");

    await getTransactionsByUser("user1", { from, to });

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user1",
          date: { gte: from, lte: to },
        },
      }),
    );
  });
});

describe("createTransaction", () => {
  it("creates transaction and increments balance for INCOME", async () => {
    const mockTx = { id: "tx1", type: "INCOME", amount: new Decimal(5000) };
    mockPrisma.account.findFirst.mockResolvedValue({ id: "acc1" });
    mockPrisma.transaction.create.mockResolvedValue(mockTx);
    mockPrisma.account.update.mockResolvedValue({});

    const result = await createTransaction({
      userId: "user1",
      accountId: "acc1",
      type: "INCOME",
      amount: 5000,
      description: "Gaji",
      date: new Date(),
    });

    expect(result).toEqual(mockTx);
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { increment: 5000 } },
    });
  });

  it("creates transaction and decrements balance for EXPENSE", async () => {
    const mockTx = { id: "tx2", type: "EXPENSE", amount: new Decimal(2000) };
    mockPrisma.account.findFirst.mockResolvedValue({ id: "acc1" });
    mockPrisma.transaction.create.mockResolvedValue(mockTx);
    mockPrisma.account.update.mockResolvedValue({});

    await createTransaction({
      userId: "user1",
      accountId: "acc1",
      type: "EXPENSE",
      amount: 2000,
      description: "Makan",
      date: new Date(),
    });

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { decrement: 2000 } },
    });
  });

  it("throws if account not found", async () => {
    mockPrisma.account.findFirst.mockResolvedValue(null);

    await expect(
      createTransaction({
        userId: "user1",
        accountId: "acc1",
        type: "EXPENSE",
        amount: 1000,
        description: "Test",
        date: new Date(),
      }),
    ).rejects.toThrow("Rekening sumber tidak ditemukan");
  });

  it("handles TRANSFER with targetAccountId", async () => {
    const mockTx = { id: "tx3", type: "TRANSFER", amount: new Decimal(1000) };
    mockPrisma.account.findFirst
      .mockResolvedValueOnce({ id: "acc1" })
      .mockResolvedValueOnce({ id: "acc2" });
    mockPrisma.transaction.create.mockResolvedValue(mockTx);
    mockPrisma.account.update.mockResolvedValue({});

    await createTransaction({
      userId: "user1",
      accountId: "acc1",
      type: "TRANSFER",
      amount: 1000,
      description: "Transfer",
      date: new Date(),
      targetAccountId: "acc2",
    });

    expect(mockPrisma.account.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { decrement: 1000 } },
    });
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc2" },
      data: { balance: { increment: 1000 } },
    });
  });

  it("throws if TRANSFER without targetAccountId", async () => {
    mockPrisma.account.findFirst.mockResolvedValue({ id: "acc1" });

    await expect(
      createTransaction({
        userId: "user1",
        accountId: "acc1",
        type: "TRANSFER",
        amount: 1000,
        description: "Transfer",
        date: new Date(),
      }),
    ).rejects.toThrow("Rekening tujuan wajib untuk transfer");
  });
});

describe("updateTransaction", () => {
  it("reverses old EXPENSE balance and applies new EXPENSE balance", async () => {
    const existing = {
      id: "tx1",
      userId: "user1",
      type: "EXPENSE",
      amount: new Decimal(1000),
      accountId: "acc1",
    };
    const updated = {
      ...existing,
      type: "EXPENSE",
      amount: new Decimal(2000),
      accountId: "acc1",
    };
    mockPrisma.transaction.findFirst.mockResolvedValue(existing);
    mockPrisma.transaction.update.mockResolvedValue(updated);
    mockPrisma.account.update.mockResolvedValue({});

    const result = await updateTransaction("tx1", "user1", { amount: 2000 });

    expect(result).toEqual(updated);
    expect(mockPrisma.account.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { increment: 1000 } },
    });
  });

  it("reverses old INCOME balance and applies new INCOME balance", async () => {
    const existing = {
      id: "tx1",
      userId: "user1",
      type: "INCOME",
      amount: new Decimal(5000),
      accountId: "acc1",
    };
    const updated = {
      ...existing,
      type: "INCOME",
      amount: new Decimal(8000),
      accountId: "acc1",
    };
    mockPrisma.transaction.findFirst.mockResolvedValue(existing);
    mockPrisma.transaction.update.mockResolvedValue(updated);
    mockPrisma.account.update.mockResolvedValue({});

    await updateTransaction("tx1", "user1", { amount: 8000 });

    expect(mockPrisma.account.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { decrement: 5000 } },
    });
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { increment: 8000 } },
    });
  });

  it("throws if transaction not found", async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue(null);

    await expect(updateTransaction("tx999", "user1", {})).rejects.toThrow(
      "Transaksi tidak ditemukan",
    );
  });
});

describe("deleteTransaction", () => {
  it("reverses INCOME balance and deletes transaction", async () => {
    const existing = {
      id: "tx1",
      userId: "user1",
      type: "INCOME",
      amount: new Decimal(5000),
      accountId: "acc1",
    };
    mockPrisma.transaction.findFirst.mockResolvedValue(existing);
    mockPrisma.transaction.delete.mockResolvedValue(existing);
    mockPrisma.account.update.mockResolvedValue({});

    await deleteTransaction("tx1", "user1");

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { decrement: 5000 } },
    });
    expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
      where: { id: "tx1" },
    });
  });

  it("reverses EXPENSE balance (increment) and deletes transaction", async () => {
    const existing = {
      id: "tx2",
      userId: "user1",
      type: "EXPENSE",
      amount: new Decimal(3000),
      accountId: "acc1",
    };
    mockPrisma.transaction.findFirst.mockResolvedValue(existing);
    mockPrisma.transaction.delete.mockResolvedValue(existing);
    mockPrisma.account.update.mockResolvedValue({});

    await deleteTransaction("tx2", "user1");

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc1" },
      data: { balance: { increment: 3000 } },
    });
  });

  it("throws if transaction not found", async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue(null);

    await expect(deleteTransaction("tx999", "user1")).rejects.toThrow(
      "Transaksi tidak ditemukan",
    );
  });
});

describe("getMonthlySummary", () => {
  it("returns income, expense, and balance", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(10000) } })
      .mockResolvedValueOnce({ _sum: { amount: new Decimal(3000) } });

    const result = await getMonthlySummary("user1", new Date("2026-08-01"));

    expect(result).toEqual({
      income: 10000,
      expense: 3000,
      balance: 7000,
    });
  });

  it("handles null amounts gracefully", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    const result = await getMonthlySummary("user1", new Date("2026-08-01"));

    expect(result).toEqual({ income: 0, expense: 0, balance: 0 });
  });
});
