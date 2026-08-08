# Project Context — Catatanku

## Overview

**Catatanku** adalah aplikasi keuangan pribadi & keluarga berbasis web. Target pasar: pengguna Indonesia. Bahasa UI: Indonesia. Mata uang default: IDR.

**Purpose:** Mencatat transaksi, mengelola anggaran, melacak aset/hutang/investasi, insight AI, dan kolaborasi keluarga.

---

## Tech Stack

| Layer           | Technology                                       | Version |
| --------------- | ------------------------------------------------ | ------- |
| Framework       | Next.js (App Router)                             | 15.x    |
| Language        | TypeScript (strict)                              | 5.9.x   |
| React           | React                                            | 19.x    |
| Database        | PostgreSQL (pgvector image)                      | 16      |
| ORM             | Prisma                                           | 6.x     |
| Auth            | NextAuth.js (Credentials provider, JWT strategy) | 4.x     |
| State (client)  | TanStack React Query                             | 5.x     |
| Styling         | Tailwind CSS                                     | 3.4.x   |
| UI Primitives   | Radix UI                                         | various |
| Validation      | Zod                                              | 4.x     |
| Charts          | Recharts                                         | 3.x     |
| AI              | Vercel AI SDK + OpenAI                           | 7.x     |
| OCR             | Google Cloud Vision                              | 5.x     |
| Push            | Web Push (VAPID)                                 | 3.x     |
| Testing (unit)  | Vitest                                           | 4.x     |
| Testing (e2e)   | Playwright                                       | 1.62.x  |
| Linting         | ESLint (next/core-web-vitals)                    | 8.x     |
| Formatting      | Prettier + prettier-plugin-tailwindcss           | 3.x     |
| Git Hooks       | Husky + lint-staged                              | 9.x     |
| Deployment      | Docker (standalone output) + Caddy reverse proxy | —       |
| Database (prod) | pgvector/pgvector:pg16 via Docker Compose        | —       |

---

## Project Structure

```
src/
├── ai/                     # AI engines (insight-engine.ts)
├── app/
│   ├── (app)/              # Protected app routes (requires auth)
│   │   ├── layout.tsx      # AppShell wrapper (providers + nav)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── accounts/
│   │   ├── savings/
│   │   ├── debts/
│   │   ├── assets/
│   │   ├── investments/
│   │   ├── insights/
│   │   ├── chat/
│   │   └── settings/
│   ├── (auth)/             # Public auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (family)/           # Family collaboration routes
│   │   └── family/
│   ├── api/                # API routes (REST)
│   ├── globals.css         # Global styles + font imports
│   ├── layout.tsx          # Root layout (Providers wrapper)
│   └── page.tsx            # Landing/redirect
├── components/
│   ├── layout/             # AppNav, AppShell
│   ├── ui/                 # Reusable UI primitives (button, card, input, etc.)
│   ├── charts/             # Chart components (Recharts)
│   ├── forms/              # Form components
│   ├── family/             # Family-specific components
│   ├── *-content.tsx       # Page content components (client-side)
│   ├── transaction-modal.tsx
│   ├── providers.tsx       # SessionProvider + QueryClientProvider
│   └── ocr-upload.tsx
├── hooks/                  # Custom hooks (currently empty)
├── lib/                    # Shared utilities
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # cn(), formatCurrency(), formatDate()
├── middleware.ts            # Auth middleware (withAuth)
├── server/                 # Server-side business logic (services)
│   ├── account.service.ts
│   ├── transaction.service.ts
│   ├── category.service.ts
│   ├── budget.service.ts
│   ├── debt.service.ts
│   ├── asset.service.ts
│   ├── investment.service.ts
│   ├── savings.service.ts
│   ├── networth.service.ts
│   ├── family.service.ts
│   ├── anomaly.service.ts
│   └── push.service.ts
└── types/
    └── next-auth.d.ts      # Session type augmentation
```

---

## Architecture Patterns

### Page Pattern (Route → Content)

Setiap halaman mengikuti pola yang SAMA:

```tsx
// src/app/(app)/[feature]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FeatureContent } from "@/components/feature-content";

export default async function FeaturePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <FeatureContent />;
}
```

**Rules:**

- Page component = SERVER COMPONENT. Hanya auth check + render content component.
- Content component = CLIENT COMPONENT (`"use client"`). Semua interaksi, data fetching, dan UI di sini.
- TIDAK ada data fetching di page component. Semua fetching via React Query di content component.
- Nama content component: `[feature]-content.tsx` (e.g., `dashboard-content.tsx`, `transactions-content.tsx`).

### API Route Pattern

```tsx
// src/app/api/[resource]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z from "zod";
import { authOptions } from "@/lib/auth";
import { serviceFunction } from "@/server/[resource].service";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... logic
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const result = await serviceFunction({ userId: session.user.id, ...data });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Rules:**

- SELALU validasi session di setiap handler.
- SELALU gunakan Zod schema untuk validasi input POST/PUT/PATCH.
- Error handling: ZodError → 400, lainnya → 500.
- Service function menerima `userId` sebagai parameter pertama untuk ownership check.
- Response format: `{ data }` atau `{ error: string }`.

### Service Layer Pattern

```tsx
// src/server/[resource].service.ts
import { prisma } from "@/lib/prisma";

export async function getResourcesByUser(userId: string, opts?: { ... }) {
  return prisma.resource.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 50,
  });
}

export async function createResource(data: { userId: string; ... }) {
  return prisma.resource.create({ data });
}
```

**Rules:**

- Service files HANYA boleh import `prisma` dari `@/lib/prisma` dan Prisma types.
- TIDAK boleh import Next.js, React, atau client-side code.
- Nama fungsi: `get[Resource]ByUser`, `create[Resource]`, `update[Resource]`, `delete[Resource]`.
- SELALU terima `userId` untuk operasi yang memerlukan ownership.
- Gunakan `prisma.$transaction()` untuk operasi yang memerlukan atomicity (contoh: create transaction + update account balance).
- Decimal fields dari Prisma perlu `.toNumber()` saat diakses di client.

---

## Data Model Key Points

### Prisma Schema Enums

```
Role:           OWNER, MEMBER, VIEWER
AccountType:    BANK, CASH, E_WALLET
CategoryType:   INCOME, EXPENSE, SAVINGS, DEBT
TransactionType: INCOME, EXPENSE, TRANSFER
DebtType:       DEBT, CREDIT
AssetType:      REAL_ESTATE, VEHICLE, INVESTMENT, OTHER
InvestmentInstrument: STOCK, MUTUAL_FUND, CRYPTO, BOND, GOLD
InvestmentTxType: BUY, SELL, DIVIDEND
InsightType:    SPENDING_PATTERN, BUDGET_ALERT, SAVINGS_PROGRESS, DEBT_TRACKING, ANOMALY, PREDICTION
InsightSeverity: INFO, WARNING, CRITICAL, POSITIVE
ChatRole:       USER, ASSISTANT, TOOL
```

### Decimal Handling

Semua field monetary menggunakan `Decimal @db.Decimal(18, 2)`. Di client, gunakan `.toNumber()` untuk mengakses nilai. Format dengan `formatCurrency()` dari `@/lib/utils`.

### Transaction Balance Logic

Saat create/update/delete transaction, balance akun harus diupdate secara atomic:

- `INCOME` → `account.balance += amount`
- `EXPENSE` → `account.balance -= amount`
- `TRANSFER` → decrement source, increment target

Ini ditangani di service layer menggunakan `prisma.$transaction()`.

---

## Design System

### Typography

| Token                                                                      | Font           | Use Case                                |
| -------------------------------------------------------------------------- | -------------- | --------------------------------------- |
| `font-sans`                                                                | Hanken Grotesk | Body text, UI elements                  |
| `font-serif` / `font-headline-md` / `font-headline-lg` / `font-display-lg` | Bodoni Moda    | Headlines, display text, day numbers    |
| `font-mono`                                                                | JetBrains Mono | Labels, currency codes, transaction IDs |

### Color Palette (Tailwind Custom Colors)

**Primary:** `primary` (#9d4300), `primary-container` (#f97316 — orange utama)
**Surface:** `background` (#fff8f4), `surface` (#fff8f4), `surface-container` (#f7ece4), `surface-container-lowest` (#ffffff)
**Text:** `on-surface` (#1f1b16), `on-surface-variant` (#584237)
**Inverse:** `inverse-surface` (#352f2b — dark card), `inverse-on-surface` (#faefe7)
**Secondary (green):** `secondary` (#3e6a00), `secondary-container` (#b9f079)
**Error (red):** `error` (#ba1a1a), `error-container` (#ffdad6)
**Outline:** `outline` (#8c7164), `outline-variant` (#e0c0b1)

### Icons

Gunakan **Material Symbols Outlined** via Google Fonts CDN. Sudah diimport di `globals.css`.

```tsx
<span className="material-symbols-outlined">icon_name</span>
```

Untuk filled: `style={{ fontVariationSettings: '"FILL" 1' }}`

### Layout

- Mobile-first. Breakpoint `md:` untuk desktop.
- Max width: `max-w-[1200px]`
- Mobile padding: `px-5` atau `px-6`
- Desktop padding: `md:px-10`
- Grid: 4 kolom mobile, 12 kolom desktop (`grid-cols-4 md:grid-cols-12`)

### App Shell Structure

```
AppShell (client)
├── TransactionModalProvider
│   ├── Top Bar (fixed, mobile only) — "Catatanku" + avatar
│   ├── Desktop Sidebar (fixed, desktop only)
│   ├── Content Area (scrollable, pt-14 md:pl-56)
│   └── Bottom Nav (fixed, mobile only) — Home, Transaksi, FAB, Stats, Budget
```

### Component Patterns

- Content components menggunakan `"use client"` directive.
- Data fetching via `useQuery` dari TanStack React Query.
- Mutations via `useMutation` dengan `queryClient.invalidateQueries()`.
- Loading state: skeleton dengan `animate-pulse`.
- Empty state: icon + text centered.
- Currency display: `formatCurrency(amount)` dari `@/lib/utils`.

---

## Client-Side Data Fetching

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["resource"],
  queryFn: async () => (await fetch("/api/resource")).json(),
});

const mutation = useMutation({
  mutationFn: async (payload) => {
    const res = await fetch("/api/resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resource"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  },
});
```

**Rules:**

- Query key harus konsisten. Pattern: `["resource"]`, `["resource", id]`.
- Invalidate `["dashboard"]` setelah mutate data yang mempengaruhi dashboard.
- Invalidate `["accounts"]` setelah mutate transaksi (karena balance berubah).
- Retry: 3x dengan exponential backoff (dikonfigurasi di providers.tsx).
- Stale time: 60 detik.

---

## Testing

### Unit Tests (Vitest)

- Location: `tests/unit/`
- Setup: `tests/setup.ts` — mock Prisma client secara menyeluruh.
- Coverage: `src/server/**/*.ts`, `src/lib/**/*.ts`
- Pattern: `vi.mock("@/lib/prisma")` → test service functions dengan mock return values.
- Run: `npm test` atau `npm run test:run`

### E2E Tests (Playwright)

- Location: `tests/e2e/`
- Config: `playwright.config.ts`
- Single worker, sequential execution.
- Base URL: `http://localhost:3000`
- Run: `npm run test:e2e`

---

## Environment Variables

```env
DATABASE_URL=postgresql://catatanku:catatanku@localhost:5432/catatanku
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=                    # AI features
GOOGLE_APPLICATION_CREDENTIALS=    # OCR (Google Vision)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=      # Push notifications
VAPID_PRIVATE_KEY=                 # Push notifications
```

---

## Commands

```bash
npm run dev              # Start dev server
npm run build            # prisma generate + next build
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm test                 # Vitest watch mode
npm run test:run         # Vitest single run
npm run test:e2e         # Playwright tests
npm run db:generate      # Prisma generate
npm run db:migrate       # Prisma migrate dev
npm run db:seed          # Seed database
npm run db:studio        # Prisma Studio
npm run format           # Prettier
```

---

## Critical Rules & Gotchas

### MUST DO

1. **Auth check di SETIAP page component dan API route.** Tidak ada pengecualian.
2. **Server component page → client component content.** Jangan fetch data di page component.
3. **Decimal → .toNumber()** saat akses field monetary dari Prisma di client.
4. **Zod validation** di semua POST/PUT/PATCH API routes.
5. **prisma.$transaction()** untuk operasi yang mengubah balance (transaction CRUD).
6. **invalidateQueries(["dashboard"])** setelah mutate transaksi/akun.
7. **"use client"** directive di semua content components dan komponen yang menggunakan hooks.
8. **formatCurrency()** untuk semua tampilan mata uang. Jangan format manual.
9. **Material Symbols Outlined** untuk icons. Bukan lucide-react (kecuali di UI primitives yang sudah ada).
10. **Tailwind custom colors** (e.g., `text-on-surface`, `bg-primary-container`). Bukan hardcoded hex.

### MUST NOT

1. **JANGAN** fetch data di server page component. Gunakan React Query di content component.
2. **JANGAN** import service files ke client component. Service hanya untuk API routes.
3. **JANGAN** gunakan `img` tag. Gunakan `next/image` (kecuali ESLint rule memperbolehkan).
4. **JANGAN** hardcode user ID. SELALU ambil dari `session.user.id`.
5. **JANGAN** skip Zod validation di API routes.
6. **JANGAN** gunakan `prisma` langsung di component. Hanya di service dan API routes.
7. **JANGAN** buat file baru tanpa mengikuti naming convention yang ada.
8. **JANGAN** gunakan inline styles kecuali untuk Material Symbols `fontVariationSettings`.
9. **JANGAN** commit `.env` file. Hanya `.env.example`.
10. **JANGAN** hapus `suppressHydrationWarning` dari `<html>` tag di root layout.

### Non-Obvious Details

1. **Background color app:** `#fef9f0` (warm cream) — bukan Tailwind default. Digunakan di `app-shell.tsx`, `app-nav.tsx`, dan `layout.tsx`.
2. **Font import:** Google Fonts via CDN di `globals.css` (Bodoni Moda, Hanken Grotesk, JetBrains Mono, Material Symbols Outlined).
3. **Prisma singleton:** Harus menggunakan pattern global di `lib/prisma.ts` untuk menghindari connection pool exhaustion di development.
4. **NextAuth session augmentation:** `session.user.id` ditambahkan via `types/next-auth.d.ts`. Type `id` tidak ada di default NextAuth types.
5. **Middleware:** `withAuth` dari `next-auth/middleware` melindungi routes yang di-list di `config.matcher`.
6. **Docker standalone output:** `next.config.ts` menggunakan `output: "standalone"` untuk Docker deployment.
7. **Prisma seed:** `tsx prisma/seed.ts` (configured di package.json).
8. **Lint-staged:** Menjalankan ESLint + Prettier pada `.ts/.tsx` files saat commit.
9. **Transaction modal:** Menggunakan React Context (`TransactionModalProvider`) yang di-wrap di `AppShell`. FAB button di bottom nav membuka modal ini.
10. **Provider stack:** `SessionProvider` → `QueryClientProvider` → `TransactionModalProvider` → app content.
11. **NextAuth `session.user` type** extended with `id: string` via `src/types/next-auth.d.ts` — wajib di-augment agar `session.user.id` bisa diakses tanpa error TypeScript.

---

## Adding a New Feature

Untuk menambahkan fitur baru (e.g., "Tabungan"):

1. **Prisma:** Tambah model di `prisma/schema.prisma` → `npm run db:migrate`
2. **Service:** Buat `src/server/[feature].service.ts` dengan CRUD functions
3. **API Route:** Buat `src/app/api/[feature]/route.ts` dengan Zod validation
4. **Content Component:** Buat `src/components/[feature]-content.tsx` (`"use client"`)
5. **Page:** Buat `src/app/(app)/[feature]/page.tsx` (server component, auth check)
6. **Navigation:** Tambah item di `sidebarItems` dan/atau `navItems` di `app-nav.tsx`
7. **Middleware:** Tambah route matcher di `middleware.ts`
8. **Tests:** Buat `tests/unit/[feature].service.test.ts`

---

## Git Workflow

- Branch: feature branches dari main
- Commit: conventional commits (feat:, fix:, chore:, etc.)
- Pre-commit: Husky + lint-staged (ESLint + Prettier otomatis)
- PR: ke main branch

---

## Deployment

- Docker Compose: app + PostgreSQL (pgvector) + Caddy reverse proxy
- Build: `docker-compose up -d`
- Database: `npx prisma migrate deploy` di dalam container
- Port: 3000 (app), 5432 (postgres), 80/443 (caddy)
- Standalone output: Next.js build menghasilkan `server.js` yang berjalan tanpa `node_modules`
