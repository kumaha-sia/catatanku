import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = {
  asset: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const {
  getAssetsByUser,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetSummary,
} = await import("@/server/asset.service");

beforeEach(() => vi.clearAllMocks());

describe("getAssetsByUser", () => {
  it("returns assets ordered by createdAt desc", async () => {
    const assets = [{ id: "a1", name: "Rumah" }];
    mockPrisma.asset.findMany.mockResolvedValue(assets);

    const result = await getAssetsByUser("user1");

    expect(result).toEqual(assets);
    expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getAssetById", () => {
  it("returns asset by id and userId", async () => {
    const asset = { id: "a1", name: "Rumah" };
    mockPrisma.asset.findFirst.mockResolvedValue(asset);

    const result = await getAssetById("a1", "user1");

    expect(result).toEqual(asset);
  });

  it("returns null if not found", async () => {
    mockPrisma.asset.findFirst.mockResolvedValue(null);

    const result = await getAssetById("a999", "user1");

    expect(result).toBeNull();
  });
});

describe("createAsset", () => {
  it("creates asset with metadata", async () => {
    const asset = {
      id: "a1",
      name: "Rumah",
      type: "REAL_ESTATE",
      currentValue: 500000000,
      purchasePrice: 400000000,
    };
    mockPrisma.asset.create.mockResolvedValue(asset);

    const result = await createAsset({
      userId: "user1",
      type: "REAL_ESTATE",
      name: "Rumah",
      currentValue: 500000000,
      purchasePrice: 400000000,
    });

    expect(result).toEqual(asset);
  });
});

describe("updateAsset", () => {
  it("updates only provided fields", async () => {
    mockPrisma.asset.updateMany.mockResolvedValue({ count: 1 });

    await updateAsset("a1", "user1", { currentValue: 600000000 });

    expect(mockPrisma.asset.updateMany).toHaveBeenCalledWith({
      where: { id: "a1", userId: "user1" },
      data: { currentValue: 600000000 },
    });
  });

  it("updates purchasePrice field", async () => {
    mockPrisma.asset.updateMany.mockResolvedValue({ count: 1 });

    await updateAsset("a1", "user1", { purchasePrice: 500000000 });

    expect(mockPrisma.asset.updateMany).toHaveBeenCalledWith({
      where: { id: "a1", userId: "user1" },
      data: { purchasePrice: 500000000 },
    });
  });

  it("updates metadata field", async () => {
    mockPrisma.asset.updateMany.mockResolvedValue({ count: 1 });
    const metadata = { address: "Jl. Sudirman", luas: 200 };

    await updateAsset("a1", "user1", { metadata });

    expect(mockPrisma.asset.updateMany).toHaveBeenCalledWith({
      where: { id: "a1", userId: "user1" },
      data: { metadata },
    });
  });

  it("updates multiple fields at once", async () => {
    mockPrisma.asset.updateMany.mockResolvedValue({ count: 1 });

    await updateAsset("a1", "user1", {
      name: "Rumah Baru",
      currentValue: 700000000,
      purchasePrice: 500000000,
      type: "REAL_ESTATE",
    });

    expect(mockPrisma.asset.updateMany).toHaveBeenCalledWith({
      where: { id: "a1", userId: "user1" },
      data: {
        name: "Rumah Baru",
        currentValue: 700000000,
        purchasePrice: 500000000,
        type: "REAL_ESTATE",
      },
    });
  });

  it("skips undefined fields", async () => {
    mockPrisma.asset.updateMany.mockResolvedValue({ count: 1 });

    await updateAsset("a1", "user1", { name: "Updated" });

    const call = mockPrisma.asset.updateMany.mock.calls[0][0];
    expect(call.data).not.toHaveProperty("currentValue");
    expect(call.data).not.toHaveProperty("purchasePrice");
    expect(call.data).not.toHaveProperty("metadata");
  });
});

describe("deleteAsset", () => {
  it("deletes asset by id and userId", async () => {
    mockPrisma.asset.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteAsset("a1", "user1");

    expect(result.count).toBe(1);
  });
});

describe("getAssetSummary", () => {
  it("calculates total value, purchase, and gain/loss", async () => {
    const assets = [
      {
        currentValue: new Decimal(600000000),
        purchasePrice: new Decimal(400000000),
      },
      {
        currentValue: new Decimal(100000000),
        purchasePrice: new Decimal(150000000),
      },
    ];
    mockPrisma.asset.findMany.mockResolvedValue(assets);

    const result = await getAssetSummary("user1");

    expect(result.totalValue).toBe(700000000);
    expect(result.totalPurchase).toBe(550000000);
    expect(result.gainLoss).toBe(150000000);
    expect(result.count).toBe(2);
  });

  it("handles empty assets", async () => {
    mockPrisma.asset.findMany.mockResolvedValue([]);

    const result = await getAssetSummary("user1");

    expect(result.totalValue).toBe(0);
    expect(result.gainLossPct).toBe(0);
  });
});
