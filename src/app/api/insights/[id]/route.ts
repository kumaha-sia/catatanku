import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const insight = await prisma.insight.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!insight)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.insight.update({
    where: { id },
    data: { dismissed: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const insight = await prisma.insight.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!insight)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.insight.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
