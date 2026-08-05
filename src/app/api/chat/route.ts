import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { streamChatResponse } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  let message: string;
  let sessionId: string | undefined;
  try {
    const body = await req.json();
    const data = chatSchema.parse(body);
    message = data.message;
    sessionId = data.sessionId;
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const chatSession = sessionId
    ? await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: session.user.id },
      })
    : await prisma.chatSession.create({ data: { userId: session.user.id } });

  if (!chatSession) return new Response("Session not found", { status: 404 });

  await prisma.chatMessage.create({
    data: { sessionId: chatSession.id, role: "USER", content: message },
  });

  return streamChatResponse({
    userId: session.user.id,
    sessionId: chatSession.id,
    prompt: message,
  });
}
