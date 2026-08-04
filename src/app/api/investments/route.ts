import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  createInvestment,
  getInvestmentsByUser,
  getInvestmentSummary,
} from "@/server/investment.service";

const schema = z.object({
  instrument: z.enum(["STOCK", "MUTUAL_FUND", "CRYPTO", "BOND", "GOLD"]),
  units: z.number().positive(),
  buyPrice: z.number().positive(),
  currentValue: z.number().positive().optional(),
  assetId: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [investments, summary] = await Promise.all([
    getInvestmentsByUser(session.user.id),
    getInvestmentSummary(session.user.id),
  ]);
  return NextResponse.json({ investments, summary });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const inv = await createInvestment({ userId: session.user.id, ...data });
    return NextResponse.json(inv, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
