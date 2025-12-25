# Quick Start Guide - Vapestore

## 🚀 Langkah Cepat Setup (15 menit)

### 1. Setup Supabase (5 menit)

1. Buka [supabase.com](https://supabase.com) → Sign up (gratis)
2. Klik "New Project"
   - Name: `vapestore-catalog`
   - Database Password: buat password kuat (simpan!)
   - Region: pilih terdekat (Singapore recommended)
   - Klik "Create new project" → tunggu 1-2 menit
3. Setelah selesai, buka **SQL Editor** (icon di sidebar)
4. Copy seluruh isi file `supabase/01_schema.sql`
5. Paste ke SQL Editor → klik **Run** (⚡)
6. Copy seluruh isi file `supabase/02_seed.sql`
7. Paste ke SQL Editor → klik **Run** (⚡)

✅ Database siap dengan 2 cabang & 5 produk sample!

### 2. Setup Environment Variables (2 menit)

1. Di Supabase Dashboard, klik **Settings** → **API**
2. Copy nilai berikut:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public** key (klik "Copy" di bagian Project API keys)
3. Di folder project, copy file `.env.local.example` → rename jadi `.env.local`
4. Buka `.env.local` dan isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=paste-project-url-disini
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-disini
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Jalankan Project (2 menit)

```bash
npm run dev
```

Buka browser → [http://localhost:3000](http://localhost:3000)

✅ Katalog publik sudah live!

### 4. Buat Admin User (3 menit)

1. Di Supabase Dashboard → **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
   - Email: `admin@vapestore.com`
   - Password: buat password (misal: `Admin123!`)
   - Klik **Create user**
3. Setelah user dibuat, **copy User UID** (contoh: `abc123-def456-...`)
4. Buka **SQL Editor** → paste SQL ini (ganti USER_ID):

```sql
INSERT INTO public.staff_profiles (user_id, full_name, role, is_active)
VALUES ('paste-user-uid-disini', 'Admin Vapestore', 'admin', true);
```

5. Klik **Run**

### 5. Login ke Dashboard (1 menit)

1. Buka [http://localhost:3000/login](http://localhost:3000/login)
2. Login dengan:
   - Email: `admin@vapestore.com`
   - Password: yang Anda buat tadi
3. ✅ Anda masuk ke dashboard admin!

---

## 🎯 Test Fitur-Fitur

### Public Catalog
- Buka homepage → lihat 5 produk sample
- Klik filter kategori (Liquid, Device, Pod)
- Klik produk → pilih varian → pilih cabang
- Klik "Pesan via WhatsApp" → otomatis buka WA dengan pesan terformat

### Dashboard Admin
- **Kelola Stok**: Update quantity produk per cabang (+ / - / Set)
- **Produk**: Lihat list produk & SKU (tambah produk fitur coming soon)
- **Cabang**: Lihat 2 cabang sample (Jakarta & Bandung)

---

## 🔥 Next Steps

1. **Ganti Data Sample**: Edit produk & cabang sesuai bisnis Anda
2. **Invite Staff**: Buat user vaporista untuk tiap cabang
3. **Deploy**: Push ke GitHub → deploy di Vercel (lihat README.md)

## ❓ Troubleshooting

**Error: Invalid API key**
→ Cek `.env.local`, pastikan URL & key sudah benar

**Error: User tidak punya akses**
→ Pastikan staff_profiles sudah dibuat di step 4

**Produk tidak muncul**
→ Pastikan seed data (02_seed.sql) sudah di-run

---

**Butuh bantuan?** Cek [README.md](README.md) untuk dokumentasi lengkap.
