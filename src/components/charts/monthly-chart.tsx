"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis
          tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}K`}
          className="text-xs"
        />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend />
        <Bar
          dataKey="income"
          name="Pemasukan"
          fill="#3e6a00"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          name="Pengeluaran"
          fill="#ba1a1a"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
