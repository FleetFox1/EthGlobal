# Manual NFT Claiming System

## Overview
Updated the voting system to allow users to manually claim their NFT after their bug submission is approved, instead of auto-minting on the 5th vote.

## Key Changes

### 1. BugVotingV2.sol (New Contract)
**Location**: `apps/contracts/contracts/BugVotingV2.sol`

**Major Changes from V1**:
- ✅ Removed auto-mint from `_resolveSubmission()`
- ✅ Added `claimNFT(submissionId)` function
- ✅ Added `nftClaimed` boolean to Submission struct
- ✅ Added `canClaimNFT(submissionId)` view function
- ✅ Added `NFTClaimed` event

**New Functions**:
```solidity
function claimNFT(uint256 submissionId) external nonReentrant
function canClaimNFT(uint256 submissionId) external view returns (bool)
function getSubmission(uint256 submissionId) external view returns (...)
```

**User Flow**:
1. User submits bug → gets submissionId
2. Community votes (5 votes needed for approval)
3. If approved → "Claim Your NFT" button appears
4. User clicks claim → pays gas to mint
5. NFT minted to their wallet

### 2. Collection Page Updates
**Location**: `apps/web/app/collection/page.tsx`

**New Features**:
- ✅ Fetches blockchain status for each submission
- ✅ Shows voting progress (X/5 votes)
- ✅ Shows "Claim Your NFT" button when approved
- ✅ Shows "NFT Claimed" status after claiming
- ✅ Shows "Not Approved" status if rejected

**New Functions**:
```typescript
getSubmissionStatus(submissionId) // Fetches from blockchain
claimNFT(upload) // Calls contract to mint NFT
```

**UI States**:
1. **Not Submitted**: "Submit for Voting" button
2. **In Voting**: Shows vote count (e.g., "3/5 votes")
3. **Approved - Unclaimed**: Green "Claim Your NFT" button
4. **NFT Claimed**: Green checkmark "NFT Claimed"
5. **Not Approved**: Red warning message

## Deployment Instructions

### Step 1: Deploy BugVotingV2
```bash
cd apps/contracts

# Update BugToken address in deploy-v2.ts (line 6)
# Current BugNFT: 0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267

npx hardhat run scripts/deploy-v2.ts --network sepolia
```

The script will:
1. Deploy BugVotingV2 with existing BugToken & BugNFT
2. Authorize BugVotingV2 as NFT minter
3. Revoke old BugVoting authorization
4. Output new contract address

### Step 2: Update Frontend
```bash
cd apps/web

# Update .env.local
NEXT_PUBLIC_BUG_VOTING_ADDRESS=<new_address_from_deployment>

# Restart dev server
npm run dev
```

### Step 3: Update deployment.json
```json
{
  "BugToken": "0x...",
  "BugNFT": "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267",
  "BugVoting": "<old_address>",
  "BugVotingV2": "<new_address>"
}
```

## Gas Economics

### V1 (Auto-Mint)
- Submitter: ~50k gas (submit)
- Voters 1-4: ~100k gas each (vote + stake)
- **Voter 5: ~300k gas (vote + stake + MINT NFT)** ⚠️

### V2 (Manual Claim)
- Submitter: ~50k gas (submit)
- Voters 1-5: ~100k gas each (vote + stake)
- **Submitter: ~150k gas (claim NFT)** ✅

**Benefits**:
- ✅ Fair gas distribution (each user pays for their actions)
- ✅ User control (claim when ready)
- ✅ 5th voter no longer penalized
- ✅ Can batch claim multiple NFTs

## Testing Checklist

Before deploying:
- [ ] Get BugToken address from deployment.json or Sepolia
- [ ] Update `BUG_TOKEN_ADDRESS` in deploy-v2.ts
- [ ] Fund deployer wallet with Sepolia ETH
- [ ] Verify deployer is owner of BugNFT contract

After deploying:
- [ ] Verify contract on Etherscan
- [ ] Update .env.local with new address
- [ ] Test submit → vote → claim flow
- [ ] Verify old voting contract is revoked

## Contract Interactions

### Submit Bug
```typescript
const bugVoting = new ethers.Contract(address, abi, signer);
const tx = await bugVoting.submitBug(metadataCid, rarity);
const receipt = await tx.wait();
const submissionId = receipt.logs[0].topics[1]; // Extract from event
```

### Check Status
```typescript
const [submitter, ipfsHash, createdAt, votesFor, votesAgainst, 
       resolved, approved, nftClaimed, nftTokenId] = 
  await bugVoting.getSubmission(submissionId);
```

### Claim NFT
```typescript
const tx = await bugVoting.claimNFT(submissionId);
await tx.wait();
// User now owns NFT!
```

## Frontend States

Collection page now shows:

1. **Submitted, Voting in Progress**:
   ```
   ℹ️ In Voting
   Votes For: 3 / 5
   Votes Against: 1
   ```

2. **Approved, Ready to Claim**:
   ```
   ✨ Claim Your NFT
   [Green button, clickable]
   ```

3. **NFT Claimed**:
   ```
   ✅ NFT Claimed
   [Disabled, green checkmark]
   ```

4. **Not Approved**:
   ```
   ⚠️ Not Approved
   This submission didn't receive enough votes
   ```

## Security Considerations

- ✅ Only original submitter can claim
- ✅ Can only claim once (nftClaimed flag)
- ✅ Must be resolved and approved
- ✅ ReentrancyGuard on claimNFT
- ✅ NFT minting authorization required

## Migration Notes

**Existing Submissions on V1**:
- Old submissions on 0x85E82a36fF69f85b995eE4de27dFB33925c7d35A will auto-mint on approval (V1 behavior)
- New submissions on V2 will require manual claiming
- Users can see both in their collection

**Frontend Compatibility**:
- Collection page works with both V1 (auto-minted) and V2 (manual claim)
- Checks `blockchainStatus.nftClaimed` to show appropriate UI

## Future Enhancements

1. **Batch Claiming**: Allow users to claim multiple approved NFTs in one transaction
2. **Auto-Refresh**: Poll blockchain status every 30 seconds
3. **Notifications**: Alert user when their submission is approved
4. **Gas Estimation**: Show estimated gas cost before claiming
5. **Voting Modal**: Explain staking mechanics before submission

## Questions & Answers

**Q: What happens if I don't claim my NFT?**
A: It stays claimable forever. You can come back anytime to claim it.

**Q: Can someone else claim my NFT?**
A: No, only the original submitter can claim (enforced by `msg.sender == submission.submitter`).

**Q: What if my submission is rejected?**
A: Your stake is returned but you cannot claim an NFT. You can submit again with a different bug.

**Q: How much gas does claiming cost?**
A: Approximately 150k gas (~$3-5 on mainnet, ~$0.01 on Sepolia).

## Rollback Plan

If issues arise:
1. Keep V2 deployed but don't update frontend
2. Revert .env.local to old BugVoting address
3. Re-authorize old contract: `bugNFT.authorizeMinter(oldAddress)`
4. Investigate issue, fix, and redeploy
