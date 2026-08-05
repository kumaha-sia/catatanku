import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  account: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    aggregate: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getAccountsByUser,
  createAccount,
  getTotalBalance,
  updateAccount,
  deleteAccount,
} = await import("@/server/account.service");

beforeEach(() => vi.clearAllMocks());

describe("getAccountsByUser", () => {
  it("returns accounts ordered by creation date", async () => {
    const accounts = [
      { id: "1", name: "BCA", balance: new Decimal(5000000) },
      { id: "2", name: "Cash", balance: new Decimal(100000) },
    ];
    mockPrisma.account.findMany.mockResolvedValue(accounts);

    const result = await getAccountsByUser("user1");

    expect(result).toEqual(accounts);
    expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("createAccount", () => {
  it("creates account with default values", async () => {
    const account = {
      id: "1",
      name: "BCA",
      type: "BANK",
      balance: new Decimal(0),
      currency: "IDR",
    };
    mockPrisma.account.create.mockResolvedValue(account);

    const result = await createAccount({
      userId: "user1",
      name: "BCA",
      type: "BANK",
    });

    expect(result).toEqual(account);
    expect(mockPrisma.account.create).toHaveBeenCalledWith({
      data: {
        userId: "user1",
        name: "BCA",
        type: "BANK",
        balance: 0,
        currency: "IDR",
      },
    });
  });

  it("creates account with custom balance", async () => {
    mockPrisma.account.create.mockResolvedValue({ id: "1" });

    await createAccount({
      userId: "user1",
      name: "Mandiri",
      type: "BANK",
      balance: 1000000,
    });

    expect(mockPrisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ balance: 1000000 }),
      }),
    );
  });
});

describe("getTotalBalance", () => {
  it("returns total balance across accounts", async () => {
    mockPrisma.account.aggregate.mockResolvedValue({
      _sum: { balance: new Decimal(5100000) },
    });

    const result = await getTotalBalance("user1");

    expect(result).toEqual(new Decimal(5100000));
  });

  it("returns 0 when no accounts", async () => {
    mockPrisma.account.aggregate.mockResolvedValue({ _sum: { balance: null } });

    const result = await getTotalBalance("user1");

    expect(result).toEqual(0);
  });
});

describe("updateAccount", () => {
  it("updates account by id and userId", async () => {
    mockPrisma.account.updateMany.mockResolvedValue({ count: 1 });

    await updateAccount("acc1", "user1", { name: "BCA Updated" });

    expect(mockPrisma.account.updateMany).toHaveBeenCalledWith({
      where: { id: "acc1", userId: "user1" },
      data: { name: "BCA Updated" },
    });
  });
});

describe("deleteAccount", () => {
  it("deletes account by id and userId", async () => {
    mockPrisma.account.deleteMany.mockResolvedValue({ count: 1 });

    await deleteAccount("acc1", "user1");

    expect(mockPrisma.account.deleteMany).toHaveBeenCalledWith({
      where: { id: "acc1", userId: "user1" },
    });
  });
});
