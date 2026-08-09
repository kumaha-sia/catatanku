import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/transaction.service", () => ({
  getTransactionsByUser: vi.fn(),
  getTransactionById: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

import { getServerSession } from "next-auth";
import {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/server/transaction.service";
import { GET, POST } from "@/app/api/transactions/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE as DELETE_BY_ID,
} from "@/app/api/transactions/[id]/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/transactions", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/transactions");
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns transactions with default params", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const txs = [
      { id: "tx1", amount: 50000, description: "Makan" },
      { id: "tx2", amount: 100000, description: "Transport" },
    ];
    vi.mocked(getTransactionsByUser).mockResolvedValue(txs as any);

    const req = new Request("http://localhost/api/transactions");
    const response = await GET(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(txs);
    expect(getTransactionsByUser).toHaveBeenCalledWith("user1", {
      accountId: undefined,
      categoryId: undefined,
      type: null,
      from: undefined,
      to: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it("passes query params to service", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTransactionsByUser).mockResolvedValue([]);

    const req = new Request(
      "http://localhost/api/transactions?accountId=a1&type=EXPENSE&limit=10",
    );
    await GET(req as any);

    expect(getTransactionsByUser).toHaveBeenCalledWith("user1", {
      accountId: "a1",
      categoryId: undefined,
      type: "EXPENSE",
      from: undefined,
      to: undefined,
      limit: 10,
      offset: 0,
    });
  });

  it("parses date range params", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getTransactionsByUser).mockResolvedValue([]);

    const req = new Request(
      "http://localhost/api/transactions?from=2026-01-01&to=2026-01-31",
    );
    await GET(req as any);

    expect(getTransactionsByUser).toHaveBeenCalledWith(
      "user1",
      expect.objectContaining({
        from: new Date("2026-01-01"),
        to: new Date("2026-01-31"),
      }),
    );
  });
});

describe("POST /api/transactions", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        accountId: "a1",
        type: "EXPENSE",
        amount: 50000,
        description: "Test",
        date: "2026-08-09T00:00:00Z",
      }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(401);
  });

  it("creates transaction and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const newTx = {
      id: "tx1",
      type: "EXPENSE",
      amount: 50000,
      description: "Makan siang",
    };
    vi.mocked(createTransaction).mockResolvedValue(newTx as any);

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        accountId: "a1",
        type: "EXPENSE",
        amount: 50000,
        description: "Makan siang",
        date: "2026-08-09T12:00:00Z",
      }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newTx);
    expect(createTransaction).toHaveBeenCalledWith({
      userId: "user1",
      accountId: "a1",
      categoryId: undefined,
      type: "EXPENSE",
      amount: 50000,
      description: "Makan siang",
      date: new Date("2026-08-09T12:00:00Z"),
      receiptUrl: undefined,
      ocrData: undefined,
    });
  });

  it("returns 400 for missing required fields", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({ type: "EXPENSE" }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid type", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        accountId: "a1",
        type: "INVALID",
        amount: 50000,
        description: "Test",
        date: "2026-08-09T00:00:00Z",
      }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(400);
  });

  it("returns 400 for negative amount", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        accountId: "a1",
        type: "EXPENSE",
        amount: -100,
        description: "Test",
        date: "2026-08-09T00:00:00Z",
      }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(400);
  });

  it("returns 500 for service errors", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(createTransaction).mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        accountId: "a1",
        type: "EXPENSE",
        amount: 50000,
        description: "Test",
        date: "2026-08-09T00:00:00Z",
      }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(500);
  });
});

describe("GET /api/transactions/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET_BY_ID({} as any, {
      params: Promise.resolve({ id: "tx1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns transaction by id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const tx = { id: "tx1", amount: 50000, description: "Makan" };
    const { getTransactionById } = await import("@/server/transaction.service");
    vi.mocked(getTransactionById).mockResolvedValue(tx as any);

    const response = await GET_BY_ID({} as any, {
      params: Promise.resolve({ id: "tx1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(tx);
  });

  it("returns 404 if not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const { getTransactionById } = await import("@/server/transaction.service");
    vi.mocked(getTransactionById).mockResolvedValue(null);

    const response = await GET_BY_ID({} as any, {
      params: Promise.resolve({ id: "tx999" }),
    });

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/transactions/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/transactions/tx1", {
      method: "PUT",
      body: JSON.stringify({ description: "Updated" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "tx1" }),
    });

    expect(response.status).toBe(401);
  });

  it("updates transaction successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const updated = { id: "tx1", description: "Updated", amount: 75000 };
    vi.mocked(updateTransaction).mockResolvedValue(updated as any);

    const req = new Request("http://localhost/api/transactions/tx1", {
      method: "PUT",
      body: JSON.stringify({ description: "Updated", amount: 75000 }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "tx1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
  });
});

describe("DELETE /api/transactions/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "tx1" }),
    });

    expect(response.status).toBe(401);
  });

  it("deletes transaction successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteTransaction).mockResolvedValue({} as any);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "tx1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
