import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
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
  createDebt,
  getDebtSummary,
  addInstallment,
  payInstallment,
} = await import("@/server/debt.service");

beforeEach(() => vi.clearAllMocks());

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
});
