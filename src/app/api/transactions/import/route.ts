import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/server/transaction.service";

const csvRowSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional(),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function parseCsv(text: string): z.infer<typeof csvRowSchema>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: z.infer<typeof csvRowSchema>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 4) continue;

    const parsed = csvRowSchema.safeParse({
      date: cols[headers.indexOf("date")] || cols[0],
      description: cols[headers.indexOf("description")] || cols[1],
      amount: parseFloat(cols[headers.indexOf("amount")] || cols[2]),
      type: (cols[headers.indexOf("type")] || cols[3]).toUpperCase(),
      category: cols[headers.indexOf("category")] || cols[4] || undefined,
    });
    if (parsed.success) rows.push(parsed.data);
  }
  return rows;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const accountId = formData.get("accountId") as string | null;

    if (!file || !accountId) {
      return NextResponse.json(
        { error: "File dan accountId wajib" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 },
      );
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: session.user.id },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Rekening tidak ditemukan" },
        { status: 404 },
      );
    }

    const text = await file.text();
    const rows = parseCsv(text);

    let imported = 0;
    let failed = 0;

    for (const [idx, row] of rows.entries()) {
      try {
        let categoryId: string | undefined;
        if (row.category) {
          const cat = await prisma.category.findFirst({
            where: {
              userId: session.user.id,
              name: { contains: row.category, mode: "insensitive" },
            },
          });
          categoryId = cat?.id;
        }

        await createTransaction({
          userId: session.user.id,
          accountId,
          categoryId,
          type: row.type,
          amount: row.amount,
          description: row.description,
          date: new Date(row.date),
        });
        imported++;
      } catch (e) {
        console.error(`Failed to import row ${idx + 1}:`, e);
        failed++;
      }
    }

    return NextResponse.json({ imported, failed, total: rows.length });
  } catch (e) {
    console.error("CSV import error:", e);
    return NextResponse.json({ error: "Gagal import CSV" }, { status: 500 });
  }
}
