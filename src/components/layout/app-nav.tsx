"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/transactions", label: "Transaksi", icon: "edit_note" },
  { href: "/stats", label: "Stats", icon: "leaderboard" },
  { href: "/budgets", label: "Budget", icon: "account_balance_wallet" },
] as const;

const sidebarItems = [
  { href: "/dashboard", label: "Beranda", icon: "home" },
  { href: "/transactions", label: "Transaksi", icon: "edit_note" },
  { href: "/budgets", label: "Anggaran", icon: "account_balance_wallet" },
  { href: "/savings", label: "Tabungan", icon: "savings" },
  { href: "/debts", label: "Hutang", icon: "receipt_long" },
  { href: "/assets", label: "Aset", icon: "real_estate_agent" },
  { href: "/investments", label: "Investasi", icon: "trending_up" },
  { href: "/family/dashboard", label: "Keluarga", icon: "group" },
  { href: "/insights", label: "Insight AI", icon: "auto_awesome" },
  { href: "/chat", label: "Chat AI", icon: "chat" },
  { href: "/settings", label: "Pengaturan", icon: "settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Bar - STICKY */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-surface-variant bg-[#fef9f0]/90 px-5 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-on-surface"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            notes
          </span>
          <h1 className="font-headline-md text-[28px] font-bold tracking-tight text-on-surface">
            Catatanku
          </h1>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
          S
        </div>
      </header>

      {/* Desktop Sidebar - FIXED */}
      <aside className="hidden border-r border-surface-variant bg-surface-container-lowest md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-56 md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-surface-variant px-4">
          <span
            className="material-symbols-outlined text-primary-container"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            notes
          </span>
          <span className="font-headline-md text-lg font-bold text-on-surface">
            Catatanku
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {sidebarItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-container/10 text-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={
                    active ? { fontVariationSettings: '"FILL" 1' } : undefined
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav - FIXED */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-variant/50 bg-surface/95 px-4 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md md:hidden">
        {navItems.slice(0, 2).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center py-1 transition-all active:scale-95",
                active ? "font-bold text-primary" : "text-on-surface-variant",
              )}
            >
              {active && (
                <div className="absolute -top-2 h-1 w-12 rounded-b-md bg-primary-container" />
              )}
              <span
                className="material-symbols-outlined mb-0.5 rounded-full p-1 group-hover:bg-primary-container/10"
                style={
                  active ? { fontVariationSettings: '"FILL" 1' } : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}

        {/* FAB */}
        <Link
          href="/transactions/new"
          className="relative -top-5 flex flex-col items-center justify-center transition-all active:scale-95"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg transition-all hover:bg-primary hover:shadow-xl">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
        </Link>

        {navItems.slice(2).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center py-1 transition-all active:scale-95",
                active ? "font-bold text-primary" : "text-on-surface-variant",
              )}
            >
              <span
                className="material-symbols-outlined mb-0.5 rounded-full p-1 group-hover:bg-primary-container/10"
                style={
                  active ? { fontVariationSettings: '"FILL" 1' } : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
