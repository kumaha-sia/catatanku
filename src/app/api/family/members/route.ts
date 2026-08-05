import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getFamilyByUser,
  getFamilyMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/server/family.service";

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

  const members = await getFamilyMembers(family.id);
  return NextResponse.json(members);
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "VIEWER"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const family = await getFamilyByUser(session.user.id);
  if (!family)
    return NextResponse.json(
      { error: "Belum memiliki family" },
      { status: 404 },
    );

  try {
    const body = await req.json();
    const data = inviteSchema.parse(body);
    const member = await inviteMember(
      family.id,
      session.user.id,
      data.email,
      data.role,
    );
    return NextResponse.json(member);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mengundang anggota";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

const updateSchema = z.object({
  memberId: z.string(),
  action: z.enum(["remove", "updateRole"]),
  role: z.enum(["MEMBER", "VIEWER"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const family = await getFamilyByUser(session.user.id);
  if (!family)
    return NextResponse.json(
      { error: "Belum memiliki family" },
      { status: 404 },
    );

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.action === "remove") {
      await removeMember(family.id, session.user.id, data.memberId);
      return NextResponse.json({ success: true });
    }
    if (data.action === "updateRole" && data.role) {
      await updateMemberRole(
        family.id,
        session.user.id,
        data.memberId,
        data.role,
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal memproses";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
