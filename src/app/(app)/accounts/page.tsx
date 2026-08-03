import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountsContent } from "@/components/accounts-content";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <AccountsContent />;
}
