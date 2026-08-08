import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getFamilyByUser, createFamily } from "@/server/family.service";

const createSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const family = await getFamilyByUser(session.user.id);
  if (!family)
    return NextResponse.json(
      { error: "Belum memiliki family" },
      { status: 404 },
    );

  return NextResponse.json(family);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const family = await createFamily(session.user.id, data.name);
    return NextResponse.json(family, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    const msg = e instanceof Error ? e.message : "Gagal membuat keluarga";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
