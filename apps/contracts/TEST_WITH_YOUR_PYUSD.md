# Testing BugTokenV2 with Your Real PYUSD

Since you already have test PYUSD in your admin account, we'll test with that!

## Prerequisites

✅ You have test ETH in your deployer account  
✅ You have test PYUSD in your deployer account  
✅ You know your PYUSD contract address

## Quick Test (3 Steps)

### Step 1: Add Your PYUSD Address

Edit `apps/contracts/scripts/test-token-v2-with-real-pyusd.ts` and replace:

```typescript
const EXISTING_PYUSD = "PASTE_YOUR_PYUSD_ADDRESS_HERE";
```

With your actual PYUSD address:

```typescript
const EXISTING_PYUSD = "0xYourActualPYUSDAddress";
```

Or create a `.env` file in `apps/contracts`:

```bash
PYUSD_ADDRESS=0xYourActualPYUSDAddress
```

### Step 2: Start Local Node

```bash
cd apps/contracts
npx hardhat node
```

Leave this terminal running.

### Step 3: Run the Test (new terminal)

```bash
cd apps/contracts
npx hardhat run scripts/test-token-v2-with-real-pyusd.ts --network localhost
```

## What Gets Tested

The script will test with YOUR account:

1. **Check Your Balances**
   - Shows your ETH balance
   - Shows your PYUSD balance

2. **Deploy BugTokenV2**
   - Uses your real PYUSD address
   - Deploys new token contract

3. **Unlock with ETH**
   - You pay 0.00033 ETH (~$1)
   - You get unlocked + 100 BUG
   - Gas pool gets funded

4. **Claim from Faucet**
   - You claim another 100 BUG
   - Tests cooldown (24h wait)

5. **Optional: Test PYUSD Unlock**
   - Uncomment the code if you want to test
   - Pays 1 PYUSD (~$1)
   - PYUSD pool gets funded

6. **Check Pool Stats**
   - Shows ETH collected
   - Shows PYUSD collected
   - Shows gas pool balance

## Expected Output

```
🧪 Testing BugTokenV2 with YOUR test PYUSD...

Deployer (you): 0xYourAddress
Your ETH balance: 1.5
Your PYUSD balance: 50.0

Using your PYUSD at: 0xYourPYUSDAddress

📝 Deploying BugTokenV2...
✅ BugTokenV2 deployed to: 0xNewContractAddress

🔓 Test 1: You unlock with ETH
- Your unlock status: false
- Sending 0.00033 ETH (~$1)...
- Transaction sent: 0xTxHash
✅ You unlocked!
- Your unlock status: true
- Your BUG balance: 100.0
- Gas pool balance: 0.00033 ETH

🎰 Test 2: Claim from faucet
- BUG balance before: 100.0
✅ Claimed!
- BUG balance after: 200.0
- Received: 100.0 BUG

⏰ Test 3: Try to claim again (should fail)
✅ Correctly rejected - cooldown active (need to wait 24h)

🔓 Test 4: Test PYUSD unlock (optional)
- You have enough PYUSD to test!
- Would you like to test PYUSD unlock?
- Uncomment the code below to test PYUSD unlock

📊 Test 5: Pool Statistics
- Contract ETH balance: 0.00033
- Contract PYUSD balance: 0.0
- Gas pool (ETH for operations): 0.00033

🔍 Test 6: Can Claim Status
- Can claim now: false
- Time until next claim: 24.00 hours

🎉 All tests passed!

📋 Summary:
===========
BugTokenV2: 0xNewContractAddress
Your PYUSD: 0xYourPYUSDAddress
Your BUG balance: 200.0
Gas pool collected: 0.00033 ETH

💡 To use in frontend (.env.local):
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xNewContractAddress
NEXT_PUBLIC_PYUSD_ADDRESS=0xYourPYUSDAddress

🚀 Next steps:
1. Update apps/web/.env.local with addresses above
2. Restart dev server: npm run dev
3. Connect wallet in browser
4. Try unlocking faucet with ETH or PYUSD!
```

## After Testing Locally

Once everything works on localhost:

1. **Deploy to Sepolia** (or your testnet):
   ```bash
   npx hardhat run scripts/deploy-token-v2.ts --network sepolia
   ```

2. **Update Frontend** `.env.local`:
   ```bash
   NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xYourSepoliaAddress
   NEXT_PUBLIC_PYUSD_ADDRESS=0xYourSepoliaPYUSDAddress
   ```

3. **Test in Browser**:
   - Connect wallet
   - Switch to Sepolia network
   - Try unlocking with ETH or PYUSD!

## Troubleshooting

### "PYUSD_ADDRESS not set"
- Add your PYUSD address to the script or .env file

### "insufficient funds"
- Make sure you have at least 0.001 ETH in your deployer account
- Check your PYUSD balance is at least 1 PYUSD

### "nonce too high"
- Reset your MetaMask: Settings → Advanced → Clear activity tab data

### Want to test PYUSD unlock?
- Open `scripts/test-token-v2-with-real-pyusd.ts`
- Find the commented code in Test 4
- Uncomment the lines between `/*` and `*/`
- Run the test again

## Why This Approach?

✅ **Real PYUSD** - Tests with actual token contract  
✅ **Your Account** - Uses your admin/deployer wallet  
✅ **Safe Testing** - Local Hardhat network (free, no real money)  
✅ **Quick Validation** - Verify everything works before Sepolia  
✅ **Pool Mechanics** - See exactly where payments go  

After successful local testing, you'll be confident deploying to Sepolia! 🚀
