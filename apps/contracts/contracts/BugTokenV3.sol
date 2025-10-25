// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title BugTokenV3
 * @dev ERC-20 token with Pyth oracle for dynamic ETH pricing
 * 
 * Economic Model:
 * - One-time $1 payment (ETH or PYUSD) to unlock faucet
 * - ETH price determined by Pyth Network oracle (real-time)
 * - PYUSD option for stable $1 payment
 * - After unlock: unlimited free claims with cooldown
 */
contract BugTokenV3 is ERC20, Ownable {
    // Faucet cooldown period (1 day)
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    // Amount given per faucet claim (100 BUG)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    
    // Unlock cost in USD (1 dollar)
    uint256 public constant USD_UNLOCK_COST = 1 * 10**8; // $1 in Pyth 8-decimal format
    
    // Unlock cost in PYUSD (1 PYUSD = $1)
    uint256 public constant PYUSD_UNLOCK_COST = 1 * 10**6; // 1 PYUSD (6 decimals)
    
    // Maximum supply (100 million BUG)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Pyth oracle contract
    IPyth public immutable pyth;
    
    // ETH/USD price feed ID (Pyth Network)
    // Sepolia: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
    bytes32 public immutable ethUsdPriceFeedId;
    
    // PYUSD token contract
    IERC20 public immutable pyusdToken;
    
    // Track last faucet claim time per address
    mapping(address => uint256) public lastFaucetClaim;
    
    // Track if address has unlocked the faucet
    mapping(address => bool) public hasUnlocked;
    
    // Authorized minters (contracts that can mint tokens)
    mapping(address => bool) public authorizedMinters;
    
    // Gas pool balance (ETH collected for subsidizing operations)
    uint256 public gasPool;
    
    // PYUSD pool balance (to be converted to ETH)
    uint256 public pyusdPool;
    
    event FaucetUnlocked(address indexed user, string paymentMethod, uint256 amount);
    event FaucetClaimed(address indexed claimer, uint256 amount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event GasPoolDeposit(uint256 amount);
    event PYUSDConverted(uint256 pyusdAmount, uint256 ethReceived);
    event GasPoolWithdrawal(address indexed to, uint256 amount);
    
    constructor(
        address _pyusdToken,
        address _pythContract,
        bytes32 _ethUsdPriceFeedId
    ) ERC20("Bug Token", "BUG") Ownable(msg.sender) {
        require(_pyusdToken != address(0), "Invalid PYUSD address");
        require(_pythContract != address(0), "Invalid Pyth address");
        
        pyusdToken = IERC20(_pyusdToken);
        pyth = IPyth(_pythContract);
        ethUsdPriceFeedId = _ethUsdPriceFeedId;
        
        // Mint initial supply to deployer for rewards and distribution
        _mint(msg.sender, 10_000_000 * 10**18); // 10M initial
    }
    
    /**
     * @dev Get current ETH unlock cost based on Pyth oracle price
     * @return Required ETH amount for $1 unlock
     */
    function getETHUnlockCost() public view returns (uint256) {
        // Get ETH/USD price from Pyth (no update needed, just read latest)
        PythStructs.Price memory price = pyth.getPriceUnsafe(ethUsdPriceFeedId);
        
        require(price.price > 0, "Invalid price");
        
        // Pyth prices have 8 decimals (e.g., $3000.00 = 300000000000)
        // Calculate: $1 / (ETH price in USD) = ETH required
        // Formula: (USD_UNLOCK_COST * 10^18) / price
        // Example: ETH = $3000 → (1 * 10^8 * 10^18) / (3000 * 10^8) = 0.000333... ETH
        
        uint256 ethRequired = (USD_UNLOCK_COST * 10**18) / uint256(uint64(price.price));
        
        return ethRequired;
    }
    
    /**
     * @dev Unlock faucet by paying with ETH (dynamic price via Pyth)
     * One-time $1 payment goes to gas pool
     */
    function unlockWithETH() external payable {
        require(!hasUnlocked[msg.sender], "Already unlocked");
        
        uint256 requiredETH = getETHUnlockCost();
        require(msg.value >= requiredETH, "Insufficient ETH");
        
        // Mark as unlocked
        hasUnlocked[msg.sender] = true;
        
        // Add to gas pool
        gasPool += msg.value;
        
        // Give initial 100 BUG
        _mintToUser(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUnlocked(msg.sender, "ETH", msg.value);
        emit GasPoolDeposit(msg.value);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Unlock faucet by paying with PYUSD
     * One-time $1 PYUSD payment collected for gas pool conversion
     */
    function unlockWithPYUSD() external {
        require(!hasUnlocked[msg.sender], "Already unlocked");
        
        // Transfer PYUSD from user to contract
        require(
            pyusdToken.transferFrom(msg.sender, address(this), PYUSD_UNLOCK_COST),
            "PYUSD transfer failed"
        );
        
        // Mark as unlocked
        hasUnlocked[msg.sender] = true;
        
        // Add to PYUSD pool
        pyusdPool += PYUSD_UNLOCK_COST;
        
        // Give initial 100 BUG
        _mintToUser(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUnlocked(msg.sender, "PYUSD", PYUSD_UNLOCK_COST);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Claim free tokens from faucet (must be unlocked first)
     * After unlock, unlimited claims with cooldown
     */
    function claimFaucet() external {
        require(hasUnlocked[msg.sender], "Faucet not unlocked");
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Cooldown period not passed"
        );
        
        // Update last claim time
        lastFaucetClaim[msg.sender] = block.timestamp;
        
        // Mint tokens
        _mintToUser(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Internal mint with supply cap check
     */
    function _mintToUser(address to, uint256 amount) internal {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Max supply reached"
        );
        _mint(to, amount);
    }
    
    /**
     * @dev Mint tokens (only authorized contracts)
     */
    function mint(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _mintToUser(to, amount);
    }
    
    /**
     * @dev Add authorized minter
     */
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Withdraw ETH from gas pool (owner only)
     */
    function withdrawGasPool(uint256 amount) external onlyOwner {
        require(amount <= gasPool, "Insufficient balance");
        gasPool -= amount;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit GasPoolWithdrawal(owner(), amount);
    }
    
    /**
     * @dev Convert PYUSD to ETH via DEX (owner only)
     * This would typically interact with a DEX router
     * For now, just allows owner to withdraw PYUSD
     */
    function withdrawPYUSD(uint256 amount) external onlyOwner {
        require(amount <= pyusdPool, "Insufficient PYUSD balance");
        pyusdPool -= amount;
        
        require(
            pyusdToken.transfer(owner(), amount),
            "PYUSD transfer failed"
        );
    }
    
    /**
     * @dev Get user's unlock status
     */
    function getFaucetStatus(address user) external view returns (
        bool unlocked,
        uint256 nextClaimTime,
        uint256 timeUntilClaim
    ) {
        unlocked = hasUnlocked[user];
        nextClaimTime = lastFaucetClaim[user] + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            timeUntilClaim = 0;
        } else {
            timeUntilClaim = nextClaimTime - block.timestamp;
        }
    }
}
