# 🎉 BugTokenV2 DEPLOYED TO SEPOLIA!

## ✅ Deployment Success

**Deployed:** October 14, 2025 at 03:03:58 UTC  
**Network:** Sepolia Testnet  
**Deployer:** 0x71940fd31a77979F3a54391b86768C661C78c263

## 📋 Contract Addresses

| Contract | Address |
|----------|---------|
| **BugTokenV2** | `0x431185c8d1391fFD2eeB2aA4870015a1061f03e1` |
| **PYUSD** | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` |

## 🔗 View on Etherscan

- **BugTokenV2**: https://sepolia.etherscan.io/address/0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
- **PYUSD**: https://sepolia.etherscan.io/address/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

## 💰 Pricing Configuration

- **ETH Unlock:** 0.00033 ETH (~$1)
- **PYUSD Unlock:** 1.00 PYUSD
- **Faucet Reward:** 100 BUG per claim
- **Cooldown:** 24 hours between claims
- **Initial Supply:** 10,000,000 BUG (to deployer)
- **Max Supply:** 100,000,000 BUG

## ✅ Frontend Updated

Your `apps/web/.env.local` has been updated with:
```bash
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x431185c8d1391fFD2eeB2aA4870015a1061f03e1
NEXT_PUBLIC_PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

## 🚀 Test It Now!

### 1. Restart Your Dev Server

```powershell
cd c:\EthGlobal\apps\web
npm run dev
```

### 2. Open http://localhost:3000

### 3. Test the Flow

1. **Connect Wallet** (Sepolia network)
2. **Click Faucet Button** → Should show "Unlock for $1"
3. **Choose ETH or PYUSD**
4. **Confirm Transaction**
5. **Receive 100 BUG tokens!** ✅

## 📊 What Happens When Users Pay

### ETH Payment:
```
User pays 0.00033 ETH → Gas pool immediately ✅
```

### PYUSD Payment:
```
User pays 1 PYUSD → PYUSD pool → You convert manually later
```

## 🔧 Check Pool Status (Owner)

```typescript
const stats = await bugToken.getPoolStats();
// Returns: [ethBalance, pyusdPool, gasPool]
```

## 🎯 Success!

Your $1 unlock system is LIVE on Sepolia! 🚀

Users can now:
- Pay $1 ONE TIME (ETH or PYUSD)
- Get unlimited 100 BUG claims (24h cooldown)
- Help fund the gas pool for future operations

Time to test it in your browser!
