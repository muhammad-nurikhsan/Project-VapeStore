# Vapestore Digital Catalog & Multi-Branch Inventory System

Platform katalog digital vape dengan sistem multi-cabang, variant management, dan integrasi WhatsApp.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (Free Tier)

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase (Free Tier)
- Akun Vercel (Free Tier)

## 🛠️ Setup Lokal

### 1. Clone & Install Dependencies

```bash
cd Project-VapeStore
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema:
   - Buka Supabase SQL Editor
   - Copy-paste isi file `supabase/01_schema.sql` dan execute
   - Copy-paste isi file `supabase/02_seed.sql` dan execute (untuk data testing)

3. Ambil credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → Project API keys → `anon` `public`

### 3. Environment Variables

Buat file `.env.local` di root project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 👥 Setup User Admin Pertama

Setelah seed data berhasil, buat user admin via Supabase:

1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Add user" → Email
3. Masukkan email & password (contoh: `admin@vapestore.com`)
4. Setelah user dibuat, catat `user_id` (UUID)
5. Jalankan SQL di SQL Editor:

```sql
INSERT INTO public.staff_profiles (user_id, full_name, role, is_active)
VALUES ('paste-user-id-disini', 'Admin Vapestore', 'admin', true);
```

Login di `/login` dengan credentials tersebut.

## 📱 Fitur Utama

### Public Catalog
- ✅ Age Gate (verifikasi 18+)
- ✅ Product listing dengan filter kategori
- ✅ Product detail dengan variant selector
- ✅ Branch selector & stock availability
- ✅ WhatsApp order integration

### Dashboard Staff
- ✅ Role-based access (Admin & Vaporista)
- ✅ Stock management per branch
- ✅ Product CRUD (Admin only)
- ✅ Branch management (Admin only)
- ✅ Real-time stock updates

## 🗂️ Struktur Database

```
branches → Cabang toko (whatsapp_phone, address, city)
categories → Kategori produk (hierarchical)
products → Master produk
product_option_types → Tipe varian (Flavor, Nicotine, dll)
product_option_values → Value varian (Mango, 3mg, dll)
product_skus → SKU dengan attributes (JSONB) & price
branch_stock → Stok per cabang per SKU
staff_profiles → User staff dengan role (admin/vaporista)
```

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/vapestore.git
git push -u origin main
```

### 2. Deploy via Vercel

1. Buka [Vercel](https://vercel.com)
2. Import repository GitHub
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (akan di-generate otomatis, update setelah deploy pertama)
4. Deploy!

### 3. Update Supabase Redirect URLs

Setelah deploy, tambahkan Vercel URL ke Supabase:
- Supabase Dashboard → Authentication → URL Configuration
- Tambahkan `https://your-app.vercel.app/**` ke Redirect URLs

## 📊 Row Level Security (RLS)

Database menggunakan RLS untuk keamanan:
- **Public**: Read-only untuk catalog (products, branches, stock)
- **Authenticated**: 
  - Vaporista: Update stock untuk branch-nya
  - Admin: Full access ke semua tabel

## 🔧 Troubleshooting

### Database connection error
- Pastikan `.env.local` sudah benar
- Restart dev server setelah update env vars

### Auth tidak berfungsi
- Pastikan RLS policies sudah di-apply
- Cek Supabase logs di Dashboard → Logs

### Stok tidak bisa diupdate
- Pastikan user sudah punya `staff_profile` dengan role yang benar
- Vaporista hanya bisa update branch yang di-assign ke mereka

## 📝 Next Steps (Optional Enhancements)

- [ ] Upload gambar produk via Supabase Storage
- [ ] Reporting & analytics dashboard
- [ ] Export data ke Excel
- [ ] Notification system untuk low stock
- [ ] Multi-language support

## 📄 License

Private - Internal Use Only

## 🤝 Support

Untuk pertanyaan teknis, hubungi tim development.
