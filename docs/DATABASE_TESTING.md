# Database Testing Guide

## Quick Database Connection Test

### 1. Test Init Endpoint
```
https://your-app.vercel.app/api/init-db
```
Expected: `{"success":true,"message":"Database initialized successfully"}`

### 2. Test Direct Query in Neon Console

Go to: Vercel Dashboard → Storage → Database → Open in Neon Console → SQL Editor

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check users table
SELECT * FROM users;

-- Check uploads table  
SELECT * FROM uploads;

-- Check table structure
\d users
\d uploads
```

## Debug: Why Data Disappears on Refresh

### Possible Causes:

#### 1. **Frontend Using Local State Instead of Database**
The collection page might be caching uploads in local state/localStorage and not fetching from the API on refresh.

**Check:** Open browser DevTools → Network tab → Refresh page → Look for request to `/api/uploads?address=0x...`

#### 2. **Database Writes Failing Silently**
SQL INSERT might be throwing errors but the try/catch is swallowing them.

**Check:** Vercel Function Logs for errors like:
- `relation "uploads" does not exist`
- `column "bug_info" does not exist`  
- `syntax error at or near`

#### 3. **Wrong Table Being Queried**
Frontend might be calling a different API endpoint or using wrong query params.

**Check:** In collection page, verify `/api/uploads?address=${walletAddress}` is being called with correct address.

#### 4. **POSTGRES_URL Not Set**
If environment variables aren't configured, `sql` calls will fail.

**Check:** Vercel → Settings → Environment Variables → Verify all `POSTGRES_*` vars exist

## Step-by-Step Debug Process

### Step 1: Verify Database Tables Exist

In Neon SQL Console:
```sql
SELECT * FROM uploads LIMIT 5;
```

- ✅ If returns rows or empty set → Tables exist
- ❌ If returns "relation does not exist" → Run `/api/init-db` again

### Step 2: Test Upload API Manually

Using Postman or curl:

```bash
curl -X POST https://your-app.vercel.app/api/uploads \
  -H "Content-Type: application/json" \
  -d '{
    "imageCid": "test123",
    "metadataCid": "test456",
    "imageUrl": "https://test.com/image.jpg",
    "metadataUrl": "https://test.com/metadata.json",
    "discoverer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "location": {"state": "CA", "country": "USA", "latitude": 37, "longitude": -122},
    "bugInfo": {"commonName": "Test Bug", "scientificName": "Testus bugus"}
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "upload": {...},
    "totalUploads": 1
  }
}
```

Then check Neon Console:
```sql
SELECT * FROM uploads WHERE wallet_address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb';
```

Should show the test row.

### Step 3: Test GET API

```bash
curl https://your-app.vercel.app/api/uploads?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

Expected:
```json
{
  "success": true,
  "data": {
    "uploads": [...],
    "count": 1
  }
}
```

### Step 4: Check Frontend Network Requests

1. Open site in browser
2. Open DevTools (F12) → Network tab
3. Upload a bug photo
4. Look for:
   - POST to `/api/upload-image` (should succeed)
   - POST to `/api/uploads` (should return 200)
5. Refresh page
6. Look for:
   - GET to `/api/uploads?address=0x...` (should return your uploads)

### Step 5: Check Vercel Function Logs

Go to: Vercel Dashboard → Deployments → Latest → Function Logs

Look for:
- ✅ `✅ Upload saved to database: [id]`
- ✅ `📦 Found X local uploads not yet on blockchain`
- ❌ `❌ Error saving upload:`
- ❌ `Cannot find module`
- ❌ Any SQL errors

## Common Issues & Fixes

### Issue: Data shows immediately but disappears on refresh
**Cause:** Frontend is using optimistic updates (showing data before saving to DB), but DB save is failing.

**Fix:** Check Function Logs for SQL errors. Verify POSTGRES_* env vars are set.

### Issue: "relation does not exist" error
**Cause:** Tables haven't been created.

**Fix:** Visit `/api/init-db` to create tables.

### Issue: No network request to /api/uploads on refresh
**Cause:** Frontend is using cached data from localStorage or React state.

**Fix:** Clear browser storage, hard refresh (Ctrl+Shift+R).

### Issue: POSTGRES_URL is undefined
**Cause:** Environment variables not set in Vercel.

**Fix:** 
1. Go to Vercel → Storage → Connect Neon database again
2. Or manually add POSTGRES_URL from Neon dashboard

## Next Steps After Deployment

1. ✅ Wait for new deployment (commit `6bf1073`) to finish
2. ✅ Test wallet connection (bls-eth-wasm should work now)
3. ✅ Upload a bug photo
4. ✅ Check Vercel Function Logs - should see "✅ Upload saved to database"
5. ✅ Check Neon Console - run `SELECT * FROM uploads;` - should see row
6. ✅ Refresh page - bug should still appear
7. ❌ If bug disappears - check Network tab for failed API call

If uploads are being saved to DB but not showing on refresh, the issue is in the frontend fetch logic, not the database.
