"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

const instrumentLabels: Record<string, string> = {
  STOCK: "Saham",
  MUTUAL_FUND: "Reksa Dana",
  CRYPTO: "Crypto",
  BOND: "Obligasi",
  GOLD: "Emas",
};

export function InvestmentsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [instrument, setInstrument] = useState("STOCK");
  const [units, setUnits] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const res = await fetch("/api/investments");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      setUnits("");
      setBuyPrice("");
      setShowForm(false);
    },
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  const investments = data?.investments ?? [];
  const summary = data?.summary ?? {
    totalBuy: 0,
    totalCurrent: 0,
    gainLoss: 0,
    gainLossPct: 0,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investasi</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "Tambah Investasi"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalBuy)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nilai Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalCurrent)}
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
              {formatCurrency(summary.gainLoss)} (
              {summary.gainLossPct.toFixed(1)}%)
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
                  instrument,
                  units: parseFloat(units),
                  buyPrice: parseFloat(buyPrice),
                });
              }}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="space-y-2">
                <Label>Instrument</Label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="STOCK">Saham</option>
                  <option value="MUTUAL_FUND">Reksa Dana</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="BOND">Obligasi</option>
                  <option value="GOLD">Emas</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Unit</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Beli</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {investments.map(
          (inv: {
            id: string;
            instrument: string;
            units: { toNumber: () => number };
            buyPrice: { toNumber: () => number };
            currentValue: { toNumber: () => number };
            returnPct: { toNumber: () => number };
          }) => {
            const totalValue = Number(inv.currentValue) * Number(inv.units);
            const totalBuy = Number(inv.buyPrice) * Number(inv.units);
            const gain = totalValue - totalBuy;
            return (
              <Card key={inv.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{instrumentLabels[inv.instrument]}</span>
                    <span
                      className={`text-sm ${Number(inv.returnPct) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Number(inv.returnPct).toFixed(1)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Number(inv.units).toFixed(4)} unit @{" "}
                    {formatCurrency(Number(inv.currentValue))}
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
        {investments.length === 0 && (
          <p className="text-muted-foreground">Belum ada investasi.</p>
        )}
      </div>
    </div>
  );
}
