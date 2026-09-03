import { getAccounts } from "@/actions/account"
import { getTransactions } from "@/actions/transaction"
import { formatRupiah } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"

export default async function Home() {
  const accounts = await getAccounts()
  const transactions = await getTransactions(5)

  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0)
  
  // Calculate this month's income and expense
  const now = new Date()
  const currentMonthTransactions = await getTransactions() // in a real app, pass filter params
  
  let totalIncome = 0
  let totalExpense = 0
  
  currentMonthTransactions.forEach(t => {
    if (t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear()) {
      if (t.type === "INCOME") totalIncome += t.amount
      else if (t.type === "EXPENSE") totalExpense += t.amount
    }
  })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beranda</h1>
          <p className="text-muted-foreground">Ringkasan keuangan Anda bulan ini.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Saldo</h3>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{formatRupiah(totalBalance)}</div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <Wallet className="w-24 h-24" />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pemasukan</h3>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">{formatRupiah(totalIncome)}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pengeluaran</h3>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-500">{formatRupiah(totalExpense)}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4">Transaksi Terakhir</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground">Belum ada transaksi.</p>
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
                <div className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
