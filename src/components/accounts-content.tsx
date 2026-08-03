"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  BANK: "Bank",
  CASH: "Tunai",
  E_WALLET: "E-Wallet",
};

export function AccountsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [balance, setBalance] = useState("");

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type: string;
      balance?: number;
    }) => {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal membuat akun");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setName("");
      setType("BANK");
      setBalance("");
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      name,
      type,
      balance: balance ? parseFloat(balance) : 0,
    });
  }

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rekening</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "Tambah Rekening"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Rekening</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Tunai</option>
                  <option value="E_WALLET">E-Wallet</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Awal</Label>
                <Input
                  id="balance"
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(
          (acc: {
            id: string;
            name: string;
            type: string;
            balance: { toNumber: () => number };
            currency: string;
          }) => (
            <Card key={acc.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{acc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {typeLabels[acc.type]}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(acc.balance.toNumber(), acc.currency)}
                </p>
              </CardContent>
            </Card>
          ),
        )}
        {accounts.length === 0 && (
          <p className="text-muted-foreground">
            Belum ada rekening. Klik Tambah Rekening untuk memulai.
          </p>
        )}
      </div>
    </div>
  );
}
