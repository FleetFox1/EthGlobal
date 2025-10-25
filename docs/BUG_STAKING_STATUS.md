# BUG Token Staking & Rewards System

## ⚠️ Current Status: DATABASE TRACKING ONLY

The system is **partially implemented** - it tracks stakes and rewards in the database but does NOT move actual tokens yet.

## How It Works Now

### 1. Submit for Voting
**File**: `apps/web/app/api/submit-for-voting/route.ts`

```typescript
// ✅ IMPLEMENTED: Balance check
const balance = await bugToken.balanceOf(walletAddress);
if (balance < 10 BUG) → Error: "Insufficient BUG tokens"

// ✅ IMPLEMENTED: Database tracking
UPDATE uploads SET bug_staked = 10 WHERE id = uploadId

// ❌ NOT IMPLEMENTED: Actual token transfer
// Should do: bugToken.transferFrom(user, contract, 10 BUG)
```

### 2. Voting Resolves
**File**: `apps/web/app/api/resolve-voting/route.ts`

```typescript
// ✅ IMPLEMENTED: Reward calculation
const bugRewards = votesFor * 5; // 5 BUG per upvote

// ✅ IMPLEMENTED: Database tracking
UPDATE uploads SET bug_rewards_earned = bugRewards

// ❌ NOT IMPLEMENTED: Actual token distribution  
// Should do: bugToken.transfer(user, stake + rewards)
```

### 3. Frontend Display
**File**: `apps/web/app/collection/page.tsx`

```typescript
// ✅ IMPLEMENTED: Shows stake amount
"💎 Staked: {upload.bugStaked || 10} BUG"

// ✅ IMPLEMENTED: Shows potential rewards
"💰 Potential Rewards: {votesFor * 5} BUG (5 BUG per upvote)"

// ✅ IMPLEMENTED: Shows rewards earned
"🎉 Rewards Earned: {bugRewardsEarned} BUG"
```

## What's Missing for Full Implementation

### Option A: Use BugVotingV3 Contract (RECOMMENDED)
The `BugVotingV3.sol` contract **already has everything**:
- Submitters stake 10 BUG on submit
- Voters stake 10 BUG per vote
- Winners get 5 BUG per upvote
- Losers get stake back
- All automated on-chain ✅

**To implement**:
1. Deploy BugVotingV3 to Sepolia
2. Update frontend to call contract functions instead of APIs
3. Switch from off-chain to on-chain voting

### Option B: Add Simple Stake Contract (QUICK FIX)
Create a minimal contract just for submission stakes:

```solidity
contract BugStakeManager {
    mapping(string => uint256) public stakes; // uploadId => amount
    
    function stakeForSubmission(string memory uploadId) external {
        bugToken.transferFrom(msg.sender, address(this), 10 * 10**18);
        stakes[uploadId] = 10 * 10**18;
    }
    
    function distributeRewards(string memory uploadId, address user, uint256 rewards) external onlyOwner {
        bugToken.transfer(user, stakes[uploadId] + rewards);
        delete stakes[uploadId];
    }
}
```

### Option C: Keep Current System (DEMO-ONLY)
For the hackathon demo:
- Show the UI (looks great! ✨)
- Explain it's "simulated staking" for gas-free testing
- Mention on-chain version is ready (BugVotingV3)
- Focus on PYUSD donations and faucet unlock (those work!)

## Database Schema

```sql
-- Added in scripts/add-bug-stake-columns.sql
ALTER TABLE uploads 
ADD COLUMN bug_staked INTEGER DEFAULT 0,              -- Amount staked (10 BUG)
ADD COLUMN bug_rewards_earned INTEGER DEFAULT 0,      -- Rewards from upvotes (votesFor * 5)
ADD COLUMN rewards_claimed BOOLEAN DEFAULT false;     -- For future claim tracking
```

## Recommendation for 1.5 Days Left

**Option C (Keep Current) + Focus on polish**:
- ✅ UI already shows staking (looks professional)
- ✅ Explains tokenomics clearly
- ✅ Database tracks everything
- ✅ Focus remaining time on:
  - PYUSD demo video 🎥
  - Blockscout deployment (when credits arrive)
  - NFT card integration (holographic effects)
  - Testing full user flow

**Why**: Moving to on-chain staking now risks breaking the working demo. The UI tells the story well enough for judging!

## For Post-Hackathon

Deploy BugVotingV3 and switch to full on-chain voting system. It's already built and tested!

## Files Changed

- ✅ `apps/web/app/api/submit-for-voting/route.ts` - Balance check + DB tracking
- ✅ `apps/web/app/api/resolve-voting/route.ts` - Reward calculation
- ✅ `apps/web/app/collection/page.tsx` - Stake/rewards display
- ✅ `apps/web/scripts/add-bug-stake-columns.sql` - Database migration
- ✅ Deployed: Commit `60f3174`

## Testing Checklist

- [x] Database columns added
- [x] Balance check works (shows error if < 10 BUG)
- [x] Stake tracked in database
- [x] Rewards calculated correctly (5 BUG per upvote)
- [x] UI shows all information
- [ ] Actual token transfer (NOT IMPLEMENTED)
- [ ] Actual reward distribution (NOT IMPLEMENTED)
