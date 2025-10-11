# 🐛 BugDex Smart Contracts

Smart contracts for the BugDex bug collection platform - ETHGlobal 2025

## 📦 Contracts

### BugToken.sol (ERC-20)
**Purpose**: Native token for the BugDex ecosystem

**Features**:
- ✅ Faucet system - Claim 100 BUG tokens once per day
- ✅ Max supply: 100M BUG
- ✅ Authorized minters for rewards
- ✅ Owner controls

**Key Functions**:
```solidity
claimFaucet() - Claim 100 BUG (once per day)
mint(address, amount) - Mint tokens (authorized only)
addMinter(address) - Add authorized minter
```

---

### BugNFT.sol (ERC-721)
**Purpose**: NFT collection for discovered bugs

**Features**:
- ✅ IPFS metadata storage
- ✅ Rarity system (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
- ✅ Track discoverer and discovery time
- ✅ Verification system
- ✅ Vote count tracking

**Key Functions**:
```solidity
mintBug(address, ipfsHash, rarity, voteCount) - Mint bug NFT
getBugsByDiscoverer(address) - Get all bugs by user
getBugMetadata(tokenId) - Get full bug metadata
```

---

### BugVoting.sol
**Purpose**: Community voting system for bug submissions

**Features**:
- ✅ Stake 10 BUG to vote
- ✅ 5 vote threshold for approval
- ✅ 3 day voting period
- ✅ 5 BUG reward per successful vote
- ✅ Auto-resolution when threshold met
- ✅ Stake refund if rejected

**Key Functions**:
```solidity
submitBug(ipfsHash, rarity) - Submit for voting
vote(submissionId, voteFor) - Cast vote
getActiveSubmissions() - Get current votes
```

**Voting Flow**:
1. User submits bug with IPFS hash
2. Community votes (stake 10 BUG)
3. If 5+ approve → Mint NFT + Reward voters
4. If 5+ reject → Return stakes
5. Voters earn 5 BUG for approved submissions

---

## 🚀 Quick Start

### Install Dependencies
```bash
cd apps/contracts
pnpm install
```

### Compile Contracts
```bash
pnpm compile
```

### Run Tests
```bash
pnpm test
```

### Deploy Locally
```bash
# Terminal 1: Start local node
pnpm run node

# Terminal 2: Deploy contracts
pnpm run deploy:local
```

---

## 🧪 Testing

Current test suite: **8 passing tests**

```bash
pnpm test
```

Tests cover:
- ✅ Token deployment and faucet
- ✅ NFT minting and metadata
- ✅ Voting and threshold mechanics
- ✅ Authorization and access control

---

## 📊 Contract Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **Vote Stake** | 10 BUG | Amount to vote |
| **Vote Threshold** | 5 votes | Votes needed to approve |
| **Voting Period** | 3 days | Time to vote |
| **Vote Reward** | 5 BUG | Reward per successful vote |
| **Faucet Amount** | 100 BUG | Free tokens |
| **Faucet Cooldown** | 1 day | Claim frequency |
| **Max Supply** | 100M BUG | Total token cap |

---

## 🔗 Deployment

### Local Hardhat Network
```bash
pnpm run deploy:local
```

### Sepolia Testnet
1. Add to `hardhat.config.ts`:
   ```typescript
   sepolia: {
     url: process.env.SEPOLIA_RPC_URL,
     accounts: [process.env.PRIVATE_KEY],
   }
   ```

2. Create `.env`:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_private_key
   ```

3. Deploy:
   ```bash
   pnpm run deploy:sepolia
   ```

### Deployment Output
After deployment, you'll get:
- Contract addresses (saved to `deployment.json`)
- Network info
- Configuration summary

---

## 🔌 Integration with Frontend

### Contract Addresses
After deployment, use addresses from `deployment.json`:

```typescript
const CONTRACTS = {
  BugToken: "0x...",
  BugNFT: "0x...",
  BugVoting: "0x...",
};
```

### ABI Files
Located in `artifacts/contracts/`:
- `BugToken.sol/BugToken.json`
- `BugNFT.sol/BugNFT.json`
- `BugVoting.sol/BugVoting.json`

### Example Usage
```typescript
import { ethers } from "ethers";
import BugTokenABI from "./BugToken.json";

const bugToken = new ethers.Contract(
  CONTRACTS.BugToken,
  BugTokenABI.abi,
  signer
);

// Claim from faucet
await bugToken.claimFaucet();

// Check balance
const balance = await bugToken.balanceOf(userAddress);
```

---

## 📝 Architecture

```
┌─────────────┐
│  BugToken   │  ← ERC-20 token with faucet
│   (BUG)     │
└─────────────┘
       ↓ authorized minter
┌─────────────┐     ┌─────────────┐
│  BugVoting  │ ←→  │   BugNFT    │  ← ERC-721 collection
│   (Vote)    │     │  (BUGDEX)   │
└─────────────┘     └─────────────┘
       ↓ authorized minter
    Rewards
```

**Flow**:
1. Users claim BUG from faucet
2. Submit bug to BugVoting with IPFS hash
3. Community votes by staking BUG
4. If approved → BugNFT minted + voters rewarded
5. Voters earn BUG tokens for participation

---

## 🛡️ Security

- ✅ OpenZeppelin v5.0 contracts
- ✅ ReentrancyGuard on voting
- ✅ Access control (Ownable)
- ✅ Authorized minter pattern
- ✅ Max supply caps
- ✅ Cooldown periods

---

## 🔮 Future Enhancements

- [ ] PYUSD integration for payments
- [ ] Bug trading marketplace
- [ ] Staking mechanisms
- [ ] Governance features
- [ ] Multi-chain deployment
- [ ] Gas optimization

---

## 📚 Resources

- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)

---

**Built for ETHGlobal 2025** 🚀
