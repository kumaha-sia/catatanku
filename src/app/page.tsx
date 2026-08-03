import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Catatanku
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Pencatatan keuangan pribadi & keluarga dengan AI insight, chat assistant,
          dan otomasi input struk.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Masuk</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Daftar</Link>
        </Button>
      </div>
    </main>
  );
}
