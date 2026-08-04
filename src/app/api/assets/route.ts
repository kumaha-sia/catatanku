import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  createAsset,
  getAssetsByUser,
  getAssetSummary,
} from "@/server/asset.service";

const schema = z.object({
  type: z.enum(["REAL_ESTATE", "VEHICLE", "INVESTMENT", "OTHER"]),
  name: z.string().min(1),
  currentValue: z.number().positive(),
  purchasePrice: z.number().min(0),
  metadata: z.unknown().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [assets, summary] = await Promise.all([
    getAssetsByUser(session.user.id),
    getAssetSummary(session.user.id),
  ]);
  return NextResponse.json({ assets, summary });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const asset = await createAsset({ userId: session.user.id, ...data });
    return NextResponse.json(asset, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
