"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";

const typeColors: Record<string, string> = {
  INCOME: "text-green-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-blue-600",
};

export function TransactionsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importAccountId, setImportAccountId] = useState("");

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await fetch("/api/accounts");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions?limit=50");
      return res.json();
    },
  });

  const createTxMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal membuat transaksi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setAmount("");
      setDescription("");
      setShowForm(false);
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: { file: File; accountId: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("accountId", data.accountId);
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Gagal import");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setImportFile(null);
      setShowImport(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTxMutation.mutate({
      accountId,
      categoryId: categoryId || undefined,
      type,
      amount: parseFloat(amount),
      description,
      date: new Date(date).toISOString(),
    });
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (importFile && importAccountId) {
      importMutation.mutate({ file: importFile, accountId: importAccountId });
    }
  }

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaksi</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(!showImport)}>
            Import CSV
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Batal" : "Tambah Transaksi"}
          </Button>
        </div>
      </div>

      {showImport && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importAccount">Rekening Tujuan</Label>
                <select
                  id="importAccount"
                  value={importAccountId}
                  onChange={(e) => setImportAccountId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Pilih rekening</option>
                  {accounts.map((a: { id: string; name: string }) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="importFile">File CSV</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <Button type="submit" disabled={importMutation.isPending}>
                {importMutation.isPending ? "Mengimport..." : "Import"}
              </Button>
              {importMutation.data && (
                <p className="text-sm text-muted-foreground">
                  Berhasil: {importMutation.data.imported} transaksi, gagal:{" "}
                  {importMutation.data.failed}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="txAccount">Rekening</Label>
                <select
                  id="txAccount"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Pilih rekening</option>
                  {accounts.map((a: { id: string; name: string }) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txCategory">Kategori</Label>
                <select
                  id="txCategory"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Tanpa kategori</option>
                  {categories
                    .filter(
                      (c: { type: string }) =>
                        c.type === type || c.type === "INCOME",
                    )
                    .map((c: { id: string; name: string }) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txType">Tipe</Label>
                <select
                  id="txType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pemasukan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txAmount">Jumlah</Label>
                <Input
                  id="txAmount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txDesc">Deskripsi</Label>
                <Input
                  id="txDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txDate">Tanggal</Label>
                <Input
                  id="txDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={createTxMutation.isPending}>
                  {createTxMutation.isPending
                    ? "Menyimpan..."
                    : "Simpan Transaksi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map(
              (tx: {
                id: string;
                type: string;
                description: string;
                amount: { toNumber: () => number };
                date: string;
                account: { name: string };
                category: { name: string } | null;
              }) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.date)} • {tx.account.name}
                      {tx.category ? ` • ${tx.category.name}` : ""}
                    </p>
                  </div>
                  <p className={`font-semibold ${typeColors[tx.type]}`}>
                    {tx.type === "INCOME"
                      ? "+"
                      : tx.type === "EXPENSE"
                        ? "-"
                        : ""}
                    {formatCurrency(tx.amount.toNumber())}
                  </p>
                </div>
              ),
            )}
            {transactions.length === 0 && (
              <p className="text-muted-foreground">Belum ada transaksi.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
