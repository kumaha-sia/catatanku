import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionsContent } from "@/components/transactions-content";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <TransactionsContent />;
}
