# BugDex Contract Versions

## Current Deployment (Sepolia Testnet)

### ✅ LIVE CONTRACTS:
- **BugToken**: `0x30E5178756aE1db0DEb1FD61f1B4CCB9b756f926`
- **BugNFT**: `0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267`
- **BugVoting**: `0x85E82a36fF69f85b995eE4de27dFB33925c7d35A`

### Features:
- Free faucet (100 BUG every 24 hours)
- Bug submission and voting
- NFT minting on approval
- Token rewards for voting

---

## Contract Files

### `BugToken.sol` (DEPLOYED)
- Current production version
- Simple free faucet system
- Matches deployed contract

### `BugTokenPaid.sol` (FUTURE)
- Enhanced version with PYUSD payments
- First claim: FREE
- Additional claims: 1 PYUSD = 100 BUG
- Ready to deploy when needed

### `MockPYUSD.sol` (READY)
- Test PYUSD token
- For use with BugTokenPaid.sol
- Includes public faucet for testing

---

## Deployment Commands

### Current Setup (Already Deployed):
```bash
# This is what's currently live
npx hardhat run --network sepolia scripts/deploy.ts
```

### Future PYUSD Version:
```bash
# When ready to deploy paid version:
# 1. Update deploy.ts to use BugTokenPaid
# 2. Deploy MockPYUSD first
# 3. Deploy BugTokenPaid with PYUSD address
```

---

## Why Two Versions?

**Decision:** Focus on core functionality first
- Current deployment works perfectly
- Avoids address changes during hackathon
- PYUSD version ready when needed
- Can show both versions to judges

---

## Testing

### Test Current Deployment:
```bash
npx hardhat console --network sepolia

const bugToken = await ethers.getContractAt("BugToken", "0x30E5178756aE1db0DEb1FD61f1B4CCB9b756f926");
await bugToken.claimFaucet();
```

### Test Future PYUSD Version (Local):
```bash
npx hardhat test
# Tests for BugTokenPaid in test/ directory
```

---

## Next Steps

1. ✅ Current contracts deployed and working
2. ⏳ Test frontend with current deployment
3. ⏳ Complete core features (scan, vote, mint)
4. ⏳ Optional: Deploy PYUSD version if time permits
