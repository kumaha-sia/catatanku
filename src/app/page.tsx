export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beranda</h1>
          <p className="text-muted-foreground">Ringkasan keuangan Anda bulan ini.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Saldo</h3>
          </div>
          <div className="text-2xl font-bold">Rp 10.500.000</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pemasukan</h3>
          </div>
          <div className="text-2xl font-bold text-emerald-500">Rp 12.000.000</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pengeluaran</h3>
          </div>
          <div className="text-2xl font-bold text-rose-500">Rp 1.500.000</div>
        </div>
      </div>
    </div>
  );
}
