# Quick Start: Test BugTokenV2 Payment System

## 🚀 Simplest Way (No Setup Needed!)

The test script will automatically deploy MockPYUSD for you!

### Step 1: Start Hardhat
```powershell
cd c:\EthGlobal\apps\contracts
npx hardhat node
```
Keep this running. Open a **new terminal** for step 2.

### Step 2: Run the Test
```powershell
cd c:\EthGlobal\apps\contracts
npx hardhat run scripts\test-token-v2-with-real-pyusd.ts --network localhost
```

That's it! The script will:
- ✅ Deploy MockPYUSD automatically
- ✅ Give you 1,000,000 test PYUSD
- ✅ Test ETH unlock ($1 payment)
- ✅ Test faucet claims
- ✅ Show you the contract addresses for frontend

## 📱 What You'll See

```
🧪 Testing BugTokenV2 with YOUR test PYUSD...

Deployer (you): 0xYourAddress
Your ETH balance: 10000.0

📝 Deploying MockPYUSD for testing...
✅ MockPYUSD deployed to: 0xMockPYUSDAddress
   Your MockPYUSD balance: 1000000.0

Using PYUSD at: 0xMockPYUSDAddress
Your PYUSD balance: 1000000.0

📝 Deploying BugTokenV2...
✅ BugTokenV2 deployed to: 0xBugTokenAddress

🔓 Test 1: You unlock with ETH
✅ You unlocked!
- Your BUG balance: 100.0
- Gas pool balance: 0.00033 ETH

🎰 Test 2: Claim from faucet
✅ Claimed!
- Received: 100.0 BUG

⏰ Test 3: Try to claim again (should fail)
✅ Correctly rejected - cooldown active

🎉 All tests passed!

💡 To use in frontend (.env.local):
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xBugTokenAddress
NEXT_PUBLIC_PYUSD_ADDRESS=0xMockPYUSDAddress
```

## 🌐 For Sepolia Testnet (Later)

When you're ready to deploy to Sepolia:

1. **Get real test PYUSD:**
   - Go to https://faucet.circle.com/
   - Select Sepolia + PYUSD
   - Enter your wallet: `0x71940fd31a77979F3a54391b86768C661C78c263`

2. **Set PYUSD address in .env:**
   ```bash
   # apps/contracts/.env
   PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
   ```

3. **Deploy to Sepolia:**
   ```powershell
   npx hardhat run scripts\deploy-token-v2.ts --network sepolia
   ```

## ❓ FAQs

**Q: Do I need to get PYUSD from somewhere?**  
A: No! The script deploys MockPYUSD automatically for local testing.

**Q: What's the difference between MockPYUSD and real PYUSD?**  
A: MockPYUSD is just for testing on local Hardhat. Real PYUSD is on Sepolia/Mainnet.

**Q: Is my wallet address the same as PYUSD address?**  
A: No! Your wallet address is `0x7194...c263`. PYUSD contract address is public (like `0xCaC5...3bB9`).

**Q: Where do I get the PYUSD contract address?**  
A: For local testing - it's deployed automatically! For Sepolia - use `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

## 🎯 Understanding Contract Addresses

- **Your Wallet Address**: `0x71940fd31a77979F3a54391b86768C661C78c263` (private, yours)
- **PYUSD Contract Address**: Public address where PYUSD token logic lives
  - Local: Deployed automatically by test script
  - Sepolia: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (PayPal's official testnet)
- **BugTokenV2 Address**: Your new contract (will be deployed by script)

Think of it like:
- Your wallet = your bank account
- PYUSD contract = the US Dollar (everyone uses the same one)
- BugTokenV2 = your new coin you're creating

## ✅ Ready to Test!

Just run those 2 commands above and you're good to go! 🚀
