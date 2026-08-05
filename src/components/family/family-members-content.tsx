"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roleLabels: Record<string, string> = {
  OWNER: "Pemilik",
  MEMBER: "Anggota",
  VIEWER: "Pengamat",
};

export function FamilyMembersContent() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [showInvite, setShowInvite] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const res = await fetch("/api/family/members");
      return res.ok ? res.json() : [];
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await fetch("/api/family/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengundang");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      setEmail("");
      setShowInvite(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch("/api/family/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "remove" }),
      });
      if (!res.ok) throw new Error("Gagal menghapus");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["family-members"] }),
  });

  const roleMutation = useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: string;
    }) => {
      const res = await fetch("/api/family/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, action: "updateRole", role: newRole }),
      });
      if (!res.ok) throw new Error("Gagal mengubah role");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["family-members"] }),
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Anggota Keluarga</h1>
        <Button onClick={() => setShowInvite(!showInvite)}>
          {showInvite ? "Batal" : "Undang Anggota"}
        </Button>
      </div>

      {showInvite && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMutation.mutate({ email, role });
              }}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MEMBER">Anggota</option>
                  <option value="VIEWER">Pengamat (hanya lihat)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Mengundang..." : "Undang"}
                </Button>
              </div>
            </form>
            {inviteMutation.isError && (
              <p className="mt-2 text-sm text-destructive">
                {inviteMutation.error.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {members.map(
          (m: { id: string; name: string; email: string; role: string }) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {roleLabels[m.role]}
                  </span>
                  {m.role !== "OWNER" && (
                    <div className="flex gap-2">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            memberId: m.id,
                            newRole: e.target.value,
                          })
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="MEMBER">Anggota</option>
                        <option value="VIEWER">Pengamat</option>
                      </select>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Hapus ${m.name} dari keluarga?`)) {
                            removeMutation.mutate(m.id);
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ),
        )}
        {members.length === 0 && (
          <p className="text-muted-foreground">Belum ada anggota keluarga.</p>
        )}
      </div>
    </div>
  );
}
