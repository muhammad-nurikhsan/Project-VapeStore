# ⚠️ LANGKAH KRITIS: Setup Environment Variables di Vercel

## Masalah yang Terjadi
Site menampilkan **500 INTERNAL_SERVER_ERROR** dengan code `MIDDLEWARE_INVOCATION_FAILED` karena:
1. **Environment variables belum diset di Vercel production environment**
2. Middleware.ts mencoba inisialisasi Supabase client dengan nilai undefined

**Status Perbaikan:**
- ✅ Code fix sudah diterapkan (middleware guard logic ditambahkan)
- ✅ Code sudah dipush ke GitHub dan Vercel sedang rebuild
- ⏳ **Sekarang Anda perlu set environment variables di Vercel**

---

## Langkah-Langkah Setup Environment Variables di Vercel

### **Step 1: Login ke Vercel Dashboard**
1. Buka https://vercel.com/dashboard
2. Login dengan akun Anda

### **Step 2: Pilih Project**
1. Cari dan klik project **"Project-VapeStore"**
2. Atau akses langsung: https://vercel.com/dashboard/projects

### **Step 3: Buka Settings → Environment Variables**
1. Di sidebar kiri, klik **"Settings"**
2. Pilih tab **"Environment Variables"**

### **Step 4: Tambahkan 3 Environment Variables**

Tambahkan 3 variable berikut. Untuk setiap variable:
1. Klik **"Add New"** atau **"+ Add"**
2. Isi **Name** dan **Value**
3. Klik **"Save"**

#### **Variable 1: NEXT_PUBLIC_SUPABASE_URL**
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://xuaarepjbkyduykayyog.supabase.co
```

#### **Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_98itcKmLPJ4yMrONxACqIQ_xhWE51P2
```

#### **Variable 3: NEXT_PUBLIC_SITE_URL**
```
Name:  NEXT_PUBLIC_SITE_URL
Value: https://project-vape-store.vercel.app
```

**⚠️ PENTING:**
- Pastikan nilai **persis sama** (case-sensitive, jangan ada spasi)
- Untuk Production environment, pilih opsi "Production" jika ada dropdown
- Jangan upload ke public atau share values ini ke orang lain

### **Step 5: Trigger Vercel Re-Deploy**

Setelah semua 3 variables disimpan:

1. Di sidebar Vercel, pilih **"Deployments"**
2. Cari deployment terbaru (yang paling atas)
3. Klik pada row deployment tersebut
4. Cari tombol **"Redeploy"** atau **"Rebuild and Deploy"**
5. Klik tombol tersebut → Vercel akan mulai rebuild dengan env vars yang baru

**Tunggu hingga status berubah dari "Building" → "Ready"** (biasanya 1-2 menit)

---

## Verifikasi Berhasil

### **A. Cek Status Deployment di Vercel**
- Status harus berubah dari "Building" → "Ready" ✅
- Jangan ada error badge merah

### **B. Test Site di Browser**
1. Buka https://project-vape-store.vercel.app/
2. Halaman harus **load dengan baik tanpa error 500**
3. Lihat homepage dengan kategori produk & promo

### **C. Buka DevTools Console (F12)**
- **Tidak boleh ada** error merah seperti:
  - `500 INTERNAL_SERVER_ERROR`
  - `MIDDLEWARE_INVOCATION_FAILED`
  - `Failed to fetch Supabase...`
- Boleh ada warning kuning tentang CSS atau fonts (tidak masalah)

### **D. Test Navigasi**
- Klik salah satu produk → product detail harus membuka
- Coba login di `/login` → harus bisa akses form
- Coba akses `/dashboard` tanpa login → harus redirect ke login

---

## Jika Masih Error...

### **Jika Error 500 Masih Muncul:**
1. Verifikasi **3 env vars sudah disimpan** di Vercel
2. **Re-deploy lagi** dari Deployments tab
3. Bersihkan browser cache: **Ctrl+Shift+Delete** → pilih "All time" → Clear
4. Buka site di **private/incognito window** (untuk fresh cache)
5. Cek console lagi untuk error spesifik

### **Jika Error 404 pada CSS/Fonts:**
- Ini normal dan tidak menghalangi fungsionalitas
- Akan hilang setelah beberapa saat

### **Jika Production Build Gagal:**
- Lihat log deployment di Vercel untuk error detail
- Common issue: import path error atau TypeScript mismatch
- Hubungi kami dengan screenshot error dari Vercel logs

---

## Setelah Env Vars Setup Berhasil ✅

Kemudian lakukan **langkah berikutnya:**

### **1. Execute Supabase Database Migrations** (10 menit)
Ikuti panduan di [SUPABASE_MIGRATIONS.md](./SUPABASE_MIGRATIONS.md) untuk menjalankan file:
- `supabase/03_schema_enhancements.sql` → menambah kolom `discount_percent` dan `is_featured`
- `supabase/03_seed_enhancements.sql` → mengisi data promo untuk produk

Setelah ini selesai:
- Halaman homepage akan menampilkan **"New Arrivals"** dan **"Best Deals"** sections dengan data sebenarnya
- Product detail akan menampilkan **discount badges** dan **harga promo**

### **2. Smoke Testing**
- Buka homepage → pastikan semua section muncul dengan benar
- Klik "New Arrivals" atau "Best Deals" → pastikan produk terbuka
- Coba filter kategori dan search
- Cek product detail dengan diskon badge

---

## Quick Reference

**Supabase Credentials** (untuk reference):
```
URL:     https://xuaarepjbkyduykayyog.supabase.co
Key:     sb_publishable_98itcKmLPJ4yMrONxACqIQ_xhWE51P2
Project: xuaarepjbkyduykayyog
```

**Vercel Project:**
```
Name:    Project-VapeStore
URL:     https://vercel.com/dashboard/projects
Domain:  https://project-vape-store.vercel.app
```

**GitHub:**
```
Repo:    https://github.com/muhammad-nurikhsan/Project-VapeStore
Branch:  main (latest commit: middleware env guard fix)
```

---

**Status:**
- ✅ Code fix: Middleware guard added (prevent 500 crash)
- ✅ Code pushed to GitHub + Vercel rebuilding
- ⏳ **NEXT: Anda set env vars di Vercel** (ini yang perlu dilakukan sekarang)
- ⏳ Then: Re-deploy Vercel
- ⏳ Then: Execute Supabase migrations
- ⏳ Then: Verify site works

**Estimated waktu: 15-20 menit total untuk semua langkah.**
