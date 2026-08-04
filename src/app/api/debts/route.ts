import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  createDebt,
  getDebtsByUser,
  getDebtSummary,
} from "@/server/debt.service";

const debtSchema = z.object({
  type: z.enum(["DEBT", "CREDIT"]),
  counterpartyName: z.string().min(1),
  totalAmount: z.number().positive(),
  paidAmount: z.number().min(0).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [debts, summary] = await Promise.all([
    getDebtsByUser(session.user.id),
    getDebtSummary(session.user.id),
  ]);
  return NextResponse.json({ debts, summary });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = debtSchema.parse(body);
    const debt = await createDebt({ userId: session.user.id, ...data });
    return NextResponse.json(debt, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
