# 🚀 Deploying to Sepolia: Simple Guide

## What You Need to Enter

### Just ONE thing: The PYUSD Contract Address

```typescript
const PYUSD_SEPOLIA = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
```

**That's it!** This is PayPal's official PYUSD testnet contract. It's public - everyone uses the same address.

---

## 🔄 How Payments Work (Automatic vs Manual)

### ✅ ETH Payments (Fully Automatic)

```
User pays 0.00033 ETH
        ↓
Goes to BugTokenV2 contract
        ↓
AUTOMATICALLY added to gasPool ✅
        ↓
Ready to fund gas subsidies!
```

**No action needed from you!**

### ⏳ PYUSD Payments (Manual Conversion)

```
User pays 1.00 PYUSD
        ↓
Goes to BugTokenV2 contract
        ↓
Stored in pyusdPool (tracked)
        ↓
YOU manually convert later:
  1. Call withdrawPYUSD() → Get PYUSD to your wallet
  2. Swap on Uniswap/CEX → Get ETH
  3. Call depositToGasPool() → Send ETH back
        ↓
Now in gasPool ✅
        ↓
Ready to fund gas subsidies!
```

**You convert weekly/monthly in batches (cheaper than auto-converting each payment)**

---

## 💡 Why Not Auto-Convert PYUSD?

### Auto-conversion would cost:

- 🔴 **~$5-15 in gas** per conversion (Uniswap swap costs)
- 🔴 **Slippage** (might lose 1-5% in the swap)
- 🔴 **Complex code** (more bugs, more auditing)

### Manual conversion costs:

- ✅ **$0** (you pay gas once for many conversions)
- ✅ **Better rates** (use CEX or wait for good prices)
- ✅ **Simple code** (less risk)

**Math:** If you collect 100 PYUSD payments ($100), better to convert once than pay $500-1500 in gas!

---

## 🎯 What "Gas Credits" Actually Means

You mentioned "10 free gas credits" - let me clarify:

### NOT: "Users get 10 free transactions"
That would cost you ~$30 per user (0.001 ETH × 10 txs × $3000/ETH)

### YES: "Gas pool funds subsidized operations"

The $0.35 from each $1 payment goes to a pool that you use to:
- Pay for gasless voting (you relay their vote)
- Pay for gasless NFT claims (you relay their claim)
- Pay for backend operations

**Users don't get 10 separate transactions** - they get unlimited FREE claims and votes because YOU pay the gas from the pool!

---

## 📊 Economics Breakdown

### Each $1 User Pays:

| Amount | Purpose |
|--------|---------|
| $0.35 | 100 BUG tokens (initial gift) |
| $0.35 | Gas pool (for subsidizing their future interactions) |
| $0.30 | Your profit / operational costs |

### The Gas Pool Funds:

1. **Gasless Claims** - User calls claimFaucet(), you pay ~$0.05 gas
   - One $1 unlock = 7 gasless claims funded
   
2. **Gasless Voting** - User votes, you relay it, you pay ~$0.10 gas
   - One $1 unlock = 3.5 gasless votes funded

3. **Gasless NFT Claims** - User claims NFT, you pay ~$0.15 gas
   - One $1 unlock = 2.3 gasless NFT claims funded

**Total: Each user's $1 pays for ~10-15 subsidized interactions!**

---

## 🛠️ The Owner Functions You'll Use

### View Current Pools

```typescript
// Check how much is collected
const stats = await bugToken.getPoolStats();
console.log("ETH in contract:", ethers.formatEther(stats[0]));
console.log("PYUSD collected:", ethers.formatUnits(stats[1], 6));
console.log("Gas pool (ready):", ethers.formatEther(stats[2]));
```

### Convert PYUSD to ETH (Weekly Task)

```typescript
// Step 1: Withdraw PYUSD from contract
await bugToken.withdrawPYUSD(yourWalletAddress);
// You now have PYUSD in your wallet

// Step 2: Swap on Uniswap or CEX
// (Do this manually on Uniswap.com or send to Coinbase)

// Step 3: Deposit ETH back to gas pool
await bugToken.depositToGasPool({ value: ethers.parseEther("0.1") });
```

### Use Gas Pool for Operations

```typescript
// Withdraw from gas pool to pay for relayer service
await bugToken.withdrawFromGasPool(relayerAddress, ethers.parseEther("0.5"));
```

---

## 🚀 Deployment Steps

### 1. Make Sure You Have Test PYUSD

```powershell
# Open MetaMask
# Switch to Sepolia
# Import token: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
# Check your balance (should see PYUSD amount)
```

### 2. Deploy BugTokenV2

```powershell
cd c:\EthGlobal\apps\contracts
npx hardhat run scripts\deploy-token-v2.ts --network sepolia
```

This will output:
```
BugTokenV2 deployed to: 0xYourNewContractAddress
```

### 3. Update Frontend

Edit `c:\EthGlobal\apps\web\.env.local`:
```bash
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xYourNewContractAddress
NEXT_PUBLIC_PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

### 4. Restart Dev Server

```powershell
cd c:\EthGlobal\apps\web
npm run dev
```

### 5. Test It!

1. Go to your app in browser
2. Connect wallet (make sure on Sepolia)
3. Click "Unlock Faucet"
4. Choose ETH or PYUSD
5. Pay $1
6. Check you got 100 BUG tokens ✅

---

## ✅ Summary: What You Need to Know

1. **To Deploy:** Just use PYUSD address `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

2. **ETH Payments:** Automatically go to gas pool ✅

3. **PYUSD Payments:** You convert manually (better economics)

4. **Gas Pool Usage:** Funds subsidized operations for ALL users

5. **No Auto-Conversion:** Too expensive, manual is better for MVP

6. **Your Weekly Task:** 
   - Check pyusdPool balance
   - Withdraw PYUSD
   - Swap to ETH
   - Deposit back to gas pool

That's it! Ready to deploy? 🎯
