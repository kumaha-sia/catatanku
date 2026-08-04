import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DebtsContent } from "@/components/debts-content";

export default async function DebtsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DebtsContent />;
}
