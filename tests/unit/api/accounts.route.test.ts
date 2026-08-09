import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/account.service", () => ({
  getAccountsByUser: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
  getTotalBalance: vi.fn(),
  getAccountById: vi.fn(),
}));

import { getServerSession } from "next-auth";
import {
  getAccountsByUser,
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/server/account.service";
import { GET, POST } from "@/app/api/accounts/route";
import { PUT, DELETE as DELETE_BY_ID } from "@/app/api/accounts/[id]/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/accounts", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns accounts for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const accounts = [
      { id: "a1", name: "BCA", balance: 5000000 },
      { id: "a2", name: "Cash", balance: 100000 },
    ];
    vi.mocked(getAccountsByUser).mockResolvedValue(accounts as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(accounts);
    expect(getAccountsByUser).toHaveBeenCalledWith("user1");
  });
});

describe("POST /api/accounts", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "BCA", type: "BANK" }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(401);
  });

  it("creates account and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const newAccount = { id: "a1", name: "BCA", type: "BANK" };
    vi.mocked(createAccount).mockResolvedValue(newAccount as any);

    const req = new Request("http://localhost/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "BCA", type: "BANK", balance: 1000000 }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newAccount);
    expect(createAccount).toHaveBeenCalledWith({
      userId: "user1",
      name: "BCA",
      type: "BANK",
      balance: 1000000,
    });
  });

  it("returns 400 for invalid data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "", type: "INVALID" }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 500 for service errors", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(createAccount).mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "BCA", type: "BANK" }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(500);
  });
});

describe("PUT /api/accounts/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/accounts/a1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "a1" }),
    });

    expect(response.status).toBe(401);
  });

  it("updates account successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(updateAccount).mockResolvedValue({ count: 1 } as any);

    const req = new Request("http://localhost/api/accounts/a1", {
      method: "PUT",
      body: JSON.stringify({ name: "BCA Updated" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "a1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 404 if account not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(updateAccount).mockResolvedValue({ count: 0 } as any);

    const req = new Request("http://localhost/api/accounts/a999", {
      method: "PUT",
      body: JSON.stringify({ name: "Not Found" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "a999" }),
    });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/accounts/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "a1" }),
    });

    expect(response.status).toBe(401);
  });

  it("deletes account successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteAccount).mockResolvedValue({ count: 1 } as any);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "a1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 404 if account not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteAccount).mockResolvedValue({ count: 0 } as any);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "a999" }),
    });

    expect(response.status).toBe(404);
  });
});
