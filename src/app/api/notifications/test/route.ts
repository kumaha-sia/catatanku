import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPushToUser } from "@/server/push.service";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sent = await sendPushToUser(session.user.id, {
    title: "Tes Notifikasi",
    body: "Notifikasi dari Catatanku berhasil!",
    url: "/dashboard",
  });

  return NextResponse.json({ sent });
}
