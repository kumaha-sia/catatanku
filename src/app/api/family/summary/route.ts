import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyByUser, getFamilySummary } from "@/server/family.service";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const family = await getFamilyByUser(session.user.id);
  if (!family)
    return NextResponse.json(
      { error: "Belum memiliki family" },
      { status: 404 },
    );

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month")
    ? new Date(searchParams.get("month")!)
    : new Date();

  const summary = await getFamilySummary(family.id, month);
  return NextResponse.json(summary);
}
