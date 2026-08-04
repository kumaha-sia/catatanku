import { openai } from "@ai-sdk/openai";
import { generateText, streamText, tool } from "ai";
import type {
  ModelMessage,
  UserModelMessage,
  AssistantModelMessage,
} from "@ai-sdk/provider-utils";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const model = openai.chat("gpt-4o-mini");

export async function generateInsight(params: {
  userId: string;
  month: Date;
  summary: unknown;
  budgets: unknown;
}) {
  const { text } = await generateText({
    model,
    system:
      "Kamu adalah asisten keuangan pribadi. Tulis insight dalam Bahasa Indonesia, ringkas, actionable, dan hormati privasi pengguna.",
    prompt: `Bulan: ${params.month.toISOString()}\nRingkasan data keuangan pengguna (JSON):\n${JSON.stringify(params.summary)}\n\nBudget status (JSON):\n${JSON.stringify(params.budgets)}\n\nTugas: buat insight keuangan bulanan yang mencakup pola pengeluaran, risiko over-budget, saran hemat, dan satu insight positif. Gunakan format bullet.`,
  });
  return text;
}

export async function streamChatResponse(params: {
  userId: string;
  sessionId: string;
  prompt: string;
}) {
  const history = await loadHistory(params.sessionId);
  const stream = streamText({
    model,
    system:
      "Kamu adalah asisten keuangan. Gunakan tools saat butuh data. Jawaban harus ringkas dalam Bahasa Indonesia.",
    messages: history,
    tools: {
      getTransactions: tool({
        description: "Ambil daftar transaksi pengguna berdasarkan filter.",
        inputSchema: z.object({
          categoryId: z.string().optional(),
          type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
          from: z.string().optional(),
          to: z.string().optional(),
          limit: z.number().min(1).max(100).optional(),
        }),
        execute: async ({ categoryId, type, from, to, limit }) => {
          const where: Record<string, unknown> = { userId: params.userId };
          if (categoryId) where.categoryId = categoryId;
          if (type) where.type = type;
          if (from || to) {
            where.date = {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            };
          }
          const data = await prisma.transaction.findMany({
            where,
            include: { category: true, account: true },
            orderBy: { date: "desc" },
            take: limit ?? 20,
          });
          return data.map((tx) => ({
            id: tx.id,
            date: tx.date,
            type: tx.type,
            amount: tx.amount.toString(),
            description: tx.description,
            category: tx.category?.name ?? null,
            account: tx.account.name,
          }));
        },
      }),
      getBudgetStatus: tool({
        description: "Ambil status budget pengguna untuk bulan tertentu.",
        inputSchema: z.object({ month: z.string().optional() }),
        execute: async ({ month }) => {
          const date = month ? new Date(month) : new Date();
          return import("@/server/budget.service").then((m) =>
            m.getBudgetVsActual(params.userId, date),
          );
        },
      }),
      getNetWorth: tool({
        description: "Ambil ringkasan net worth pengguna.",
        inputSchema: z.object({}),
        execute: async () => {
          const data = await import("@/server/networth.service").then((m) =>
            m.getNetWorth(params.userId),
          );
          return { ...data };
        },
      }),
      getDebtSummary: tool({
        description: "Ambil ringkasan hutang/piutang pengguna.",
        inputSchema: z.object({}),
        execute: async () => {
          return import("@/server/debt.service").then((m) =>
            m.getDebtSummary(params.userId),
          );
        },
      }),
    },
    stopWhen: [],
    onFinish: async ({ responseMessages }) => {
      await saveHistory(params.sessionId, responseMessages);
    },
  });
  return stream.toTextStreamResponse();
}

async function loadHistory(sessionId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 40,
  });
  return messages.map((m): ModelMessage => {
    if (m.role === "ASSISTANT") {
      return {
        role: "assistant",
        content: m.content,
      } satisfies AssistantModelMessage;
    }
    return { role: "user", content: m.content } satisfies UserModelMessage;
  });
}

async function saveHistory(sessionId: string, messages: unknown[]) {
  const payload = (messages as Array<{ role: string; content: unknown }>).map(
    (m) => ({
      sessionId,
      role: m.role.toUpperCase() as "USER" | "ASSISTANT",
      content:
        typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }),
  );
  await prisma.chatMessage.createMany({ data: payload, skipDuplicates: true });
}
