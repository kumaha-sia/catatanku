import { getAccounts } from "@/actions/account"
import { formatRupiah } from "@/lib/utils"
import { Wallet, Plus } from "lucide-react"

export default async function AccountsPage() {
  const accounts = await getAccounts()
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dompet & Rekening</h1>
          <p className="text-muted-foreground">Kelola semua sumber dana Anda.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Akun</span>
        </button>
      </header>

      {accounts.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Anda belum memiliki dompet atau rekening.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map(account => (
            <div key={account.id} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-lg">{account.name}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">{account.type}</span>
              </div>
              <div className="text-2xl font-bold">
                {formatRupiah(account.balance)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
