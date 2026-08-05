"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OcrUpload } from "@/components/ocr-upload";

export function TransactionsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
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
    queryFn: async () => (await fetch("/api/accounts")).json(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await fetch("/api/transactions?limit=50")).json(),
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

  if (isLoading)
    return (
      <div className="mx-auto max-w-screen-lg px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );

  return (
    <div className="mx-auto max-w-screen-lg space-y-5 px-4 py-6">
      <div className="float-in flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Transaksi</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowImport(!showImport);
              setShowOcr(false);
              setShowForm(false);
            }}
          >
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowOcr(!showOcr);
              setShowImport(false);
              setShowForm(false);
            }}
          >
            Scan
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setShowImport(false);
              setShowOcr(false);
            }}
          >
            {showForm ? "Batal" : "+ Tambah"}
          </Button>
        </div>
      </div>

      {showImport && (
        <div className="float-in rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <Label>Rekening Tujuan</Label>
              <select
                value={importAccountId}
                onChange={(e) => setImportAccountId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
              <Label>File CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <Button type="submit" disabled={importMutation.isPending}>
              {importMutation.isPending ? "Mengimport..." : "Import"}
            </Button>
          </form>
        </div>
      )}

      {showOcr && (
        <div className="float-in">
          <OcrUpload
            onExtracted={(data) => {
              setShowForm(true);
              setShowOcr(false);
              setDescription(data.merchant ?? "");
              if (data.date)
                setDate(new Date(data.date).toISOString().split("T")[0]);
              if (data.total) setAmount(String(data.total));
              setType("EXPENSE");
            }}
          />
        </div>
      )}

      {showForm && (
        <div className="float-in rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="space-y-2">
              <Label>Rekening</Label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
              <Label>Kategori</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
              <Label>Tipe</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="EXPENSE">Pengeluaran</option>
                <option value="INCOME">Pemasukan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Contoh: Makan siang"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createTxMutation.isPending}>
                {createTxMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="float-in stagger-1 space-y-2">
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
              className="group flex items-center justify-between rounded-xl border border-border/30 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                    tx.type === "INCOME"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {tx.type === "INCOME" ? "↑" : "↓"}
                </div>
                <div>
                  <p className="text-sm font-semibold">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)} · {tx.account.name}
                    {tx.category ? ` · ${tx.category.name}` : ""}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-extrabold tabular-nums ${
                  tx.type === "INCOME"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatCurrency(tx.amount.toNumber())}
              </p>
            </div>
          ),
        )}
        {transactions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-lg">💸</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Belum ada transaksi
            </p>
            <p className="text-xs text-muted-foreground/70">
              Tekan + Tambah untuk mulai mencatat
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
