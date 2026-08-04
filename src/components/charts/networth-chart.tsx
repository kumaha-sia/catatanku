"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetWorthData {
  month: string;
  netWorth: number;
}

export function NetWorthChart({ data }: { data: NetWorthData[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada data net worth</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis
          tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}K`}
          className="text-xs"
        />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Area
          type="monotone"
          dataKey="netWorth"
          name="Net Worth"
          stroke="#2563eb"
          fill="url(#netWorthGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
