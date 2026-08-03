import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  createTransaction,
  getTransactionsByUser,
} from "@/server/transaction.service";

const txSchema = z.object({
  accountId: z.string(),
  categoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string().datetime(),
  receiptUrl: z.string().optional(),
  ocrData: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const type = searchParams.get("type") as
    "INCOME" | "EXPENSE" | "TRANSFER" | undefined;
  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;
  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : undefined;
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const txs = await getTransactionsByUser(session.user.id, {
    accountId,
    categoryId,
    type,
    from,
    to,
    limit,
    offset,
  });
  return NextResponse.json(txs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = txSchema.parse(body);
    const tx = await createTransaction({
      userId: session.user.id,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      receiptUrl: data.receiptUrl,
      ocrData: data.ocrData,
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
