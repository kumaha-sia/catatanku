import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { addInvestmentTransaction } from "@/server/investment.service";

const schema = z.object({
  type: z.enum(["BUY", "SELL", "DIVIDEND"]),
  units: z.number().positive(),
  price: z.number().positive(),
  date: z.string().datetime(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);
    const tx = await addInvestmentTransaction(id, session.user.id, {
      type: data.type,
      units: data.units,
      price: data.price,
      date: new Date(data.date),
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
