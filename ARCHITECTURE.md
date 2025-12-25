# Architecture Documentation

## 🏗️ System Overview

Vapestore adalah platform katalog digital dengan sistem multi-cabang yang menggunakan serverless architecture untuk meminimalkan biaya operasional.

## 📊 Tech Stack & Justification

### Frontend: Next.js 15 App Router
- **ISR (Incremental Static Regeneration)**: Catalog pages di-cache 1 jam, mengurangi database queries
- **Server Components**: Default untuk halaman catalog (SEO-friendly, faster initial load)
- **Client Components**: Hanya untuk interaktif components (Age Gate, Stock Management)
- **Route Handlers**: Belum digunakan (RLS di Supabase cukup untuk keamanan)

### Backend: Supabase
- **PostgreSQL**: Relational database dengan JSONB untuk flexibility (variant attributes)
- **Row Level Security (RLS)**: Security layer di database level
- **Auth**: Built-in authentication dengan email/password
- **Edge Functions**: Tidak digunakan (overhead untuk use case ini)

### Deployment: Vercel Free Tier
- 100GB bandwidth/month (cukup untuk ~50K page views)
- Unlimited deployments
- Auto-scaling serverless functions
- Edge network (CDN) untuk static assets

## 🗂️ Database Design

### Core Tables

```
branches (Cabang Toko)
├── id (uuid, PK)
├── slug (text, unique) → URL-friendly identifier
├── name (text) → Display name
├── whatsapp_phone (text) → Format: 62812xxx (tanpa +)
├── address, city
└── is_active (boolean) → Soft delete

products (Master Produk)
├── id (uuid, PK)
├── slug (text, unique) → SEO-friendly URL
├── name, description, brand
├── category_id (uuid, FK)
├── base_image_url
├── meta_title, meta_description → SEO
└── is_active (boolean)

product_skus (Variant SKU)
├── id (uuid, PK)
├── product_id (uuid, FK)
├── sku_code (text, optional)
├── attributes (jsonb) → {"Flavor":"Mango","Nicotine":"6mg"}
├── price_idr (integer) → Dalam Rupiah, misal: 80000
└── UNIQUE(product_id, attributes) → Prevent duplicate variants

branch_stock (Inventory per Branch)
├── branch_id (uuid, FK)
├── sku_id (uuid, FK)
├── quantity (integer)
├── low_stock_threshold (integer)
└── PRIMARY KEY (branch_id, sku_id)
```

### Design Decisions

**Why JSONB for attributes?**
- Flexibility: Add new variant types tanpa ALTER TABLE
- Performance: GIN index untuk fast queries
- Tradeoff: Sedikit lebih kompleks untuk validasi, tapi masih manageable
- Alternative: EAV (Entity-Attribute-Value) terlalu verbose untuk use case ini

**Why composite PK for branch_stock?**
- One stock record per branch-SKU pair
- Fast lookups: WHERE branch_id = X AND sku_id = Y
- No need for surrogate key (id) karena tidak ada child table

**Why integer for price (not decimal)?**
- Avoid floating-point precision issues
- Store in cents (Rupiah tidak punya sen, jadi langsung Rupiah)
- Display: formatRupiah() utility handles formatting

## 🔐 Security Architecture

### Row Level Security (RLS) Policies

```sql
-- Public (Anonymous Users)
✅ SELECT active products, skus, branches, stock
❌ No INSERT/UPDATE/DELETE

-- Authenticated (Staff)
Vaporista:
  ✅ SELECT/UPDATE branch_stock WHERE branch_id = their_branch
  ❌ Cannot modify products/branches

Admin:
  ✅ Full access to products, skus, branches, categories
  ✅ SELECT/UPDATE all branch_stock
  ❌ Cannot directly modify auth.users (Supabase Auth handles this)
```

### Authentication Flow

1. User submits email/password → Supabase Auth
2. Middleware checks session → redirect if unauthorized
3. Dashboard checks staff_profiles → verify role & active status
4. RLS policies enforce data access per role

**Why no JWT in frontend?**
- Supabase SDK handles session automatically via httpOnly cookies
- No XSS risk (token tidak di localStorage)
- Auto-refresh token sebelum expire

## 🚀 Performance Optimizations

### ISR Strategy
```typescript
export const revalidate = 3600 // 1 hour cache
```
- Homepage & product pages cached di Vercel Edge
- Stok real-time di client-side (fetch on demand)
- Admin dashboard: no cache (always fresh data)

### Query Optimization
- **Homepage**: Single query dengan JOIN categories & skus
- **Product Detail**: 3 parallel queries (product, options, stock)
- **Stock Management**: Single query per branch (tidak fetch all SKUs)

### Image Optimization
- Next.js Image component (auto WebP, lazy loading)
- Placeholder: Emoji (no external CDN untuk placeholder)
- Future: Supabase Storage dengan transform API

## 📱 Mobile-First Design

### Responsive Breakpoints
```css
sm: 640px   → 2 cols grid
md: 768px   → 3 cols grid
lg: 1024px  → 4 cols grid
```

### Touch-Optimized
- Stock update buttons: 44×44px (Apple Human Interface)
- Dropdown selectors: Large tap targets
- Horizontal scroll for category filters (no wrapping)

## 🔗 WhatsApp Integration

### Deep Link Format
```
https://wa.me/[phone]?text=[encoded_message]
```

**Message Template:**
```
Halo, saya tertarik dengan produk:

📦 *Product Name*
🎯 Varian: Flavor: Mango, Nicotine: 6mg
💰 Harga: Rp80.000
🏪 Cabang: Jakarta Pusat

Apakah produk ini tersedia?
```

**Why not auto-order?**
- Legal: Vape products require age verification (handled via Age Gate)
- Customer service: Staff can confirm stock & answer questions
- Flexibility: Price negotiation untuk bulk orders

## 🎯 Scalability Plan

### Current Capacity (Free Tier)
- **Supabase**: 500MB storage, unlimited API requests
- **Vercel**: 100GB bandwidth, 100 serverless executions/day
- **Estimated**: ~50K page views/month, ~500 products

### Scale-Up Path (When Needed)
1. **10K+ products**: Add full-text search (tsvector) atau Algolia
2. **High traffic**: Vercel Pro ($20/mo) → 1TB bandwidth
3. **Real-time stock**: Supabase Realtime subscriptions
4. **Analytics**: Vercel Analytics atau self-hosted Plausible

## 🛠️ Development Workflow

### Local Development
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (test SSR/ISR)
npm run start        # Serve production build locally
```

### Database Migrations
```bash
supabase/
├── 01_schema.sql    # Initial schema (one-time)
├── 02_seed.sql      # Sample data (testing)
└── migrations/      # Future: versioned migrations
```

**No ORM**: SQL langsung via Supabase client (type-safe via generated types)

### Type Safety
- `database.types.ts`: Auto-generated dari Supabase schema
- No manual type definitions untuk database tables
- Future: `supabase gen types typescript` untuk auto-sync

## 📦 File Structure

```
app/
├── (public)/
│   ├── page.tsx              # Homepage (Product List)
│   └── products/[slug]/      # Product Detail
├── dashboard/
│   ├── layout.tsx            # Protected layout + nav
│   ├── page.tsx              # Dashboard overview
│   ├── stock/                # Stock management
│   ├── products/             # Product CRUD
│   └── branches/             # Branch CRUD
├── login/                    # Auth page
├── layout.tsx                # Root layout + Age Gate
├── globals.css               # Tailwind + custom styles
├── robots.ts                 # SEO: robots.txt
└── sitemap.ts                # SEO: dynamic sitemap

lib/
├── supabase/
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server client
│   └── middleware.ts         # Session refresh
├── database.types.ts         # Generated types
└── utils.ts                  # formatRupiah, generateWhatsAppLink

components/
└── age-gate.tsx              # Modal verifikasi usia
```

## 🔮 Future Enhancements

### Phase 2 (Optional)
- [ ] Image upload via Supabase Storage
- [ ] Product search (full-text atau fuzzy)
- [ ] Low stock notifications (email/WhatsApp)
- [ ] Sales analytics dashboard
- [ ] CSV import/export untuk bulk operations

### Phase 3 (Scale)
- [ ] Multi-language (i18n)
- [ ] PWA support (offline catalog)
- [ ] QR code per product (print untuk toko fisik)
- [ ] Customer wishlist (requires user accounts)

---

**Last Updated**: December 2025  
**Version**: 1.0.0 (MVP)
