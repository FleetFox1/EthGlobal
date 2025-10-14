# Where Does the $1 Payment Go? 💰

## Payment Flow Diagram

```
USER PAYS $1
     |
     ├─── ETH Payment
     │    │
     │    └──> unlockWithETH() sends msg.value to contract
     │         │
     │         ├─> Contract Address: receives 0.00033 ETH
     │         │   (Stored in contract's ETH balance)
     │         │
     │         └─> gasPool variable incremented
     │             (Tracks how much is for gas subsidies)
     │
     └─── PYUSD Payment
          │
          └──> unlockWithPYUSD() transfers PYUSD to contract
               │
               ├─> Contract Address: receives 1.00 PYUSD
               │   (Stored in contract's PYUSD balance)
               │
               └─> pyusdPool variable incremented
                   (Tracks how much PYUSD to convert)
```

## Contract Storage

### The BugTokenV2 contract itself holds the funds:

```solidity
contract BugTokenV2 {
    // Track ETH for gas subsidies
    uint256 public gasPool;        // e.g., 0.05 ETH
    
    // Track PYUSD to be converted
    uint256 public pyusdPool;      // e.g., 15.00 PYUSD
    
    // Actual balances
    address(this).balance          // Contract's ETH: 0.05 ETH
    pyusdToken.balanceOf(this)     // Contract's PYUSD: 15.00 PYUSD
}
```

### Example After 100 Users:

```
50 users paid with ETH:
  gasPool = 50 × 0.00033 = 0.0165 ETH
  address(BugTokenV2).balance = 0.0165 ETH

50 users paid with PYUSD:
  pyusdPool = 50 × 1.00 = 50.00 PYUSD
  pyusdToken.balanceOf(BugTokenV2) = 50.00 PYUSD

Total Value: ~$100 USD
```

## How to Check Balances

### On Etherscan:
```
1. Go to: https://sepolia.etherscan.io/address/<BugTokenV2_ADDRESS>
2. See "Balance" = ETH held by contract
3. Click "Token Holdings" = PYUSD held by contract
```

### Via Contract:
```typescript
// Get pool statistics
const [ethBalance, pyusdBalance, gasPoolBalance] = 
  await bugToken.getPoolStats();

console.log("ETH in contract:", ethers.formatEther(ethBalance));
console.log("PYUSD to convert:", ethers.formatUnits(pyusdBalance, 6));
console.log("Gas pool tracked:", ethers.formatEther(gasPoolBalance));
```

### Via RPC:
```typescript
// Direct balance check
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/...");

// ETH balance
const ethBalance = await provider.getBalance(bugTokenAddress);
console.log("ETH:", ethers.formatEther(ethBalance));

// PYUSD balance
const pyusd = new ethers.Contract(PYUSD_ADDRESS, erc20ABI, provider);
const pyusdBalance = await pyusd.balanceOf(bugTokenAddress);
console.log("PYUSD:", ethers.formatUnits(pyusdBalance, 6));
```

## How to Withdraw/Use Funds

### 1. Withdraw ETH from Gas Pool (Owner Only)
```typescript
// Owner can withdraw ETH for operational costs
await bugToken.withdrawFromGasPool(ownerAddress, amount);

// Example: Withdraw 0.01 ETH
await bugToken.withdrawFromGasPool(
  owner.address, 
  ethers.parseEther("0.01")
);
```

### 2. Withdraw PYUSD to Convert (Owner Only)
```typescript
// Owner withdraws PYUSD to convert to ETH manually
await bugToken.withdrawPYUSD(ownerAddress);

// Now owner has PYUSD in wallet
// Go to Uniswap/1inch and swap PYUSD → ETH
// Then deposit back:
await bugToken.depositToGasPool({ value: ethReceived });
```

### 3. Emergency Withdraw All ETH (Owner Only)
```typescript
// Nuclear option - withdraw everything
await bugToken.emergencyWithdraw(ownerAddress);
```

## Future: Automated Relayer (Gasless Operations)

### How the gas pool will be used:
```typescript
// Backend relayer service
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

// User wants to vote but has no ETH
// Relayer pays gas from the pool:

const bugVoting = new ethers.Contract(address, abi, relayerWallet);
await bugVoting.vote(submissionId, true);
// ↑ Relayer pays ~0.02 ETH gas from pool

// Pool balance decreases by 0.02 ETH
// User votes without needing ETH! ✨
```

## Security Notes

### ✅ Safe:
- Only owner can withdraw funds
- Funds stored in contract (not EOA wallet)
- Multiple checks before withdrawal
- ReentrancyGuard on functions

### ⚠️ Considerations:
- Contract holds all user payments
- If contract hacked, funds at risk
- Should eventually move to multisig owner
- Consider upgradeability pattern

### 🔒 Best Practices:
```solidity
// Current: Single owner
owner() = deployer address

// Better: Gnosis Safe multisig
owner() = 0x... (3-of-5 multisig)

// Even Better: Timelock + multisig
owner() = TimelockController
  → governed by multisig
  → 24h delay on withdrawals
```

## Testing Locally

I'll create a Hardhat test to verify all payment flows work correctly!

