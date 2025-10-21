# 🎯 Database Migration Complete!

## ✅ What We Fixed

### The Problem
- **In-memory storage** using JavaScript `Map` objects
- **Data lost** on every server restart, hot reload, or page refresh
- **User frustration**: "I saved one image...still can't see it after refresh"
- **Deployment blocker**: Can't ship an app that loses user data

### The Solution
- **Vercel Postgres** - Production-ready SQL database
- **Persistent storage** - Data survives restarts, deploys, everything
- **Free tier** - 256MB storage, 60 hours compute/month
- **Auto-configured** - Environment variables set by Vercel

---

## 📦 What Changed

### 1. Installed Dependencies
```bash
pnpm add @vercel/postgres
```

### 2. Created Database Infrastructure

**New Files:**
- `lib/db/client.ts` - Database connection and init function
- `lib/db/schema.sql` - SQL schema documentation
- `app/api/init-db/route.ts` - One-time setup endpoint
- `DATABASE_SETUP.md` - Complete setup guide
- `.env.local.example` - Environment variables template

### 3. Migrated API Routes

**Before (In-Memory ❌):**
```typescript
const userUploads = new Map();
userUploads.set(address, data);  // Lost on restart
```

**After (Postgres ✅):**
```typescript
import { sql } from '@vercel/postgres';
await sql`INSERT INTO uploads VALUES (...)`;  // Persists forever
```

**Files Updated:**
- ✅ `app/api/uploads/route.ts` - POST, GET, PATCH endpoints
- ✅ `app/api/user/register/route.ts` - User creation/update

---

## 📊 Database Schema

### `users` Table
| Column | Type | Purpose |
|--------|------|---------|
| wallet_address | VARCHAR(42) PK | User's wallet (0x...) |
| username | VARCHAR(50) | Display name |
| profile_ipfs_hash | VARCHAR(100) | IPFS link to profile data |
| bio | TEXT | User bio |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last profile update |

### `uploads` Table
| Column | Type | Purpose |
|--------|------|---------|
| id | VARCHAR(50) PK | Unique upload ID |
| wallet_address | VARCHAR(42) FK | Owner's wallet |
| image_cid | VARCHAR(100) | IPFS image CID |
| metadata_cid | VARCHAR(100) | IPFS metadata CID |
| image_url | TEXT | Full IPFS URL |
| metadata_url | TEXT | Full metadata URL |
| timestamp | BIGINT | Upload timestamp |
| location | JSONB | GPS coordinates, state, country |
| bug_info | JSONB | AI identification results |
| submitted_to_blockchain | BOOLEAN | Submitted for voting? |
| submission_id | INTEGER | Blockchain submission ID |
| transaction_hash | VARCHAR(66) | TX hash if submitted |
| created_at | TIMESTAMP | Database insert time |

**Indexes:**
- `idx_uploads_wallet` - Fast user queries
- `idx_uploads_blockchain` - Filter submitted/unsubmitted
- `idx_uploads_timestamp` - Sort by date

---

## 🚀 Deployment Steps

### 1. Create Database (You need to do this!)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Storage** tab
4. **Create Database** → **Postgres**
5. Name it: `bugdex-db`
6. Click **Create**

✨ **Environment variables auto-configure in production!**

### 2. Deploy Your App

```bash
git checkout main
git merge integration/merge-frontend
git push origin main
```

Vercel will auto-deploy with database connection.

### 3. Initialize Tables

After deployment, visit:
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

### 4. Test Persistence ✅

1. **Upload a bug photo** → Save to collection
2. **Refresh the page** → Bug should still be there!
3. **Edit your profile** → Save changes
4. **Refresh again** → Changes persisted!
5. **Close browser, come back later** → Everything still there!

---

## 🧪 Local Development (Optional)

If you want to test locally:

```bash
cd apps/web

# Pull production environment variables
vercel env pull .env.local

# Start dev server
pnpm dev

# Initialize tables
curl http://localhost:3000/api/init-db
```

---

## ✨ What This Fixes

- ✅ **Uploads persist** across page refreshes
- ✅ **Profiles persist** across sessions
- ✅ **Collection page** shows all uploaded bugs
- ✅ **Production ready** for Vercel deployment
- ✅ **No data loss** on server restart
- ✅ **Real database** instead of in-memory hacks

---

## 📝 Testing Checklist

After deployment:

- [ ] Visit `/api/init-db` - Should show success message
- [ ] Upload a bug photo - Should save
- [ ] Refresh page - Bug should still appear in collection
- [ ] Edit profile (name/bio/avatar) - Should save
- [ ] Refresh page - Changes should persist
- [ ] Logout and login again - Data should remain
- [ ] Check Vercel Storage dashboard - Should show data

---

## 🎉 You're Ready to Deploy!

**Current Status:**
- ✅ Database code complete
- ✅ Migration committed to Git
- ⏳ **YOU NEED TO**: Create Vercel Postgres database in dashboard
- ⏳ **YOU NEED TO**: Deploy to Vercel
- ⏳ **YOU NEED TO**: Visit `/api/init-db` to create tables

**After this, your app will have REAL persistent storage! 🚀**

---

## 💡 Architecture Summary

```
┌─────────────────┐
│  User's Browser │
│   (React App)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js API   │
│  /api/uploads   │
│  /api/user/*    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Vercel Postgres │      │     IPFS     │
│   SQL Database  │      │  (Lighthouse)│
│                 │      │              │
│ • users table   │      │ • Images     │
│ • uploads table │      │ • Metadata   │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Blockchain    │
│  (BugVotingV2)  │
│                 │
│ • Submissions   │
│ • Voting        │
│ • NFT Claims    │
└─────────────────┘
```

**Storage Strategy:**
1. **IPFS** - Permanent file storage (images, metadata)
2. **Postgres** - Queryable app data (users, uploads, relationships)
3. **Blockchain** - Immutable voting records, NFT ownership
