import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createAccount, getAccountsByUser } from "@/server/account.service";

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["BANK", "CASH", "E_WALLET"]),
  balance: z.number().optional(),
  currency: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await getAccountsByUser(session.user.id);
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = accountSchema.parse(body);
    const account = await createAccount({ userId: session.user.id, ...data });
    return NextResponse.json(account, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
