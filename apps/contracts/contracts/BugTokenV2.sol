// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BugTokenV2
 * @dev ERC-20 token for BugDex ecosystem with $1 unlock system
 * 
 * Economic Model:
 * - One-time $1 payment (ETH or PYUSD) to unlock faucet
 * - After unlock: unlimited free claims with cooldown
 * - Payment goes to gas pool for subsidizing operations
 * - PYUSD collected can be converted to ETH by owner
 */
contract BugTokenV2 is ERC20, Ownable {
    // Faucet cooldown period (1 day)
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    // Amount given per faucet claim (100 BUG)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    
    // Unlock cost in ETH (approximately $1 at $3000/ETH)
    uint256 public constant ETH_UNLOCK_COST = 0.00033 ether; // ~$1
    
    // Unlock cost in PYUSD (1 PYUSD = $1)
    uint256 public constant PYUSD_UNLOCK_COST = 1 * 10**6; // 1 PYUSD (6 decimals)
    
    // Maximum supply (100 million BUG)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
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
    
    constructor(address _pyusdToken) ERC20("Bug Token", "BUG") Ownable(msg.sender) {
        require(_pyusdToken != address(0), "Invalid PYUSD address");
        pyusdToken = IERC20(_pyusdToken);
        
        // Mint initial supply to deployer for rewards and distribution
        _mint(msg.sender, 10_000_000 * 10**18); // 10M initial
    }
    
    /**
     * @dev Unlock faucet by paying with ETH
     * One-time $1 payment goes to gas pool
     */
    function unlockWithETH() external payable {
        require(!hasUnlocked[msg.sender], "Already unlocked");
        require(msg.value >= ETH_UNLOCK_COST, "Insufficient ETH");
        
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
        require(hasUnlocked[msg.sender], "Must unlock first");
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Cooldown period active"
        );
        require(
            totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY,
            "Max supply reached"
        );
        
        // Update last claim time
        lastFaucetClaim[msg.sender] = block.timestamp;
        
        // Mint tokens
        _mintToUser(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Check if address can claim from faucet
     */
    function canClaimFaucet(address user) external view returns (bool) {
        if (!hasUnlocked[user]) return false;
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) return false;
        if (block.timestamp < lastFaucetClaim[user] + FAUCET_COOLDOWN) return false;
        return true;
    }
    
    /**
     * @dev Get time until next faucet claim
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (!hasUnlocked[user]) return 0;
        if (lastFaucetClaim[user] == 0) return 0;
        
        uint256 nextClaimTime = lastFaucetClaim[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaimTime) return 0;
        
        return nextClaimTime - block.timestamp;
    }
    
    /**
     * @dev Internal mint function with supply check
     */
    function _mintToUser(address to, uint256 amount) private {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev Mint tokens (only authorized minters like voting contract)
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized");
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
     * @dev Convert PYUSD to ETH for gas pool (manual for now)
     * In production, this could use a DEX integration
     */
    function withdrawPYUSD(address to) external onlyOwner {
        uint256 amount = pyusdPool;
        require(amount > 0, "No PYUSD to withdraw");
        
        pyusdPool = 0;
        require(pyusdToken.transfer(to, amount), "Transfer failed");
        
        // Owner manually converts PYUSD to ETH and deposits back
    }
    
    /**
     * @dev Deposit ETH to gas pool (after converting PYUSD manually)
     */
    function depositToGasPool() external payable onlyOwner {
        gasPool += msg.value;
        emit GasPoolDeposit(msg.value);
    }
    
    /**
     * @dev Withdraw from gas pool for operational costs
     */
    function withdrawFromGasPool(address payable to, uint256 amount) external onlyOwner {
        require(amount <= gasPool, "Insufficient pool balance");
        
        gasPool -= amount;
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit GasPoolWithdrawal(to, amount);
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 ethBalance,
        uint256 pyusdBalance,
        uint256 gasPoolBalance
    ) {
        return (
            address(this).balance,
            pyusdPool,
            gasPool
        );
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {
        gasPool += msg.value;
        emit GasPoolDeposit(msg.value);
    }
}
