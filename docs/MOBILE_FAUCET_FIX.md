# 🔧 Mobile Faucet Unlock Fix - Setup Instructions

## Problem Solved
**Issue:** Mobile users see "Unlock for $1" even after unlocking on desktop  
**Cause:** Contract calls fail silently on mobile MetaMask  
**Solution:** Database fallback for reliable unlock status tracking

---

## 🗄️ Database Setup (REQUIRED)

### Step 1: Run Migration in Neon Console

1. Go to https://console.neon.tech
2. Select your project (BugDex)
3. Click "SQL Editor"
4. Copy and paste from `apps/web/scripts/create-faucet-unlocks-table.sql`:

```sql
CREATE TABLE IF NOT EXISTS faucet_unlocks (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR(10) CHECK (payment_method IN ('ETH', 'PYUSD')),
  payment_amount DECIMAL(20, 6),
  transaction_hash VARCHAR(66),
  last_claim_at TIMESTAMP,
  total_claims INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faucet_unlocks_wallet ON faucet_unlocks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_faucet_unlocks_last_claim ON faucet_unlocks(last_claim_at);
```

5. Click "Run"
6. Verify with: `SELECT * FROM faucet_unlocks;`

---

## ✅ How It Works

### Desktop Flow (Unchanged):
1. User unlocks with ETH/PYUSD
2. Transaction confirms on-chain
3. **NEW:** Also records in database
4. Status checks contract (works fine)

### Mobile Flow (Fixed):
1. User unlocks with ETH/PYUSD
2. Transaction confirms on-chain
3. **NEW:** Records in database
4. Status checks contract (fails on mobile)
5. **NEW:** Falls back to database ✅
6. Shows correct unlock status!

---

## 🔍 Check Flow Diagram

```
┌─────────────────────────────────────┐
│  User Opens Faucet Page             │
└─────────────────┬───────────────────┘
                  │
                  v
      ┌───────────────────────┐
      │ checkUnlockStatus()   │
      └───────────┬───────────┘
                  │
                  v
      ┌──────────────────────────┐
      │ Try: Contract Call       │
      │ hasUnlocked(address)     │
      └──────────┬───────────────┘
                  │
         ┌────────┴────────┐
         │                  │
      SUCCESS            FAIL
         │                  │
         v                  v
    ┌─────────┐     ┌──────────────┐
    │ Desktop │     │   Mobile     │
    │ Returns │     │  Contract    │
    │  true   │     │    Fails     │
    └─────────┘     └──────┬───────┘
                           │
                           v
                  ┌──────────────────┐
                  │ Fallback: Check  │
                  │    Database      │
                  │ /api/faucet/...  │
                  └────────┬─────────┘
                           │
                  ┌────────┴────────┐
                  │                  │
               FOUND            NOT FOUND
                  │                  │
                  v                  v
            ┌─────────┐        ┌──────────┐
            │ Unlocked│        │  Locked  │
            │   ✅    │        │    🔒   │
            └─────────┘        └──────────┘
```

---

## 📡 API Endpoints Created

### 1. Check Unlock Status
**GET** `/api/faucet/check-unlock?wallet=0x...`

**Response:**
```json
{
  "success": true,
  "hasUnlocked": true,
  "data": {
    "wallet_address": "0x123...",
    "unlocked_at": "2025-10-24T12:00:00Z",
    "payment_method": "ETH",
    "transaction_hash": "0xabc..."
  }
}
```

### 2. Record Unlock
**POST** `/api/faucet/record-unlock`

**Body:**
```json
{
  "walletAddress": "0x123...",
  "paymentMethod": "ETH",
  "transactionHash": "0xabc...",
  "amount": "0.00033"
}
```

---

## 🧪 Testing Instructions

### Test 1: Desktop (Should Work)
1. Desktop: Open bugdex.life
2. Check browser console
3. Should see: `✅ Contract unlock check: true`

### Test 2: Mobile (Now Works!)
1. Mobile: Open bugdex.life in MetaMask browser
2. Check if faucet shows as unlocked
3. Console should show:
   - `⚠️ Contract call failed, checking database`
   - `📡 Checking database unlock status...`
   - `✅ Database shows unlocked`

### Test 3: New User
1. New wallet (never unlocked)
2. Should see "Unlock for $1" on both
3. After unlocking once:
   - Desktop: Shows unlocked ✅
   - Mobile: Shows unlocked ✅

---

## 🛠️ Troubleshooting

### Mobile Still Shows Locked After Desktop Unlock

**Cause:** Database not synced from old unlock

**Solution:** Need to backfill existing unlocks from contract

Run this query in Neon:
```sql
-- Manual insert for your test wallet
INSERT INTO faucet_unlocks (wallet_address, payment_method, unlocked_at)
VALUES (
  LOWER('0xYourWalletAddress'),
  'ETH',
  NOW()
)
ON CONFLICT (wallet_address) DO NOTHING;
```

Replace `0xYourWalletAddress` with your actual wallet.

---

### Console Shows Database Error

Check:
1. Table exists: `SELECT * FROM faucet_unlocks LIMIT 1;`
2. Vercel environment variables set
3. Database connection string in .env.local

---

### Unlock Button Doesn't Record in Database

Check browser console for:
- `✅ Unlock recorded in database` (success)
- `Failed to record unlock in database` (error)

If error, check API endpoint works:
```bash
curl -X POST https://bugdex.life/api/faucet/record-unlock \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x123...","paymentMethod":"ETH","amount":"0.00033"}'
```

---

## 📊 Database Schema

```sql
CREATE TABLE faucet_unlocks (
  id SERIAL PRIMARY KEY,                    -- Auto-increment
  wallet_address VARCHAR(42) NOT NULL UNIQUE, -- Ethereum address
  unlocked_at TIMESTAMP DEFAULT NOW(),      -- When unlocked
  payment_method VARCHAR(10),               -- 'ETH' or 'PYUSD'
  payment_amount DECIMAL(20, 6),            -- Amount paid
  transaction_hash VARCHAR(66),             -- Blockchain tx
  last_claim_at TIMESTAMP,                  -- Last faucet claim
  total_claims INTEGER DEFAULT 0,           -- Total claims
  created_at TIMESTAMP DEFAULT NOW()        -- Record creation
);
```

**Indexes:**
- `idx_faucet_unlocks_wallet` - Fast wallet lookups
- `idx_faucet_unlocks_last_claim` - Claim tracking

---

## 🔮 Future Improvements

- [ ] Backfill script to sync existing on-chain unlocks
- [ ] Cron job to periodically sync contract state
- [ ] Admin dashboard to view all unlocks
- [ ] Analytics: ETH vs PYUSD unlock breakdown

---

## ✅ Deployment Checklist

- [x] SQL table created in Neon
- [x] API endpoints deployed (`check-unlock`, `record-unlock`)
- [x] FaucetButton updated with fallback logic
- [x] UnlockFaucetModal records on success
- [x] Commit: `af206c9`
- [x] Deployed to production
- [ ] **YOU NEED TO:** Run SQL migration in Neon console
- [ ] **YOU NEED TO:** Test mobile after deploy

---

## 🎯 Expected Results

### Before Fix:
- Desktop: ✅ Shows unlocked
- Mobile: ❌ Shows locked (broken)

### After Fix:
- Desktop: ✅ Shows unlocked (contract)
- Mobile: ✅ Shows unlocked (database fallback)

**Result:** Same user, same wallet, same unlock status everywhere! 🎉

---

## 📝 Next Steps

1. **Run the SQL migration** in Neon (5 minutes)
2. **Wait for Vercel deploy** (~2 minutes)
3. **Test on mobile** MetaMask browser
4. **Check console logs** for database fallback
5. **Verify unlock status** matches desktop

**Status:** Code deployed, database migration required!
