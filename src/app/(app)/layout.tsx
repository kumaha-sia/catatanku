import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#fef9f0]">
      <AppNav />
      {/* pt-14 = fixed header height, pb-24 = bottom nav + FAB space, md:pl-56 = sidebar width */}
      <main className="pb-24 pt-14 md:pb-4 md:pl-56">{children}</main>
    </div>
  );
}
