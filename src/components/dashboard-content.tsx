"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { MonthlyChart } from "@/components/charts/monthly-chart";

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
      <main className="mx-auto max-w-[1200px] px-5 py-4 md:px-10 md:py-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="grid grid-cols-4 gap-4 md:grid-cols-12">
          <div className="col-span-4 h-40 animate-pulse rounded-xl bg-surface-container md:col-span-6" />
          <div className="col-span-4 h-40 animate-pulse rounded-xl bg-surface-container md:col-span-6" />
        </div>
      </main>
    );
  }

  const now = new Date();
  const dayName = now.toLocaleDateString("id-ID", { weekday: "short" });
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const currentDay = now.getDate();

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-4 md:px-10 md:py-8">
      <div className="grid grid-cols-4 gap-4 md:grid-cols-12">
        {/* Greeting */}
        <div className="col-span-4 flex items-end justify-between md:col-span-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {dayName} • {dateStr}
            </p>
            <h2 className="font-headline-md text-[28px] font-semibold text-on-surface md:text-[32px]">
              Hi,{" "}
              <span className="italic text-primary-container">
                {userName.split(" ")[0]}.
              </span>
            </h2>
          </div>
          <button className="flex items-center gap-1 rounded-full border border-surface-variant bg-surface-container-low px-3 py-1 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontSize: 16 }}
            >
              calendar_today
            </span>
            {now.toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}{" "}
            {now.getFullYear()}
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              arrow_drop_down
            </span>
          </button>
        </div>

        {/* Spent So Far */}
        <section className="col-span-4 rounded-xl border border-surface-variant bg-surface-container-lowest p-4 shadow-sm md:col-span-6">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Spent so far{" "}
                {now.toLocaleDateString("id-ID", { month: "short" })}
              </h3>
              <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold text-on-tertiary-fixed">
                {currentDay} of {daysInMonth} days
              </span>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
          <div className="mb-6 flex items-end gap-2">
            <h2 className="font-headline-md text-[32px] font-semibold text-on-surface">
              {formatCurrency(data?.summary?.expense ?? 0)}
            </h2>
            <span className="material-symbols-outlined mb-2 text-on-surface-variant">
              keyboard_arrow_down
            </span>
          </div>
          <div className="mb-4 h-px w-full bg-surface-variant" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">
              Budget terpakai: {data?.summary?.budgetPct ?? 0}% ·{" "}
              <Link
                className="text-primary-container hover:underline"
                href="/budgets"
              >
                SET →
              </Link>
            </p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-on-surface-variant">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                expand_more
              </span>{" "}
              VS Last Month
            </p>
          </div>
        </section>

        {/* Scan Receipt CTA */}
        <section className="col-span-4 mt-2 flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl bg-tertiary-fixed p-4 shadow-sm transition-colors hover:bg-[#ffeb99] md:col-span-6 md:mt-0">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontSize: 24 }}
            >
              photo_camera
            </span>
          </div>
          <div className="z-10 flex-grow">
            <h3 className="font-headline-md text-[28px] font-bold text-on-surface">
              Scan receipt
            </h3>
            <p className="text-sm text-on-surface-variant">
              Snap the receipt, it fills in for you ✨
            </p>
          </div>
          <span className="material-symbols-outlined z-10 text-on-surface">
            arrow_forward
          </span>
          <div className="absolute -right-2 -top-4 rotate-12 opacity-50">
            <span
              className="material-symbols-outlined text-surface-container-lowest"
              style={{ fontSize: 80 }}
            >
              receipt_long
            </span>
          </div>
        </section>

        {/* Which Day Hits Hardest */}
        <section className="col-span-4 mt-4 rounded-xl border border-surface-variant bg-surface-container-lowest p-4 shadow-sm md:col-span-12">
          <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Which day hits hardest?
          </h3>
          <DayChart data={data?.dayBreakdown ?? []} />
        </section>

        {/* Budget So Far */}
        <section className="col-span-4 mt-6 md:col-span-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Budget so far
              </h3>
              <span
                className="material-symbols-outlined text-on-surface-variant"
                style={{ fontSize: 16 }}
              >
                help
              </span>
            </div>
            <button className="flex items-center gap-1 rounded-full bg-primary-container px-4 py-1.5 text-[12px] font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                ios_share
              </span>{" "}
              Share
            </button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {(data?.budgets ?? [])
              .slice(0, 3)
              .map(
                (
                  b: {
                    id: string;
                    name: string;
                    budget: number;
                    spent: number;
                  },
                  i: number,
                ) => (
                  <div
                    key={b.id}
                    className={`rounded-xl border-2 p-4 ${i === 0 ? "border-primary-container" : "border-surface-variant"} bg-surface-container-lowest`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-variant">
                        <span
                          className="material-symbols-outlined text-on-surface"
                          style={{ fontSize: 14 }}
                        >
                          home
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface">
                        {b.name}
                      </span>
                    </div>
                    <p className="font-headline-md text-[28px] font-bold text-on-surface">
                      {formatCurrency(b.budget)}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-on-surface-variant">
                      {b.spent > 0 ? "Ada pengeluaran" : "Belum ada"}
                    </p>
                  </div>
                ),
              )}
            {(!data?.budgets || data.budgets.length === 0) && (
              <div className="rounded-xl border-2 border-dashed border-surface-variant p-4 text-center">
                <p className="text-sm text-on-surface-variant">
                  Belum ada budget
                </p>
              </div>
            )}
          </div>
          <Link
            href="/budgets"
            className="flex w-full items-center justify-center rounded-xl border border-surface-variant bg-surface-container-low py-3 text-[12px] font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            Set a budget per category →
          </Link>
        </section>

        {/* Cash Flow */}
        <section className="col-span-4 mt-6 rounded-xl border border-surface-variant bg-surface-container-lowest p-4 shadow-sm md:col-span-12">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="font-headline-md text-[28px] font-bold text-on-surface md:text-[24px]">
                Cash flow
              </h3>
              <p className="text-sm text-on-surface-variant">last 6 months</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Surplus {now.toLocaleDateString("id-ID", { month: "short" })}
              </p>
              <p className="font-headline-md text-[28px] font-bold text-secondary">
                +
                {formatCurrency(
                  (data?.summary?.income ?? 0) - (data?.summary?.expense ?? 0),
                )}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#e2ead3] px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed-variant">
                <span className="h-2 w-2 rounded-full bg-secondary" /> saving{" "}
                {data?.summary?.income > 0
                  ? Math.round(
                      ((data.summary.income - data.summary.expense) /
                        data.summary.income) *
                        100,
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
          <div className="mb-4 flex rounded-full bg-surface-variant p-1">
            {["This Month", "6 Months", "12 Months"].map((label, i) => (
              <button
                key={label}
                className={`flex-1 rounded-full py-1.5 text-[10px] font-bold uppercase transition-colors ${i === 1 ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mb-6 flex rounded-full bg-surface-variant p-1">
            {["With Income", "Without Income"].map((label, i) => (
              <button
                key={label}
                className={`flex-1 rounded-full py-1.5 text-[10px] font-bold uppercase transition-colors ${i === 0 ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mb-6 flex gap-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
              <div className="h-0.5 w-3 rounded-full bg-secondary" /> Income
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
              <div className="h-0.5 w-3 rounded-full bg-primary-container" />{" "}
              Spending
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
              <div className="h-3 w-3 rounded-sm bg-[#e2ead3]" /> Surplus
            </div>
          </div>
          <MonthlyChart data={data?.monthlyData ?? []} />
        </section>

        {/* Today's Entries */}
        <section className="col-span-4 mt-8 md:col-span-12">
          <div className="mb-4 flex items-center justify-between border-b border-surface-variant pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {now.toLocaleDateString("id-ID", { weekday: "long" })} ·{" "}
              {data?.recentTransactions?.length ?? 0} Entries
            </h3>
            <span className="text-[12px] font-bold uppercase text-primary-container">
              -{formatCurrency(data?.summary?.expense ?? 0)}
            </span>
          </div>
          <div className="space-y-0">
            {(data?.recentTransactions ?? []).map(
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
                  className="flex items-center justify-between border-b border-surface-variant/50 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary/20 bg-[#e2ead3]">
                      <span
                        className="material-symbols-outlined text-secondary"
                        style={{ fontSize: 20 }}
                      >
                        {tx.type === "INCOME" ? "payments" : "home"}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-on-surface">
                        {tx.description}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">
                        {tx.category?.name ?? "Tanpa kategori"}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-base font-semibold ${tx.type === "INCOME" ? "text-secondary" : "text-on-surface"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(tx.amount.toNumber())}
                  </p>
                </div>
              ),
            )}
            {(!data?.recentTransactions ||
              data.recentTransactions.length === 0) && (
              <p className="py-8 text-center text-sm italic text-on-surface-variant">
                Belum ada transaksi hari ini
              </p>
            )}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm italic text-on-surface-variant">
              Logged with a calm mind · Catatanku
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function DayChart({ data }: { data: Array<{ day: string; amount: number }> }) {
  const days = ["S", "S", "R", "K", "J", "S", "M"];
  const maxVal = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex h-32 items-end justify-between px-2">
      {days.map((day, i) => {
        const val = data[i]?.amount ?? 0;
        const height = val > 0 ? Math.max((val / maxVal) * 100, 4) : 4;
        const isMax = val === Math.max(...data.map((d) => d.amount)) && val > 0;

        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-on-surface-variant">
              {val > 0 ? formatCurrency(val) : "0"}
            </span>
            <div
              className={`w-8 rounded-t-md md:w-12 ${isMax ? "bg-primary-container" : val > 0 ? "bg-surface-container-high" : "bg-surface-variant"}`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] font-bold text-on-surface-variant">
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
