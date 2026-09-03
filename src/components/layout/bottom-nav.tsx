"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Wallet, PieChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Beranda", href: "/", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: Receipt },
  { name: "Dompet", href: "/accounts", icon: Wallet },
  { name: "Anggaran", href: "/budgets", icon: PieChart },
  { name: "Pengaturan", href: "/settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
