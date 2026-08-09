import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("getEnv", () => {
  it("returns parsed env when all required vars are set", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.NEXTAUTH_SECRET = "a".repeat(32);
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    const { getEnv } = await import("@/lib/env");
    const result = getEnv();

    expect(result.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(result.NEXTAUTH_SECRET).toBe("a".repeat(32));
    expect(result.NEXTAUTH_URL).toBe("http://localhost:3000");
  });

  it("returns fallback values when required vars are missing", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_URL;

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getEnv } = await import("@/lib/env");
    const result = getEnv();

    expect(result.DATABASE_URL).toBe("");
    expect(result.NEXTAUTH_SECRET).toBe("");
    expect(result.NEXTAUTH_URL).toBe("");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing or invalid env vars"),
    );

    consoleSpy.mockRestore();
  });

  it("includes optional vars when set", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.NEXTAUTH_SECRET = "a".repeat(32);
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.GOOGLE_AI_API_KEY = "test-google-key";
    process.env.OPENAI_API_KEY = "test-openai-key";

    const { getEnv } = await import("@/lib/env");
    const result = getEnv();

    expect(result.GOOGLE_AI_API_KEY).toBe("test-google-key");
    expect(result.OPENAI_API_KEY).toBe("test-openai-key");
    expect(result.GOOGLE_VISION_API_KEY).toBeUndefined();
  });

  it("returns cached result on subsequent calls", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.NEXTAUTH_SECRET = "a".repeat(32);
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    const { getEnv } = await import("@/lib/env");
    const result1 = getEnv();
    const result2 = getEnv();

    expect(result1).toBe(result2);
  });
});
