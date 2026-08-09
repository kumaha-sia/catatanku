import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/asset.service", () => ({
  getAssetsByUser: vi.fn(),
  getAssetById: vi.fn(),
  createAsset: vi.fn(),
  updateAsset: vi.fn(),
  deleteAsset: vi.fn(),
  getAssetSummary: vi.fn(),
}));

vi.mock("@/server/investment.service", () => ({
  getInvestmentsByUser: vi.fn(),
  getInvestmentById: vi.fn(),
  createInvestment: vi.fn(),
  updateInvestmentValue: vi.fn(),
  deleteInvestment: vi.fn(),
  getInvestmentSummary: vi.fn(),
  addInvestmentTransaction: vi.fn(),
}));

import { getServerSession } from "next-auth";
import {
  getAssetsByUser,
  getAssetSummary,
  createAsset,
  deleteAsset,
} from "@/server/asset.service";
import {
  getInvestmentsByUser,
  getInvestmentSummary,
  createInvestment,
  deleteInvestment,
  addInvestmentTransaction,
} from "@/server/investment.service";
import { GET as GET_ASSETS, POST as POST_ASSET } from "@/app/api/assets/route";
import { DELETE as DELETE_ASSET } from "@/app/api/assets/[id]/route";
import {
  GET as GET_INVESTMENTS,
  POST as POST_INVESTMENT,
} from "@/app/api/investments/route";
import { DELETE as DELETE_INVESTMENT } from "@/app/api/investments/[id]/route";
import { POST as POST_INV_TX } from "@/app/api/investments/[id]/transactions/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("Assets API", () => {
  describe("GET /api/assets", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_ASSETS();
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("returns assets with summary", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const assets = [
        {
          id: "a1",
          name: "Rumah",
          type: "REAL_ESTATE",
          currentValue: 500000000,
        },
      ];
      const summary = {
        totalValue: 500000000,
        totalPurchase: 400000000,
        gainLoss: 100000000,
        gainLossPct: 25,
        count: 1,
      };
      vi.mocked(getAssetsByUser).mockResolvedValue(assets as any);
      vi.mocked(getAssetSummary).mockResolvedValue(summary);

      const response = await GET_ASSETS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.assets).toEqual(assets);
      expect(data.summary).toEqual(summary);
    });
  });

  describe("POST /api/assets", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/assets", {
        method: "POST",
        body: JSON.stringify({
          type: "REAL_ESTATE",
          name: "Rumah",
          currentValue: 500000000,
          purchasePrice: 400000000,
        }),
      });
      const response = await POST_ASSET(req as any);

      expect(response.status).toBe(401);
    });

    it("creates asset and returns 201", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const newAsset = {
        id: "a1",
        name: "Rumah",
        type: "REAL_ESTATE",
      };
      vi.mocked(createAsset).mockResolvedValue(newAsset as any);

      const req = new Request("http://localhost/api/assets", {
        method: "POST",
        body: JSON.stringify({
          type: "REAL_ESTATE",
          name: "Rumah",
          currentValue: 500000000,
          purchasePrice: 400000000,
        }),
      });
      const response = await POST_ASSET(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newAsset);
    });

    it("returns 400 for invalid type", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const req = new Request("http://localhost/api/assets", {
        method: "POST",
        body: JSON.stringify({
          type: "INVALID",
          name: "Test",
          currentValue: 100,
          purchasePrice: 100,
        }),
      });
      const response = await POST_ASSET(req as any);

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/assets/[id]", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await DELETE_ASSET({} as any, {
        params: Promise.resolve({ id: "a1" }),
      });

      expect(response.status).toBe(401);
    });

    it("deletes asset successfully", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(deleteAsset).mockResolvedValue({ count: 1 } as any);

      const response = await DELETE_ASSET({} as any, {
        params: Promise.resolve({ id: "a1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe("Investments API", () => {
  describe("GET /api/investments", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_INVESTMENTS();
      const data = await response.json();

      expect(response.status).toBe(401);
    });

    it("returns investments with summary", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const investments = [
        {
          id: "i1",
          instrument: "STOCK",
          units: 100,
          buyPrice: 1000,
          currentValue: 1200,
        },
      ];
      const summary = {
        totalBuy: 100000,
        totalCurrent: 120000,
        gainLoss: 20000,
        gainLossPct: 20,
        count: 1,
      };
      vi.mocked(getInvestmentsByUser).mockResolvedValue(investments as any);
      vi.mocked(getInvestmentSummary).mockResolvedValue(summary);

      const response = await GET_INVESTMENTS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.investments).toEqual(investments);
      expect(data.summary).toEqual(summary);
    });
  });

  describe("POST /api/investments", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/investments", {
        method: "POST",
        body: JSON.stringify({
          instrument: "STOCK",
          units: 100,
          buyPrice: 1000,
        }),
      });
      const response = await POST_INVESTMENT(req as any);

      expect(response.status).toBe(401);
    });

    it("creates investment and returns 201", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const newInv = {
        id: "i1",
        instrument: "STOCK",
        units: 100,
        buyPrice: 1000,
      };
      vi.mocked(createInvestment).mockResolvedValue(newInv as any);

      const req = new Request("http://localhost/api/investments", {
        method: "POST",
        body: JSON.stringify({
          instrument: "STOCK",
          units: 100,
          buyPrice: 1000,
          currentValue: 1200,
        }),
      });
      const response = await POST_INVESTMENT(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newInv);
    });
  });

  describe("DELETE /api/investments/[id]", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await DELETE_INVESTMENT({} as any, {
        params: Promise.resolve({ id: "i1" }),
      });

      expect(response.status).toBe(401);
    });

    it("deletes investment successfully", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(deleteInvestment).mockResolvedValue({ count: 1 } as any);

      const response = await DELETE_INVESTMENT({} as any, {
        params: Promise.resolve({ id: "i1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/investments/[id]/transactions", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request(
        "http://localhost/api/investments/i1/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            type: "BUY",
            units: 50,
            price: 1200,
            date: "2026-08-09T00:00:00Z",
          }),
        },
      );
      const response = await POST_INV_TX(req as any, {
        params: Promise.resolve({ id: "i1" }),
      });

      expect(response.status).toBe(401);
    });

    it("adds investment transaction and returns 201", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const tx = { id: "tx1", type: "BUY", units: 50, price: 1200 };
      vi.mocked(addInvestmentTransaction).mockResolvedValue(tx as any);

      const req = new Request(
        "http://localhost/api/investments/i1/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            type: "BUY",
            units: 50,
            price: 1200,
            date: "2026-08-09T00:00:00Z",
          }),
        },
      );
      const response = await POST_INV_TX(req as any, {
        params: Promise.resolve({ id: "i1" }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(tx);
    });

    it("returns 400 for invalid type", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const req = new Request(
        "http://localhost/api/investments/i1/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            type: "INVALID",
            units: 50,
            price: 1200,
            date: "2026-08-09T00:00:00Z",
          }),
        },
      );
      const response = await POST_INV_TX(req as any, {
        params: Promise.resolve({ id: "i1" }),
      });

      expect(response.status).toBe(400);
    });
  });
});
