import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNetWorth, getNetWorthHistory } from "@/server/networth.service";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const months = Number(searchParams.get("months") ?? 12);

  const [netWorth, history] = await Promise.all([
    getNetWorth(session.user.id),
    getNetWorthHistory(session.user.id, months),
  ]);

  return NextResponse.json({ ...netWorth, history });
}
