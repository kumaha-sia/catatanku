import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/debt.service", () => ({
  getDebtsByUser: vi.fn(),
  getDebtById: vi.fn(),
  createDebt: vi.fn(),
  updateDebt: vi.fn(),
  deleteDebt: vi.fn(),
  getDebtSummary: vi.fn(),
  addInstallment: vi.fn(),
  payInstallment: vi.fn(),
}));

import { getServerSession } from "next-auth";
import {
  getDebtsByUser,
  getDebtSummary,
  createDebt,
  deleteDebt,
  addInstallment,
} from "@/server/debt.service";
import { GET, POST } from "@/app/api/debts/route";
import { DELETE as DELETE_BY_ID } from "@/app/api/debts/[id]/route";
import { POST as POST_INSTALLMENT } from "@/app/api/debts/[id]/installments/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/debts", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
  });

  it("returns debts with summary", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const debts = [
      {
        id: "d1",
        type: "DEBT",
        counterpartyName: "Bank BCA",
        totalAmount: 10000000,
        remaining: 5000000,
      },
    ];
    const summary = {
      totalDebt: 5000000,
      totalCredit: 0,
      netDebt: 5000000,
      debtCount: 1,
      creditCount: 0,
    };
    vi.mocked(getDebtsByUser).mockResolvedValue(debts as any);
    vi.mocked(getDebtSummary).mockResolvedValue(summary);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.debts).toEqual(debts);
    expect(data.summary).toEqual(summary);
  });
});

describe("POST /api/debts", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/debts", {
      method: "POST",
      body: JSON.stringify({
        type: "DEBT",
        counterpartyName: "Bank BCA",
        totalAmount: 10000000,
      }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(401);
  });

  it("creates debt and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const newDebt = {
      id: "d1",
      type: "DEBT",
      counterpartyName: "Bank BCA",
      totalAmount: 10000000,
    };
    vi.mocked(createDebt).mockResolvedValue(newDebt as any);

    const req = new Request("http://localhost/api/debts", {
      method: "POST",
      body: JSON.stringify({
        type: "DEBT",
        counterpartyName: "Bank BCA",
        totalAmount: 10000000,
        paidAmount: 2000000,
      }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newDebt);
  });

  it("returns 400 for invalid data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/debts", {
      method: "POST",
      body: JSON.stringify({ type: "INVALID" }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/debts/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "d1" }),
    });

    expect(response.status).toBe(401);
  });

  it("deletes debt successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteDebt).mockResolvedValue({ count: 1 } as any);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "d1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe("POST /api/debts/[id]/installments", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/debts/d1/installments", {
      method: "POST",
      body: JSON.stringify({
        amount: 1000000,
        dueDate: "2026-09-01T00:00:00Z",
      }),
    });
    const response = await POST_INSTALLMENT(req as any, {
      params: Promise.resolve({ id: "d1" }),
    });

    expect(response.status).toBe(401);
  });

  it("adds installment and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const installment = {
      id: "inst1",
      amount: 1000000,
      dueDate: "2026-09-01T00:00:00.000Z",
    };
    vi.mocked(addInstallment).mockResolvedValue(installment as any);

    const req = new Request("http://localhost/api/debts/d1/installments", {
      method: "POST",
      body: JSON.stringify({
        amount: 1000000,
        dueDate: "2026-09-01T00:00:00Z",
      }),
    });
    const response = await POST_INSTALLMENT(req as any, {
      params: Promise.resolve({ id: "d1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(installment);
  });

  it("returns 400 for invalid data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/debts/d1/installments", {
      method: "POST",
      body: JSON.stringify({ amount: -100 }),
    });
    const response = await POST_INSTALLMENT(req as any, {
      params: Promise.resolve({ id: "d1" }),
    });

    expect(response.status).toBe(400);
  });
});
