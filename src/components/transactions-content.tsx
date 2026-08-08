"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export function TransactionsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await fetch("/api/transactions?limit=100")).json(),
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
    },
  });

  // Group transactions by date
  const grouped = groupByDate(transactions);
  const filtered = search
    ? transactions.filter(
        (tx: { description: string; category: { name: string } | null }) =>
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : transactions;

  const filteredGrouped = search ? groupByDate(filtered) : grouped;

  const filterChips = [
    { key: "ALL", label: "ALL", icon: null, color: null },
    ...categories
      .filter((c: { type: string }) => c.type === "EXPENSE")
      .slice(0, 5)
      .map((c: { id: string; name: string }) => ({
        key: c.id,
        label: c.name.toUpperCase(),
        icon: getCategoryIcon(c.name),
        color: getCategoryColor(c.name),
      })),
  ];

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
    <main className="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 md:px-10">
      {/* Header */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-headline-md text-[28px] font-semibold text-on-surface md:text-[32px]">
            All <span className="italic text-primary-container">records.</span>
          </h1>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Filter Button */}
        <div className="mb-4 flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface px-4 py-2 text-sm">
            Filter{" "}
            <span className="material-symbols-outlined text-[16px]">
              keyboard_arrow_down
            </span>
          </button>
        </div>

        {/* Search & Date */}
        <div className="space-y-3">
          <div className="flex items-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5">
            <span className="material-symbols-outlined mr-2 text-on-surface-variant/60">
              search
            </span>
            <input
              className="w-full bg-transparent text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
              placeholder="Search records or category"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5">
            <span className="material-symbols-outlined mr-2 text-primary-container">
              calendar_today
            </span>
            <span className="flex-grow text-on-surface-variant/60">
              Specific date <span className="ml-2">mm / dd / yyyy</span>
            </span>
            <span className="material-symbols-outlined text-on-surface-variant/60">
              calendar_today
            </span>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:-mx-10 md:px-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveFilter(chip.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-1 text-[12px] font-semibold uppercase transition-colors ${
              activeFilter === chip.key
                ? "bg-inverse-surface text-white"
                : "border border-outline-variant/30 bg-surface"
            }`}
          >
            {chip.icon && (
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: chip.color }}
              >
                {chip.icon}
              </span>
            )}
            {chip.label}
          </button>
        ))}
      </section>

      {/* Transaction Groups */}
      {Object.entries(filteredGrouped).map(([dateKey, txs]) => {
        const dayTxs = txs as Array<{
          id: string;
          type: string;
          description: string;
          amount: { toNumber: () => number };
          date: string;
          category: { name: string } | null;
        }>;
        const totalDay = dayTxs.reduce(
          (sum, tx) =>
            sum +
            (tx.type === "EXPENSE"
              ? -tx.amount.toNumber()
              : tx.amount.toNumber()),
          0,
        );
        const d = new Date(dateKey);

        return (
          <section key={dateKey} className="space-y-0">
            {/* Day Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-[#231b00] p-4 text-white">
              <div className="flex items-center gap-4">
                <span className="text-[48px] font-bold leading-none">
                  {d.getDate()}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-70">
                    <span>
                      {d
                        .toLocaleDateString("id-ID", { weekday: "long" })
                        .toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>
                      {d
                        .toLocaleDateString("id-ID", { month: "short" })
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="font-headline-md text-[24px] font-bold">
                    {totalDay >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(totalDay))}
                  </div>
                  {dayTxs.some((tx) => tx.type === "INCOME") && (
                    <div className="mt-1 w-max rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-secondary-fixed-dim">
                      +
                      {formatCurrency(
                        dayTxs
                          .filter((tx) => tx.type === "INCOME")
                          .reduce((s, tx) => s + tx.amount.toNumber(), 0),
                      )}{" "}
                      in
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm italic text-primary-container">
                {dayTxs.length} records{" "}
                <span className="material-symbols-outlined text-[18px]">
                  check
                </span>
              </div>
            </div>

            {/* Transactions */}
            <div className="space-y-4 rounded-b-2xl border-x border-b border-outline-variant/30 bg-surface-container-lowest p-4">
              {dayTxs.map((tx, i) => (
                <div key={tx.id}>
                  {i > 0 && (
                    <div className="mb-4 border-t border-dashed border-outline-variant/30" />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container/30 text-secondary">
                        <span className="material-symbols-outlined">
                          {tx.type === "INCOME"
                            ? "payments"
                            : getCategoryIcon(tx.category?.name ?? "")}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-on-surface">
                          {tx.description}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-on-surface-variant/60">
                          <span>{tx.category?.name ?? "Tanpa kategori"}</span>
                          <span>•</span>
                          <span>
                            {new Date(tx.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-base font-medium ${tx.type === "INCOME" ? "text-secondary" : "text-on-surface"}`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount.toNumber())}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm("Hapus transaksi ini?"))
                            deleteMutation.mutate(tx.id);
                        }}
                        className="text-on-surface-variant/40 transition-colors hover:text-error"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {Object.keys(filteredGrouped).length === 0 && (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 py-16 text-center">
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

      {/* FAB Mobile */}
      <Link
        href="/transactions/new"
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg transition-all hover:bg-primary hover:shadow-xl active:scale-95 md:hidden"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </Link>
    </main>
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

function getCategoryIcon(name: string): string {
  const icons: Record<string, string> = {
    Makan: "restaurant",
    Transportasi: "directions_car",
    "Belanja Harian": "shopping_bag",
    Hiburan: "movie",
    Kesehatan: "local_hospital",
    Pendidikan: "school",
    Tagihan: "receipt",
    "Dana Darurat": "savings",
    Liburan: "flight",
    Gaji: "payments",
    Bonus: "card_giftcard",
    Freelance: "work",
  };
  return icons[name] || "receipt_long";
}

function getCategoryColor(name: string): string {
  const colors: Record<string, string> = {
    Makan: "#f97316",
    Transportasi: "#3e6a00",
    "Belanja Harian": "#735c00",
    Hiburan: "#9d4300",
    Kesehatan: "#ba1a1a",
    Pendidikan: "#3e6a00",
  };
  return colors[name] || "#8c7164";
}
