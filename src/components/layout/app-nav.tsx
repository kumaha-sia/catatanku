"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Rekening" },
  { href: "/transactions", label: "Transaksi" },
  { href: "/budgets", label: "Budget" },
  { href: "/savings", label: "Tabungan" },
  { href: "/debts", label: "Hutang" },
  { href: "/assets", label: "Aset" },
  { href: "/investments", label: "Investasi" },
  { href: "/insights", label: "Insight" },
  { href: "/chat", label: "Chat AI" },
  { href: "/settings", label: "Pengaturan" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link href="/dashboard" className="font-bold">
          Catatanku
        </Link>
        <div className="flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
