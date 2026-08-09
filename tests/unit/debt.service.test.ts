import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  $transaction: vi.fn(async (fn: Function) => fn(mockPrisma)),
  debt: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  installment: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getDebtsByUser,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  addInstallment,
  payInstallment,
  getDebtSummary,
} = await import("@/server/debt.service");

beforeEach(() => vi.clearAllMocks());

describe("getDebtsByUser", () => {
  it("returns debts with installments ordered by createdAt desc", async () => {
    const debts = [
      {
        id: "d1",
        type: "DEBT",
        counterpartyName: "Bank BCA",
        installments: [{ id: "inst1", amount: 1000000 }],
      },
    ];
    mockPrisma.debt.findMany.mockResolvedValue(debts);

    const result = await getDebtsByUser("user1");

    expect(result).toEqual(debts);
    expect(mockPrisma.debt.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      include: { installments: { orderBy: { dueDate: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns empty array when no debts", async () => {
    mockPrisma.debt.findMany.mockResolvedValue([]);

    const result = await getDebtsByUser("user1");

    expect(result).toEqual([]);
  });
});

describe("getDebtById", () => {
  it("returns debt by id and userId", async () => {
    const debt = {
      id: "d1",
      type: "DEBT",
      counterpartyName: "Bank BCA",
      installments: [],
    };
    mockPrisma.debt.findFirst.mockResolvedValue(debt);

    const result = await getDebtById("d1", "user1");

    expect(result).toEqual(debt);
    expect(mockPrisma.debt.findFirst).toHaveBeenCalledWith({
      where: { id: "d1", userId: "user1" },
      include: { installments: { orderBy: { dueDate: "asc" } } },
    });
  });

  it("returns null if not found", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue(null);

    const result = await getDebtById("d999", "user1");

    expect(result).toBeNull();
  });
});

describe("createDebt", () => {
  it("creates debt with calculated remaining", async () => {
    const debt = {
      id: "d1",
      type: "DEBT",
      counterpartyName: "Bank BCA",
      totalAmount: new Decimal(10000000),
      paidAmount: new Decimal(2000000),
      remaining: new Decimal(8000000),
    };
    mockPrisma.debt.create.mockResolvedValue(debt);

    const result = await createDebt({
      userId: "user1",
      type: "DEBT",
      counterpartyName: "Bank BCA",
      totalAmount: 10000000,
      paidAmount: 2000000,
    });

    expect(result.remaining).toEqual(new Decimal(8000000));
    expect(mockPrisma.debt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          remaining: 8000000,
        }),
      }),
    );
  });

  it("creates debt with default paidAmount of 0", async () => {
    mockPrisma.debt.create.mockResolvedValue({
      id: "d1",
      remaining: new Decimal(5000000),
    });

    await createDebt({
      userId: "user1",
      type: "CREDIT",
      counterpartyName: "Friend",
      totalAmount: 5000000,
    });

    expect(mockPrisma.debt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paidAmount: 0,
          remaining: 5000000,
        }),
      }),
    );
  });
});

describe("updateDebt", () => {
  it("updates debt with new remaining calculation", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue({
      id: "d1",
      totalAmount: new Decimal(10000000),
      paidAmount: new Decimal(2000000),
    });
    mockPrisma.debt.update.mockResolvedValue({ id: "d1" });

    await updateDebt("d1", "user1", { paidAmount: 5000000 });

    expect(mockPrisma.debt.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { paidAmount: 5000000, remaining: 5000000 },
    });
  });

  it("updates debt with new totalAmount", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue({
      id: "d1",
      totalAmount: new Decimal(10000000),
      paidAmount: new Decimal(2000000),
    });
    mockPrisma.debt.update.mockResolvedValue({ id: "d1" });

    await updateDebt("d1", "user1", { totalAmount: 15000000 });

    expect(mockPrisma.debt.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { totalAmount: 15000000, remaining: 13000000 },
    });
  });

  it("throws if debt not found", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue(null);

    await expect(
      updateDebt("d999", "user1", { paidAmount: 1000 }),
    ).rejects.toThrow("Hutang tidak ditemukan");
  });
});

describe("deleteDebt", () => {
  it("deletes debt by id and userId", async () => {
    mockPrisma.debt.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteDebt("d1", "user1");

    expect(result.count).toBe(1);
    expect(mockPrisma.debt.deleteMany).toHaveBeenCalledWith({
      where: { id: "d1", userId: "user1" },
    });
  });

  it("returns count 0 if not found", async () => {
    mockPrisma.debt.deleteMany.mockResolvedValue({ count: 0 });

    const result = await deleteDebt("d999", "user1");

    expect(result.count).toBe(0);
  });
});

describe("addInstallment", () => {
  it("adds installment to debt", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue({ id: "d1" });
    mockPrisma.installment.create.mockResolvedValue({
      id: "inst1",
      debtId: "d1",
      amount: 1000000,
      dueDate: new Date("2026-09-01"),
    });

    const result = await addInstallment("d1", "user1", {
      amount: 1000000,
      dueDate: new Date("2026-09-01"),
    });

    expect(result.id).toBe("inst1");
    expect(mockPrisma.installment.create).toHaveBeenCalledWith({
      data: { debtId: "d1", amount: 1000000, dueDate: new Date("2026-09-01") },
    });
  });

  it("throws if debt not found", async () => {
    mockPrisma.debt.findFirst.mockResolvedValue(null);

    await expect(
      addInstallment("d999", "user1", {
        amount: 1000000,
        dueDate: new Date(),
      }),
    ).rejects.toThrow("Hutang tidak ditemukan");
  });
});

describe("payInstallment", () => {
  it("marks installment as paid and updates debt", async () => {
    const installment = {
      id: "inst1",
      debtId: "d1",
      amount: new Decimal(1000000),
      debt: {
        id: "d1",
        userId: "user1",
        paidAmount: new Decimal(2000000),
        totalAmount: new Decimal(10000000),
      },
    };
    mockPrisma.installment.findFirst.mockResolvedValue(installment);
    mockPrisma.installment.update.mockResolvedValue({
      ...installment,
      paid: true,
    });
    mockPrisma.debt.update.mockResolvedValue({});

    await payInstallment("inst1", "user1");

    expect(mockPrisma.installment.update).toHaveBeenCalledWith({
      where: { id: "inst1" },
      data: { paid: true, paidAt: expect.any(Date) },
    });
    expect(mockPrisma.debt.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { paidAmount: 3000000, remaining: 7000000 },
    });
  });

  it("throws if installment not found", async () => {
    mockPrisma.installment.findFirst.mockResolvedValue(null);

    await expect(payInstallment("inst999", "user1")).rejects.toThrow(
      "Cicilan tidak ditemukan",
    );
  });

  it("throws if installment belongs to different user", async () => {
    mockPrisma.installment.findFirst.mockResolvedValue({
      id: "inst1",
      debt: { userId: "user2" },
    });

    await expect(payInstallment("inst1", "user1")).rejects.toThrow(
      "Cicilan tidak ditemukan",
    );
  });
});

describe("getDebtSummary", () => {
  it("calculates total debt and credit", async () => {
    mockPrisma.debt.findMany
      .mockResolvedValueOnce([
        { remaining: new Decimal(5000000) },
        { remaining: new Decimal(3000000) },
      ])
      .mockResolvedValueOnce([{ remaining: new Decimal(2000000) }]);

    const result = await getDebtSummary("user1");

    expect(result.totalDebt).toBe(8000000);
    expect(result.totalCredit).toBe(2000000);
    expect(result.netDebt).toBe(6000000);
    expect(result.debtCount).toBe(2);
    expect(result.creditCount).toBe(1);
  });

  it("handles empty debts", async () => {
    mockPrisma.debt.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await getDebtSummary("user1");

    expect(result.totalDebt).toBe(0);
    expect(result.totalCredit).toBe(0);
    expect(result.netDebt).toBe(0);
    expect(result.debtCount).toBe(0);
    expect(result.creditCount).toBe(0);
  });
});
