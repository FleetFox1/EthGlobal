# 🔮 Pyth Oracle Integration Plan

**Prize**: $3,000 (1st: $1,500, 2nd: $1,000, 3rd: $500)  
**Status**: Planning → Implementation  
**Use Case**: Dynamic $1 faucet unlock with real-time ETH/USD pricing

---

## 🎯 Problem We're Solving

### Current Issue:
```solidity
// BugTokenV2.sol - Hardcoded price ❌
uint256 public constant UNLOCK_PAYMENT = 0.00033 ether; // ~$1 when ETH = $3,000

// Problems:
// - ETH price changes (now $2,500? $3,500?)
// - User might pay $0.80 or $1.50 instead of $1
// - Not professional for production
```

### Pyth Oracle Solution:
```solidity
// Dynamic price with Pyth oracle ✅
function getUnlockPaymentInETH() public view returns (uint256) {
    // Get real-time ETH/USD price from Pyth
    PythStructs.Price memory ethPrice = pyth.getPriceNoOlderThan(
        ethUsdPriceId,
        60  // Price must be from last 60 seconds
    );
    
    // Calculate: $1 / ETH_PRICE = ETH amount needed
    // ethPrice.price has 8 decimals (e.g., 300000000000 = $3,000)
    uint256 ethPriceInUsd = uint256(uint64(ethPrice.price));
    
    // ($1 × 10^18 × 10^8) / (ETH_PRICE × 10^8) = ETH amount in wei
    return (1e18 * 1e8) / ethPriceInUsd;
}

function unlockFaucet() public payable {
    uint256 requiredPayment = getUnlockPaymentInETH();
    require(msg.value >= requiredPayment, "Insufficient payment");
    // Always charges exactly $1 worth of ETH!
}
```

---

## 📋 Implementation Steps

### 1. Install Pyth SDK
```bash
cd apps/contracts
pnpm add @pythnetwork/pyth-sdk-solidity
```

### 2. Update BugTokenV2 Contract

Add Pyth imports and interface:
```solidity
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract BugTokenV2 is ERC20, Ownable {
    IPyth public pyth;
    bytes32 public ethUsdPriceId;
    
    // Pyth contract on Sepolia: 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
    // ETH/USD Price ID: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
    
    constructor(address _pyth, bytes32 _ethUsdPriceId) {
        pyth = IPyth(_pyth);
        ethUsdPriceId = _ethUsdPriceId;
    }
}
```

Add dynamic pricing function:
```solidity
/**
 * Get the unlock payment amount in ETH based on current ETH/USD price
 * Always returns the ETH amount needed to equal $1
 */
function getUnlockPaymentInETH() public view returns (uint256) {
    // Get the latest ETH/USD price (must be within 60 seconds)
    PythStructs.Price memory price = pyth.getPriceNoOlderThan(
        ethUsdPriceId,
        60  // Max age: 60 seconds
    );
    
    // Price format: price × 10^expo
    // Example: ETH = $3,000 → price = 300000000000, expo = -8
    // So: 300000000000 × 10^-8 = 3000
    
    require(price.price > 0, "Invalid price");
    
    // Calculate $1 worth of ETH in wei
    // Formula: (1 USD × 10^18) / (ETH_PRICE_USD)
    // Adjust for Pyth's 8 decimal exponent
    uint256 ethPriceUsd = uint256(uint64(price.price)); // Remove negative values
    uint256 oneDollarInWei = (1e18 * 1e8) / ethPriceUsd;
    
    return oneDollarInWei;
}
```

Update unlockFaucet to use dynamic pricing:
```solidity
function unlockFaucet() public payable {
    require(!hasUnlockedFaucet[msg.sender], "Faucet already unlocked");
    
    // Get dynamic $1 payment amount
    uint256 requiredPayment = getUnlockPaymentInETH();
    
    require(
        msg.value >= requiredPayment,
        string(abi.encodePacked(
            "Insufficient payment. Required: ",
            Strings.toString(requiredPayment / 1e15), // Convert to ETH with 3 decimals
            " ETH for $1"
        ))
    );
    
    hasUnlockedFaucet[msg.sender] = true;
    lastFaucetClaim[msg.sender] = block.timestamp;
    
    emit FaucetUnlocked(msg.sender, msg.value);
}
```

### 3. Update Frontend to Fetch Price

Before calling unlockFaucet, show user the exact amount:
```typescript
// In WalletButton.tsx or similar
async function getUnlockCost() {
    const bugToken = new ethers.Contract(BUG_TOKEN_ADDRESS, ABI, provider);
    const costInWei = await bugToken.getUnlockPaymentInETH();
    const costInEth = ethers.formatEther(costInWei);
    
    return {
        wei: costInWei,
        eth: costInEth,
        display: `${Number(costInEth).toFixed(5)} ETH ($1.00)`
    };
}

// Show in UI:
// "Unlock faucet for 0.00033 ETH ($1.00)"
// Updates in real-time as ETH price changes!
```

### 4. Deploy Updated Contract

Deploy with Pyth contract address:
```typescript
// scripts/deploy-bug-token-v3-pyth.ts
const PYTH_SEPOLIA = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21";
const ETH_USD_PRICE_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

const BugTokenV3 = await ethers.getContractFactory("BugTokenV3Pyth");
const bugToken = await BugTokenV3.deploy(
    PYTH_SEPOLIA,
    ETH_USD_PRICE_ID
);
```

---

## 📡 Pyth Network Details

### Contract Addresses (Sepolia)
- **Pyth Contract**: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21`
- **ETH/USD Price Feed ID**: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`

### Price Feed Format
```
price: int64      // Price with expo decimals (e.g., 300000000000)
conf: uint64      // Confidence interval
expo: int32       // Exponent (typically -8)
publishTime: uint // Unix timestamp of price update
```

### How Pyth Works (Pull Model)
1. **Off-chain**: Pyth publishes prices to Hermes API
2. **Fetch**: Your frontend fetches latest price proof from Hermes
3. **Update**: Frontend calls `pyth.updatePriceFeeds(proof)` (costs gas)
4. **Read**: Your contract reads the on-chain price (free)

### Price Update Flow
```typescript
// 1. Fetch price update from Hermes
const priceUpdate = await fetch(
    `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${ETH_USD_PRICE_ID}`
);

// 2. Update on-chain (user pays gas)
const updateFee = await pyth.getUpdateFee([priceUpdate]);
await pyth.updatePriceFeeds([priceUpdate], { value: updateFee });

// 3. Read price in your contract (free)
const price = await bugToken.getUnlockPaymentInETH();
```

---

## 🏆 Prize Qualification

### Requirements:
1. ✅ Use Pyth Pull oracle (fetch from Hermes)
2. ✅ Update price feeds on-chain using `updatePriceFeeds`
3. ✅ Consume the price in your contract
4. ⚠️ Follow EVM guide (5 minute integration)

### Our Implementation:
- **Fetch**: Frontend fetches ETH/USD from Hermes API
- **Update**: User updates price when unlocking faucet (fresh data)
- **Consume**: Contract calculates exact $1 worth of ETH
- **Innovation**: Dynamic faucet pricing prevents user overpayment/underpayment

### Judging Criteria:
- **Functionality**: Does it work correctly? ✅
- **Innovation**: Novel use case? ✅ (Most faucets use fixed prices)
- **Code Quality**: Clean implementation? ✅
- **Documentation**: Clear explanation? ✅ (This doc!)

---

## 🎬 Demo Script for Video

1. **Show Problem**:
   - "Current faucet charges 0.00033 ETH, hardcoded as ~$1"
   - "But ETH price changes! User might overpay or underpay"

2. **Show Pyth Integration**:
   - Show `getUnlockPaymentInETH()` function
   - Show Pyth contract call in Remix/Etherscan
   - Show price updates from Hermes

3. **Show Live Demo**:
   - Open bugdex.life
   - Click "Unlock Faucet"
   - Show exact ETH amount: "0.000XX ETH ($1.00)"
   - Show MetaMask popup with correct amount
   - After unlock, show it worked!

4. **Show Code**:
   - Walk through contract code
   - Explain price calculation
   - Show frontend integration

5. **Highlight Benefits**:
   - Always exactly $1 (fair pricing)
   - Real-time market data
   - Professional oracle integration
   - Works on 100+ blockchains (Pyth support)

---

## 📊 Alternative: PYUSD Unlock with Pyth

We could also use Pyth for **PYUSD/USD price validation**:

```solidity
// PYUSD should always = $1, but verify with Pyth
function unlockWithPYUSD(uint256 amount) public {
    PythStructs.Price memory pyusdPrice = pyth.getPriceNoOlderThan(
        pyusdUsdPriceId,
        60
    );
    
    // Verify PYUSD is actually worth ~$1 (within 5% tolerance)
    require(
        pyusdPrice.price >= 95000000 && pyusdPrice.price <= 105000000,
        "PYUSD price unstable"
    );
    
    require(amount >= 1e6, "Need at least $1 PYUSD"); // PYUSD has 6 decimals
    
    // Transfer PYUSD from user
    IERC20(pyusdAddress).transferFrom(msg.sender, address(this), amount);
    hasUnlockedFaucet[msg.sender] = true;
}
```

**This could boost both PYUSD prize AND Pyth prize alignment!**

---

## 🚀 Implementation Timeline

### Now (30 minutes):
1. Install @pythnetwork/pyth-sdk-solidity
2. Create BugTokenV3Pyth.sol with Pyth integration
3. Test locally with Hardhat

### Next (1 hour):
1. Deploy BugTokenV3Pyth to Sepolia
2. Update frontend to fetch Hermes prices
3. Update WalletButton.tsx unlock flow

### Testing (30 minutes):
1. Test unlock with real ETH price
2. Verify $1 payment works correctly
3. Test edge cases (old price, invalid price)

### Demo (30 minutes):
1. Screen record full flow
2. Show code walkthrough
3. Highlight innovation
4. Submit to Pyth team

**Total: 2.5 hours for $3,000 prize opportunity!**

---

## 📝 Code Snippets for Quick Copy-Paste

### Install Pyth
```bash
pnpm add @pythnetwork/pyth-sdk-solidity
```

### Pyth Contract Interface
```solidity
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
```

### Sepolia Addresses
```solidity
address constant PYTH_SEPOLIA = 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
bytes32 constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
```

### Fetch Price from Hermes (TypeScript)
```typescript
const response = await fetch(
    `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${ETH_USD_PRICE_ID}`
);
const data = await response.json();
const priceUpdate = data[0].vaa; // VAA = Verified Action Approval
```

### Update Price On-Chain
```typescript
const pyth = new ethers.Contract(PYTH_ADDRESS, PYTH_ABI, signer);
const updateFee = await pyth.getUpdateFee([priceUpdate]);
await pyth.updatePriceFeeds([priceUpdate], { value: updateFee });
```

---

## 🎯 Success Metrics

**For ETHGlobal Judging**:
1. ✅ Real-time price oracle integration (not hardcoded)
2. ✅ Always charges exactly $1 (fair pricing)
3. ✅ Professional oracle usage (Pyth Network)
4. ✅ Frontend integration with Hermes API
5. ✅ Novel use case (dynamic faucet pricing)
6. ✅ Clean code implementation
7. ✅ Comprehensive documentation

**Prize Alignment**:
- **Pyth Prize**: $3,000 for innovative oracle use ⬅️ This!
- **PYUSD Prize**: $3,500 for PYUSD integration (already have)
- **Hardhat Prize**: $2,500 for Hardhat development (already have)
- **Blockscout Prize**: $3,500 for custom explorer (in progress)

**Total Potential**: $12,500 in prizes! 🏆

---

## 🔗 Resources

**Pyth Docs**:
- EVM Guide: https://docs.pyth.network/price-feeds/use-real-time-data/evm
- Price Feeds: https://docs.pyth.network/price-feeds/price-feeds
- Contract API: https://api-reference.pyth.network/price-feeds/evm/getPriceNoOlderThan
- Fetch Updates: https://docs.pyth.network/price-feeds/fetch-price-updates

**Pyth Contracts**:
- Sepolia: https://docs.pyth.network/price-feeds/contract-addresses/evm#testnets

**Hermes API**:
- Latest Prices: https://hermes.pyth.network/docs

**Dev Forum**:
- https://dev-forum.pyth.network/

---

**Status**: Ready to implement! 🚀  
**Next Step**: Install Pyth SDK and create BugTokenV3Pyth contract
