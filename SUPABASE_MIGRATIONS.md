# Supabase Database Migrations

## 📋 Daftar Migrations yang Perlu Dijalankan

Setelah environment variables di Vercel sudah diset dan site tidak error 500 lagi, jalankan 2 SQL migration ini di Supabase:

| Nomor | File | Tujuan | Status |
|-------|------|--------|--------|
| 1 | `03_schema_enhancements.sql` | Tambah kolom discount_percent, is_featured + buat 5 views | ⏳ Belum dijalankan |
| 2 | `03_seed_enhancements.sql` | Isi data promo ke produk contoh | ⏳ Belum dijalankan |

---

## 🚀 Cara Menjalankan Migrations

### **Step 1: Buka Supabase SQL Editor**
1. Login ke https://supabase.com
2. Pilih project Anda: **xuaarepjbkyduykayyog**
3. Di sidebar, klik **"SQL Editor"**
4. Atau akses langsung: https://app.supabase.com/project/xuaarepjbkyduykayyog/sql/new

### **Step 2: Jalankan Migration #1 - Schema Enhancements**

1. Klik **"+ New Query"** atau **"New Query"**
2. Copy semua kode dari file ini:
   ```
   📁 d:\Project-VapeStore\supabase\03_schema_enhancements.sql
   ```

3. Paste ke editor SQL di Supabase
4. Klik tombol **"▶ Run"** atau **Ctrl+Enter**
5. Tunggu hingga selesai (akan terlihat pesan "Success" atau query output)

**Apa yang dilakukan:**
- ✅ Tambah kolom `discount_percent` ke tabel `products`
- ✅ Tambah kolom `is_featured` ke tabel `products`
- ✅ Buat 5 views baru:
  - `v_new_arrivals` - Produk terbaru (8 item)
  - `v_best_deals` - Produk dengan diskon (8 item)
  - `v_popular_categories` - Kategori dengan jumlah produk
  - `v_all_brands` - Daftar brand unik
  - `v_featured_products` - Produk unggulan (3 item)

### **Step 3: Jalankan Migration #2 - Seed Data**

1. Klik **"+ New Query"** atau buat query baru
2. Copy semua kode dari file ini:
   ```
   📁 d:\Project-VapeStore\supabase\03_seed_enhancements.sql
   ```

3. Paste ke editor SQL di Supabase
4. Klik tombol **"▶ Run"** atau **Ctrl+Enter**
5. Tunggu hingga selesai

**Apa yang dilakukan:**
- ✅ Update kolom `discount_percent` pada 5 produk contoh (10-20%)
- ✅ Update kolom `is_featured` untuk beberapa produk
- ✅ Data siap untuk ditampilkan di homepage (New Arrivals, Best Deals, Featured)

---

## ✅ Verifikasi Berhasil

### **1. Check Kolom Baru Ditambahkan**
1. Di Supabase, buka **"Table Editor"**
2. Pilih tabel **"products"**
3. Scroll ke kanan → pastikan terlihat 2 kolom baru:
   - `discount_percent` (integer)
   - `is_featured` (boolean)

### **2. Check Views Terbuat**
1. Di Supabase, buka **"Table Editor"**
2. Scroll ke bawah di list tabel
3. Pastikan terlihat 5 views baru:
   - `v_new_arrivals`
   - `v_best_deals`
   - `v_popular_categories`
   - `v_all_brands`
   - `v_featured_products`

### **3. Test Queries di SQL Editor**
Jalankan queries ini untuk verifikasi:

#### **Query A: Cek New Arrivals**
```sql
SELECT id, name, discount_percent, is_featured 
FROM v_new_arrivals 
LIMIT 5;
```
**Harapan:** Kembali 5-8 produk, urutan terbaru dulu

#### **Query B: Cek Best Deals**
```sql
SELECT id, name, discount_percent 
FROM v_best_deals 
LIMIT 5;
```
**Harapan:** Kembali produk dengan discount > 0%, urutan diskon terbesar dulu

#### **Query C: Cek Featured Products**
```sql
SELECT id, name, is_featured 
FROM v_featured_products;
```
**Harapan:** Kembali 3 produk dengan is_featured = true

---

## 🔄 Kalau Ada Error...

### **Error: "Column 'discount_percent' already exists"**
- Berarti kolom sudah pernah ditambahkan sebelumnya
- Tidak masalah, skip ke migration #2

### **Error: "Relation 'v_new_arrivals' already exists"**
- Berarti view sudah pernah dibuat
- Tidak masalah, skip ke migration #2

### **Error: "Permission denied"**
- Pastikan Anda login dengan role **Admin** atau **Owner** di Supabase project
- Atau periksa RLS policies (mungkin menolak query)

### **Error Syntax di SQL**
- Copy-paste ulang dari file, pastikan tidak ada karakter hilang
- Check editor untuk tombol "Format" (format ulang code)

---

## 📊 Testing di Production Site

Setelah migrations selesai, refresh website production:

### **Test 1: Homepage Sections**
Buka https://project-vape-store.vercel.app/
- ✅ Section **"🆕 New Arrivals"** harus muncul dengan 8 produk
- ✅ Section **"🎉 Best Deals"** harus muncul dengan produk promo + badge diskon merah
- ✅ Section **"⭐ Featured Products"** harus muncul dengan 3 produk unggulan

### **Test 2: Product Detail - Discount Badge**
- Klik salah satu produk dari Best Deals
- ✅ Harus muncul **badge merah "PROMO 15%"** di atas gambar
- ✅ Harga bawah harus menampilkan perhitungan:
  - Original: Rp XXX.XXX
  - Promo: Rp YYY.YYY
  - Diskon: -15%

### **Test 3: Filter & Search**
- Coba cari produk → harus menampilkan hasil
- Coba filter kategori → harus update produk
- Tidak boleh ada error di console

---

## 📁 File Reference

**Lokasi migrations di project:**
```
Project-VapeStore/
├── supabase/
│   ├── 01_schema.sql                    (original schema - sudah dijalankan ✅)
│   ├── 02_seed.sql                      (demo data - sudah dijalankan ✅)
│   ├── 03_schema_enhancements.sql       (JALANKAN INI - belum ✅)
│   └── 03_seed_enhancements.sql         (JALANKAN INI - belum ✅)
```

---

## 🎯 Checklist Completion

- [ ] Environment variables diset di Vercel (3 variables)
- [ ] Vercel re-deployed dan site tidak error 500
- [ ] Login ke Supabase SQL Editor
- [ ] Jalankan `03_schema_enhancements.sql` → Success
- [ ] Jalankan `03_seed_enhancements.sql` → Success
- [ ] Verifikasi kolom baru ada di table products
- [ ] Verifikasi 5 views ada di Table Editor
- [ ] Test queries untuk verify data
- [ ] Refresh production site dan cek New Arrivals / Best Deals sections
- [ ] Product detail menampilkan discount badge dengan benar

**Status keseluruhan setelah checklist selesai:** ✅ **READY FOR PHASE 2 DEVELOPMENT**

---

## Apa Selanjutnya?

Setelah migrations selesai dan site berjalan normal:

1. **Phase 2 Feature Development:**
   - Build admin product CRUD form (Create/Edit/Delete products)
   - Add image upload ke Supabase Storage
   - Manage product variants dan stock levels

2. **Dashboard Enhancements:**
   - Real-time stock monitoring
   - Order management dashboard
   - Staff management & roles

3. **Customer Features:**
   - Wishlist functionality
   - Order history & tracking
   - Product reviews & ratings

**Time Estimate untuk Phase 2: 3-4 hari kerja dengan pace development yang solid.**
