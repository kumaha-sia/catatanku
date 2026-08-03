# Design: Aplikasi Pencatatan Keuangan Pribadi & Keluarga dengan AI

**Tanggal:** 2026-08-03
**Status:** Draft
**Project:** catatanku

## Ringkasan

Aplikasi web PWA untuk pencatatan keuangan pribadi dan keluarga dengan fitur lengkap: rekening fisik, kategori budgeting, tabungan, hutang/piutang, cicilan, aset, investasi, dan integrasi AI untuk insight, chat assistant, dan otomasi input (OCR struk + auto-categorize). Deploy ke VPS dengan Docker Compose.

---

## 1. Arsitektur & Tech Stack

### Frontend
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (komponen accessible, dark mode, mobile-first)
- **PWA** via service worker + manifest.json
- **React Query** untuk data fetching & caching
- **Zustand** untuk state management
- **Recharts** untuk visualisasi chart

### Backend
- **Next.js API Routes** (dalam monorepo yang sama)
- **Prisma ORM** untuk akses PostgreSQL type-safe
- **PostgreSQL** + **pgvector** extension (untuk AI embedding)
- **NextAuth.js** untuk autentikasi multi-user

### AI Layer
- **Vercel AI SDK** untuk streaming & tool calling
- **Google Gemini 2.5 Flash** untuk insight harian (cepat, murah)
- **Google Gemini 2.5 Pro** untuk analisis kompleks
- **Google Vision API** untuk OCR ekstrak struk
- **pgvector** di PostgreSQL untuk embedding transaksi historis

### Deployment: VPS dengan Docker Compose
- 3 container: Next.js app, PostgreSQL+pgvector, Caddy reverse proxy
- Caddy untuk auto SSL/HTTPS
- Domain: subdomain (misal `keuangan.nama-domain.com`)
- Backup: cron `pg_dump` harian, simpan 7 hari

### Struktur Docker Compose
```
services:
  app:       # Next.js (port 3000)
  db:        # PostgreSQL + pgvector
  proxy:     # Caddy (auto SSL, port 80/443)
```

---

## 2. Data Model & Relasi

### Core Entities

#### User
- id, email, name, passwordHash
- role: OWNER | MEMBER | VIEWER
- familyId → Family

#### Family
- id, name, createdAt
- members: User[]

#### Account (Rekening fisik)
- id, userId, familyId
- type: BANK | CASH | E_WALLET
- name (e.g. "BCA Pribadi", "Cash Dompet")
- balance, currency
- transactions: Transaction[]

#### Category (Kategori budgeting/tabungan)
- id, userId (nullable untuk family category)
- type: INCOME | EXPENSE | SAVINGS | DEBT
- name (e.g. "Makan", "Dana Darurat", "Cicilan Mobil")
- budget, spent, remaining
- parent: Category? (tree untuk sub-kategori)

#### Transaction
- id, accountId, categoryId, userId
- type: INCOME | EXPENSE | TRANSFER
- amount, description, date
- receiptUrl? (foto struk)
- ocrData? (JSON hasil ekstrak struk)
- embedding? (vector untuk AI search)

#### Debt (Hutang/Piutang)
- id, userId, familyId
- type: DEBT | CREDIT
- counterpartyName (siapa)
- totalAmount, paidAmount, remaining
- installments: Installment[]

#### Asset
- id, userId, familyId
- type: REAL_ESTATE | VEHICLE | INVESTMENT | OTHER
- name, currentValue, purchasePrice
- metadata (JSON: sertifikat, lokasi, dll)

#### Investment
- id, userId, assetId?
- instrument: STOCK | MUTUAL_FUND | CRYPTO | BOND | GOLD
- units, buyPrice, currentValue, returnPct
- transactions: InvestmentTransaction[]

### Aturan Akses Data
- `userId` pada entity = milik pribadi, hanya owner/user yang bisa akses
- `familyId` + tanpa `userId` = milik keluarga (shared, semua member bisa lihat)
- Query agregasi keluarga: filter by `familyId` + role check
- Family viewer: hanya bisa GET agregasi, tidak bisa lihat transaksi detail anggota lain

---

## 3. AI Features & Data Flow

### 3.1 Insight & Analisis (Cron Job + On-Demand)

**Trigger:** Setiap malam 23:00 atau manual "Generate Insight"

**Flow:**
1. Query transaksi user/family bulan ini
2. Prompt: "Analisis pola pengeluaran, bandingkan dengan bulan lalu, identifikasi kategori overspending, beri 3 saran konkret"
3. AI return: ringkasan, alert budget, prediksi tren
4. Simpan ke Insight table, tampilkan di dashboard

**Contoh output:**
- "Pengeluaran makan naik 40% vs bulan lalu (Rp 1.2M vs 850K)"
- "Dana darurat baru 2.1x pengeluaran bulanan, target 6x"
- "Cicilan mobil sisa 8 bulan, total sisa Rp 16M"

### 3.2 Asisten Chat (Real-time)

**Trigger:** User kirim pertanyaan via chat interface

**Flow:**
1. User: "Berapa total pengeluaran makan bulan ini?"
2. AI SDK streaming + tool calling
3. AI call tools: getTransactions(category, dateRange)
4. AI return: "Bulan ini pengeluaran makan Rp 850K dari budget 1M. Sudah 85% terpakai, hati-hati 5 hari tersisa."
5. Store chat history untuk konteks percakapan

**Tools yang tersedia untuk AI:**
- `getTransactions(filter)` → query transaksi
- `getBudgetStatus(userId, month)` → status budget
- `getDebtSummary(familyId)` → ringkasan hutang
- `getNetWorth(userId)` → total aset - hutang
- `getCategoryTrends(categoryId, months)` → tren kategori

### 3.3 Otomasi Input (OCR + Auto-Categorize)

**Upload struk:**
1. Upload gambar → Google Vision API
2. Extract: merchant, items, total, date, tax
3. AI categorize: "INDOMARET" → Category "Belanja Harian"
4. AI detect anomalies: "Pengeluaran ini 3x rata-rata kategori ini"
5. Return pre-filled form → user konfirmasi → save

**Auto-categorize manual input:**
1. User ketik "makan di warteg 15rb"
2. AI parse: amount=15000, category="Makan", description="Warteg"
3. Suggest form, user tinggal submit

### 3.4 Vector Search (pgvector)

Setiap transaksi di-embed (description + category + amount):
- Cari transaksi serupa: "kapan terakhir saya beli bensin?"
- Pattern detection: AI cari pola pengeluaran berulang
- Deduplikasi: cek transaksi mirip sebelum save

---

## 4. UI/UX Layout & Halaman

### Halaman Public
- `/` (landing page)
- `/login`
- `/register`

### Halaman App - Personal
- `/dashboard` — ringkasan: saldo total, pemasukan/pengeluaran bulan, net worth, insight hari ini, chart tren
- `/accounts` — list rekening, tambah/edit, lihat transaksi per rekening
- `/transactions` — list semua transaksi, filter, search, tombol "Tambah" dan "Import"
- `/transactions/new` — form input (manual/OCR)
- `/transactions/import` — upload CSV/Excel atau batch struk
- `/budgets` — list kategori budget, progress bar, set budget
- `/savings` — list tabungan, target progress
- `/debts` — list hutang/piutang, jadwal cicilan
- `/assets` — list aset, update nilai, riwayat perubahan
- `/investments` — portofolio, return, transaksi investasi
- `/insights` — semua insight AI, filter by date
- `/chat` — interface chat dengan AI assistant

### Halaman App - Family
- `/family/dashboard` — agregasi keluarga: total net worth, pemasukan/pengeluaran sekeluarga, chart per anggota, insight family
- `/family/members` — list anggota, invite, role management
- `/family/budgets` — budget keluarga bersama (optional)

### Halaman Settings
- `/settings/profile` — data pribadi
- `/settings/family` — kelola family workspace
- `/settings/preferences` — currency, theme, notifikasi

### Komponen UI Utama
- **TransactionForm**: input cepat, auto-categorize AI, upload struk
- **BudgetCard**: progress bar, sisa budget, warna merah/kuning/hijau
- **NetWorthChart**: line chart aset vs hutang per bulan
- **FamilyMemberCard**: avatar, peran, kontribusi bulan ini
- **ChatInterface**: streaming AI response, quick actions
- **InsightCard**: icon, judul, detail, dismiss/acknowledge

### PWA Behavior
- Offline: input transaksi disimpan lokal (IndexedDB), sync ketika online
- Install prompt di mobile
- Push notification untuk insight harian & budget alert

---

## 5. Security & Error Handling

### Authentication & Authorization
- NextAuth.js dengan Credentials (email/password) + optional OAuth Google
- JWT token di cookie httpOnly, session timeout 7 hari
- Family workspace: role check di middleware + API
- Prisma middleware: inject userId/familyId filter setiap query
- Tidak ada API endpoint yang return data tanpa scope check
- Family viewer: hanya GET agregasi, tidak bisa lihat transaksi detail anggota lain

### Data Security
- Password: bcrypt hash (12 rounds)
- API key AI & OCR: environment variables, tidak expose ke client
- Upload struk: simpan ke lokal VPS storage (encrypted at rest) atau Minio (S3-compatible)
- Database backup: cron `pg_dump` harian, simpan 7 hari
- HTTPS wajib (Caddy auto SSL)

### Error Handling

**API Layer:**
- Zod validation setiap input → 400 dengan field errors
- Prisma error → map ke user-friendly message
- AI API timeout/error → fallback ke cached insight atau skip
- OCR error → return form kosong, user input manual

**Client Layer:**
- React Query untuk caching + retry (3x exponential backoff)
- Error boundary per section, bukan crash halaman
- Form: inline validation, disable submit saat loading

**Offline Sync:**
- Transaction queue di IndexedDB
- Conflict resolution: timestamp-based, last-write-wins
- Jika konflik kategori (kategori dihapus): flag "uncategorized"

### Testing Strategy
- **Unit**: Vitest — service layer, AI tools (mock), Prisma query builders
- **Integration**: Vitest + test database — API routes dengan auth, family aggregation, OCR → categorize flow
- **E2E**: Playwright — login → input transaksi → dashboard, family invite → agregasi, chat → jawaban, PWA offline → sync
- **Target coverage**: 70%+ untuk service layer

---

## 6. Implementasi Bertahap

### Phase 1: Foundation (Minggu 1-2)
- Setup Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Setup Prisma + PostgreSQL (Docker Compose local)
- Implementasi User & Family model + NextAuth
- Landing + login + register
- PWA manifest + service worker basic

### Phase 2: Core Features (Minggu 3-4)
- Account CRUD (rekening fisik)
- Category CRUD (kategori budgeting)
- Transaction CRUD + import CSV
- Dashboard personal: saldo, pemasukan/pengeluaran, chart
- Budget tracking: set budget per kategori, progress bar

### Phase 3: Advanced Financial (Minggu 5-6)
- Savings tracking dengan target progress
- Debt & cicilan management + jadwal pembayaran
- Asset management + update nilai berkala
- Investment portfolio + transaksi investasi
- Net worth calculation & chart

### Phase 4: AI Integration (Minggu 7-8)
- Vercel AI SDK setup + Gemini API integration
- pgvector + embedding transaksi
- Insight engine: cron job harian + on-demand
- Chat assistant dengan tool calling
- Auto-categorize untuk input manual

### Phase 5: OCR & Automation (Minggu 9-10)
- Google Vision API integration
- Upload struk → OCR → pre-fill form
- Batch import struk
- Anomaly detection pada transaksi
- Push notification (PWA + web push)

### Phase 6: Family & Polish (Minggu 11-12)
- Family dashboard agregasi
- Member management + invite system
- Role-based access control lengkap
- Family insight & budget bersama
- E2E testing + performance optimization
- Docker Compose production + Caddy SSL
- Deployment ke VPS

**Total estimasi: 12 minggu untuk MVP lengkap**

---

## 7. Dependencies & Struktur Project

### Dependencies Utama

**Frontend:**
- next@15, react@19, typescript
- tailwindcss, shadcn/ui (radix-ui)
- recharts (chart), lucide-react (icon)
- react-query (data fetching)
- zustand (state management)
- date-fns (tanggal Indonesia)

**Backend:**
- prisma, @prisma/client
- next-auth
- zod (validation)
- bcryptjs (password hash)

**AI:**
- ai (Vercel AI SDK)
- @google/generative-ai (Gemini)
- @google-cloud/vision (OCR struk)
- pgvector (embedding)

**DevOps:**
- docker, docker-compose
- caddy (reverse proxy + SSL)
- vitest, @playwright/test
- eslint, prettier

### Struktur Folder

```
catatanku/
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── (app)/dashboard, accounts, transactions,
│   │   │            budgets, savings, debts, assets,
│   │   │            investments, insights, chat
│   │   ├── (family)/family/dashboard, members, budgets
│   │   ├── api/auth/[...nextauth]
│   │   ├── api/accounts, transactions, budgets
│   │   ├── api/debts, assets, investments
│   │   ├── api/insights, chat, ocr
│   │   └── api/family/*
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── forms/, charts/, layout/
│   │   └── family/
│   ├── lib/
│   │   ├── auth.ts, prisma.ts, ai.ts
│   │   ├── ocr.ts, embedding.ts
│   │   └── utils/
│   ├── server/ (services)
│   │   ├── transaction.service.ts
│   │   ├── budget.service.ts
│   │   ├── insight.service.ts
│   │   ├── debt.service.ts
│   │   ├── asset.service.ts
│   │   └── family.service.ts
│   ├── ai/
│   │   ├── tools/ (AI tool definitions)
│   │   ├── prompts/
│   │   └── insight-engine.ts
│   └── public/
│       ├── manifest.json (PWA)
│       └── icons/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    └── plans/
```

### Environment Variables (.env)

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://keuangan.domain.com

GOOGLE_AI_API_KEY=...
GOOGLE_VISION_API_KEY=...
```

---

## Verifikasi End-to-End

Setelah implementasi selesai, verifikasi dengan:

1. **Docker Compose up** — semua container berjalan tanpa error
2. **Register + login** — user baru bisa daftar dan login
3. **Input transaksi manual** — transaksi tersimpan, saldo berubah
4. **Import CSV** — bulk import transaksi berhasil
5. **Upload struk** — OCR ekstrak data, form terisi otomatis
6. **Chat AI** — tanya "pengeluaran makan bulan ini", AI jawab dengan data real
7. **Insight harian** — generate insight, tampilkan di dashboard
8. **Family workspace** — invite anggota, lihat agregasi keluarga
9. **PWA install** — install di mobile, offline input, online sync
10. **HTTPS** — akses via domain dengan SSL valid
