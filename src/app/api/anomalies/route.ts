import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectAnomalies } from "@/server/anomaly.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anomalies = await detectAnomalies(session.user.id);
  return NextResponse.json(anomalies);
}
