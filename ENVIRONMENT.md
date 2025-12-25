# Environment Variables Setup Guide

## Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Production Setup

For Vercel deployment:

```bash
# Your production URL (update after first deploy)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## Local Development

Create `.env.local` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Use Vercel Environment Variables for production
- Anon key is safe for client-side use (RLS protects data)
- Service role key (if needed) must be kept secret and only used server-side
