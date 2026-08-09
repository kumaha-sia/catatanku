import { describe, it, expect, vi } from "vitest";

vi.mock("ai", () => ({
  embed: vi.fn().mockResolvedValue({ embedding: [0.1, 0.2, 0.3] }),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: {
    embedding: vi.fn().mockReturnValue("mock-model"),
  },
}));

describe("createEmbedding", () => {
  it("returns embedding array from input text", async () => {
    const { createEmbedding } = await import("@/lib/embedding");
    const result = await createEmbedding("test text");

    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it("returns array (not Float32Array)", async () => {
    const { createEmbedding } = await import("@/lib/embedding");
    const result = await createEmbedding("test");

    expect(Array.isArray(result)).toBe(true);
  });
});
