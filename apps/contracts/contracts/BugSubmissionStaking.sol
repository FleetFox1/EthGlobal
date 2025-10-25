// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BugSubmissionStaking
 * @notice Simple staking contract for BugDex submissions
 * 
 * Flow:
 * 1. User stakes 10 BUG when submitting for voting
 * 2. Tokens held in this contract during voting period
 * 3. After voting resolves:
 *    - If APPROVED: User gets 10 BUG stake back + (5 BUG × upvotes)
 *    - If REJECTED: User gets 10 BUG stake back only
 * 4. Voting is FREE for all users (no stake required)
 */
contract BugSubmissionStaking is Ownable, ReentrancyGuard {
    IERC20 public bugToken;
    
    uint256 public constant STAKE_AMOUNT = 10 * 10**18; // 10 BUG tokens
    uint256 public constant REWARD_PER_UPVOTE = 5 * 10**18; // 5 BUG per upvote
    
    // Track stakes by upload ID (matches database ID)
    struct Stake {
        address submitter;
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }
    
    mapping(string => Stake) public stakes; // uploadId => Stake
    
    event Staked(string indexed uploadId, address indexed submitter, uint256 amount);
    event RewardDistributed(string indexed uploadId, address indexed submitter, uint256 totalAmount, uint256 upvotes);
    event StakeReturned(string indexed uploadId, address indexed submitter, uint256 amount);
    
    constructor(address _bugToken) Ownable(msg.sender) {
        bugToken = IERC20(_bugToken);
    }
    
    /**
     * @notice Stake 10 BUG tokens to submit for voting
     * @param uploadId The unique ID of the upload (from database)
     */
    function stakeForSubmission(string memory uploadId) external nonReentrant {
        require(stakes[uploadId].amount == 0, "Already staked for this submission");
        require(
            bugToken.balanceOf(msg.sender) >= STAKE_AMOUNT,
            "Insufficient BUG balance"
        );
        
        // Transfer 10 BUG from user to this contract
        require(
            bugToken.transferFrom(msg.sender, address(this), STAKE_AMOUNT),
            "BUG transfer failed"
        );
        
        stakes[uploadId] = Stake({
            submitter: msg.sender,
            amount: STAKE_AMOUNT,
            timestamp: block.timestamp,
            claimed: false
        });
        
        emit Staked(uploadId, msg.sender, STAKE_AMOUNT);
    }
    
    /**
     * @notice Distribute rewards after voting ends (APPROVED)
     * @param uploadId The unique ID of the upload
     * @param upvotes Number of upvotes received
     * @dev Only owner (backend) can call this after vote resolution
     */
    function distributeRewards(string memory uploadId, uint256 upvotes) external onlyOwner nonReentrant {
        Stake storage stake = stakes[uploadId];
        
        require(stake.amount > 0, "No stake found");
        require(!stake.claimed, "Already claimed");
        require(stake.submitter != address(0), "Invalid stake");
        
        stake.claimed = true;
        
        // Calculate total: stake + (upvotes × 5 BUG)
        uint256 rewardAmount = upvotes * REWARD_PER_UPVOTE;
        uint256 totalAmount = stake.amount + rewardAmount;
        
        // Transfer back to submitter
        require(
            bugToken.transfer(stake.submitter, totalAmount),
            "BUG transfer failed"
        );
        
        emit RewardDistributed(uploadId, stake.submitter, totalAmount, upvotes);
    }
    
    /**
     * @notice Return stake without rewards (REJECTED)
     * @param uploadId The unique ID of the upload
     * @dev Only owner (backend) can call this after vote resolution
     */
    function returnStake(string memory uploadId) external onlyOwner nonReentrant {
        Stake storage stake = stakes[uploadId];
        
        require(stake.amount > 0, "No stake found");
        require(!stake.claimed, "Already claimed");
        require(stake.submitter != address(0), "Invalid stake");
        
        stake.claimed = true;
        
        // Return stake only (no rewards)
        require(
            bugToken.transfer(stake.submitter, stake.amount),
            "BUG transfer failed"
        );
        
        emit StakeReturned(uploadId, stake.submitter, stake.amount);
    }
    
    /**
     * @notice Emergency withdraw function (owner only)
     * @dev Should only be used if contract needs to be upgraded
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = bugToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        bugToken.transfer(owner(), balance);
    }
    
    /**
     * @notice Fund the contract with BUG tokens for rewards
     * @param amount Amount of BUG tokens to add
     */
    function fundRewards(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(
            bugToken.transferFrom(msg.sender, address(this), amount),
            "BUG transfer failed"
        );
    }
    
    /**
     * @notice Check contract's BUG token balance
     */
    function getContractBalance() external view returns (uint256) {
        return bugToken.balanceOf(address(this));
    }
    
    /**
     * @notice Get stake info for an upload
     */
    function getStake(string memory uploadId) external view returns (
        address submitter,
        uint256 amount,
        uint256 timestamp,
        bool claimed
    ) {
        Stake memory stake = stakes[uploadId];
        return (stake.submitter, stake.amount, stake.timestamp, stake.claimed);
    }
}
