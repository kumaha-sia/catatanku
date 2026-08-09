import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/budget.service", () => ({
  setBudget: vi.fn(),
  getBudgetVsActual: vi.fn(),
}));

vi.mock("@/server/savings.service", () => ({
  getSavingsByUser: vi.fn(),
  setSavingsTarget: vi.fn(),
}));

vi.mock("@/server/networth.service", () => ({
  getNetWorth: vi.fn(),
  getNetWorthHistory: vi.fn(),
}));

vi.mock("@/server/family.service", () => ({
  getFamilyByUser: vi.fn(),
  getFamilyMembers: vi.fn(),
  createFamily: vi.fn(),
  inviteMember: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  getFamilySummary: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { setBudget, getBudgetVsActual } from "@/server/budget.service";
import { getSavingsByUser, setSavingsTarget } from "@/server/savings.service";
import { getNetWorth, getNetWorthHistory } from "@/server/networth.service";
import {
  getFamilyByUser,
  createFamily,
  getFamilyMembers,
} from "@/server/family.service";
import {
  GET as GET_BUDGETS,
  PUT as PUT_BUDGETS,
} from "@/app/api/budgets/route";
import {
  GET as GET_SAVINGS,
  PUT as PUT_SAVINGS,
} from "@/app/api/savings/route";
import { GET as GET_NETWORTH } from "@/app/api/networth/route";
import { GET as GET_FAMILY, POST as POST_FAMILY } from "@/app/api/family/route";
import { GET as GET_MEMBERS } from "@/app/api/family/members/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("Budgets API", () => {
  describe("GET /api/budgets", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/budgets");
      const response = await GET_BUDGETS(req as any);

      expect(response.status).toBe(401);
    });

    it("returns budget vs actual data", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const budgets = [
        {
          id: "c1",
          name: "Makan",
          budget: 2000000,
          spent: 1500000,
          remaining: 500000,
          pct: 75,
        },
      ];
      vi.mocked(getBudgetVsActual).mockResolvedValue(budgets);

      const req = new Request("http://localhost/api/budgets");
      const response = await GET_BUDGETS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(budgets);
    });

    it("accepts month param", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(getBudgetVsActual).mockResolvedValue([]);

      const req = new Request("http://localhost/api/budgets?month=2026-08-01");
      await GET_BUDGETS(req as any);

      expect(getBudgetVsActual).toHaveBeenCalledWith(
        "user1",
        new Date("2026-08-01"),
      );
    });
  });

  describe("PUT /api/budgets", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/budgets", {
        method: "PUT",
        body: JSON.stringify({ categoryId: "c1", budget: 2000000 }),
      });
      const response = await PUT_BUDGETS(req as any);

      expect(response.status).toBe(401);
    });

    it("sets budget successfully", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(setBudget).mockResolvedValue({ count: 1 } as any);

      const req = new Request("http://localhost/api/budgets", {
        method: "PUT",
        body: JSON.stringify({ categoryId: "c1", budget: 2000000 }),
      });
      const response = await PUT_BUDGETS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(setBudget).toHaveBeenCalledWith("c1", "user1", 2000000);
    });

    it("returns 400 for negative budget", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const req = new Request("http://localhost/api/budgets", {
        method: "PUT",
        body: JSON.stringify({ categoryId: "c1", budget: -100 }),
      });
      const response = await PUT_BUDGETS(req as any);

      expect(response.status).toBe(400);
    });
  });
});

describe("Savings API", () => {
  describe("GET /api/savings", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_SAVINGS();

      expect(response.status).toBe(401);
    });

    it("returns savings data", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const savings = [
        {
          id: "s1",
          name: "Dana Darurat",
          target: 50000000,
          saved: 20000000,
          pct: 40,
          remaining: 30000000,
        },
      ];
      vi.mocked(getSavingsByUser).mockResolvedValue(savings);

      const response = await GET_SAVINGS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(savings);
    });
  });

  describe("PUT /api/savings", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/savings", {
        method: "PUT",
        body: JSON.stringify({ categoryId: "s1", target: 50000000 }),
      });
      const response = await PUT_SAVINGS(req as any);

      expect(response.status).toBe(401);
    });

    it("sets savings target successfully", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(setSavingsTarget).mockResolvedValue({ count: 1 } as any);

      const req = new Request("http://localhost/api/savings", {
        method: "PUT",
        body: JSON.stringify({ categoryId: "s1", target: 50000000 }),
      });
      const response = await PUT_SAVINGS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe("Net Worth API", () => {
  describe("GET /api/networth", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/networth");
      const response = await GET_NETWORTH(req as any);

      expect(response.status).toBe(401);
    });

    it("returns net worth with history", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const netWorth = {
        totalAssets: 100000000,
        totalLiabilities: 20000000,
        netWorth: 80000000,
        breakdown: {
          accounts: 10000000,
          assets: 50000000,
          investments: 40000000,
          debts: 20000000,
          credits: 0,
        },
      };
      const history = [
        { month: "Jul 26", netWorth: 70000000 },
        { month: "Agu 26", netWorth: 80000000 },
      ];
      vi.mocked(getNetWorth).mockResolvedValue(netWorth);
      vi.mocked(getNetWorthHistory).mockResolvedValue(history);

      const req = new Request("http://localhost/api/networth?months=2");
      const response = await GET_NETWORTH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.netWorth).toBe(80000000);
      expect(data.history).toEqual(history);
    });
  });
});

describe("Family API", () => {
  describe("GET /api/family", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_FAMILY();

      expect(response.status).toBe(401);
    });

    it("returns 404 if no family", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(getFamilyByUser).mockResolvedValue(null);

      const response = await GET_FAMILY();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("family");
    });

    it("returns family data", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const family = {
        id: "f1",
        name: "Keluarga Budi",
        members: [{ id: "user1", name: "Budi" }],
      };
      vi.mocked(getFamilyByUser).mockResolvedValue(family as any);

      const response = await GET_FAMILY();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(family);
    });
  });

  describe("POST /api/family", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/family", {
        method: "POST",
        body: JSON.stringify({ name: "Keluarga Baru" }),
      });
      const response = await POST_FAMILY(req as any);

      expect(response.status).toBe(401);
    });

    it("creates family and returns 201", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const newFamily = { id: "f1", name: "Keluarga Baru" };
      vi.mocked(createFamily).mockResolvedValue(newFamily as any);

      const req = new Request("http://localhost/api/family", {
        method: "POST",
        body: JSON.stringify({ name: "Keluarga Baru" }),
      });
      const response = await POST_FAMILY(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newFamily);
    });

    it("returns 400 if already has family", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(createFamily).mockRejectedValue(
        new Error("Sudah memiliki keluarga"),
      );

      const req = new Request("http://localhost/api/family", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const response = await POST_FAMILY(req as any);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/family/members", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_MEMBERS();

      expect(response.status).toBe(401);
    });

    it("returns members", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const family = { id: "f1" };
      const members = [
        { id: "user1", name: "Budi", role: "OWNER" },
        { id: "user2", name: "Ani", role: "MEMBER" },
      ];
      vi.mocked(getFamilyByUser).mockResolvedValue(family as any);
      vi.mocked(getFamilyMembers).mockResolvedValue(members as any);

      const response = await GET_MEMBERS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(members);
    });
  });
});
