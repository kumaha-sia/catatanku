"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function SavingsContent() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState("");

  const { data: savings = [], isLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: async () => {
      const res = await fetch("/api/savings");
      return res.json();
    },
  });

  const setTargetMutation = useMutation({
    mutationFn: async (data: { categoryId: string; target: number }) => {
      const res = await fetch("/api/savings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      setEditingId(null);
      setTargetValue("");
    },
  });

  if (isLoading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Tabungan</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {savings.map(
          (s: {
            id: string;
            name: string;
            target: number;
            saved: number;
            pct: number;
            remaining: number;
          }) => {
            const color =
              s.pct >= 100
                ? "bg-green-500"
                : s.pct >= 75
                  ? "bg-blue-500"
                  : "bg-yellow-500";
            return (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{s.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {s.pct.toFixed(0)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      Terkumpul:{" "}
                      <span className="font-semibold">
                        {formatCurrency(s.saved)}
                      </span>
                    </span>
                    <span>Target: {formatCurrency(s.target)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${color} transition-all`}
                      style={{ width: `${Math.min(s.pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sisa target: {formatCurrency(s.remaining)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={s.target.toString()}
                      value={editingId === s.id ? targetValue : ""}
                      onChange={(e) => {
                        setEditingId(s.id);
                        setTargetValue(e.target.value);
                      }}
                      className="w-40"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setTargetMutation.mutate({
                          categoryId: s.id,
                          target: parseFloat(targetValue) || 0,
                        })
                      }
                      disabled={setTargetMutation.isPending}
                    >
                      Set Target
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
        {savings.length === 0 && (
          <p className="text-muted-foreground">
            Belum ada tabungan. Set target di kategori SAVINGS untuk mulai
            melacak.
          </p>
        )}
      </div>
    </div>
  );
}
