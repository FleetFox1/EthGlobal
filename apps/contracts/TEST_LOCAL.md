# Testing BugTokenV2 Locally

## Quick Start

### 1. Start Local Hardhat Node
```bash
cd apps/contracts
npx hardhat node
```

This starts a local blockchain at `http://127.0.0.1:8545/` with 20 test accounts.

### 2. Run Test Script (in another terminal)
```bash
cd apps/contracts
npx hardhat run scripts/test-token-v2.ts --network localhost
```

## What the Test Does

The test script will:
1. ✅ Deploy MockPYUSD contract
2. ✅ Deploy BugTokenV2 contract
3. ✅ Fund test users with PYUSD
4. ✅ User1 unlocks with ETH
5. ✅ User2 unlocks with PYUSD
6. ✅ User1 claims from faucet
7. ✅ Try to claim again (should fail - cooldown)
8. ✅ Check pool statistics
9. ✅ Owner withdraws from gas pool
10. ✅ Owner withdraws PYUSD

## Expected Output

```
🧪 Testing BugTokenV2 locally...

Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
User1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
User2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

📝 Deploying MockPYUSD...
✅ MockPYUSD deployed to: 0x...

📝 Deploying BugTokenV2...
✅ BugTokenV2 deployed to: 0x...

💰 Minting PYUSD to users...
✅ Users funded with 100 PYUSD each

🔓 Test 1: User1 unlocks with ETH
- User1 is unlocked: false
✅ User1 unlocked!
- User1 is unlocked: true
- User1 BUG balance: 100.0
- Gas pool: 0.00033 ETH

🔓 Test 2: User2 unlocks with PYUSD
- User2 is unlocked: false
✅ User2 unlocked!
- User2 is unlocked: true
- User2 BUG balance: 100.0
- PYUSD pool: 1.0 PYUSD

🎰 Test 3: User1 claims from faucet
✅ User1 claimed!
- Balance before: 100.0
- Balance after: 200.0
- Received: 100.0

⏰ Test 4: Try to claim again (should fail)
✅ Correctly rejected: Cooldown active

📊 Test 5: Pool Statistics
- Contract ETH balance: 0.00033
- Contract PYUSD balance: 1.0
- Gas pool tracked: 0.00033

🔍 Test 6: Can Claim Status
- User1 can claim: false
- User2 can claim: true

💸 Test 7: Owner withdraws from gas pool
✅ Owner withdrew!
- Withdrew: 0.0001 ETH
- Remaining gas pool: 0.00023 ETH

💸 Test 8: Owner withdraws PYUSD
✅ Owner withdrew PYUSD!
- Owner PYUSD balance: 1.0
- Remaining PYUSD pool: 0.0

🎉 All tests passed!

📋 Summary:
===========
BugTokenV2: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MockPYUSD: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Total BUG minted: 10000200.0
Users unlocked: 2

💡 To use in frontend:
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PYUSD_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## Update Frontend

After running the test, copy the addresses to `apps/web/.env.local`:

```bash
# Local Hardhat Network
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PYUSD_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Then restart your dev server:
```bash
cd apps/web
npm run dev
```

## Test in Frontend

1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. In MetaMask:
   - Switch to "Localhost 8545" network
   - Import a test account using private key from Hardhat node output
4. You should see "Unlock for $1" button
5. Click it and pay with ETH
6. You'll receive 100 BUG tokens immediately!

## Troubleshooting

### "Cannot find module"
```bash
cd apps/contracts
npm install
# or
pnpm install
```

### "Contract not deployed"
Make sure Hardhat node is running in a separate terminal.

### "Nonce too high"
Reset MetaMask account:
Settings → Advanced → Clear activity tab data

### TypeScript Errors
These are expected - the script uses `@ts-ignore` for Hardhat types.
The script will run correctly despite the warnings.

