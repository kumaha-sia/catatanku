import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InsightsContent } from "@/components/insights-content";

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <InsightsContent />;
}
