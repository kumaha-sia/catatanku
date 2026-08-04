import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssetsContent } from "@/components/assets-content";

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <AssetsContent />;
}
