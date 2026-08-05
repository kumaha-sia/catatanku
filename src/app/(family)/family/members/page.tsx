import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FamilyMembersContent } from "@/components/family/family-members-content";

export default async function FamilyMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <FamilyMembersContent />;
}
