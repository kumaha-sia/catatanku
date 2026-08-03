import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BudgetsContent } from "@/components/budgets-content";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <BudgetsContent />;
}
