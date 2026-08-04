"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DebtsContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("DEBT");
  const [counterparty, setCounterparty] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const res = await fetch("/api/debts");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      setCounterparty("");
      setTotalAmount("");
      setShowForm(false);
    },
  });

  const payMutation = useMutation({
    mutationFn: async (installmentId: string) => {
      const res = await fetch(`/api/installments/${installmentId}/pay`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["debts"] }),
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  const debts = data?.debts ?? [];
  const summary = data?.summary ?? { totalDebt: 0, totalCredit: 0, netDebt: 0 };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hutang & Piutang</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "Tambah"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Hutang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalDebt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Piutang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.netDebt)}
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
                  counterpartyName: counterparty,
                  totalAmount: parseFloat(totalAmount),
                });
              }}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="space-y-2">
                <Label>Tipe</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="DEBT">Hutang (saya berhutang)</option>
                  <option value="CREDIT">
                    Piutang (orang berhutang ke saya)
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nama Pihak</Label>
                <Input
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Total Jumlah</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
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

      <div className="space-y-4">
        {debts.map(
          (debt: {
            id: string;
            type: string;
            counterpartyName: string;
            totalAmount: { toNumber: () => number };
            paidAmount: { toNumber: () => number };
            remaining: { toNumber: () => number };
            installments: Array<{
              id: string;
              amount: { toNumber: () => number };
              dueDate: string;
              paid: boolean;
            }>;
          }) => (
            <Card key={debt.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{debt.counterpartyName}</span>
                  <span
                    className={`text-sm ${debt.type === "DEBT" ? "text-red-600" : "text-green-600"}`}
                  >
                    {debt.type === "DEBT" ? "Hutang" : "Piutang"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>
                    Total: {formatCurrency(debt.totalAmount.toNumber())}
                  </span>
                  <span>
                    Dibayar: {formatCurrency(debt.paidAmount.toNumber())}
                  </span>
                  <span className="font-semibold">
                    Sisa: {formatCurrency(debt.remaining.toNumber())}
                  </span>
                </div>
                {debt.installments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Jadwal Cicilan:</p>
                    {debt.installments.map((inst) => (
                      <div
                        key={inst.id}
                        className="flex items-center justify-between border-b pb-2 text-sm last:border-0"
                      >
                        <div>
                          <span>{formatDate(inst.dueDate)}</span>
                          <span className="ml-2">
                            {formatCurrency(inst.amount.toNumber())}
                          </span>
                        </div>
                        {inst.paid ? (
                          <span className="text-green-600">Lunas</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => payMutation.mutate(inst.id)}
                          >
                            Bayar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ),
        )}
        {debts.length === 0 && (
          <p className="text-muted-foreground">
            Belum ada hutang atau piutang.
          </p>
        )}
      </div>
    </div>
  );
}
