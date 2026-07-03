# Portal MySPD (Next.js) \u2014 Reka Bentuk v4: Gaya Produk Komersial

Bina semula teras Portal MySPD (login, portal utama, panel admin) guna **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Supabase**, dengan reka bentuk yang bertujuan nampak seperti **produk SaaS komersial berbayar** (gaya Linear/Vercel/Stripe) \u2014 bukan portal dalaman generik.

## Setup

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sebenar di .env.local
npm run dev
```

## Arah reka bentuk v4 ("commercial value")

Berbanding v2 (kad plain) dan v3 (glassmorphism/blob), v4 fokus kepada ciri yang buat produk kelihatan **matang dan bernilai**:

- **Sidebar gelap elegan** (`#0B0C0E`) \u2014 gaya Linear/Vercel/Notion, bukan sidebar putih generik.
- **Data sebenar-nampak**: kad statistik ada **sparkline** (carta trend mini SVG), panel "Aktiviti Dokumen" ada **carta bar** animasi \u2014 buat portal nampak macam produk analytics sebenar, bukan sekadar borang.
- **Log Masuk**: panel jenama gelap dengan carta trend sebenar ("Dokumen Diproses 1,284 +18.2%") \u2014 mesej pemasaran produk, bukan hiasan kosong.
- **Jadual data profesional** di Panel Admin (bukan kad besar-besar) \u2014 lebih padat dan "enterprise", dengan footer pagination.
- **Tipografi lebih tajam**: `letter-spacing` negatif sedikit, saiz teks lebih kecil & padat (gaya produk data-dense), bukan besar-besar kosong.
- **Animasi bertujuan, bukan hiasan**: fade-up masuk berperingkat, carta bar animasi "tumbuh", tiada blob/gelombang yang tak relevan dengan fungsi produk.
- Warna accent ditukar ke indigo (`#4F5DFF`) \u2014 lebih "tech product" berbanding biru kerajaan biasa.

## Apa yang KEKAL sama

- Panggilan Supabase terus dari browser (client-side).
- Skop teras: login, portal utama, panel admin sahaja.
- Dasar kata laluan 8 aksara minimum.

## \u26a0\ufe0f Kelemahan keselamatan yang MASIH BELUM diselesaikan

Lihat nota di bahagian atas `components/AdminView.tsx`:

1. **RLS** Supabase mesti diketatkan \u2014 semakan role di React hanya kawal paparan, bukan capaian data sebenar.
2. **Fungsi `create-user`** mesti sahkan sendiri JWT pemanggil ialah superadmin.
3. Untuk sekatan sebenar, pindahkan operasi sensitif ke Route Handler / Server Action.

## Struktur fail

```
app/
  layout.tsx, page.tsx, globals.css
components/
  icons.tsx, LoginScreen.tsx, ForgotPasswordModal.tsx, NewPasswordModal.tsx,
  Sidebar.tsx, Topbar.tsx, DashboardView.tsx, AdminView.tsx, PortalShell.tsx,
  ProfileModal.tsx, ToastContainer.tsx
hooks/
  useAuth.ts, useTheme.ts, useToasts.ts
lib/
  supabaseClient.ts, types.ts
```
