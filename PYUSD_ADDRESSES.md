# PYUSD Contract Addresses

## Official PayPal PYUSD Addresses

### Mainnet (Ethereum)
- **Address**: `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8`
- **Network**: Ethereum Mainnet (Chain ID: 1)
- **Use**: Production (real money)

### Sepolia Testnet
- **Address**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Use**: Testing (free test PYUSD)
- **Faucet**: Get test PYUSD at https://faucet.circle.com/

### Polygon Mumbai (Deprecated)
- **Address**: `0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f`
- **Network**: Mumbai Testnet
- **Status**: Mumbai is deprecated, use Sepolia instead

## How to Get Test PYUSD

### Method 1: Circle Faucet (Recommended)
1. Go to https://faucet.circle.com/
2. Select "Sepolia" network
3. Select "PYUSD" token
4. Enter your wallet address: `0x71940fd31a77979F3a54391b86768C661C78c263`
5. Complete captcha
6. Receive test PYUSD (usually 10-100 PYUSD)

### Method 2: Deploy Your Own MockPYUSD
If Circle faucet is not available:
```solidity
// contracts/MockPYUSD.sol
contract MockPYUSD is ERC20 {
    constructor() ERC20("Mock PayPal USD", "PYUSD") {
        _mint(msg.sender, 1000000 * 10**6); // 1M PYUSD
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // PYUSD uses 6 decimals
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

## What to Use for Testing

### Local Hardhat Testing
- Use your own PYUSD address if you have test PYUSD
- Or deploy MockPYUSD for testing

### Sepolia Testnet Deployment
- **Use**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- This is the official PYUSD Sepolia testnet address
- Get test PYUSD from Circle faucet first

## Quick Setup

Update your `.env` file in `apps/contracts`:

```bash
# For Sepolia deployment
PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

# Your deployer wallet
PRIVATE_KEY=your_private_key_here

# Sepolia RPC (get from Alchemy/Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

## Checking PYUSD Balance

### Via Etherscan
1. Go to https://sepolia.etherscan.io/
2. Paste PYUSD contract: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
3. Go to "Contract" → "Read Contract"
4. Call `balanceOf` with your address: `0x71940fd31a77979F3a54391b86768C661C78c263`
5. Result will be in 6 decimals (1000000 = 1 PYUSD)

### Via MetaMask
1. Open MetaMask
2. Switch to Sepolia network
3. Click "Import tokens"
4. Custom Token:
   - **Token Contract Address**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
   - **Token Symbol**: PYUSD
   - **Token Decimals**: 6
5. Your PYUSD balance will appear in MetaMask

## For Your Current Setup

Since you're testing on **Sepolia** (based on deployment.json), use:

```typescript
// In scripts/test-token-v2-with-real-pyusd.ts
const EXISTING_PYUSD = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Official Sepolia PYUSD
```

But first, get test PYUSD from Circle faucet!
