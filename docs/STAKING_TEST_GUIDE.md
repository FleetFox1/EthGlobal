# 🧪 End-to-End Staking Test Guide

**Contract Balance**: 1000 BUG ✅  
**Ready to test**: Full staking → voting → reward distribution flow

---

## 🎯 Test Flow

### Phase 1: Submit Bug with Stake (Frontend)

1. **Go to bugdex.life**
2. **Connect wallet** (test wallet with >= 10 BUG)
3. **Upload a bug photo** (any insect photo)
4. **Get AI analysis** (should work for free)
5. **Click "Submit for Community Voting"**

**Expected Flow**:
```
1. ✅ Check balance >= 10 BUG
2. 🦊 MetaMask popup #1: Approve 10 BUG to staking contract
   - Click "Confirm"
3. ⏳ Wait for approval transaction (~15 seconds)
4. 🦊 MetaMask popup #2: Stake 10 BUG to contract
   - Click "Confirm"
5. ⏳ Wait for stake transaction (~15 seconds)
6. 🎉 Success! "💎 10 BUG staked! 💰 Earn 5 BUG per upvote!"
```

**Check on Etherscan**:
- Staking contract: https://sepolia.etherscan.io/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
- Should show your staking transaction
- Contract balance should decrease by 0 (stake is just moved from you to contract)

---

### Phase 2: Vote on Submission (Different Wallet)

1. **Switch to a different wallet** (or use second device)
2. **Go to bugdex.life**
3. **Find the submission** on collection page
4. **Click "View Details"**
5. **Vote FOR or AGAINST** (free, no gas!)

**Expected**:
```
✅ Vote recorded in database
✅ Vote count updates immediately
✅ No MetaMask popup (off-chain voting)
```

---

### Phase 3: Resolve Voting & Distribute Rewards (Backend)

**Manual Trigger**:
```bash
# Call the resolve API
curl https://bugdex.life/api/resolve-voting
```

**Or use browser**:
Just visit: `https://bugdex.life/api/resolve-voting`

**Expected Backend Flow**:
```
1. 🔍 Find expired voting periods (or manually resolve)
2. 📊 Calculate: votes_for - votes_against
3. ✅ If approved (net votes >= 0):
   - Calculate rewards: 10 BUG stake + (votes_for × 5 BUG)
   - Call contract.distributeRewards(uploadId, votes_for)
   - Transfer total to submitter
4. ❌ If rejected (net votes < 0):
   - Call contract.returnStake(uploadId)
   - Transfer stake only (no rewards)
5. 💾 Update database: voting_resolved = true
```

**Check on Etherscan**:
- Staking contract should show `distributeRewards` or `returnStake` transaction
- Your wallet should receive BUG tokens back
- Contract balance should decrease

---

## 🔍 Verification Checklist

### Before Testing:
- [x] Staking contract deployed: `0x68E8DF1350C3500270ae9226a81Ca1771F2eD542`
- [x] Contract funded with 1000 BUG
- [x] Private key added to .env.local
- [x] API updated to call contract
- [ ] Frontend updated to stake tokens
- [ ] Test wallet has >= 10 BUG

### During Testing:
- [ ] Approval transaction succeeds
- [ ] Stake transaction succeeds
- [ ] Contract receives stake
- [ ] Database updated (voting_status = 'pending_voting')
- [ ] Voting works (free, off-chain)
- [ ] Resolve API called successfully
- [ ] Contract distributes rewards
- [ ] User receives tokens back

### After Testing:
- [ ] Check Etherscan for all transactions
- [ ] Verify contract balance decreased
- [ ] Verify user balance increased
- [ ] Database shows voting_resolved = true
- [ ] Database shows bug_rewards_earned > 0

---

## 🐛 Troubleshooting

### "No stake found in contract"
- Check if stakeForSubmission() transaction succeeded
- View on Etherscan: https://sepolia.etherscan.io/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542

### "Insufficient BUG tokens"
- Claim 100 BUG from faucet: bugdex.life (click "Claim 100 BUG")
- Wait 24 hours between claims

### "Failed to verify stake"
- Frontend might not be updated yet
- Check if you're calling the stake contract in frontend
- Look at browser console for errors

### "Failed to call staking contract" (in resolve API)
- Check STAKING_CONTRACT_PRIVATE_KEY is correct in .env.local
- Check deployer wallet has ETH for gas
- Check contract address is correct

### "Transaction failed" (MetaMask)
- Check you have enough Sepolia ETH for gas
- Get ETH: https://sepoliafaucet.com
- Need ~0.001 ETH for transactions

---

## 📊 Test Scenarios

### Scenario 1: Approved Submission (Happy Path)
```
Submit bug → Stake 10 BUG
Vote FOR (3 times) from different wallets
Resolve voting
Expected reward: 10 BUG + (3 × 5 BUG) = 25 BUG
Contract balance: 1000 - 25 = 975 BUG
```

### Scenario 2: Rejected Submission
```
Submit bug → Stake 10 BUG
Vote AGAINST (5 times)
Vote FOR (2 times)
Net votes: 2 - 5 = -3 (rejected)
Resolve voting
Expected reward: 10 BUG (stake only, no bonus)
Contract balance: 1000 - 10 = 990 BUG
```

### Scenario 3: No Votes (Still Approved!)
```
Submit bug → Stake 10 BUG
No one votes
Voting deadline expires
Net votes: 0 - 0 = 0 (approved by default!)
Resolve voting
Expected reward: 10 BUG + (0 × 5 BUG) = 10 BUG
Contract balance: 1000 - 10 = 990 BUG
```

### Scenario 4: Lots of Upvotes (Jackpot!)
```
Submit bug → Stake 10 BUG
Vote FOR (20 times) - viral submission!
Resolve voting
Expected reward: 10 BUG + (20 × 5 BUG) = 110 BUG
Contract balance: 1000 - 110 = 890 BUG
```

---

## 🚨 Critical Issues to Watch

### 1. Frontend Not Updated
**Symptom**: Submit button calls API but doesn't open MetaMask  
**Fix**: Need to update collection page submitForVoting() function to:
1. Approve BUG tokens
2. Call staking contract
3. Then call API

### 2. Voting Deadline Too Long
**Symptom**: Can't test rewards because voting period hasn't expired  
**Fix**: Reduce voting duration in admin panel OR manually resolve

### 3. Contract Not Funded Enough
**Symptom**: distributeRewards fails with "ERC20: transfer amount exceeds balance"  
**Fix**: Run `pnpm hardhat run scripts/fund-staking.ts --network sepolia` again

### 4. Wrong Private Key
**Symptom**: "OwnableUnauthorizedAccount" error  
**Fix**: STAKING_CONTRACT_PRIVATE_KEY must be from deployer wallet (0x71940fd31a77979F3a54391b86768C661C78c263)

---

## 🎬 Demo Video Checklist

### Show These Steps:
1. ✅ Wallet balance: "I have 100 BUG"
2. ✅ Upload bug photo
3. ✅ Click "Submit for Community Voting"
4. ✅ MetaMask popup #1: Approve tokens
5. ✅ MetaMask popup #2: Stake 10 BUG
6. ✅ Success message: "💎 10 BUG staked!"
7. ✅ Switch wallet, vote FOR
8. ✅ Call resolve API
9. ✅ Check Etherscan: distributeRewards transaction
10. ✅ Check wallet: Received 15 BUG (10 stake + 5 reward)

### Highlight These Points:
- "Tokens actually moved to contract, not just database tracking"
- "Staking contract holds your 10 BUG during voting"
- "Voting is free for community (off-chain)"
- "Smart contract distributes rewards after voting"
- "I earned 5 BUG per upvote!"

---

## 📝 Next Steps After Testing

1. **If staking works**: ✅ Move to Pyth oracle integration
2. **If issues**: 🐛 Debug and fix
3. **Screen record**: 🎥 Demo for PYUSD + Pyth prizes
4. **Update docs**: 📝 Add testing results

---

**Ready to test?** Let me know if you hit any issues! 🚀
