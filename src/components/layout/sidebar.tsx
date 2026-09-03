"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Wallet, PieChart, Settings, WalletCards } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { name: "Beranda", href: "/", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: Receipt },
  { name: "Dompet", href: "/accounts", icon: Wallet },
  { name: "Anggaran", href: "/budgets", icon: PieChart },
  { name: "Pengaturan", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background h-full sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-xl text-primary">
          <WalletCards className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">CatatUang</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <ThemeToggle />
      </div>
    </aside>
  )
}
