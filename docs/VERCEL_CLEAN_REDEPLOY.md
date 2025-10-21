# Vercel Clean Redeploy Guide

## Problem
Vercel is caching the build and not picking up new dependencies (bls-eth-wasm still missing even after commit).

## Solution: Force Clean Redeploy

### Method 1: Through Vercel Dashboard (Recommended)

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Click on your `eth-global` project**
3. **Go to "Deployments" tab**
4. **Find the latest deployment** (should be from commit `388fdc1`)
5. **Click the ⋯ menu** on the right side
6. **Select "Redeploy"**
7. **IMPORTANT: Uncheck "Use existing Build Cache"** ✅ This is critical!
8. **Click "Redeploy"**

### Method 2: Push Empty Commit (Alternative)

If dashboard method doesn't work:

```bash
cd c:\EthGlobal
git commit --allow-empty -m "chore: Force Vercel rebuild"
git push origin main
```

Then redeploy through dashboard with cache disabled.

### Method 3: Delete .next Folder in Vercel (Nuclear)

If still failing:

1. Add a `vercel.json` to force clean builds:

```json
{
  "cleanUrls": true,
  "buildCommand": "rm -rf .next && pnpm build"
}
```

2. Commit and push

## Verify Fix

After redeploying, check:

1. **Function Logs** - Should NOT show `Cannot find module 'bls-eth-wasm'`
2. **Test wallet connection** - Should work without errors
3. **Test upload** - Should process through Privy authentication

## Database Persistence Issue

The "data disappearing on refresh" suggests the API routes aren't actually writing to Postgres. 

### Check Environment Variables

Make sure these are set in Vercel:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

These should have been auto-configured when you connected Neon Postgres.

### Test Database Connection

1. Go to: `https://your-app.vercel.app/api/init-db`
2. Should return: `{"success":true,"message":"Database initialized successfully"}`

If it fails, the Postgres connection isn't working in production.

### Check Function Logs for SQL Errors

Look in Vercel → Deployments → Function Logs for errors like:

- `relation "users" does not exist`
- `connection refused`
- `POSTGRES_URL is not defined`

## Common Issues

### Issue 1: bls-eth-wasm still missing after redeploy
**Cause**: Build cache not cleared  
**Fix**: Redeploy with "Use existing Build Cache" UNCHECKED

### Issue 2: Data disappears on refresh
**Cause**: Database writes failing silently  
**Fix**: Check Function Logs for SQL errors, verify POSTGRES_* env vars

### Issue 3: Upload API returns 500 error
**Cause**: Missing dependencies or environment variables  
**Fix**: Check all env vars are set, redeploy without cache

## Next Steps After Clean Redeploy

1. ✅ Test wallet connection
2. ✅ Upload a bug photo
3. ✅ **REFRESH** - bug should persist
4. ✅ Edit profile → Save
5. ✅ **REFRESH** - changes should persist
6. ✅ Check Function Logs - no errors

If data still disappears, the SQL INSERT statements are failing. Check Neon Console SQL Editor:

```sql
SELECT * FROM users;
SELECT * FROM uploads;
```

Should show rows after testing uploads.
