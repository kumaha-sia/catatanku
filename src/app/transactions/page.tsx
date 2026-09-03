import { getTransactions } from "@/actions/transaction"
import { formatRupiah } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Plus, Receipt } from "lucide-react"

export default async function TransactionsPage() {
  const transactions = await getTransactions()
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Riwayat pemasukan dan pengeluaran.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </button>
      </header>

      {transactions.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Receipt className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold">{t.category?.name || "Lainnya"}</p>
                  <p className="text-xs text-muted-foreground">{t.account.name} • {t.date.toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                </div>
                {t.note && <p className="text-xs text-muted-foreground mt-1">{t.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
