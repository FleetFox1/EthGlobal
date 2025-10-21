# 🔐 Vercel Environment Variables Setup

## What to Add to Vercel

You need to add these environment variables to your Vercel project dashboard:

---

## 📋 Required Environment Variables

### 1. Lighthouse IPFS Storage
```
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```
**Get yours at:** https://lighthouse.storage

---

### 2. OpenAI for Bug Identification
```
OPENAI_API_KEY=your_openai_api_key_here
```
**Get yours at:** https://platform.openai.com/api-keys

---

### 3. Privy Wallet Authentication
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```
**Get yours at:** https://dashboard.privy.io

---

### 4. Contract Addresses (Already Set)
```
NEXT_PUBLIC_BUG_VOTING_ADDRESS=0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x9Be29fFC6e50BcC6d32bD38Dcd52e1b85C1c6a17
NEXT_PUBLIC_BUG_NFT_ADDRESS=0x73ebEC63AB4C77bCf1cDae2e2e99F24e2ADA2E58
NEXT_PUBLIC_PYUSD_ADDRESS=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d
NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60
```

---

### 5. Postgres Database (AUTO-CONFIGURED ✨)
**DON'T ADD THESE MANUALLY!** Vercel adds them automatically when you create the database:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

---

## 🚀 How to Add Them to Vercel

### Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### Step 2: Select Your Project
Click on your BugDex project

### Step 3: Go to Settings
Click **Settings** tab → **Environment Variables**

### Step 4: Add Each Variable

For each variable:
1. **Key:** (e.g., `LIGHTHOUSE_API_KEY`)
2. **Value:** (your actual API key)
3. **Environments:** Select all:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Save**

### Step 5: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

---

## 📝 Quick Copy-Paste Checklist

Use this to track what you've added:

### Must Add Manually:
- [ ] `LIGHTHOUSE_API_KEY` - From your .env.local
- [ ] `OPENAI_API_KEY` - From your .env.local
- [ ] `NEXT_PUBLIC_PRIVY_APP_ID` - From your .env.local
- [ ] `NEXT_PUBLIC_BUG_VOTING_ADDRESS` = `0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9`
- [ ] `NEXT_PUBLIC_BUG_TOKEN_ADDRESS` = `0x9Be29fFC6e50BcC6d32bD38Dcd52e1b85C1c6a17`
- [ ] `NEXT_PUBLIC_BUG_NFT_ADDRESS` = `0x73ebEC63AB4C77bCf1cDae2e2e99F24e2ADA2E58`
- [ ] `NEXT_PUBLIC_PYUSD_ADDRESS` = `0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d`
- [ ] `NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS` = `0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60`

### Auto-Added (After Creating Postgres DB):
- ✅ `POSTGRES_URL` - Added by Vercel
- ✅ `POSTGRES_PRISMA_URL` - Added by Vercel
- ✅ `POSTGRES_URL_NO_SSL` - Added by Vercel
- ✅ `POSTGRES_URL_NON_POOLING` - Added by Vercel
- ✅ `POSTGRES_USER` - Added by Vercel
- ✅ `POSTGRES_HOST` - Added by Vercel
- ✅ `POSTGRES_PASSWORD` - Added by Vercel
- ✅ `POSTGRES_DATABASE` - Added by Vercel

---

## 🔍 Where to Find Your API Keys

### From Your Local `.env.local`

Look in `apps/web/.env.local` - you should have:
```bash
LIGHTHOUSE_API_KEY=lh-xxx...
OPENAI_API_KEY=sk-xxx...
NEXT_PUBLIC_PRIVY_APP_ID=xxx...
```

**Copy these exact values** to Vercel.

---

## ⚠️ IMPORTANT NOTES

### 1. Public vs Private Variables

**Variables starting with `NEXT_PUBLIC_`:**
- ✅ Exposed to browser
- ✅ Safe for contract addresses
- ⚠️ Don't use for API keys!

**Variables WITHOUT `NEXT_PUBLIC_`:**
- 🔒 Server-side only
- ✅ Safe for API keys
- ✅ Use for LIGHTHOUSE_API_KEY, OPENAI_API_KEY

### 2. Don't Commit `.env.local`

Your `.env.local` file should be in `.gitignore` and **never** committed to GitHub. Only use `.env.local.example` (with fake values) for documentation.

### 3. Postgres Variables

When you create the Vercel Postgres database:
1. Vercel adds 8 database variables automatically
2. You DON'T need to copy anything
3. They're already configured for production

---

## 🧪 Testing Environment Variables

After adding them and redeploying:

### Test 1: Check Deployment Logs
1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Check **Build Logs** for errors
4. Should see: "✓ Compiled successfully"

### Test 2: Visit Your App
1. Go to your live URL
2. Open browser console (F12)
3. Check for errors about missing env variables

### Test 3: Test Features
1. **Upload a bug** - Tests LIGHTHOUSE_API_KEY
2. **AI identifies it** - Tests OPENAI_API_KEY
3. **Connect wallet** - Tests NEXT_PUBLIC_PRIVY_APP_ID
4. **Submit for voting** - Tests contract addresses

---

## 🚨 Common Issues

### "LIGHTHOUSE_API_KEY is not defined"
- **Cause:** Variable not added to Vercel
- **Fix:** Add to Settings → Environment Variables → Redeploy

### "Failed to connect to OpenAI"
- **Cause:** OPENAI_API_KEY missing or invalid
- **Fix:** Check API key is correct and has credits

### "Cannot connect to database"
- **Cause:** Postgres database not created
- **Fix:** Create Vercel Postgres database (auto-adds variables)

### Changes not taking effect
- **Cause:** Need to redeploy after adding variables
- **Fix:** Deployments → Redeploy with latest environment variables

---

## ✅ Final Checklist

Before testing your app:

- [ ] Added all API keys to Vercel
- [ ] Added all contract addresses to Vercel
- [ ] Created Vercel Postgres database
- [ ] Redeployed after adding variables
- [ ] Checked build logs for success
- [ ] Tested upload feature
- [ ] Tested AI identification
- [ ] Tested wallet connection

---

## 🎯 Quick Summary

**Answer to your question:**

**NO** - Don't copy Postgres variables! Here's what to do:

1. **Copy from `.env.local` to Vercel:**
   - ✅ `LIGHTHOUSE_API_KEY`
   - ✅ `OPENAI_API_KEY`
   - ✅ `NEXT_PUBLIC_PRIVY_APP_ID`
   - ✅ All `NEXT_PUBLIC_*` contract addresses

2. **Postgres variables:**
   - ❌ Don't add manually
   - ✅ Vercel adds them when you create the database

3. **Then:**
   - Redeploy
   - Visit `/api/init-db`
   - Test everything!

---

**Need help?** Check the deployment logs at:
https://vercel.com/dashboard → Your Project → Deployments → Latest → View Function Logs
