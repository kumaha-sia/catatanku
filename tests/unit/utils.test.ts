import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats IDR correctly", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1.500.000");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-500000);
    expect(result).toContain("500.000");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const result = formatDate("2026-08-05T00:00:00Z");
    expect(result).toContain("Agustus");
    expect(result).toContain("2026");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toContain("Januari");
  });
});
