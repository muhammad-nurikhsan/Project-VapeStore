#!/usr/bin/env bash

# VAPESTORE QUICK DEPLOYMENT CHECKLIST
# Run this script OR follow manually below

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 VAPESTORE DEPLOYMENT CHECKLIST${NC}"
echo "======================================="
echo ""

# Check 1: Build Status
echo "1️⃣  Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build passing${NC}"
else
    echo -e "${RED}✗ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi

# Check 2: Git Status
echo "2️⃣  Checking Git..."
if git status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠ Git not initialized. Run: git init${NC}"
fi

# Check 3: Environment Variables
echo "3️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓ .env.local configured${NC}"
    else
        echo -e "${YELLOW}⚠ NEXT_PUBLIC_SUPABASE_URL not set in .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found. Create it with Supabase credentials${NC}"
fi

# Check 4: Dependencies
echo "4️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Dependencies not installed. Run: npm install${NC}"
fi

# Check 5: Database Files
echo "5️⃣  Checking database migration files..."
if [ -f "supabase/03_schema_enhancements.sql" ]; then
    echo -e "${GREEN}✓ Schema enhancements file present${NC}"
else
    echo -e "${RED}✗ supabase/03_schema_enhancements.sql not found${NC}"
fi

if [ -f "supabase/03_seed_enhancements.sql" ]; then
    echo -e "${GREEN}✓ Seed enhancements file present${NC}"
else
    echo -e "${RED}✗ supabase/03_seed_enhancements.sql not found${NC}"
fi

# Final Summary
echo ""
echo "======================================="
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. Execute database migrations in Supabase:"
echo "   - Go to Supabase Dashboard → SQL Editor"
echo "   - Copy content from supabase/03_schema_enhancements.sql"
echo "   - Paste and run in SQL Editor"
echo "   - Repeat for supabase/03_seed_enhancements.sql"
echo ""
echo "2. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'chore: Ready for production deployment'"
echo "   git push"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Visit https://vercel.com"
echo "   - Create new project from GitHub"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo -e "${GREEN}For detailed instructions, see:${NC}"
echo "   - LAUNCH_SUMMARY.md (quick overview)"
echo "   - DEPLOYMENT_GUIDE.md (step-by-step)"
echo "   - SETUP_INSTRUCTIONS.md (complete setup)"
echo ""
