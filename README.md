# Portal MySPD (Next.js) \u2014 Reka Bentuk v3: Glassmorphism + Animasi Penuh

Bina semula sepenuhnya teras Portal MySPD (login, portal utama, panel admin) guna **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Supabase**.

UI diubah keseluruhan (bukan iterasi kecil daripada versi navy/sidebar sebelum ini) kepada gaya **glassmorphism moden** dengan latar gradient mesh animasi, navigasi atas (top nav) berbanding sidebar, dan animasi di hampir setiap interaksi.

## Setup

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sebenar di .env.local
npm run dev
```

> `framer-motion` ditambah sebagai dependency baharu. Sandbox pembangunan (saya) tiada akses internet untuk `npm install` di sini, jadi ia belum diuji jalan sebenar \u2014 tapi ini pakej stabil & sangat popular, akan resolve normal semasa `npm install` anda (macam `next`/`react` yang dah berjaya sebelum ini di Vercel).

## Apa yang berubah (UI keseluruhan)

- **Log Masuk**: kad kaca (glassmorphism) terapung di atas latar gradient mesh 3 "blob" animasi + grid overlay halus. Kad dan medan borang masuk dengan animasi *stagger fade-up* berturutan.
- **Navigasi**: tukar daripada sidebar kiri kepada **top nav** melengkung (pill navigation) dengan penunjuk aktif yang **meluncur** (`layoutId` Framer Motion) antara tab.
- **Portal Utama**: kad statistik dengan **nombor mengira naik** (count-up) apabila muka surat dimuatkan, kad modul dengan kesan *hover lift*, semua elemen masuk dengan animasi *stagger fade-up*.
- **Panel Admin**: senarai pengguna sebagai kad (bukan jadual), butang "Tambah Pengguna" membuka **drawer gelongsor** dari kanan (slide-over) dengan latar blur, skeleton loading semasa data dimuatkan.
- **Toast**: animasi spring masuk/keluar (slide + scale).
- **Modal** (Lupa Kata Laluan, Sunting Profil): animasi scale + fade masuk/keluar dengan backdrop blur.
- **Tema gelap/terang**: ikon matahari/bulan bertukar dengan animasi putar + fade.
- Semua animasi hormat keutamaan pengguna `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` di peringkat root, serta CSS `@media (prefers-reduced-motion: reduce)` untuk animasi blob).

## Apa yang KEKAL sama

- Panggilan Supabase terus dari browser (client-side) untuk auth, data portal, dan panel admin.
- Skop teras: login, portal utama, panel admin sahaja (modul lain macam chat/status feed belum dibina; pautan modul lain di top nav sengaja dinyahaktifkan).
- Dasar kata laluan 8 aksara minimum di semua tempat.

## \u26a0\ufe0f Kelemahan keselamatan yang MASIH BELUM diselesaikan

Lihat nota keselamatan di bahagian atas `components/AdminView.tsx`. Ringkasnya:

1. **Row Level Security (RLS)** bagi jadual `profiles`, `admin_audit`, dsb. mesti disemak/diketatkan di papan pemuka Supabase \u2014 semakan `role === "superadmin"` di React hanya mengawal PAPARAN, bukan capaian data sebenar.
2. **Fungsi pelayan `create-user`** mesti sendiri sahkan JWT pemanggil ialah superadmin sebelum cipta akaun baharu dengan `role` yang diminta.
3. Untuk sekatan sebenar peringkat server dalam Next.js sendiri, pindahkan operasi sensitif ke Route Handler / Server Action yang sahkan sesi di server sebelum panggil Supabase.

## Struktur fail

```
app/
  layout.tsx          - root layout
  page.tsx            - entry point (splash / login / portal / recovery)
  globals.css         - design tokens + kelas glass/blob
components/
  icons.tsx           - set ikon SVG tersendiri
  LoginScreen.tsx      - skrin log masuk (glass card + blob animasi)
  ForgotPasswordModal.tsx
  NewPasswordModal.tsx
  TopNav.tsx           - navigasi atas dengan sliding pill indicator
  DashboardView.tsx    - portal utama (count-up stats, module grid animasi)
  AdminView.tsx        - panel admin (user cards, drawer, skeleton loading)
  PortalShell.tsx      - orkestrasi shell + page transition antara view
  ProfileModal.tsx
  ToastContainer.tsx
hooks/
  useAuth.ts           - session, login/logout, profile fetch
  useTheme.ts          - mod gelap/terang
  useToasts.ts
  useCountUp.ts        - animasi nombor mengira naik
lib/
  supabaseClient.ts
  types.ts
```
