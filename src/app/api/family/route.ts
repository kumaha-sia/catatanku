import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyByUser } from "@/server/family.service";

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
