# 🚀 DEPLOYMENT - 3 STEPS TO GO LIVE

**Status:** Ready to deploy ✅  
**Build:** Passing ✅  
**Code:** Committed to GitHub ✓  

---

## STEP 1: Run Database Migrations (10 minutes)

### In Supabase SQL Editor:

1. Go to: https://app.supabase.com → Your Project → SQL Editor
2. Click "New Query"
3. **COPY THIS FILE** and paste in SQL Editor:
   ```
   File: d:\Project-VapeStore\supabase\03_schema_enhancements.sql
   ```
4. Click "Run"
5. Wait for success (should add 2 columns + 5 views)

Then repeat steps 2-4 with:
   ```
   File: d:\Project-VapeStore\supabase\03_seed_enhancements.sql
   ```

**Result:** Database now has discount_percent, is_featured, and views ready.

---

## STEP 2: Push to GitHub (5 minutes)

```bash
cd d:\Project-VapeStore
git add .
git commit -m "Deploy: Vapestore production ready"
git push origin main
```

---

## STEP 3: Deploy to Vercel (15 minutes)

### In Vercel Dashboard:

1. Go to: https://vercel.com
2. Click "New Project"
3. Select "Project-VapeStore" from GitHub
4. Click "Import"
5. **ADD ENVIRONMENT VARIABLES:**
   - `NEXT_PUBLIC_SUPABASE_URL` = (from Supabase Dashboard → Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase Dashboard → Settings → API)
   - `NEXT_PUBLIC_SITE_URL` = `https://vapestore.vercel.app` (or your custom domain)
6. Click "Deploy"
7. Wait for build complete (60-90 seconds)

**Result:** Your site is now LIVE! 🎉

---

## VERIFICATION (5 minutes)

### Test These:
- [ ] Visit your Vercel domain (e.g., https://vapestore.vercel.app)
- [ ] Homepage loads with hero, categories, products
- [ ] Click a product → Detail page shows variants & branches
- [ ] Select variant + branch → WhatsApp button works
- [ ] Click "Login" → Sign up works
- [ ] After signup, go to Supabase SQL Editor and run:
  ```sql
  SELECT id FROM auth.users WHERE email = 'your-email';
  INSERT INTO staff_profiles (user_id, role, branch_id)
  VALUES ('PASTE_ID', 'admin', NULL);
  ```
- [ ] Logout & login again → Dashboard loads

---

## DONE! 🎉

Your Vapestore is now LIVE and READY FOR CUSTOMERS!

**Next Steps (Optional):**
- Add custom domain (in Vercel Settings → Domains)
- Upload real product data
- Train staff on dashboard
- Promote to customers!

---

## Need Help?

**Read these for more details:**
- [LAUNCH_SUMMARY.md](./LAUNCH_SUMMARY.md) - Full overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed steps with troubleshooting
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Complete setup guide

---

**Questions? Check the docs or reach out! Good luck! 🚀**
