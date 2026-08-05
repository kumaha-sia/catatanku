"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/transactions", label: "Transaksi", icon: TxIcon },
  { href: "/budgets", label: "Budget", icon: BudgetIcon },
  { href: "/investments", label: "Investasi", icon: InvestIcon },
  { href: "/family/dashboard", label: "Keluarga", icon: FamilyIcon },
] as const;

const moreItems = [
  { href: "/accounts", label: "Rekening" },
  { href: "/savings", label: "Tabungan" },
  { href: "/debts", label: "Hutang" },
  { href: "/assets", label: "Aset" },
  { href: "/insights", label: "Insight AI" },
  { href: "/chat", label: "Chat AI" },
  { href: "/family/members", label: "Anggota" },
  { href: "/settings", label: "Pengaturan" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md shadow-orange-500/20">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-base font-extrabold tracking-tight">
              Catatanku
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <MoreDropdown pathname={pathname} />
          </nav>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-around px-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                  active ? "text-orange-500" : "text-muted-foreground",
                )}
              >
                <item.icon active={active} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          <MoreDropdown pathname={pathname} mobile />
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </>
  );
}

function MoreDropdown({
  pathname,
  mobile,
}: {
  pathname: string;
  mobile?: boolean;
}) {
  return (
    <details className="relative">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-1 rounded-lg transition-colors",
          mobile
            ? "flex-col gap-0.5 px-3 py-1.5 text-muted-foreground"
            : "px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <MoreIcon active={false} />
        {!mobile && <span className="text-xs">Lainnya</span>}
        {mobile && <span className="text-[10px] font-semibold">Lainnya</span>}
      </summary>
      <div className="absolute bottom-full mb-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/10 md:bottom-auto md:left-0 md:mb-0 md:mt-2">
        {moreItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function TxIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      {active && (
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
      )}
    </svg>
  );
}

function BudgetIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
      {active && (
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          fill="currentColor"
          opacity="0.1"
        />
      )}
    </svg>
  );
}

function InvestIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
      {active && (
        <circle cx="13.5" cy="15.5" r="2" fill="currentColor" opacity="0.3" />
      )}
    </svg>
  );
}

function FamilyIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
      {active && (
        <circle cx="10" cy="8" r="3" fill="currentColor" opacity="0.15" />
      )}
    </svg>
  );
}

function MoreIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
