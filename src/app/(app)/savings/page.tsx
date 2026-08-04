import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SavingsContent } from "@/components/savings-content";

export default async function SavingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <SavingsContent />;
}
