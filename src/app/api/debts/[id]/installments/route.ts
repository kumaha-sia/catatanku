import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { addInstallment } from "@/server/debt.service";

const schema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
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
    const installment = await addInstallment(id, session.user.id, {
      amount: data.amount,
      dueDate: new Date(data.dueDate),
    });
    return NextResponse.json(installment, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
