import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractReceipt } from "@/lib/ocr";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File wajib" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const receipt = await extractReceipt(buffer);

  const similar = receipt.embedding
    ? await prisma.$queryRawUnsafe(
        `SELECT id, description FROM "Transaction" WHERE "userId" = $1 ORDER BY embedding <-> $2::vector LIMIT 5`,
        session.user.id,
        `[${receipt.embedding.join(",")}]`,
      )
    : [];

  return NextResponse.json({
    merchant: receipt.merchant,
    date: receipt.date,
    total: receipt.total,
    lines: receipt.lines.slice(0, 30),
    similarTransactions: similar,
  });
}
