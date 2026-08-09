import { describe, it, expect, vi, beforeEach } from "vitest";

let capturedAuthorize: ((creds: any) => Promise<any>) | null = null;

vi.mock("next-auth/providers/credentials", () => ({
  default: (config: any) => {
    capturedAuthorize = config.authorize;
    return {
      id: "credentials",
      name: config.name,
      type: "credentials" as const,
      credentials: config.credentials,
      authorize: config.authorize,
    };
  },
}));

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import bcrypt from "bcryptjs";

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  capturedAuthorize = null;
});

async function getAuthorize() {
  const { authOptions } = await import("@/lib/auth");
  return capturedAuthorize ?? authOptions.providers[0].authorize;
}

describe("auth authorize", () => {
  it("returns null if credentials are undefined", async () => {
    const authorize = await getAuthorize();
    const result = await authorize(undefined);
    expect(result).toBeNull();
  });

  it("returns null if email is missing", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ password: "password123" });
    expect(result).toBeNull();
  });

  it("returns null if email is empty string", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ email: "", password: "password123" });
    expect(result).toBeNull();
  });

  it("returns null if password is missing", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ email: "test@test.com" });
    expect(result).toBeNull();
  });

  it("returns null if password is empty string", async () => {
    const authorize = await getAuthorize();
    const result = await authorize({ email: "test@test.com", password: "" });
    expect(result).toBeNull();
  });

  it("returns null if user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const authorize = await getAuthorize();

    const result = await authorize({
      email: "notfound@test.com",
      password: "password123",
    });

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "notfound@test.com" },
    });
  });

  it("returns null if user has no passwordHash", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "test@test.com",
      name: "Test",
      passwordHash: null,
    });
    const authorize = await getAuthorize();

    const result = await authorize({
      email: "test@test.com",
      password: "password123",
    });

    expect(result).toBeNull();
  });

  it("returns null if password is invalid", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "test@test.com",
      name: "Test",
      passwordHash: "$2a$12$hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const authorize = await getAuthorize();

    const result = await authorize({
      email: "test@test.com",
      password: "wrongpassword",
    });

    expect(result).toBeNull();
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "$2a$12$hashed",
    );
  });

  it("returns user object if credentials are valid", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "test@test.com",
      name: "Test User",
      passwordHash: "$2a$12$hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const authorize = await getAuthorize();

    const result = await authorize({
      email: "test@test.com",
      password: "correctpassword",
    });

    expect(result).toEqual({
      id: "user1",
      email: "test@test.com",
      name: "Test User",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correctpassword",
      "$2a$12$hashed",
    );
  });

  it("returns user without passwordHash in response", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "test@test.com",
      name: "Test User",
      passwordHash: "$2a$12$hashed",
      role: "OWNER",
      familyId: "f1",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const authorize = await getAuthorize();

    const result = await authorize({
      email: "test@test.com",
      password: "correctpassword",
    });

    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("role");
    expect(result).not.toHaveProperty("familyId");
    expect(result).toEqual({
      id: "user1",
      email: "test@test.com",
      name: "Test User",
    });
  });
});

describe("auth callbacks", () => {
  it("jwt callback adds user id to token", async () => {
    const { authOptions } = await import("@/lib/auth");
    const token = await authOptions.callbacks.jwt!({
      token: { id: undefined },
      user: { id: "user1" },
    } as any);

    expect(token.id).toBe("user1");
  });

  it("jwt callback returns token unchanged without user", async () => {
    const { authOptions } = await import("@/lib/auth");
    const token = await authOptions.callbacks.jwt!({
      token: { id: "existing-id" },
    } as any);

    expect(token.id).toBe("existing-id");
  });

  it("jwt callback preserves existing token id", async () => {
    const { authOptions } = await import("@/lib/auth");
    const token = await authOptions.callbacks.jwt!({
      token: { id: "existing-id", name: "Test" },
      user: { id: "new-id" },
    } as any);

    expect(token.id).toBe("new-id");
  });

  it("session callback adds user id to session", async () => {
    const { authOptions } = await import("@/lib/auth");
    const session = await authOptions.callbacks.session!({
      session: { user: { name: "Test", email: "test@test.com" } },
      token: { id: "user1" },
    } as any);

    expect((session.user as any).id).toBe("user1");
  });

  it("session callback handles missing user on session", async () => {
    const { authOptions } = await import("@/lib/auth");
    const session = await authOptions.callbacks.session!({
      session: {},
      token: { id: "user1" },
    } as any);

    expect(session.user).toBeUndefined();
  });

  it("session callback preserves existing session data", async () => {
    const { authOptions } = await import("@/lib/auth");
    const session = await authOptions.callbacks.session!({
      session: { user: { name: "Test", email: "test@test.com" } },
      token: { id: "user1" },
    } as any);

    expect(session.user.name).toBe("Test");
    expect(session.user.email).toBe("test@test.com");
  });
});

describe("auth config", () => {
  it("uses JWT session strategy", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("sets session maxAge to 7 days", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60);
  });

  it("has credentials provider", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].name).toBe("credentials");
  });

  it("sets signIn page to /login", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.pages?.signIn).toBe("/login");
  });
});
