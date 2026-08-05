import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-400/30 via-red-400/20 to-pink-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-amber-300/20 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[300px] w-[300px] rounded-full bg-gradient-to-bl from-emerald-400/10 to-transparent blur-3xl" />
      </div>

      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold tracking-tight">Catatanku</span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-foreground/5 px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/10"
        >
          Masuk
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
        <div className="float-in mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
          Gratis untuk keluarga kecil
        </div>

        <h1 className="float-in stagger-1 mx-auto max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Kelola uang <span className="gradient-text">tanpa ribet</span>
        </h1>

        <p className="float-in stagger-2 mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          Catat setiap rupiah, pantau budget, dan dapat insight cerdas — untuk
          Anda dan keluarga.
        </p>

        <div className="float-in stagger-3 mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/40 active:scale-[0.98]"
          >
            Mulai Gratis
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-8 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
          >
            Sudah punya akun?
          </Link>
        </div>

        <div className="float-in stagger-4 mt-14 grid w-full max-w-sm grid-cols-3 gap-4">
          {[
            { label: "Transaksi", icon: "💸", desc: "Catat instan" },
            { label: "Budget", icon: "📊", desc: "Pantau batas" },
            { label: "AI Insight", icon: "🤖", desc: "Analisis cerdas" },
          ].map((f) => (
            <div
              key={f.label}
              className="glass-card flex flex-col items-center gap-2 px-3 py-5 text-center"
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs font-bold">{f.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {f.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">
        Dibuat dengan ❤️ untuk keluarga Indonesia
      </footer>
    </main>
  );
}
