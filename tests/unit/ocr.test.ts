import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTextDetection = vi.fn();

vi.mock("@google-cloud/vision", () => {
  return {
    ImageAnnotatorClient: class MockClient {
      textDetection = mockTextDetection;
    },
  };
});

vi.mock("@/lib/embedding", () => ({
  createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("extractReceipt", () => {
  it("extracts merchant, date, total from receipt text", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description:
              "TOKO ABC\nJl. Sudirman No. 1\n01/08/2026\nTOTAL: Rp 150.000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("fake-image"));

    expect(result.merchant).toBe("TOKO ABC");
    expect(result.total).toBe(150000);
    expect(result.rawText).toContain("TOKO ABC");
    expect(result.lines).toBeInstanceOf(Array);
    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
  });

  it("handles empty text detection result", async () => {
    mockTextDetection.mockResolvedValue([{ textAnnotations: [] }]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("empty"));

    expect(result.merchant).toBeNull();
    expect(result.total).toBeNull();
    expect(result.date).toBeNull();
  });

  it("parses TOTAL with GRAND TOTAL pattern", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\nGRAND TOTAL: Rp 250.000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.total).toBe(250000);
  });

  it("parses JUMLAH pattern with Rp prefix", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\nJUMLAH: Rp 75000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.total).toBe(75000);
  });

  it("parses date in dd/mm/yyyy format", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\n15/03/2026\nTOTAL: Rp 50000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.date).toBeInstanceOf(Date);
  });

  it("returns null total when no total found", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Some random text\nwithout any total",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("no-total"));

    expect(result.total).toBeNull();
  });

  it("parses TAGIHAN pattern with Rp", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Invoice\nTAGIHAN: Rp 125000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("invoice"));

    expect(result.total).toBe(125000);
  });

  it("parses BAYAR pattern with Rp", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\nBAYAR: Rp 50000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.total).toBe(50000);
  });

  it("parses date with dashes", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\n15-03-2026\nTOTAL: Rp 50000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.date).toBeInstanceOf(Date);
  });

  it("returns null date when no date found", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\nTOTAL: Rp 50000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("no-date"));

    expect(result.date).toBeNull();
  });

  it("parses TOTAL with Rp directly attached", async () => {
    mockTextDetection.mockResolvedValue([
      {
        textAnnotations: [
          {
            description: "Receipt\nTOTAL:Rp50000",
          },
        ],
      },
    ]);

    const { extractReceipt } = await import("@/lib/ocr");
    const result = await extractReceipt(Buffer.from("receipt"));

    expect(result.total).toBe(50000);
  });
});
