# Smart Contract Versions - BugDex

## 🎯 Current Active Contracts (Sepolia)

### BugTokenV3 - ERC20 with Pyth Oracle ⭐ ACTIVE
**Address**: `0x5f7421B1e03D644CaFD3B13b2da2557748571a67`  
**Deployed**: October 25, 2025  
**Features**:
- ✅ **Pyth Network oracle integration** for dynamic ETH/USD pricing
- ✅ PYUSD unlock option (stable $1 payment)
- ✅ Always charges exact $1 worth of ETH (no hardcoded price)
- ✅ Unlimited faucet claims after unlock (24h cooldown)
- ✅ 100 BUG per claim

**Prize Tracks**: PYUSD ($3,500) + Pyth Network ($2,000)

**Key Functions**:
```solidity
function getETHUnlockCost() public view returns (uint256)  // Returns dynamic ETH amount for $1
function unlockWithETH() external payable                   // Pay ETH to unlock (dynamic price)
function unlockWithPYUSD() external                         // Pay 1 PYUSD to unlock
function claimFaucet() external                             // Claim 100 BUG (24h cooldown)
```

**Pyth Oracle**:
- Contract: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21` (Sepolia)
- Price Feed: ETH/USD (`0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`)

---

### BugNFT v2 - Public Minting Enabled ⭐ ACTIVE
**Address**: `0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF`  
**Deployed**: October 25, 2025  
**Features**:
- ✅ **Public minting enabled** - anyone can mint approved bugs (no authorization needed!)
- ✅ Rarity tiers based on vote count: Common, Uncommon, Rare, Epic, Legendary
- ✅ IPFS metadata storage
- ✅ On-chain rarity tracking

**Key Functions**:
```solidity
function mintBug(address to, string memory ipfsHash, Rarity rarity, uint256 voteCount) external
function enablePublicMinting() external onlyOwner
function disablePublicMinting() external onlyOwner
```

**Rarity Calculation**:
- Common: 0-1 votes
- Uncommon: 2-4 votes
- Rare: 5-9 votes
- Epic: 10-19 votes
- Legendary: 20+ votes

---

### BugSubmissionStaking - Voting System ⭐ ACTIVE
**Address**: `0x68E8DF1350C3500270ae9226a81Ca1771F2eD542`  
**Features**:
- ✅ Stake 10 BUG to submit for voting
- ✅ Earn 5 BUG per upvote received
- ✅ Stake returned after voting ends
- ✅ Approved if 2+ net votes (votesFor - votesAgainst >= 2)

**Key Functions**:
```solidity
function stakeAndSubmit(string memory ipfsHash) external
function claimRewards(uint256 submissionId) external
```

**Rewards Formula**: `totalRewards = 10 BUG (stake) + (5 BUG × upvotes)`

---

### BugVotingV2 - Off-Chain Voting ⭐ ACTIVE
**Address**: `0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9`  
**Features**:
- ✅ Free voting (no gas fees!)
- ✅ EIP-712 signature-based voting
- ✅ Backend verification and storage

---

### Other Active Contracts
- **UserProfileRegistry**: `0xEa53a1898E8ad17e672b28BbB724CD7Ca56F1e60`
- **PYUSD (Sepolia)**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Pyth Oracle (Sepolia)**: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21`

---

## 📜 Deprecated Contracts

### BugTokenV2 - Hardcoded ETH Price ❌ DEPRECATED
**Address**: `0x431185c8d1391fFD2eeB2aA4870015a1061f03e1`  
**Deployed**: October 14, 2025  
**Reason**: Hardcoded ETH unlock cost (0.00033 ETH) breaks when ETH price changes  
**Replaced By**: BugTokenV3 with Pyth oracle

**Issues**:
- ❌ Fixed 0.00033 ETH = $1 assumption
- ❌ No price oracle integration
- ❌ Not accurate when ETH price changes

---

### BugTokenV1 - First Iteration ❌ DEPRECATED
**Address**: `0x30E5178756aE1db0DEb1FD61f1B4CCB9b756f926`  
**Reason**: Basic faucet without unlock system  
**Replaced By**: BugTokenV2 (then V3)

---

### BugNFT v1 - Authorization Required ❌ DEPRECATED
**Address**: `0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267`  
**Deployed**: October 14, 2025  
**Reason**: Only authorized addresses could mint (partner couldn't mint!)  
**Replaced By**: BugNFT v2 with public minting flag

**Issues**:
- ❌ Required `authorizeMinter(address)` for each user
- ❌ ZeroAddress trick didn't work (contract checks msg.sender)
- ❌ Not decentralized - admin intervention needed

---

### BugVoting v1 - Gas Fees ❌ DEPRECATED
**Address**: `0x85E82a36fF69f85b995eE4de27dFB33925c7d35A`  
**Reason**: On-chain voting required gas fees for every vote  
**Replaced By**: BugVotingV2 with off-chain signatures

---

## 🔄 Migration Guide

### For Existing Users

**If you unlocked with V2**:
- ✅ Your unlock status is NOT transferable to V3
- ⚠️ You'll need to unlock again with V3 to use new features
- 💡 V3 charges exact $1 (may be cheaper or more expensive than V2 depending on ETH price)

**If you minted NFTs with V1**:
- ✅ Your old NFTs still exist and are valid
- ✅ You can mint new NFTs with V2 (no authorization needed!)
- ✅ Old and new NFTs both display in collection page

### For Developers

**Environment Variables** (use V3 and NFT V2):
```bash
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x5f7421B1e03D644CaFD3B13b2da2557748571a67
NEXT_PUBLIC_BUG_NFT_ADDRESS=0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF
NEXT_PUBLIC_STAKING_ADDRESS=0x68E8DF1350C3500270ae9226a81Ca1771F2eD542
NEXT_PUBLIC_VOTING_ADDRESS=0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9
```

**Backup Variables** (keep old contracts as fallback):
```bash
NEXT_PUBLIC_BUG_TOKEN_V2_ADDRESS=0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
NEXT_PUBLIC_BUG_TOKEN_V3_ADDRESS=0x5f7421B1e03D644CaFD3B13b2da2557748571a67
NEXT_PUBLIC_BUG_NFT_V1_ADDRESS=0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267
NEXT_PUBLIC_BUG_NFT_V2_ADDRESS=0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF
```

---

## 🚀 Deployment Timeline

| Date | Contract | Version | Change |
|------|----------|---------|--------|
| Oct 14, 2025 | BugToken | V1 | Initial deployment |
| Oct 14, 2025 | BugToken | V2 | Added PYUSD unlock system |
| Oct 14, 2025 | BugNFT | V1 | Initial NFT contract |
| Oct 25, 2025 | BugNFT | V2 | **Public minting enabled** |
| Oct 25, 2025 | BugToken | V3 | **Pyth oracle integration** 🎯 |

---

## 💰 Prize Track Integration

### PYUSD ($3,500)
**Contract**: BugTokenV3  
**Feature**: Users pay 1 PYUSD to unlock faucet  
**Status**: ✅ Working

### Blockscout ($3,500)
**Explorer**: https://bugdex-explorer.cloud.blockscout.com/  
**Integration**: Transaction popups after staking/minting  
**Status**: ✅ Working

### Pyth Network ($2,000)
**Contract**: BugTokenV3  
**Feature**: Dynamic ETH/USD pricing via oracle  
**Oracle**: 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21  
**Status**: ✅ Working

**Total Prize Value**: $9,000

---

## 🔍 Verification

All contracts deployed on Sepolia testnet (Chain ID: 11155111)

**Verify Contracts**:
```bash
# View on Blockscout
https://bugdex-explorer.cloud.blockscout.com/address/0x5f7421B1e03D644CaFD3B13b2da2557748571a67  # BugTokenV3
https://bugdex-explorer.cloud.blockscout.com/address/0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF  # BugNFT v2
https://bugdex-explorer.cloud.blockscout.com/address/0x68E8DF1350C3500270ae9226a81Ca1771F2eD542  # Staking
```

**Test Price Feed**:
```bash
cd apps/contracts
pnpm hardhat run scripts/test-pyth-price.ts --network sepolia
```

---

## 📚 Related Documentation

- `PROJECT_SUMMARY.md` - Complete project overview
- `apps/contracts/README.md` - Deployment instructions
- `apps/contracts/scripts/deploy-v3-token.ts` - V3 deployment script
- `apps/contracts/scripts/redeploy-nft.ts` - NFT v2 deployment script

---

**Last Updated**: October 25, 2025  
**Deployer**: 0x71940fd31a77979F3a54391b86768C661C78c263  
**Network**: Sepolia (11155111)
