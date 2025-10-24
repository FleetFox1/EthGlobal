# Voting Configuration Setup Guide

## For bugdex.life Production Deployment

### Step 1: Run Database Migration

**Option A: Via Vercel Postgres Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project (EthGlobal)
3. Go to "Storage" → "Postgres"
4. Click "Query" tab
5. Copy and paste contents of `apps/web/scripts/create-voting-config-table.sql`
6. Click "Run Query"
7. Verify: `SELECT * FROM voting_config;`

**Option B: Via psql CLI**
```bash
# Get connection string from Vercel dashboard
psql "postgresql://[YOUR_CONNECTION_STRING]" -f apps/web/scripts/create-voting-config-table.sql
```

### Step 2: Verify Environment Variable

Check that `NEXT_PUBLIC_ADMIN_WALLET` is set in Vercel:
1. Go to Project Settings → Environment Variables
2. Confirm `NEXT_PUBLIC_ADMIN_WALLET` = your admin wallet address (lowercase)
3. If missing, add it and redeploy

### Step 3: Deploy to Production

```bash
git push origin main
```

Vercel will auto-deploy the changes to bugdex.life

### Step 4: Test the System

1. **Go to** https://bugdex.life/admin
2. **Connect** your admin wallet (must match NEXT_PUBLIC_ADMIN_WALLET)
3. **Scroll down** to "Voting Configuration" card
4. **Try a preset:**
   - Click "5 minutes" for ultra-fast demo
   - Click "10 minutes" for quick demo
   - Click "3 days (default)" for production
5. **Click "Save Configuration"**
6. **Test submission:**
   - Upload a bug screenshot
   - Submit for voting
   - Check the deadline message (should reflect your chosen duration)

### Step 5: Hackathon Demo Mode

**For your hackathon presentation:**

```
1. Before demo: Set to "5 minutes" or "10 minutes"
2. During demo:
   - Upload bug (30 seconds)
   - Submit for voting (instant)
   - Vote from another wallet (30 seconds)
   - Show other features while waiting
   - After duration: auto-resolve triggers
   - Mint NFT with rarity (1 minute)
3. After demo: Reset to "3 days (default)"
```

### Quick Presets Available

| Preset | Hours | Best For |
|--------|-------|----------|
| 5 minutes | 0.083 | Ultra-fast hackathon demo |
| 10 minutes | 0.167 | Quick demo with Q&A time |
| 30 minutes | 0.5 | Extended presentation |
| 1 hour | 1 | Short testing session |
| 6 hours | 6 | Half-day testing |
| 1 day | 24 | Daily voting cycle |
| 3 days | 72 | **Production default** |

### Troubleshooting

**"Unauthorized: Admin access required"**
- Your wallet doesn't match NEXT_PUBLIC_ADMIN_WALLET
- Check Vercel environment variables
- Make sure you're connecting the correct wallet

**Config not saving**
- Check browser console for errors
- Verify database table exists: `SELECT * FROM voting_config;`
- Check Vercel function logs

**Duration not applying to new submissions**
- Config saved successfully but old duration still used
- Check API logs in Vercel for submit-for-voting endpoint
- Verify config query returns data

**Toggle switch not working**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if @radix-ui/react-switch is installed

### Advanced: Custom Duration

For precise timing, enter custom hours:
- **2.5 hours** = 2 hours 30 minutes
- **0.0167 hours** ≈ 1 minute
- **168 hours** = 1 week

**Formula:** `minutes / 60 = hours`
- 5 minutes: 5/60 = 0.083
- 15 minutes: 15/60 = 0.25
- 45 minutes: 45/60 = 0.75

### Important Notes

⚠️ **Only new submissions use updated duration**
- Existing pending votes keep their original deadline
- No retroactive changes to in-progress voting
- This ensures fairness for users who already submitted

⚠️ **Demo mode warning**
- Durations <1 hour show yellow warning
- Users have very limited time to vote
- Only use for demos, not production

✅ **Production recommendation: 3 days (72 hours)**
- Gives community time to evaluate
- Balances engagement vs wait time
- Industry standard for web3 governance

---

**Ready to demo!** 🚀

Test the system at: https://bugdex.life/admin
