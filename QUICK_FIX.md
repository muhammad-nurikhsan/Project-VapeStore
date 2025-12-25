# 🚨 ACTION REQUIRED - Production Issue Fix

**Status:** Site returning 500 error  
**Cause:** Missing environment variables in Vercel  
**Solution:** 3 simple steps to fix  
**Time Required:** ~20 minutes total  

---

## ⚡ QUICK START (Do This Now)

### **Step 1: Add Environment Variables to Vercel** ⏱️ 5 min

1. Go to **https://vercel.com/dashboard**
2. Click project **"Project-VapeStore"**
3. Click **Settings** → **Environment Variables**
4. Add these 3 variables (click "Add" for each):

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuaarepjbkyduykayyog.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_98itcKmLPJ4yMrONxACqIQ_xhWE51P2` |
| `NEXT_PUBLIC_SITE_URL` | `https://project-vape-store.vercel.app` |

**✅ Click "Save" for each one!**

### **Step 2: Redeploy on Vercel** ⏱️ 3 min

1. Go to **Deployments** tab
2. Click latest deployment
3. Click **"Redeploy"** button
4. Wait for build to complete (shows "Ready" when done)

### **Step 3: Test the Site** ⏱️ 5 min

1. Open **https://project-vape-store.vercel.app**
2. Should load WITHOUT 500 error ✅
3. Check DevTools (F12) → Console = no red errors ✅
4. Click a product → should open detail page ✅

---

## 🗂️ Next: Supabase Migrations

Only after site loads successfully, run these SQL migrations:

1. Open **https://app.supabase.com** → SQL Editor
2. Run file: **`supabase/03_schema_enhancements.sql`**
3. Run file: **`supabase/03_seed_enhancements.sql`**

This adds discount features and product views.

---

## 📋 Files You Need

All detailed guides are in project repo:
- **VERCEL_ENV_SETUP.md** - Complete Vercel setup with screenshots
- **SUPABASE_MIGRATIONS.md** - Complete Supabase migration guide  
- **PRODUCTION_STATUS.md** - Full status and troubleshooting

---

## ✅ Success Indicator

When you see this, everything is working:
- ✅ Homepage loads, shows products
- ✅ "New Arrivals" section visible
- ✅ "Best Deals" shows discount badges
- ✅ Can click product → detail loads
- ✅ No errors in browser console (F12)

---

**Questions?** Check the detailed guide files above.  
**All set?** Then site is production-ready! 🎉
