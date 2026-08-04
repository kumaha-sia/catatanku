import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runInsightEngine } from "@/ai/insight-engine";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const insights = await prisma.insight.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    insights.map((insight) => ({
      id: insight.id,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      severity: insight.severity,
      dismissed: insight.dismissed,
      createdAt: insight.createdAt,
    })),
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { month } = await req.json().catch(() => ({}));
  const result = await runInsightEngine(
    session.user.id,
    month ? new Date(month) : undefined,
  );
  return NextResponse.json({ content: result });
}
