"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  REAL_ESTATE: "Properti",
  VEHICLE: "Kendaraan",
  INVESTMENT: "Investasi",
  OTHER: "Lainnya",
};

export function AssetsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("OTHER");
  const [name, setName] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await fetch("/api/assets");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setName("");
      setCurrentValue("");
      setPurchasePrice("");
      setShowForm(false);
    },
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  const assets = data?.assets ?? [];
  const summary = data?.summary ?? {
    totalValue: 0,
    gainLoss: 0,
    gainLossPct: 0,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Aset</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "Tambah Aset"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Nilai Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Keuntungan/Rugi</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${summary.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(summary.gainLoss)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Persentase</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${summary.gainLossPct >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {summary.gainLossPct.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  type,
                  name,
                  currentValue: parseFloat(currentValue),
                  purchasePrice: parseFloat(purchasePrice),
                });
              }}
              className="grid gap-4 md:grid-cols-4"
            >
              <div className="space-y-2">
                <Label>Tipe</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="REAL_ESTATE">Properti</option>
                  <option value="VEHICLE">Kendaraan</option>
                  <option value="INVESTMENT">Investasi</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nama Aset</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nilai Saat Ini</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Beli</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map(
          (asset: {
            id: string;
            name: string;
            type: string;
            currentValue: { toNumber: () => number };
            purchasePrice: { toNumber: () => number };
          }) => {
            const gain =
              asset.currentValue.toNumber() - asset.purchasePrice.toNumber();
            return (
              <Card key={asset.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{asset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {typeLabels[asset.type]}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-2xl font-bold">
                    {formatCurrency(asset.currentValue.toNumber())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Beli: {formatCurrency(asset.purchasePrice.toNumber())}
                  </p>
                  <p
                    className={`text-sm font-medium ${gain >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {gain >= 0 ? "+" : ""}
                    {formatCurrency(gain)}
                  </p>
                </CardContent>
              </Card>
            );
          },
        )}
        {assets.length === 0 && (
          <p className="text-muted-foreground">Belum ada aset.</p>
        )}
      </div>
    </div>
  );
}
