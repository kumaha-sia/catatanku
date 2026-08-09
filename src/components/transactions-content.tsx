"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState("");
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

  const filtered = transactions.filter(
    (tx: {
      description: string;
      category: { name: string } | null;
      date: string;
      categoryId: string | null;
      type: string;
    }) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !tx.description.toLowerCase().includes(q) &&
          !tx.category?.name?.toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedDate) {
        const txDate = new Date(tx.date).toISOString().split("T")[0];
        if (txDate !== selectedDate) return false;
      }
      if (activeFilter !== "ALL" && tx.categoryId !== activeFilter)
        return false;
      const txDate = new Date(tx.date);
      if (
        txDate.getMonth() !== currentMonth.getMonth() ||
        txDate.getFullYear() !== currentMonth.getFullYear()
      )
        return false;
      return true;
    },
  );

  const grouped = groupByDate(filtered);

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

  const monthLabel = currentMonth
    .toLocaleDateString("id-ID", { month: "short", year: "numeric" })
    .toUpperCase()
    .replace(" ", " ");

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-4 md:px-10">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
          <div className="h-12 animate-pulse rounded-xl bg-surface-container" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-surface-container"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] px-6 pb-[180px] md:px-10">
          {/* Top Controls Section */}
          <section className="flex flex-col gap-4 pb-4 pt-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  RECORDS · {monthLabel}
                </p>
                <h2 className="font-serif text-4xl tracking-tight text-on-surface">
                  All{" "}
                  <span className="font-serif italic text-primary-container">
                    records.
                  </span>
                </h2>
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-2 text-sm font-medium shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  calendar_month
                </span>
                {monthLabel}
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button className="flex items-center gap-1 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-4 py-1.5 text-sm font-medium shadow-sm">
                Filter
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
              <div className="flex gap-2">
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Search and Date Inputs */}
          <section className="relative space-y-3 pb-4">
            <div className="relative right-0 flex justify-end">
              <button className="flex items-center gap-1 text-sm font-semibold text-primary-container">
                <span className="material-symbols-outlined text-[14px]">
                  edit
                </span>
                Select &amp; edit
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant/60">
                search
              </span>
              <input
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest py-3 pl-10 pr-3 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                placeholder="Cari catatan atau kategori"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-primary-container">
                calendar_month
              </span>
              <input
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest py-3 pl-10 pr-10 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                placeholder="Tanggal spesifik yyyy-mm-dd"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </section>

          {/* Categories Filter */}
          <section className="no-scrollbar flex gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm ${
                activeFilter === "ALL"
                  ? "bg-inverse-surface text-inverse-on-surface"
                  : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface"
              }`}
            >
              SEMUA
            </button>
            {expenseCategories.map((cat: { id: string; name: string }) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveFilter(activeFilter === cat.id ? "ALL" : cat.id)
                }
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm ${
                  activeFilter === cat.id
                    ? "bg-inverse-surface text-inverse-on-surface"
                    : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-container text-[10px]">
                  {categoryEmojis[cat.name] ?? "💰"}
                </span>
                {cat.name}
              </button>
            ))}
          </section>

          {/* Records List */}
          <section className="mt-4 flex flex-col gap-6">
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
              const incomeDay = dayTxs
                .filter((tx) => tx.type === "INCOME")
                .reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

              return (
                <div
                  key={dateKey}
                  className="overflow-hidden rounded-2xl shadow-sm"
                >
                  {/* Block Header (Dark) */}
                  <div className="bg-inverse-surface p-5 text-inverse-on-surface">
                    <div className="flex">
                      <div className="flex w-16 items-start justify-center pt-2">
                        <span className="font-serif text-5xl leading-none">
                          {d.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-inverse-on-surface/60">
                              {d.toLocaleDateString("id-ID", {
                                weekday: "long",
                              })}
                            </p>
                            <h3 className="font-serif text-3xl tracking-tight">
                              {totalDay >= 0 ? "+" : ""}
                              {formatCurrency(Math.abs(totalDay))}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium italic text-primary-container">
                            {dayTxs.length} catatan
                            <span className="material-symbols-outlined text-[16px]">
                              check_circle
                            </span>
                          </div>
                        </div>
                        {incomeDay > 0 && (
                          <div className="mt-2 inline-block rounded bg-[#3a4435] px-2 py-1 text-xs font-medium text-[#8cb084]">
                            +{formatCurrency(incomeDay)} masuk
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Block Items (Light) */}
                  <div className="bg-surface-container-lowest p-5 pt-0">
                    {dayTxs.map((tx, idx) => (
                      <div
                        key={tx.id}
                        className={`flex items-center py-4 ${
                          idx < dayTxs.length - 1
                            ? "border-b-2 border-dotted border-outline-variant/40"
                            : ""
                        }`}
                      >
                        <div
                          className={`mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
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
                          <h4 className="truncate text-[15px] font-semibold text-on-surface">
                            {tx.description}
                          </h4>
                          <p className="mt-0.5 text-xs uppercase tracking-wide text-on-surface-variant/70">
                            {tx.type === "INCOME"
                              ? "Pemasukan"
                              : (tx.category?.name ?? "Tanpa kategori")}{" "}
                            ·{" "}
                            {new Date(tx.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span
                            className={`font-serif text-[19px] font-medium ${
                              tx.type === "INCOME"
                                ? "text-secondary"
                                : "text-on-surface"
                            }`}
                          >
                            {tx.type === "INCOME" ? "+" : "-"}
                            {formatCurrency(tx.amount.toNumber())}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm("Hapus transaksi ini?"))
                                deleteMutation.mutate(tx.id);
                            }}
                            className="text-on-surface-variant/40 hover:text-error"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(grouped).length === 0 && (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
                  receipt_long
                </span>
                <p className="mt-4 text-base font-medium text-on-surface-variant">
                  Belum ada catatan
                </p>
                <p className="text-sm text-on-surface-variant/60">
                  Tekan + untuk mulai mencatat
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Summary Bar */}
      <div className="fixed bottom-[80px] left-0 z-40 flex w-full items-center justify-between border-t border-outline-variant/20 bg-surface/90 px-6 py-3 shadow-[0px_-10px_20px_rgba(249,115,22,0.02)] backdrop-blur-md md:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Pemasukan
          </span>
          <span className="font-mono text-base font-bold text-secondary">
            +{formatCurrency(totalIncome)}
          </span>
        </div>
        <div className="h-8 w-px bg-outline-variant/40" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Pengeluaran
          </span>
          <span className="font-mono text-base font-bold text-on-surface">
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
