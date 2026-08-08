"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

const categoryEmojis: Record<string, string> = {
  Makan: "🍔",
  Transportasi: "🚗",
  "Belanja Harian": "🛍️",
  Hiburan: "🎬",
  Kesehatan: "💊",
  Pendidikan: "📚",
  Tagihan: "📄",
  "Dana Darurat": "🏦",
  Liburan: "✈️",
  Gaji: "💼",
  Bonus: "🎁",
  Freelance: "💻",
  Cicilan: "🏠",
};

export function TransactionsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await fetch("/api/transactions?limit=200")).json(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  // Filter transactions
  const filtered = transactions.filter(
    (tx: {
      description: string;
      category: { name: string } | null;
      date: string;
      categoryId: string | null;
    }) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !tx.description.toLowerCase().includes(q) &&
          !tx.category?.name?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedDate) {
        const txDate = new Date(tx.date).toISOString().split("T")[0];
        const selDate = selectedDate.toISOString().split("T")[0];
        if (txDate !== selDate) return false;
      }
      if (activeFilter !== "ALL") {
        if (tx.categoryId !== activeFilter) return false;
      }
      // Filter by current month
      const txDate = new Date(tx.date);
      if (
        txDate.getMonth() !== currentMonth.getMonth() ||
        txDate.getFullYear() !== currentMonth.getFullYear()
      ) {
        return false;
      }
      return true;
    },
  );

  const grouped = groupByDate(filtered);

  // Calculate totals
  const totalIncome = filtered
    .filter((tx: { type: string }) => tx.type === "INCOME")
    .reduce(
      (sum: number, tx: { amount: { toNumber: () => number } }) =>
        sum + tx.amount.toNumber(),
      0,
    );
  const totalExpense = filtered
    .filter((tx: { type: string }) => tx.type === "EXPENSE")
    .reduce(
      (sum: number, tx: { amount: { toNumber: () => number } }) =>
        sum + tx.amount.toNumber(),
      0,
    );

  const expenseCategories = categories.filter(
    (c: { type: string }) => c.type === "EXPENSE",
  );

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 md:px-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="h-12 animate-pulse rounded-xl bg-surface-container" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-surface-container"
          />
        ))}
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 md:px-10">
        {/* Page Title & Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1,
                ),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="text-center">
            <h1 className="font-headline-md text-[28px] font-semibold tracking-tight text-on-surface">
              Semua Catatan
            </h1>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
              {currentMonth.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1,
                ),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Search & Date Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              className="w-full rounded-lg bg-[#f5f0e5] py-2 pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Cari transaksi..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Pilih tanggal"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-1 md:-mx-10 md:px-10">
          <div className="flex w-max gap-3">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-full px-6 py-1.5 text-[12px] font-semibold transition-transform active:scale-95 ${
                activeFilter === "ALL"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              Semua
            </button>
            {expenseCategories.map((cat: { id: string; name: string }) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveFilter(activeFilter === cat.id ? "ALL" : cat.id)
                }
                className={`rounded-full px-6 py-1.5 text-[12px] font-semibold transition-transform active:scale-95 ${
                  activeFilter === cat.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex flex-col gap-6 pb-32">
          {Object.entries(grouped).map(([dateKey, txs]) => {
            const dayTxs = txs as Array<{
              id: string;
              type: string;
              description: string;
              amount: { toNumber: () => number };
              date: string;
              category: { name: string } | null;
              categoryId: string | null;
            }>;
            const totalDay = dayTxs.reduce(
              (sum, tx) =>
                sum +
                (tx.type === "INCOME"
                  ? tx.amount.toNumber()
                  : -tx.amount.toNumber()),
              0,
            );
            const d = new Date(dateKey);

            return (
              <section key={dateKey}>
                {/* Day Header */}
                <div className="group relative mb-4 overflow-hidden rounded-xl bg-inverse-surface p-4 text-inverse-on-surface shadow-sm">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex items-end justify-between">
                    <div className="flex items-end gap-3">
                      <span className="font-headline-md text-[28px] font-semibold leading-none">
                        {d.getDate()}
                      </span>
                      <div className="flex flex-col pb-[2px]">
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-inverse-on-surface/80">
                          {d.toLocaleDateString("id-ID", { weekday: "long" })}
                        </span>
                        <span className="text-[10px] font-bold text-inverse-on-surface/60">
                          {d.toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`relative z-10 text-base font-bold ${totalDay >= 0 ? "text-secondary-fixed" : "text-inverse-primary"}`}
                    >
                      {totalDay >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(totalDay))}
                    </div>
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="flex flex-col gap-2">
                  {dayTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="group flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-3 transition-colors hover:border-outline-variant"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                          tx.type === "INCOME"
                            ? "bg-secondary-container/40"
                            : "bg-surface-container"
                        }`}
                      >
                        {tx.type === "INCOME"
                          ? "💼"
                          : (categoryEmojis[tx.category?.name ?? ""] ?? "💰")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-medium text-on-surface">
                          {tx.description}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === "INCOME"
                                ? "bg-secondary-container/50 text-on-secondary-container"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {tx.type === "INCOME"
                              ? "Income"
                              : (tx.category?.name ?? "Tanpa kategori")}
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            {new Date(tx.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`shrink-0 text-base font-medium ${tx.type === "INCOME" ? "text-secondary" : "text-on-surface"}`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount.toNumber())}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Hapus transaksi ini?"))
                            deleteMutation.mutate(tx.id);
                        }}
                        className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant/40 opacity-0 transition-colors hover:bg-error-container/20 hover:text-error group-hover:opacity-100 md:opacity-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {Object.keys(grouped).length === 0 && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
                receipt_long
              </span>
              <p className="mt-4 text-base font-medium text-on-surface-variant">
                Belum ada transaksi
              </p>
              <p className="text-sm text-on-surface-variant/60">
                Tekan + untuk mulai mencatat
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Summary Bar - fixed above bottom nav */}
      <div className="fixed bottom-[80px] left-0 z-40 flex w-full items-center justify-between border-t border-outline-variant/20 bg-surface/90 px-5 py-3 shadow-[0px_-10px_20px_rgba(249,115,22,0.02)] backdrop-blur-md md:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Pemasukan
          </span>
          <span className="text-base font-bold text-secondary">
            +{formatCurrency(totalIncome)}
          </span>
        </div>
        <div className="h-8 w-px bg-outline-variant/40" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Pengeluaran
          </span>
          <span className="text-base font-bold text-on-surface">
            -{formatCurrency(totalExpense)}
          </span>
        </div>
      </div>
    </>
  );
}

function groupByDate(transactions: Array<{ date: string }>) {
  const groups: Record<string, typeof transactions> = {};
  for (const tx of transactions) {
    const key = new Date(tx.date).toISOString().split("T")[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return groups;
}
