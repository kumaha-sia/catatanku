import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateText = vi.fn();
const mockStreamText = vi.fn();

vi.mock("ai", () => ({
  generateText: mockGenerateText,
  streamText: mockStreamText,
  tool: vi.fn((config: any) => config),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: {
    chat: vi.fn().mockReturnValue("mock-model"),
  },
}));

const mockPrisma = vi.hoisted(() => ({
  chatMessage: {
    findMany: vi.fn(),
    createMany: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("@/server/budget.service", () => ({
  getBudgetVsActual: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/server/networth.service", () => ({
  getNetWorth: vi.fn().mockResolvedValue({ netWorth: 100000000 }),
}));

vi.mock("@/server/debt.service", () => ({
  getDebtSummary: vi.fn().mockResolvedValue({ totalDebt: 5000000 }),
}));

beforeEach(() => vi.clearAllMocks());

describe("generateInsight", () => {
  it("calls generateText with correct params and returns text", async () => {
    mockGenerateText.mockResolvedValue({ text: "Insight text here" });

    const { generateInsight } = await import("@/lib/ai");
    const result = await generateInsight({
      userId: "user1",
      month: new Date("2026-08-01"),
      summary: { income: 10000000, expense: 5000000 },
      budgets: [{ name: "Makan", budget: 2000000, spent: 1500000 }],
    });

    expect(result).toBe("Insight text here");
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        system: expect.stringContaining("asisten keuangan"),
        prompt: expect.stringContaining("2026-08-01"),
      }),
    );
  });

  it("includes summary and budgets in prompt", async () => {
    mockGenerateText.mockResolvedValue({ text: "Result" });

    const { generateInsight } = await import("@/lib/ai");
    await generateInsight({
      userId: "user1",
      month: new Date("2026-08-01"),
      summary: { income: 10000000, expense: 5000000, balance: 5000000 },
      budgets: [{ name: "Makan", budget: 2000000, spent: 1500000 }],
    });

    const call = mockGenerateText.mock.calls[0][0];
    expect(call.prompt).toContain("10000000");
    expect(call.prompt).toContain("Makan");
  });
});

describe("streamChatResponse", () => {
  it("loads history and calls streamText", async () => {
    const messages = [
      { role: "USER", content: "Halo" },
      { role: "ASSISTANT", content: "Halo! Ada yang bisa saya bantu?" },
    ];
    mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("stream-response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    const result = await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Berapa saldo saya?",
    });

    expect(result).toBe("stream-response");
    expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith({
      where: { sessionId: "session1" },
      orderBy: { createdAt: "asc" },
      take: 40,
    });
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        system: expect.stringContaining("asisten keuangan"),
      }),
    );
  });

  it("maps USER messages to user role", async () => {
    const messages = [{ role: "USER", content: "Test message" }];
    mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.messages).toEqual([{ role: "user", content: "Test message" }]);
  });

  it("maps ASSISTANT messages to assistant role", async () => {
    const messages = [{ role: "ASSISTANT", content: "Response" }];
    mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.messages).toEqual([{ role: "assistant", content: "Response" }]);
  });

  it("defines getTransactions tool", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.tools.getTransactions).toBeDefined();
    expect(call.tools.getTransactions.description).toContain("transaksi");
  });

  it("defines getBudgetStatus tool", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.tools.getBudgetStatus).toBeDefined();
  });

  it("defines getNetWorth tool", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.tools.getNetWorth).toBeDefined();
  });

  it("defines getDebtSummary tool", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    expect(call.tools.getDebtSummary).toBeDefined();
  });

  it("getTransactions tool executes with filters", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: "tx1",
        date: new Date(),
        type: "EXPENSE",
        amount: { toString: () => "50000" },
        description: "Makan",
        category: { name: "Makan" },
        account: { name: "BCA" },
      },
    ]);

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    const result = await call.tools.getTransactions.execute({
      type: "EXPENSE",
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Makan");
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user1", type: "EXPENSE" }),
        take: 10,
      }),
    );
  });

  it("getTransactions tool with date filters", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    await call.tools.getTransactions.execute({
      from: "2026-01-01",
      to: "2026-01-31",
    });

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date("2026-01-01"),
            lte: new Date("2026-01-31"),
          },
        }),
      }),
    );
  });

  it("getTransactions tool with default limit", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    await call.tools.getTransactions.execute({});

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });

  it("getTransactions tool handles null category", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: "tx1",
        date: new Date(),
        type: "EXPENSE",
        amount: { toString: () => "50000" },
        description: "Unknown",
        category: null,
        account: { name: "BCA" },
      },
    ]);

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    const result = await call.tools.getTransactions.execute({});

    expect(result[0].category).toBeNull();
  });

  it("getBudgetStatus tool calls service", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    const result = await call.tools.getBudgetStatus.execute({
      month: "2026-08-01",
    });

    expect(result).toEqual([]);
  });

  it("getBudgetStatus tool uses current date when no month", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    await call.tools.getBudgetStatus.execute({});

    const { getBudgetVsActual } = await import("@/server/budget.service");
    expect(getBudgetVsActual).toHaveBeenCalledWith("user1", expect.any(Date));
  });

  it("getNetWorth tool returns data", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    const result = await call.tools.getNetWorth.execute({});

    expect(result).toEqual({ netWorth: 100000000 });
  });

  it("getDebtSummary tool returns data", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    const result = await call.tools.getDebtSummary.execute({});

    expect(result).toEqual({ totalDebt: 5000000 });
  });

  it("onFinish saves response messages", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    await call.onFinish({
      responseMessages: [{ role: "assistant", content: "Jawaban AI" }],
    });

    expect(mockPrisma.chatMessage.createMany).toHaveBeenCalledWith({
      data: [
        {
          sessionId: "session1",
          role: "ASSISTANT",
          content: "Jawaban AI",
        },
      ],
      skipDuplicates: true,
    });
  });

  it("onFinish handles array content", async () => {
    mockPrisma.chatMessage.findMany.mockResolvedValue([]);

    const mockToTextStreamResponse = vi.fn().mockReturnValue("response");
    mockStreamText.mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    });

    const { streamChatResponse } = await import("@/lib/ai");
    await streamChatResponse({
      userId: "user1",
      sessionId: "session1",
      prompt: "Test",
    });

    const call = mockStreamText.mock.calls[0][0];
    await call.onFinish({
      responseMessages: [
        { role: "assistant", content: [{ type: "text", text: "Hello" }] },
      ],
    });

    expect(mockPrisma.chatMessage.createMany).toHaveBeenCalledWith({
      data: [
        {
          sessionId: "session1",
          role: "ASSISTANT",
          content: JSON.stringify([{ type: "text", text: "Hello" }]),
        },
      ],
      skipDuplicates: true,
    });
  });
});
