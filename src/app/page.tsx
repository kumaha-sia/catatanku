import { getAccounts } from "@/actions/account"
import { getTransactions } from "@/actions/transaction"
import { formatRupiah } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, Wallet, CreditCard, Sparkles } from "lucide-react"

export default async function Home() {
  const accounts = await getAccounts()
  const transactions = await getTransactions(5)

  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0)
  
  const now = new Date()
  const currentMonthTransactions = await getTransactions() 
  
  let totalIncome = 0
  let totalExpense = 0
  
  currentMonthTransactions.forEach(t => {
    if (t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear()) {
      if (t.type === "INCOME") totalIncome += t.amount
      else if (t.type === "EXPENSE") totalExpense += t.amount
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
        <div>
          <p className="text-sm font-medium text-primary mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Selamat datang kembali
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ringkasan Anda</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bulan Ini</p>
            <p className="text-sm font-semibold">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </header>

      {/* Hero Card - Total Balance */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary via-primary/80 to-emerald-900 border border-primary/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <p className="text-primary-foreground/80 font-medium flex items-center gap-2">
              <CreditCard className="w-5 h-5 opacity-70" /> Total Kekayaan Bersih
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">{formatRupiah(totalBalance)}</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pemasukan Bulan Ini</p>
            <h3 className="text-2xl font-bold tracking-tight">{formatRupiah(totalIncome)}</h3>
          </div>
        </div>
        
        <div className="rounded-3xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pengeluaran Bulan Ini</p>
            <h3 className="text-2xl font-bold tracking-tight">{formatRupiah(totalExpense)}</h3>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Transaksi Terakhir</h2>
          <button className="text-sm font-medium text-primary hover:underline">Lihat Semua</button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed flex flex-col items-center">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Belum ada transaksi</p>
            <p className="text-xs text-muted-foreground mt-1">Mulai catat keuangan Anda sekarang.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(t => (
              <div key={t.id} className="group flex items-center justify-between p-5 bg-card hover:bg-muted/30 rounded-2xl border shadow-sm transition-colors cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className={`p-3.5 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-base">{t.category?.name || "Lainnya"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{t.account.name}</span>
                      <span className="text-xs text-muted-foreground">{t.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-extrabold text-lg tracking-tight ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                  </div>
                  {t.note && <p className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
