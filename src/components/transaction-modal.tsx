"use client";

import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
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

interface TransactionModalCtx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const TransactionModalContext = createContext<TransactionModalCtx>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useTransactionModal() {
  return useContext(TransactionModalContext);
}

export function TransactionModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TransactionModalContext.Provider
      value={{
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen,
      }}
    >
      {children}
      {isOpen && <TransactionModal />}
    </TransactionModalContext.Provider>
  );
}

function TransactionModal() {
  const { close } = useTransactionModal();
  const queryClient = useQueryClient();
  const [txType, setTxType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [error, setError] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await fetch("/api/accounts")).json(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  });

  const filteredCategories = categories.filter(
    (c: { type: string }) => c.type === txType,
  );

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [txType, filteredCategories, categoryId]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    const timeout = setTimeout(() => amountRef.current?.focus(), 350);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
      if (!parsedAmount || parsedAmount <= 0) {
        throw new Error("Masukkan nominal yang valid");
      }
      if (!description.trim()) {
        throw new Error("Masukkan deskripsi");
      }
      if (!accountId) {
        throw new Error("Pilih akun");
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          amount: parsedAmount,
          description: description.trim(),
          categoryId: categoryId || undefined,
          accountId,
          date: new Date(`${date}T${time}:00`).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      close();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAmountChange = (v: string) => {
    const clean = v.replace(/[^0-9]/g, "");
    setAmount(clean);
  };

  const displayAmount = amount
    ? parseInt(amount, 10).toLocaleString("id-ID")
    : "";

  const selectedCategory = filteredCategories.find(
    (c: { id: string }) => c.id === categoryId,
  );

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={close}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 z-10 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-surface-container-lowest shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-20 flex justify-center bg-surface-container-lowest pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-outline-variant" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl tracking-tight text-on-surface">
              Catat <span className="italic text-primary-container">baru.</span>
            </h2>
            <button
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          {/* Type Switcher */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => {
                setTxType("EXPENSE");
                setCategoryId("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                txType === "EXPENSE"
                  ? "bg-error/10 text-error shadow-sm ring-1 ring-error/20"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_downward
              </span>
              Pengeluaran
            </button>
            <button
              onClick={() => {
                setTxType("INCOME");
                setCategoryId("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                txType === "INCOME"
                  ? "bg-secondary/10 text-secondary shadow-sm ring-1 ring-secondary/20"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_upward
              </span>
              Pemasukan
            </button>
          </div>

          {/* Amount Display */}
          <div className="mb-6 flex flex-col items-center py-4">
            <span className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant">
              Nominal
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-medium text-on-surface-variant">
                Rp
              </span>
              <span
                className={`font-serif text-5xl font-bold tracking-tight ${
                  txType === "INCOME" ? "text-secondary" : "text-on-surface"
                }`}
              >
                {displayAmount || "0"}
              </span>
            </div>
            <input
              ref={amountRef}
              type="text"
              inputMode="numeric"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="mt-3 w-full max-w-[240px] rounded-xl border border-outline-variant/50 bg-surface-container py-3 text-center text-lg font-medium text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
              placeholder="0"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Deskripsi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                  edit
                </span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                  placeholder="Contoh: Bayar kontrakan"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Kategori
              </label>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {filteredCategories.map((cat: { id: string; name: string }) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      categoryId === cat.id
                        ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                        : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <span className="text-[14px]">
                      {categoryEmojis[cat.name] ?? "💰"}
                    </span>
                    {cat.name}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <span className="py-2 text-xs text-on-surface-variant/60">
                    Tidak ada kategori
                  </span>
                )}
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Akun
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                  account_balance
                </span>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-10 pr-10 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                >
                  {accounts.map(
                    (acc: { id: string; name: string; type: string }) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type})
                      </option>
                    ),
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                  expand_more
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Tanggal
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                    calendar_month
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-10 pr-3 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>
              <div className="w-[120px]">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Jam
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                    schedule
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-10 pr-3 text-sm text-on-surface focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-error-container/50 px-4 py-2.5 text-sm font-medium text-on-error-container">
              <span className="material-symbols-outlined text-[16px]">
                error
              </span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-on-primary shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
              txType === "INCOME"
                ? "bg-secondary hover:bg-secondary/90"
                : "bg-primary-container hover:bg-primary"
            }`}
          >
            {createMutation.isPending ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  {txType === "INCOME" ? "add_circle" : "remove_circle"}
                </span>
                Simpan {txType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </>
            )}
          </button>

          {/* Summary Preview */}
          {amount && description && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-container p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                  txType === "INCOME"
                    ? "bg-secondary-container/40"
                    : "bg-surface-container-high"
                }`}
              >
                {txType === "INCOME"
                  ? "💼"
                  : (categoryEmojis[selectedCategory?.name ?? ""] ?? "💰")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {description}
                </p>
                <p className="text-[11px] text-on-surface-variant/70">
                  {selectedCategory?.name ?? "Tanpa kategori"} · {date}
                </p>
              </div>
              <span
                className={`font-mono text-sm font-bold ${
                  txType === "INCOME" ? "text-secondary" : "text-on-surface"
                }`}
              >
                {txType === "INCOME" ? "+" : "-"}Rp {displayAmount}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
