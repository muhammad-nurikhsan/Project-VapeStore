# Setup Instructions for Vapestore Project

## Step 1: Supabase Project Setup (5 minutes)

### 1.1 Create Supabase Account & Project
- Go to https://supabase.com
- Sign up / Log in
- Create new project (choose region closest to you, e.g., Singapore for Indonesia)
- Wait for project to initialize
- Go to Project Settings → API
- Copy these values:
  - **Project URL** (e.g., `https://xxxxx.supabase.co`)
  - **Anon Key** (service key under "API Keys")

### 1.2 Create Environment Variables
In the root folder of the project, create a file named `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** 
- Replace `your-project-url` and `your-anon-key-here` with actual values from step 1.1
- `.env.local` is in `.gitignore`, so it won't be committed to GitHub
- For Vercel deployment later, you'll add these same env vars in Vercel project settings

---

## Step 2: Load Database Schema & Seed Data (10 minutes)

### 2.1 Open Supabase SQL Editor
- Go to your Supabase project → SQL Editor
- Create a new query (or copy-paste these commands sequentially)

### 2.2 Run Schema Migrations

**Run this first** (creates all tables, RLS policies, triggers):

```sql
-- Execute supabase/01_schema.sql content here
-- You can copy the entire content from the file and paste it
```

**To do this easily:**
1. Open `supabase/01_schema.sql` in VS Code
2. Select all (Ctrl+A), copy
3. In Supabase SQL Editor, paste and run

After running, you should see:
- ✓ Tables created: `branches`, `categories`, `products`, `product_option_types`, `product_option_values`, `product_skus`, `branch_stock`, `staff_profiles`
- ✓ RLS policies enabled
- ✓ Triggers created (auto-updated_at)

### 2.3 Seed Demo Data

**Run this second** (populates tables with 2 branches, 5 products, stock):

```sql
-- Execute supabase/02_seed.sql content here
```

**To do this:**
1. Open `supabase/02_seed.sql` in VS Code
2. Select all, copy
3. In Supabase SQL Editor, paste and run

You should see inserted rows for branches, categories, products, SKUs, stock.

### 2.4 Apply Schema Enhancements (NEW)

**Run this third** (adds discount_percent, is_featured columns, creates 5 views):

```sql
-- Execute supabase/03_schema_enhancements.sql content here
```

This adds:
- `discount_percent` column (0-100) to products table
- `is_featured` column (boolean) to products table
- 5 new views: `v_new_arrivals`, `v_best_deals`, `v_popular_categories`, `v_all_brands`, `v_featured_products`

### 2.5 Seed Enhancement Data

**Run this fourth** (populates discount and featured flags):

```sql
-- Execute supabase/03_seed_enhancements.sql content here
```

---

## Step 3: Create Admin User (5 minutes)

### 3.1 Signup via Application
1. Run the app locally: `npm run dev`
2. Visit http://localhost:3000
3. Click "Login" → "Sign up"
4. Create an account (e.g., email: `admin@vapestore.local`, password: `TestPassword123`)
5. You'll be redirected to dashboard (showing 404 because you're not in staff_profiles yet)

### 3.2 Add User to Staff Profiles
In Supabase SQL Editor, run:

```sql
-- First, get your user ID from the browser console or from Supabase Auth table
-- Go to Supabase → Authentication → Users → find your user
-- Copy the "ID" value

INSERT INTO staff_profiles (user_id, role, branch_id)
VALUES ('your-user-id-here', 'admin', NULL);

-- Replace 'your-user-id-here' with your actual user ID
```

After running:
- Logout and login again
- Dashboard should now load and show overview

---

## Step 4: Local Development (Ongoing)

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4.3 Available Routes
- **Public:**
  - `/` - Homepage (catalog, search, filter, sort)
  - `/products/[slug]` - Product detail (variant selector, branch stock, WhatsApp CTA)
  - `/login` - Auth (signup/signin)

- **Dashboard (requires login + admin role):**
  - `/dashboard` - Overview
  - `/dashboard/branches` - List branches (CRUD)
  - `/dashboard/branches/new` - Create branch
  - `/dashboard/branches/[slug]` - Edit branch
  - `/dashboard/products` - List products
  - `/dashboard/stock` - Manage stock by branch/SKU

### 4.4 Test Flows
1. **Homepage:** Search "Liquid", filter by "E-Liquid", sort by "Terbaru"
2. **Product Detail:** Select variant (e.g., Rasa, Nicotine), choose branch, click WhatsApp
3. **Dashboard:** Login as admin, add/edit branch, manage stock

---

## Step 5: Deploy to Vercel (10 minutes)

### 5.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial vapestore project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Project-VapeStore.git
git push -u origin main
```

### 5.2 Connect to Vercel
1. Go to https://vercel.com
2. Sign up / Log in
3. Click "New Project"
4. Select GitHub repository (Project-VapeStore)
5. Import project

### 5.3 Set Environment Variables
In Vercel project settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL` = (from Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase)
- `NEXT_PUBLIC_SITE_URL` = (your Vercel domain, e.g., `https://vapestore.vercel.app`)

### 5.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (should take ~60 seconds)
3. Visit your Vercel domain
4. Test homepage, catalog, product detail

### 5.5 Create Admin User on Production
Repeat Step 3 using your Vercel domain instead of localhost:3000

---

## Troubleshooting

### Issue: Login shows "Invalid credentials"
**Solution:** Make sure you've run Step 3.2 (INSERT into staff_profiles). User must exist in auth AND staff_profiles.

### Issue: Homepage shows "404 Not Found"
**Solution:** Verify you've run Step 2.4 (schema enhancements). The views might not exist yet.

### Issue: "Stok tidak tersedia" on product detail
**Solution:** This is expected if product has no stock allocated to a branch. Run Step 2.5 (seed enhancements) to populate demo stock.

### Issue: WhatsApp button doesn't work
**Solution:** Make sure:
1. Branch has valid `whatsapp_phone` (e.g., `6281234567890` for +62 812-3456-7890)
2. Product has an active SKU with price
3. Both variant and branch are selected

### Issue: Build fails with type errors
**Solution:** 
1. Clear `.next` folder: `rm -r .next`
2. Clear node_modules: `rm -r node_modules && npm install`
3. Run build again: `npm run build`

---

## What's Included

### Frontend Features
- ✅ Professional homepage with hero, categories, new arrivals, best deals, brand belt
- ✅ Product catalog with search, filter, sort
- ✅ Product detail with variant selector, stock per branch, WhatsApp CTA
- ✅ Age gate (18+ verification on first visit)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO (robots.txt, sitemap.xml, meta tags)

### Admin Dashboard
- ✅ Authentication (email/password via Supabase)
- ✅ Overview page (stats dashboard)
- ✅ Branch management (CRUD with unique slug validation)
- ✅ Product list (admin view with discount/featured flags)
- ✅ Stock management (per branch, per SKU)
- ✅ Protected routes (RLS + middleware)

### Database
- ✅ Normalized schema (8 tables, 5 views)
- ✅ RLS policies (row-level security)
- ✅ Auto-updated_at triggers
- ✅ Demo data (2 branches, 5 products, 15+ SKUs, stock allocation)
- ✅ Discount and featured product support

---

## Next Steps (Optional / Post-MVP)

### Phase 2: Image Management
- [ ] Supabase Storage bucket for product images
- [ ] Admin upload widget
- [ ] Image gallery on product detail
- [ ] Cloudinary integration (if Storage quota exceeded)

### Phase 3: Advanced Admin
- [ ] Product CRUD form (create/edit with image upload)
- [ ] Staff management (create users, assign roles/branches)
- [ ] Stock history & audit log
- [ ] Bulk import (CSV upload for products, stock)

### Phase 4: Customer Features
- [ ] Wishlist / favorites
- [ ] Cart (temporary, not full checkout)
- [ ] Order history (if checkout implemented later)
- [ ] Reviews & ratings

### Phase 5: Analytics & Notifications
- [ ] Product view tracking
- [ ] Popular products dashboard
- [ ] Low stock alerts (email)
- [ ] New order notifications

---

## Tech Stack Reference

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend Framework | Next.js 15 (App Router) | Latest, TypeScript strict |
| Language | TypeScript | Strict mode for type safety |
| Styling | Tailwind CSS + shadcn/ui | Pre-built components with Tailwind |
| Database | Supabase PostgreSQL | Managed, free tier available |
| Auth | Supabase Auth | Email/password, JWT tokens |
| Storage | Supabase Storage (optional) | For product images |
| Deployment | Vercel | Free tier, auto-scaling |
| SEO | Next.js Metadata | Dynamic robots.txt, sitemap |

---

## Support & Questions

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui Docs:** https://ui.shadcn.com

---

**Setup Complete!** You now have a professional vapestore platform running locally and ready to deploy. 🚀
