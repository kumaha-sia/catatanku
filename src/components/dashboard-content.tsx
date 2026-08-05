"use client";

import { useQuery } from "@tanstack/react-query";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { NetWorthChart } from "@/components/charts/networth-chart";
import { formatCurrency } from "@/lib/utils";

export function DashboardContent({ userName }: { userName: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Gagal memuat dashboard");
      return res.json();
    },
  });

  const { data: netWorthData } = useQuery({
    queryKey: ["networth"],
    queryFn: async () => {
      const res = await fetch("/api/networth?months=6");
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-lg px-4 py-6">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="mx-auto max-w-screen-lg space-y-6 px-4 py-6">
      <div className="float-in">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {userName}
        </h1>
      </div>

      <div className="float-in stagger-1">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-5 text-white shadow-2xl shadow-orange-500/30 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm font-medium text-white/80">Net Worth</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {formatCurrency(netWorthData?.netWorth ?? 0)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-medium text-white/70">Aset</p>
              <p className="text-sm font-bold">
                {formatCurrency(netWorthData?.totalAssets ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-medium text-white/70">Hutang</p>
              <p className="text-sm font-bold">
                {formatCurrency(netWorthData?.totalLiabilities ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="float-in stagger-2 grid grid-cols-2 gap-3">
        <SummaryCard
          label="Pemasukan"
          value={data?.summary?.income ?? 0}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
          icon="↑"
        />
        <SummaryCard
          label="Pengeluaran"
          value={data?.summary?.expense ?? 0}
          color="text-red-500 dark:text-red-400"
          bg="bg-red-50 dark:bg-red-950/30"
          icon="↓"
        />
        <SummaryCard
          label="Total Saldo"
          value={data?.totalBalance ?? 0}
          color="text-orange-600 dark:text-orange-400"
          bg="bg-orange-50 dark:bg-orange-950/30"
          icon="💰"
        />
        <SummaryCard
          label="Tabungan Bersih"
          value={(data?.summary?.income ?? 0) - (data?.summary?.expense ?? 0)}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-950/30"
          icon="🏦"
        />
      </div>

      <div className="float-in stagger-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-foreground/80">
          Tren 6 Bulan
        </h2>
        <MonthlyChart data={data?.monthlyData ?? []} />
      </div>

      <div className="float-in stagger-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-foreground/80">
            Pengeluaran per Kategori
          </h2>
          <CategoryPieChart data={data?.breakdown ?? []} />
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-foreground/80">
            Net Worth History
          </h2>
          <NetWorthChart data={netWorthData?.history ?? []} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: string;
}) {
  return (
    <div className={`rounded-2xl ${bg} p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <p
        className={`mt-1 text-lg font-extrabold tracking-tight sm:text-xl ${color}`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
