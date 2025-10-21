# 🗄️ Database Setup Guide

## Quick Setup for Vercel Postgres

### 1. Create Database in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `bugdex-db`)
6. Click **Create**

### 2. Copy Environment Variables

After creating the database:

1. Vercel will show you connection strings
2. Click **Copy Snippet** to copy all variables
3. These are **automatically available in production** ✅
4. For local development:
   - Paste into `.env.local` (create if doesn't exist)
   - Or run: `vercel env pull .env.local`

### 3. Initialize Database Tables

**Option A: Via Browser (Recommended)**

Once deployed, visit:
```
https://your-app.vercel.app/api/init-db
```

You should see:
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

**Option B: Via Vercel SQL Tab**

1. Go to Storage → Your Database → SQL tab
2. Copy contents of `apps/web/lib/db/schema.sql`
3. Paste and click **Execute**

### 4. Test Locally (Optional)

```bash
cd apps/web

# Pull production environment variables
vercel env pull .env.local

# Start dev server
pnpm dev

# Visit: http://localhost:3000/api/init-db
```

---

## What Changed? 🔄

### Before (In-Memory Storage ❌)
```typescript
const userUploads = new Map();  // Lost on restart!
```

### After (Vercel Postgres ✅)
```typescript
import { sql } from '@vercel/postgres';
await sql`INSERT INTO uploads ...`;  // Persists forever!
```

---

## Database Schema

### `users` Table
```sql
wallet_address VARCHAR(42) PRIMARY KEY
username VARCHAR(50)
profile_ipfs_hash VARCHAR(100)
bio TEXT
avatar_url TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### `uploads` Table
```sql
id VARCHAR(50) PRIMARY KEY
wallet_address VARCHAR(42) → references users
image_cid VARCHAR(100)
metadata_cid VARCHAR(100)
image_url TEXT
metadata_url TEXT
timestamp BIGINT
location JSONB
bug_info JSONB
submitted_to_blockchain BOOLEAN
submission_id INTEGER
transaction_hash VARCHAR(66)
created_at TIMESTAMP
```

---

## Testing Persistence

1. **Upload a bug photo** → Should save to database
2. **Refresh the page** → Bug should still be there ✅
3. **Edit your profile** → Changes should persist ✅
4. **Restart the server** → All data remains ✅

---

## Troubleshooting

### "Connection refused" error
- Make sure `POSTGRES_URL` is in `.env.local` (for local dev)
- In production, Vercel auto-configures these variables

### "relation does not exist" error
- Database tables not created yet
- Visit `/api/init-db` to create tables

### Data not persisting
- Check Vercel Storage dashboard for connection status
- Verify environment variables are set correctly

---

## Production Deployment Checklist

- [x] Install @vercel/postgres package
- [ ] Create Vercel Postgres database in dashboard
- [ ] Deploy to Vercel (env vars auto-configured)
- [ ] Visit `/api/init-db` to create tables
- [ ] Test: Upload bug → Refresh → Data persists ✅
- [ ] Test: Edit profile → Refresh → Changes saved ✅

---

## Cost

**Vercel Postgres Free Tier:**
- ✅ 256 MB storage
- ✅ 60 hours of compute per month
- ✅ Perfect for hackathons and prototypes!

For production scaling, upgrade to Pro ($20/month).
