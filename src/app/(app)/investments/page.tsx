import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvestmentsContent } from "@/components/investments-content";

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <InvestmentsContent />;
}
