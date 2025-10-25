# ✅ Pre-Testing Checklist

**Status**: Ready to test staking system end-to-end!

---

## 🔧 Setup Steps (Do These First!)

### 1. Add Private Key to Vercel ⚡ CRITICAL
- [ ] Go to: https://vercel.com/fleetfox1s-projects/eth-global/settings/environment-variables
- [ ] Click **Add New Variable**
- [ ] Name: `STAKING_CONTRACT_PRIVATE_KEY`
- [ ] Value: `6d82fa3f41df0f9e363801705842ca83dbd6f2948018dfeae119a2b74ff79f12`
- [ ] Environments: ✅ Production, ✅ Preview, ✅ Development
- [ ] Click **Save**
- [ ] Go to **Deployments** → Redeploy latest

### 2. Set Voting Duration to 10 Minutes
- [ ] Go to Neon dashboard: https://console.neon.tech/
- [ ] Open your database SQL editor
- [ ] Run script: `apps/web/scripts/set-voting-duration-10min.sql`
- [ ] Verify result shows: `voting_duration_minutes: 10`

**SQL Command**:
```sql
UPDATE voting_config
SET voting_duration_hours = 0.167, -- 10 minutes
    updated_at = NOW();

SELECT voting_duration_hours * 60 as minutes FROM voting_config;
```

### 3. Verify Contract Funded
- [ ] Check Etherscan: https://sepolia.etherscan.io/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
- [ ] Should show: 1000 BUG tokens
- [ ] If not funded, run: `pnpm hardhat run scripts/fund-staking.ts --network sepolia`

### 4. Prepare Test Wallet
- [ ] Test wallet has >= 10 BUG (for staking)
- [ ] Test wallet has ~0.001 ETH (for gas)
- [ ] If needed, claim from faucet: https://bugdex.life

---

## 🧪 Testing Flow

### Phase 1: Submit with Stake (5-10 minutes)
- [ ] Go to **bugdex.life**
- [ ] Connect test wallet
- [ ] Upload bug photo
- [ ] Get AI analysis (should work)
- [ ] Click **"Submit for Community Voting"**
- [ ] **MetaMask #1**: Approve 10 BUG → Confirm
- [ ] Wait for confirmation (~15 sec)
- [ ] **MetaMask #2**: Stake 10 BUG → Confirm  
- [ ] Wait for confirmation (~15 sec)
- [ ] See success: **"💎 10 BUG staked!"**
- [ ] Check Etherscan: Verify stake transaction

**Expected**:
- 2 MetaMask popups
- 2 transactions on Etherscan
- Collection page shows: "⏳ Voting: 10 min remaining"

### Phase 2: Vote (2 minutes)
- [ ] Switch to different wallet OR different device
- [ ] Go to **bugdex.life**
- [ ] Find your submission on collection page
- [ ] Click to view details
- [ ] Vote **FOR** (or AGAINST)
- [ ] Vote count updates immediately
- [ ] No MetaMask popup (voting is free!)

**Expected**:
- Instant vote (no gas)
- Vote count increases
- No blockchain transaction

### Phase 3: Wait for Deadline (10 minutes)
- [ ] Wait exactly 10 minutes from submission
- [ ] Check collection page
- [ ] Countdown should reach zero

**Or skip wait**:
- [ ] Manually set deadline to past in database:
```sql
UPDATE uploads 
SET voting_deadline = NOW() - INTERVAL '1 minute'
WHERE voting_status = 'pending_voting';
```

### Phase 4: Distribute Rewards (2 minutes)
- [ ] Visit: https://bugdex.life/api/resolve-voting
- [ ] Should see JSON: `{"success": true, "resolved": [...]}`
- [ ] Check response for your submission
- [ ] Note: `bugRewardsEarned: 5` (or more if multiple votes)
- [ ] Check Etherscan: Verify `distributeRewards` transaction
- [ ] Check your wallet BUG balance
- [ ] Should receive: **10 BUG + (votes × 5 BUG)**

**Expected for 1 upvote**:
- Stake returned: 10 BUG
- Reward earned: 5 BUG
- Total received: **15 BUG**
- Contract balance: 1000 - 15 = 985 BUG

---

## 🔍 Verification Points

### After Stake:
- [ ] Etherscan shows approval tx
- [ ] Etherscan shows stake tx
- [ ] Collection page shows "pending_voting"
- [ ] Your BUG balance decreased by 10
- [ ] Contract has your 10 BUG

### After Vote:
- [ ] Vote count updated (no tx)
- [ ] Database shows votes_for or votes_against
- [ ] Timer counting down

### After Resolve:
- [ ] Collection page shows "approved" or "rejected"
- [ ] Your BUG balance increased
- [ ] Contract balance decreased
- [ ] Database shows voting_resolved = true
- [ ] Database shows bug_rewards_earned

---

## 🐛 Common Issues

### Issue: "No stake found in contract"
**Cause**: Frontend didn't call staking contract  
**Fix**: Check browser console for errors, verify MetaMask transactions

### Issue: "Transaction failed"
**Cause**: Insufficient gas or BUG balance  
**Fix**: 
- Get Sepolia ETH: https://sepoliafaucet.com
- Claim BUG: https://bugdex.life (faucet)

### Issue: "Failed to call staking contract" (in resolve)
**Cause**: Private key not in Vercel  
**Fix**: Double-check Vercel environment variables, redeploy

### Issue: Voting doesn't expire
**Cause**: Voting duration still 72 hours  
**Fix**: Run SQL to set to 10 minutes (see above)

### Issue: No rewards distributed
**Cause**: Backend can't call contract  
**Fix**: Check Vercel logs, verify private key, check deployer has ETH

---

## 📊 Test Scenarios to Try

### Scenario 1: Single Upvote (Most Common)
- Submit → 1 vote FOR → Resolve
- **Expected**: 10 + 5 = **15 BUG**

### Scenario 2: Multiple Upvotes
- Submit → 5 votes FOR → Resolve
- **Expected**: 10 + 25 = **35 BUG**

### Scenario 3: Rejected Submission
- Submit → 3 votes AGAINST, 1 vote FOR → Resolve
- **Expected**: 10 BUG (stake only, no rewards)

### Scenario 4: No Votes (Approved by Default!)
- Submit → No votes → Wait 10 min → Resolve
- **Expected**: 10 BUG (approved with 0 upvotes)

---

## 🎬 Screen Recording Checklist

When it works, record this:
- [ ] Show wallet balance before (e.g., "100 BUG")
- [ ] Upload bug photo
- [ ] Click submit → Show MetaMask popups
- [ ] Show "10 BUG staked" success
- [ ] Switch wallet, vote FOR
- [ ] Wait 10 minutes (or fast-forward with SQL)
- [ ] Call /api/resolve-voting
- [ ] Show Etherscan transaction
- [ ] Show wallet balance after (e.g., "105 BUG")
- [ ] Highlight: "Earned 5 BUG from 1 upvote!"

---

## ✅ Success Criteria

**You know it's working when**:
1. ✅ Two MetaMask popups (approve + stake)
2. ✅ Etherscan shows both transactions
3. ✅ Voting happens (free, no gas)
4. ✅ After resolve, Etherscan shows distributeRewards tx
5. ✅ Your wallet receives stake + rewards
6. ✅ Contract balance decreased
7. ✅ Database shows voting_resolved = true

---

## 🔄 After Testing

### Reset Voting Duration:
```sql
-- Run this in Neon after testing
UPDATE voting_config
SET voting_duration_hours = 72; -- Back to 3 days

-- Or use: apps/web/scripts/reset-voting-duration-3days.sql
```

### Document Results:
- [ ] Did staking work? ✅/❌
- [ ] Did rewards distribute? ✅/❌
- [ ] Any errors? Note them
- [ ] Screen recording saved? ✅/❌

---

## 📝 Notes

**Estimated Total Time**: 30 minutes (including 10 min wait)  
**Can Be Shortened**: Use SQL to manually expire votes immediately  
**Best Practice**: Test all 4 scenarios before demo

**Ready?** Add that Vercel private key and let's test! 🚀
