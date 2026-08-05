import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractReceipt } from "@/lib/ocr";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File wajib" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 10MB" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const receipt = await extractReceipt(buffer);

  let similar: Array<{ id: string; description: string }> = [];
  if (receipt.embedding) {
    try {
      similar = await prisma.$queryRaw<{ id: string; description: string }[]>`
        SELECT id, description FROM "Transaction"
        WHERE "userId" = ${session.user.id}
        ORDER BY embedding <-> ${`[${receipt.embedding.join(",")}]`}::vector
        LIMIT 5
      `;
    } catch {
      similar = [];
    }
  }

  return NextResponse.json({
    merchant: receipt.merchant,
    date: receipt.date,
    total: receipt.total,
    lines: receipt.lines.slice(0, 30),
    similarTransactions: similar,
  });
}
