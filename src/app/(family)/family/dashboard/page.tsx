import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FamilyDashboardContent } from "@/components/family/family-dashboard-content";

export default async function FamilyDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <FamilyDashboardContent />;
}
