"use client";

import { useQuery } from "@tanstack/react-query";
import { MonthlyChart } from "@/components/charts/monthly-chart";
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
      <main className="mx-auto max-w-[1200px] px-5 py-6 md:px-10">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-surface-container"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-6 md:px-10">
      <div className="grid grid-cols-4 gap-4 md:grid-cols-12">
        {/* Left Column */}
        <div className="col-span-4 flex flex-col gap-6 md:col-span-8">
          {/* Net Worth Card */}
          <section className="net-worth-gradient relative overflow-hidden rounded-xl p-4 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-container/20 blur-3xl" />
            <h2 className="font-body-md text-secondary-fixed-dim">
              Total Kekayaan Bersih
            </h2>
            <div className="font-currency-display text-currency-display">
              {formatCurrency(netWorthData?.netWorth ?? 0)}
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-tertiary-container">
                trending_up
              </span>
              <span className="font-label-md text-tertiary-container">
                {netWorthData?.netWorth >= 0 ? "+" : ""}
                {((netWorthData?.netWorth ?? 0) / 1000000).toFixed(1)}% bulan
                ini
              </span>
            </div>
          </section>

          {/* Income/Expense Cards */}
          <section className="grid grid-cols-2 gap-4">
            <div className="soft-shadow flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-income-green/10 p-2 text-income-green">
                  <span className="material-symbols-outlined">
                    arrow_downward
                  </span>
                </div>
                <span className="font-body-md text-secondary">Pemasukan</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">
                {formatCurrency(data?.summary?.income ?? 0)}
              </div>
            </div>
            <div className="soft-shadow flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-expense-red/10 p-2 text-expense-red">
                  <span className="material-symbols-outlined">
                    arrow_upward
                  </span>
                </div>
                <span className="font-body-md text-secondary">Pengeluaran</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">
                {formatCurrency(data?.summary?.expense ?? 0)}
              </div>
            </div>
          </section>

          {/* Trends Chart */}
          <section className="soft-shadow flex h-64 flex-col gap-4 rounded-xl bg-surface-container-lowest p-4">
            <h3 className="font-headline-md text-headline-md">Tren Keuangan</h3>
            <MonthlyChart data={data?.monthlyData ?? []} />
          </section>
        </div>

        {/* Right Column / Sidebar */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Category Progress */}
          <section className="soft-shadow flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4">
            <h3 className="font-headline-md text-headline-md">
              Pengeluaran per Kategori
            </h3>
            <div className="flex flex-col gap-3">
              {(data?.breakdown ?? [])
                .slice(0, 5)
                .map((item: { name: string; value: number }, i: number) => {
                  const maxVal = Math.max(
                    ...(data?.breakdown ?? []).map(
                      (b: { value: number }) => b.value,
                    ),
                    1,
                  );
                  const pct = (item.value / maxVal) * 100;
                  const emojis: Record<string, string> = {
                    Makan: "🍔",
                    Transportasi: "🚗",
                    "Belanja Harian": "🛍️",
                    Hiburan: "🎬",
                    Kesehatan: "💊",
                    Pendidikan: "📚",
                    Tagihan: "📄",
                    "Dana Darurat": "🏦",
                    Liburan: "✈️",
                  };
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md">
                          {emojis[item.name] || "💰"} {item.name}
                        </span>
                        <span className="font-label-md">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                        <div
                          className="h-full rounded-full bg-primary-container transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {(!data?.breakdown || data.breakdown.length === 0) && (
                <p className="font-body-md text-secondary">
                  Belum ada pengeluaran bulan ini
                </p>
              )}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="soft-shadow flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md">
                Transaksi Terakhir
              </h3>
              <a
                className="font-label-md text-primary-container hover:underline"
                href="/transactions"
              >
                Lihat Semua
              </a>
            </div>
            <div className="flex flex-col gap-4">
              {(data?.recentTransactions ?? [])
                .slice(0, 5)
                .map(
                  (tx: {
                    id: string;
                    type: string;
                    description: string;
                    amount: { toNumber: () => number };
                    date: string;
                    category: { name: string } | null;
                  }) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-md p-2 ${
                            tx.type === "INCOME"
                              ? "bg-tertiary-container/10 text-tertiary-container"
                              : "bg-primary-container/10 text-primary-container"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {tx.type === "INCOME" ? "work" : "receipt_long"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md font-semibold">
                            {tx.description}
                          </span>
                          <span className="font-label-md text-xs text-secondary">
                            {new Date(tx.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                            {tx.category ? ` · ${tx.category.name}` : ""}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`font-label-md ${tx.type === "INCOME" ? "text-income-green" : "text-expense-red"}`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount.toNumber())}
                      </span>
                    </div>
                  ),
                )}
              {(!data?.recentTransactions ||
                data.recentTransactions.length === 0) && (
                <p className="font-body-md text-secondary">
                  Belum ada transaksi
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
