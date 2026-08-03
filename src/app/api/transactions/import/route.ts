import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/server/transaction.service";

interface CsvRow {
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category?: string;
  accountName?: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 4) continue;

    const row: CsvRow = {
      date: cols[headers.indexOf("date")] || cols[0],
      description: cols[headers.indexOf("description")] || cols[1],
      amount: parseFloat(cols[headers.indexOf("amount")] || cols[2]),
      type: (cols[headers.indexOf("type")] || cols[3]).toUpperCase() as
        "INCOME" | "EXPENSE",
      category: cols[headers.indexOf("category")] || cols[4],
      accountName: cols[headers.indexOf("account")] || cols[5],
    };

    if (row.amount > 0 && row.description) rows.push(row);
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

    const text = await file.text();
    const rows = parseCsv(text);

    let imported = 0;
    let failed = 0;

    for (const row of rows) {
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
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ imported, failed, total: rows.length });
  } catch {
    return NextResponse.json({ error: "Gagal import CSV" }, { status: 500 });
  }
}
