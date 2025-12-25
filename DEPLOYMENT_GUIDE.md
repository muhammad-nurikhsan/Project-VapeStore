# Deployment & Launch Guide

## Pre-Deployment Checklist

- [ ] Database migrations (schema + seed) executed in Supabase
- [ ] Admin user created and tested in localhost
- [ ] All features tested locally (catalog, product detail, dashboard, branch CRUD)
- [ ] Build succeeds: `npm run build` ✓
- [ ] No console errors on homepage and product pages
- [ ] WhatsApp links formatted correctly for your branches

---

## Step 1: Prepare GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
cd d:\Project-VapeStore
git init
```

### 1.2 Create `.gitignore` (already exists, but verify it includes)
```
node_modules/
.next/
.env.local
.env.local.example
dist/
build/
```

### 1.3 Add All Files & Commit
```bash
git add .
git commit -m "feat: Initial Vapestore project

- Multi-branch inventory system with shadcn/ui
- Product catalog with variants and stock management
- Admin dashboard with CRUD operations
- Supabase PostgreSQL backend with RLS
- Vercel-ready Next.js 15 deployment
"
```

### 1.4 Add GitHub Remote & Push
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Project-VapeStore.git
git push -u origin main
```

---

## Step 2: Create Vercel Project

### 2.1 Sign Up / Log In to Vercel
- Go to https://vercel.com
- Click "Sign up" or "Continue with GitHub"
- Grant Vercel access to your GitHub account

### 2.2 Import Repository
- Click "New Project" on Vercel dashboard
- Select "Project-VapeStore" repository
- Click "Import"

### 2.3 Configure Project Settings
- **Project Name:** `vapestore` (or your preferred name)
- **Framework Preset:** Vercel auto-detects "Next.js" ✓
- **Root Directory:** `./` (root of project)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 2.4 Set Environment Variables
In the "Environment Variables" section, add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
NEXT_PUBLIC_SITE_URL = https://vapestore.vercel.app
```

**Note:** Replace with your actual Supabase values from Step 2.4 in SETUP_INSTRUCTIONS.md

### 2.5 Deploy
- Click "Deploy"
- Vercel builds your project (should take 60-90 seconds)
- Once complete, you'll see "Congratulations! Your deployment is live"
- Visit your Vercel domain (e.g., `https://vapestore.vercel.app`)

---

## Step 3: Verify Production Deployment

### 3.1 Test Public Catalog
1. Visit homepage: Should load hero, categories, products
2. Try search: Filter by category "E-Liquid"
3. Click product: Product detail page loads with variants
4. Select variant + branch: WhatsApp button should enable
5. Click WhatsApp: Opens WhatsApp with pre-filled message

### 3.2 Test Authentication
1. Click "Login" in header
2. Sign up with test email: `testadmin@vapestore.local` / `TestPass123`
3. You'll be redirected to `/dashboard` (but will see error because user not in staff_profiles yet)
4. Go to Supabase → SQL Editor → Run:

```sql
-- Get your user ID from Supabase Auth → Users
-- Or run this query to find it:
SELECT id, email FROM auth.users WHERE email = 'testadmin@vapestore.local';

-- Copy the ID, then run:
INSERT INTO staff_profiles (user_id, role, branch_id)
VALUES ('YOUR_USER_ID', 'admin', NULL);
```

### 3.3 Test Dashboard
1. Refresh `/dashboard` in browser
2. Should show overview page (or redirect to login if session expired)
3. Click "Cabang" (Branches) → Should list 2 demo branches
4. Try adding new branch, editing, deleting
5. Click "Produk" (Products) → Should list products
6. Click "Stok" (Stock) → Should show stock per branch

### 3.4 Smoke Test Checklist
- [ ] Homepage loads with hero image and categories
- [ ] Search bar works (try "Liquid")
- [ ] Filter by category works
- [ ] Product detail page loads images and variants
- [ ] WhatsApp CTA button generates correct link
- [ ] Login/signup works
- [ ] Dashboard loads after auth
- [ ] Branch CRUD works (create, update, delete)
- [ ] Stock management accessible
- [ ] No console errors (check browser DevTools)

---

## Step 4: Domain Setup (Optional)

### 4.1 Add Custom Domain (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `vapestore.id`)
4. Follow instructions to add DNS records to your domain provider (Netlify DNS, Cloudflare, etc.)
5. Once DNS propagates (5-30 minutes), your custom domain will work

### 4.2 Update Environment Variable
Once your custom domain is live, update `NEXT_PUBLIC_SITE_URL` in Vercel:
```
NEXT_PUBLIC_SITE_URL = https://vapestore.id
```

---

## Step 5: Post-Launch Checklist

- [ ] Homepage is live and SEO-optimized
- [ ] Supabase backups enabled (Supabase → Database → Backups)
- [ ] Error tracking setup (optional: Sentry, LogRocket)
- [ ] Analytics enabled (optional: Vercel Analytics, Supabase Analytics)
- [ ] Staff trained on admin dashboard
- [ ] Initial product data populated (more than demo data)
- [ ] Branch information updated (correct WhatsApp numbers, addresses)
- [ ] Test orders via WhatsApp working smoothly

---

## Monitoring & Maintenance

### Weekly
- Check Supabase Dashboard for any errors in logs
- Verify stock counts are accurate
- Monitor Vercel deploy logs for any issues

### Monthly
- Review Supabase usage (database size, bandwidth)
- Check Vercel performance metrics (build times, function duration)
- Backup database (Supabase auto-backs up daily on Pro plan; Free tier doesn't have backups)

### Quarterly
- Review product catalog (add new products, remove discontinued)
- Update discounts and featured products
- Check for any security updates in dependencies (`npm audit`)

---

## Scaling Beyond Free Tier

### Database Storage (Supabase)
- **Free Tier:** 500MB
- **When to upgrade:** If product images exceed 200MB, or planning heavy traffic
- **Solution:** Upgrade to Pro ($25/month) or use Cloudinary for images (free with limits)

### Functions & Edge (Vercel)
- **Free Tier:** 100GB-hours serverless function execution
- **When to upgrade:** If your site gets 1M+ page views/month
- **Solution:** Upgrade to Pro ($20/month) for auto-scaling

### Bandwidth (Supabase)
- **Free Tier:** 2GB/month
- **When to upgrade:** If using lots of product images, or high traffic
- **Solution:** Add Cloudinary or AWS S3 for image hosting

---

## Troubleshooting Deployment Issues

### Issue: Build fails on Vercel with "Cannot find module"
**Solution:**
1. Clear cache: Vercel Dashboard → Settings → Git → Clear Git cache
2. Redeploy: Click "Redeploy" button
3. Or push new commit to GitHub to trigger fresh build

### Issue: Environment variables not working (undefined errors)
**Solution:**
1. Verify variables are set in Vercel Project Settings → Environment Variables
2. Ensure variable names are EXACT: `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)
3. Redeploy after changing env vars (they're injected at build time)

### Issue: "Cannot GET /dashboard" error
**Solution:**
1. Verify you're logged in (check browser Storage → cookies)
2. Make sure user exists in staff_profiles table
3. Try `npm run build` locally to debug middleware/auth flow

### Issue: Supabase connection errors on production
**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and key are correct
2. Check Supabase project status (Supabase Dashboard → Status)
3. Verify RLS policies aren't blocking queries (check Supabase logs)

### Issue: WhatsApp links not working
**Solution:**
1. Check branch `whatsapp_phone` format: Must be `6281234567890` (no + or hyphens)
2. Verify branch exists and is active
3. Test locally first to isolate issue

---

## Performance Optimization (Production)

### 1. Supabase Query Optimization
Add indexes to frequently queried columns:

```sql
-- In Supabase SQL Editor:
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_branch_stock_sku ON branch_stock(sku_id);
CREATE INDEX idx_branch_stock_branch ON branch_stock(branch_id);
```

### 2. Image Optimization
- All images use Next.js Image component (auto-optimized)
- Consider using Vercel Image Optimization or Cloudinary for CDN delivery
- Set `NEXT_IMAGE_UNOPTIMIZED=false` for best performance

### 3. Caching
- Homepage ISR set to 3600 seconds (1 hour revalidation)
- Adjust if product catalog changes frequently: reduce to 300 (5 min)
- Or add manual revalidation endpoint

### 4. Database Connection Pooling
Supabase uses connection pooling by default. No configuration needed.

---

## Backup & Disaster Recovery

### Supabase Backups
- **Free Tier:** Automatic daily backups, 7-day retention
- **Pro Tier:** Daily backups, 30-day retention
- **Manual Backup:** Export data via Supabase Dashboard → Backups → Export

### GitHub Backup
- Code is automatically backed up on GitHub
- If Vercel account lost, can redeploy from GitHub to new Vercel account

### Database Backup Strategy
```bash
# Download backup from Supabase periodically
# Supabase Dashboard → Settings → Backups → Download
# Store locally or on external drive
```

---

## Security Best Practices (Production)

1. **Rotate API Keys:** Regenerate Supabase anon key every 6 months (Supabase → Settings → API Keys)
2. **Monitor Auth:** Check for unusual login patterns (Supabase → Logs)
3. **Update Dependencies:** Run `npm audit` monthly, `npm update` quarterly
4. **Enable 2FA:** Supabase & GitHub account security
5. **Restrict Branch Access:** Staff should only edit their own branch stock
6. **Audit RLS Policies:** Regularly review who can access what data

---

## Rollback Procedures

### If Deployment Goes Wrong

#### Option 1: Revert to Previous Version
```bash
# View recent deployments:
git log --oneline -5

# Revert to previous commit:
git revert HEAD

# Or create a new branch and reset:
git checkout -b rollback
git reset --hard <commit_hash>
git push -u origin rollback

# In Vercel, manually select "rollback" branch to deploy
```

#### Option 2: Vercel Deployment Rollback
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find last known-good deployment
3. Click the deployment
4. Click "Promote to Production"

---

## Next Steps (Week 1-2 Post-Launch)

1. **Populate Data:** Add all products, branches, inventory to database
2. **Test Thoroughly:** Have team test on mobile, tablet, desktop
3. **Gather Feedback:** Ask users for feedback on UX, performance
4. **Monitor Metrics:** Check Vercel Analytics & Supabase logs daily
5. **Plan Phase 2:** Decide on next features (product CRUD, images, staff management)

---

**Congratulations! Your Vapestore platform is now live! 🚀**
