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
    <aside className="hidden md:flex flex-col w-72 border-r border-border/50 bg-card/50 backdrop-blur-xl h-screen sticky top-0">
      <div className="p-8 flex items-center space-x-3">
        <div className="bg-primary/10 p-2.5 rounded-2xl text-primary shadow-inner">
          <WalletCards className="w-7 h-7" />
        </div>
        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">CatatUang</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground font-medium"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary-foreground")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <ThemeToggle />
      </div>
    </aside>
  )
}
