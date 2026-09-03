import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
