# Portal MySPD (Next.js) \u2014 Reka Bentuk Profesional

Bina semula sepenuhnya teras Portal MySPD (login, portal utama, panel admin) guna **Next.js 14 (App Router) + TypeScript + Tailwind CSS (build version) + Supabase**, dengan reka bentuk UI baharu yang lebih profesional (bukan sekadar salin gaya lama).

Data/logik daripada portal asal (HTML statik) digunakan sebagai **panduan fungsi sahaja** \u2014 semua UI dilukis semula dari awal mengikut sistem reka bentuk konsisten (warna, jarak, tipografi) supaya nampak seperti produk SaaS profesional, bukan portal jabatan biasa.

## Setup

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sebenar di .env.local
npm run dev
```

Buka http://localhost:3000

## Reka bentuk baharu

- **Skrin log masuk**: reka bentuk dua panel \u2014 panel jenama (gradient navy + corak grid halus + statistik) di kiri, borang log masuk bersih di kanan.
- **Portal utama**: susun atur sidebar + topbar gaya dashboard SaaS \u2014 kad statistik, grid modul, senarai pengumuman dan staf dalam talian.
- **Panel Admin**: kad statistik pentadbiran, jadual pengguna, borang tambah pengguna, dan log audit bergaya timeline \u2014 semua dalam bingkai sidebar/topbar yang sama.
- **Sistem warna & jarak konsisten**: token warna (accent biru, latar neutral, sokongan hijau/oren/merah untuk status), skala jarak 4\u201364px, sudut bulat 8\u201312px, bayang lembut \u2014 disokong mod gelap (`.dark`) melalui CSS variables di `app/globals.css`.
- **Ikon SVG tersendiri** (`components/icons.tsx`) \u2014 tiada pek ikon luar diperlukan, mudah diselenggara offline.

## Apa yang diperbaiki berbanding portal asal

- Kunci Supabase dipindah ke `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) \u2014 bukan lagi hardcode dalam kod sumber.
- Dasar kata laluan diseragamkan: minimum 8 aksara di semua tempat (reset password dan daftar pengguna baharu).
- Tailwind CSS dibina (build), bukan CDN \u2014 lebih pantas dan sesuai produksi.
- Struktur komponen React berasingan (bukan satu fail HTML 1794 baris).

## Apa yang KEKAL sama (ikut pilihan semasa sesi ini)

- Panggilan Supabase terus dari browser (client-side) untuk data portal dan panel admin \u2014 tiada API routes/server actions baharu ditambah.

## \u26a0\ufe0f Kelemahan keselamatan yang MASIH BELUM diselesaikan

Lihat nota keselamatan di bahagian atas `components/AdminView.tsx`. Ringkasnya:

1. **Row Level Security (RLS)** bagi jadual `profiles`, `admin_audit`, dsb. mesti disemak/diketatkan di papan pemuka Supabase \u2014 semakan `role === "superadmin"` di React hanya mengawal PAPARAN, bukan capaian data sebenar.
2. **Fungsi pelayan `create-user`** mesti sendiri sahkan JWT pemanggil ialah superadmin sebelum cipta akaun baharu dengan `role` yang diminta.
3. Untuk sekatan sebenar peringkat server dalam Next.js sendiri, pindahkan operasi sensitif (tambah pengguna, tukar role, baca log audit) ke Route Handler / Server Action yang sahkan sesi di server sebelum panggil Supabase.

## Struktur fail

```
app/
  layout.tsx          - root layout
  page.tsx            - entry point (login / portal / recovery)
  globals.css         - design tokens (CSS variables) + Tailwind directives
components/
  icons.tsx           - set ikon SVG tersendiri
  LoginScreen.tsx      - skrin log masuk (reka bentuk dua panel)
  ForgotPasswordModal.tsx
  NewPasswordModal.tsx
  Sidebar.tsx          - navigasi sidebar
  Topbar.tsx           - topbar (carian, notifikasi, tema, profil)
  DashboardView.tsx    - portal utama (statistik + modul + pengumuman)
  AdminView.tsx        - panel admin (pengguna + log audit)
  PortalShell.tsx      - orkestrasi shell (sidebar+topbar+view switching)
  ProfileModal.tsx
  ToastContainer.tsx
hooks/
  useAuth.ts           - session, login/logout, profile fetch
  useTheme.ts          - mod gelap/terang
  useToasts.ts
lib/
  supabaseClient.ts
  types.ts
```
