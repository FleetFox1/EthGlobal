// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BugToken
 * @dev ERC-20 token for BugDex ecosystem
 * Users earn BUG tokens by:
 * - Submitting verified bugs
 * - Voting on submissions
 * - Participating in the ecosystem
 */
contract BugToken is ERC20, Ownable {
    // Faucet cooldown period (1 day)
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    // Amount given per faucet claim (100 BUG)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    
    // Maximum supply (100 million BUG)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Track last faucet claim time per address
    mapping(address => uint256) public lastFaucetClaim;
    
    // Authorized minters (contracts that can mint tokens)
    mapping(address => bool) public authorizedMinters;
    
    event FaucetClaimed(address indexed claimer, uint256 amount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("Bug Token", "BUG") Ownable(msg.sender) {
        // Mint initial supply to deployer for liquidity and distribution
        _mint(msg.sender, 10_000_000 * 10**18); // 10M initial
    }
    
    /**
     * @dev Claim free tokens from faucet (once per cooldown period)
     */
    function claimFaucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet: Cooldown period not passed"
        );
        require(
            totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY,
            "Faucet: Max supply reached"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Mint tokens (only by authorized contracts)
     */
    function mint(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "BugToken: Not authorized to mint"
        );
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "BugToken: Max supply exceeded"
        );
        
        _mint(to, amount);
    }
    
    /**
     * @dev Add authorized minter (e.g., Voting contract)
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
     * @dev Check if address can claim from faucet
     */
    function canClaimFaucet(address account) external view returns (bool) {
        return block.timestamp >= lastFaucetClaim[account] + FAUCET_COOLDOWN;
    }
    
    /**
     * @dev Get time until next faucet claim
     */
    function timeUntilNextClaim(address account) external view returns (uint256) {
        uint256 nextClaimTime = lastFaucetClaim[account] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
}
