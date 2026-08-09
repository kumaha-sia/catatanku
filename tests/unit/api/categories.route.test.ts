import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/server/category.service", () => ({
  getCategoriesByUser: vi.fn(),
  getCategoryById: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import { getServerSession } from "next-auth";
import {
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/server/category.service";
import { GET, POST } from "@/app/api/categories/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE as DELETE_BY_ID,
} from "@/app/api/categories/[id]/route";

const mockSession = { user: { id: "user1" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/categories", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
  });

  it("returns categories for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const categories = [
      { id: "c1", name: "Makan", type: "EXPENSE" },
      { id: "c2", name: "Gaji", type: "INCOME" },
    ];
    vi.mocked(getCategoriesByUser).mockResolvedValue(categories as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(categories);
  });
});

describe("POST /api/categories", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Makan", type: "EXPENSE" }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(401);
  });

  it("creates category and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const newCat = { id: "c1", name: "Makan", type: "EXPENSE" };
    vi.mocked(createCategory).mockResolvedValue(newCat as any);

    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Makan", type: "EXPENSE", budget: 1000000 }),
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newCat);
    expect(createCategory).toHaveBeenCalledWith({
      userId: "user1",
      name: "Makan",
      type: "EXPENSE",
      budget: 1000000,
    });
  });

  it("returns 400 for invalid type", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test", type: "INVALID" }),
    });
    const response = await POST(req as any);

    expect(response.status).toBe(400);
  });
});

describe("PUT /api/categories/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/categories/c1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "c1" }),
    });

    expect(response.status).toBe(401);
  });

  it("updates category successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(updateCategory).mockResolvedValue({ count: 1 } as any);

    const req = new Request("http://localhost/api/categories/c1", {
      method: "PUT",
      body: JSON.stringify({ name: "Makan Enak" }),
    });
    const response = await PUT(req as any, {
      params: Promise.resolve({ id: "c1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe("DELETE /api/categories/[id]", () => {
  it("returns 401 if not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "c1" }),
    });

    expect(response.status).toBe(401);
  });

  it("deletes category and returns affected transactions count", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteCategory).mockResolvedValue({
      success: true,
      affectedTransactions: 5,
    });

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "c1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.affectedTransactions).toBe(5);
  });

  it("returns 400 if category not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(deleteCategory).mockRejectedValue(
      new Error("Kategori tidak ditemukan"),
    );

    const response = await DELETE_BY_ID({} as any, {
      params: Promise.resolve({ id: "c999" }),
    });

    expect(response.status).toBe(400);
  });
});
