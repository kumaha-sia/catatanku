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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#fef9f0]">
      <AppNav />
      {/* flex-1 overflow-y-auto makes only this area scroll */}
      <div className="flex-1 overflow-y-auto pt-14 md:pl-56">{children}</div>
    </div>
  );
}
