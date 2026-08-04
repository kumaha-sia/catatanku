import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/notification-settings";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Pengaturan</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Nama: {session.user?.name}</p>
          <p>Email: {session.user?.email}</p>
        </CardContent>
      </Card>
      <NotificationSettings />
    </div>
  );
}
