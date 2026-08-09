import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    family: {
      create: vi.fn(),
    },
    category: {
      createMany: vi.fn(),
    },
    pushSubscription: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as REGISTER } from "@/app/api/auth/register/route";
import {
  GET as GET_NOTIFICATIONS,
  POST as POST_NOTIFICATIONS,
  DELETE as DELETE_NOTIFICATIONS,
} from "@/app/api/notifications/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("creates user with default categories and family", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user1",
      name: "Budi",
      email: "budi@test.com",
    } as any);
    vi.mocked(prisma.family.create).mockResolvedValue({
      id: "f1",
      name: "Keluarga Budi",
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    vi.mocked(prisma.category.createMany).mockResolvedValue({
      count: 14,
    } as any);

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Budi",
        email: "budi@test.com",
        password: "password123",
      }),
    });
    const response = await REGISTER(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe("user1");
    expect(prisma.category.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ type: "INCOME", name: "Gaji" }),
          expect.objectContaining({ type: "EXPENSE", name: "Makan" }),
          expect.objectContaining({ type: "SAVINGS", name: "Dana Darurat" }),
        ]),
      }),
    );
  });

  it("returns 400 for duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing",
      email: "budi@test.com",
    } as any);

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Budi",
        email: "budi@test.com",
        password: "password123",
      }),
    });
    const response = await REGISTER(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain("terdaftar");
  });

  it("returns 400 for short password", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Budi",
        email: "budi@test.com",
        password: "123",
      }),
    });
    const response = await REGISTER(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Budi",
        email: "not-an-email",
        password: "password123",
      }),
    });
    const response = await REGISTER(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 for short name", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "B",
        email: "budi@test.com",
        password: "password123",
      }),
    });
    const response = await REGISTER(req);

    expect(response.status).toBe(400);
  });
});

describe("Notifications API", () => {
  const mockSession = { user: { id: "user1" } };

  describe("GET /api/notifications", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET_NOTIFICATIONS();

      expect(response.status).toBe(401);
    });

    it("returns push subscriptions", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      const subs = [
        {
          id: "s1",
          endpoint: "https://fcm.google.com/1",
          createdAt: "2026-08-09T00:00:00Z",
        },
      ];
      vi.mocked(prisma.pushSubscription.findMany).mockResolvedValue(
        subs as any,
      );

      const response = await GET_NOTIFICATIONS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(subs);
    });
  });

  describe("POST /api/notifications", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/notifications", {
        method: "POST",
        body: JSON.stringify({
          endpoint: "https://fcm.google.com/1",
          keys: { p256dh: "key", auth: "auth" },
        }),
      });
      const response = await POST_NOTIFICATIONS(req as any);

      expect(response.status).toBe(401);
    });

    it("creates push subscription", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.pushSubscription.upsert).mockResolvedValue({} as any);

      const req = new Request("http://localhost/api/notifications", {
        method: "POST",
        body: JSON.stringify({
          endpoint: "https://fcm.google.com/1",
          keys: { p256dh: "key", auth: "auth" },
        }),
      });
      const response = await POST_NOTIFICATIONS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("returns 400 for invalid data", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const req = new Request("http://localhost/api/notifications", {
        method: "POST",
        body: JSON.stringify({ endpoint: "not-a-url" }),
      });
      const response = await POST_NOTIFICATIONS(req as any);

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/notifications", () => {
    it("returns 401 if not authenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new Request("http://localhost/api/notifications");
      const response = await DELETE_NOTIFICATIONS(req as any);

      expect(response.status).toBe(401);
    });

    it("deletes all subscriptions", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.pushSubscription.deleteMany).mockResolvedValue({
        count: 2,
      } as any);

      const req = new Request("http://localhost/api/notifications");
      const response = await DELETE_NOTIFICATIONS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
      });
    });

    it("deletes specific endpoint", async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.pushSubscription.deleteMany).mockResolvedValue({
        count: 1,
      } as any);

      const req = new Request(
        "http://localhost/api/notifications?endpoint=https://fcm.google.com/1",
      );
      const response = await DELETE_NOTIFICATIONS(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: "user1",
          endpoint: "https://fcm.google.com/1",
        },
      });
    });
  });
});
