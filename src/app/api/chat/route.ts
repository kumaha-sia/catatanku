import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { streamChatResponse } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { message, sessionId } = await req.json();

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
