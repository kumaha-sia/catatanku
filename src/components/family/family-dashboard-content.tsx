"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function FamilyDashboardContent() {
  const { data: family } = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      const res = await fetch("/api/family");
      return res.ok ? res.json() : null;
    },
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ["family-summary"],
    queryFn: async () => {
      const res = await fetch("/api/family/summary");
      return res.json();
    },
    enabled: !!family,
  });

  if (!family) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dashboard Keluarga</h1>
        <p className="mt-4 text-muted-foreground">
          Anda belum tergabung dalam keluarga. Undang anggota keluarga melalui
          halaman Anggota.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="p-6">Memuat...</div>;

  const chartData =
    summary?.members?.map(
      (m: { name: string; income: number; expense: number }) => ({
        name: m.name.split(" ")[0],
        income: m.income,
        expense: m.expense,
      }),
    ) ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard Keluarga</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Saldo Keluarga</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary?.totalBalance ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pemasukan Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.totalIncome ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pengeluaran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.totalExpense ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tabungan Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${(summary?.netSavings ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(summary?.netSavings ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontribusi Per Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(0)}M`}
              />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar
                dataKey="income"
                name="Pemasukan"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Pengeluaran"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Per Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary?.members?.map(
              (m: {
                userId: string;
                name: string;
                income: number;
                expense: number;
                balance: number;
              }) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Saldo: {formatCurrency(m.balance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">
                      +{formatCurrency(m.income)}
                    </p>
                    <p className="text-sm text-red-600">
                      -{formatCurrency(m.expense)}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
