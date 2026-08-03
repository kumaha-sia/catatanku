"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function BudgetsContent() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState("");

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await fetch("/api/budgets");
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

  const setBudgetMutation = useMutation({
    mutationFn: async (data: { categoryId: string; budget: number }) => {
      const res = await fetch("/api/budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan budget");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setEditingId(null);
      setBudgetValue("");
    },
  });

  const expenseCategories = categories.filter(
    (c: { type: string; budget: { equals: (v: null) => boolean } | null }) =>
      c.type === "EXPENSE",
  );

  function handleSetBudget(categoryId: string) {
    setBudgetMutation.mutate({
      categoryId,
      budget: parseFloat(budgetValue) || 0,
    });
  }

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Budget</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map(
          (b: {
            id: string;
            name: string;
            budget: number;
            spent: number;
            remaining: number;
            pct: number;
          }) => {
            const color =
              b.pct >= 100
                ? "bg-red-500"
                : b.pct >= 80
                  ? "bg-yellow-500"
                  : "bg-green-500";
            return (
              <Card key={b.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{b.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${color} transition-all`}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={
                        b.remaining >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      Sisa: {formatCurrency(b.remaining)}
                    </span>
                    <span className="text-muted-foreground">
                      {b.pct.toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
        {budgets.length === 0 && (
          <p className="text-muted-foreground">
            Belum ada budget. Set budget di kategori pengeluaran untuk mulai
            melacak.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Budget Kategori</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenseCategories.map(
            (c: { id: string; name: string; budget: number | null }) => (
              <div key={c.id} className="flex items-center gap-4">
                <Label className="w-40">{c.name}</Label>
                <Input
                  type="number"
                  placeholder={c.budget?.toString() ?? "0"}
                  value={editingId === c.id ? budgetValue : ""}
                  onChange={(e) => {
                    setEditingId(c.id);
                    setBudgetValue(e.target.value);
                  }}
                  className="w-40"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetBudget(c.id)}
                  disabled={setBudgetMutation.isPending}
                >
                  Simpan
                </Button>
              </div>
            ),
          )}
          {expenseCategories.length === 0 && (
            <p className="text-muted-foreground">
              Buat kategori pengeluaran terlebih dahulu.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
