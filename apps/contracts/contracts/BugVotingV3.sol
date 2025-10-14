// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BugNFT.sol";

/**
 * @title BugVotingV3
 * @dev Voting system with STRICT requirements:
 * - Must wait full 3 days voting period
 * - Must have minimum 5 votes to approve
 * - Vote count saved to NFT as popularity score
 * - Manual NFT claiming (submitter pays gas)
 * 
 * Compatible with BugTokenV2 (any ERC20)
 */
contract BugVotingV3 is Ownable, ReentrancyGuard {
    IERC20 public bugToken;
    BugNFT public bugNFT;
    
    // Voting parameters
    uint256 public constant VOTE_STAKE_AMOUNT = 10 * 10**18; // 10 BUG tokens
    uint256 public constant VOTE_THRESHOLD = 5; // 5 votes REQUIRED for approval
    uint256 public constant VOTING_PERIOD = 3 days; // MUST wait full period
    uint256 public constant REWARD_PER_VOTE = 5 * 10**18; // 5 BUG reward
    
    // Submission structure
    struct Submission {
        uint256 id;
        address submitter;
        string ipfsHash;
        uint256 createdAt;
        uint256 votesFor;
        uint256 votesAgainst;
        bool resolved;
        bool approved;
        bool nftClaimed;
        uint256 nftTokenId;
        BugNFT.Rarity rarity;
    }
    
    // Track submissions
    mapping(uint256 => Submission) public submissions;
    uint256 public submissionCount;
    
    // Track votes per submission per user
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Track voters for rewards (who voted "for")
    mapping(uint256 => address[]) public votersFor;
    
    // Track all voters for stake returns
    mapping(uint256 => address[]) public allVoters;
    
    event SubmissionCreated(
        uint256 indexed submissionId,
        address indexed submitter,
        string ipfsHash
    );
    event VoteCast(
        uint256 indexed submissionId,
        address indexed voter,
        bool voteFor
    );
    event SubmissionResolved(
        uint256 indexed submissionId,
        bool approved,
        uint256 totalVotes
    );
    event NFTClaimed(
        uint256 indexed submissionId,
        address indexed claimer,
        uint256 nftTokenId,
        uint256 popularityScore
    );
    event RewardDistributed(
        uint256 indexed submissionId,
        address indexed voter,
        uint256 amount
    );
    
    constructor(address _bugToken, address _bugNFT) Ownable(msg.sender) {
        bugToken = IERC20(_bugToken);
        bugNFT = BugNFT(_bugNFT);
    }
    
    /**
     * @dev Submit a bug for voting
     */
    function submitBug(string memory ipfsHash, BugNFT.Rarity rarity) 
        external 
        returns (uint256) 
    {
        submissionCount++;
        uint256 submissionId = submissionCount;
        
        submissions[submissionId] = Submission({
            id: submissionId,
            submitter: msg.sender,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            resolved: false,
            approved: false,
            nftClaimed: false,
            nftTokenId: 0,
            rarity: rarity
        });
        
        emit SubmissionCreated(submissionId, msg.sender, ipfsHash);
        
        return submissionId;
    }
    
    /**
     * @dev Vote on a submission
     * @param submissionId ID of the submission
     * @param voteFor true to approve, false to reject
     */
    function vote(uint256 submissionId, bool voteFor) external nonReentrant {
        Submission storage submission = submissions[submissionId];
        
        require(submission.id != 0, "Voting: Submission does not exist");
        require(!submission.resolved, "Voting: Already resolved");
        require(!hasVoted[submissionId][msg.sender], "Voting: Already voted");
        require(
            block.timestamp <= submission.createdAt + VOTING_PERIOD,
            "Voting: Voting period ended"
        );
        
        // Stake BUG tokens
        require(
            bugToken.transferFrom(msg.sender, address(this), VOTE_STAKE_AMOUNT),
            "Voting: Token transfer failed"
        );
        
        // Record vote
        hasVoted[submissionId][msg.sender] = true;
        allVoters[submissionId].push(msg.sender);
        
        if (voteFor) {
            submission.votesFor++;
            votersFor[submissionId].push(msg.sender);
        } else {
            submission.votesAgainst++;
        }
        
        emit VoteCast(submissionId, msg.sender, voteFor);
        
        // Note: NO auto-resolution! Must wait full 3 days
    }
    
    /**
     * @dev Resolve submission after voting period
     * REQUIRES: 3 days passed AND minimum 5 "for" votes
     */
    function resolveSubmission(uint256 submissionId) external {
        Submission storage submission = submissions[submissionId];
        
        require(submission.id != 0, "Voting: Submission does not exist");
        require(!submission.resolved, "Voting: Already resolved");
        require(
            block.timestamp > submission.createdAt + VOTING_PERIOD ||
            msg.sender == owner(),
            "Voting: Must wait 3 days"
        );
        
        // STRICT REQUIREMENTS:
        // 1. Must have at least 5 "for" votes
        // 2. More "for" than "against"
        bool approved = submission.votesFor >= VOTE_THRESHOLD && 
                        submission.votesFor > submission.votesAgainst;
        
        submission.resolved = true;
        submission.approved = approved;
        
        uint256 totalVotes = submission.votesFor + submission.votesAgainst;
        
        if (approved) {
            // Distribute rewards to voters who voted FOR
            _distributeRewards(submissionId);
        } else {
            // Return stakes to all voters (no rewards)
            _returnStakes(submissionId);
        }
        
        emit SubmissionResolved(submissionId, approved, totalVotes);
    }
    
    /**
     * @dev Claim NFT for approved submission
     * Submitter pays gas to mint
     * Vote count saved as popularity score
     */
    function claimNFT(uint256 submissionId) external nonReentrant {
        Submission storage submission = submissions[submissionId];
        
        require(submission.id != 0, "Voting: Submission does not exist");
        require(submission.resolved, "Voting: Not resolved yet");
        require(submission.approved, "Voting: Not approved");
        require(!submission.nftClaimed, "Voting: NFT already claimed");
        require(msg.sender == submission.submitter, "Voting: Not the submitter");
        
        // Mint NFT with popularity score (votesFor count)
        uint256 nftTokenId = bugNFT.mintBug(
            submission.submitter,
            submission.ipfsHash,
            submission.rarity,
            submission.votesFor  // Popularity score!
        );
        
        submission.nftClaimed = true;
        submission.nftTokenId = nftTokenId;
        
        emit NFTClaimed(submissionId, msg.sender, nftTokenId, submission.votesFor);
    }
    
    /**
     * @dev Check if a submission can be claimed
     */
    function canClaimNFT(uint256 submissionId) external view returns (bool) {
        Submission storage submission = submissions[submissionId];
        return submission.resolved && 
               submission.approved && 
               !submission.nftClaimed;
    }
    
    /**
     * @dev Check if submission can be resolved
     */
    function canResolve(uint256 submissionId) external view returns (bool) {
        Submission storage submission = submissions[submissionId];
        return !submission.resolved && 
               block.timestamp > submission.createdAt + VOTING_PERIOD;
    }
    
    /**
     * @dev Get submission status for UI
     */
    function getSubmissionStatus(uint256 submissionId) 
        external 
        view 
        returns (
            bool isResolved,
            bool isApproved,
            bool canClaim,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 timeRemaining,
            bool meetsThreshold
        ) 
    {
        Submission storage submission = submissions[submissionId];
        
        uint256 endTime = submission.createdAt + VOTING_PERIOD;
        uint256 remaining = block.timestamp < endTime ? endTime - block.timestamp : 0;
        
        return (
            submission.resolved,
            submission.approved,
            submission.resolved && submission.approved && !submission.nftClaimed,
            submission.votesFor,
            submission.votesAgainst,
            remaining,
            submission.votesFor >= VOTE_THRESHOLD
        );
    }
    
    /**
     * @dev Get submissions by submitter
     */
    function getSubmissionsBySubmitter(address submitter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        
        // Count submissions
        for (uint256 i = 1; i <= submissionCount; i++) {
            if (submissions[i].submitter == submitter) {
                count++;
            }
        }
        
        // Build array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= submissionCount; i++) {
            if (submissions[i].submitter == submitter) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Distribute rewards to voters who voted FOR (on approval)
     */
    function _distributeRewards(uint256 submissionId) private {
        address[] memory voters = votersFor[submissionId];
        
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            
            // Return staked tokens + reward
            bugToken.transfer(voter, VOTE_STAKE_AMOUNT + REWARD_PER_VOTE);
            
            emit RewardDistributed(submissionId, voter, REWARD_PER_VOTE);
        }
        
        // Return stakes to voters who voted AGAINST (no reward)
        address[] memory allSubmissionVoters = allVoters[submissionId];
        for (uint256 i = 0; i < allSubmissionVoters.length; i++) {
            address voter = allSubmissionVoters[i];
            bool votedFor = false;
            
            // Check if this voter voted FOR
            for (uint256 j = 0; j < voters.length; j++) {
                if (voters[j] == voter) {
                    votedFor = true;
                    break;
                }
            }
            
            // If voted AGAINST, just return stake
            if (!votedFor) {
                bugToken.transfer(voter, VOTE_STAKE_AMOUNT);
            }
        }
    }
    
    /**
     * @dev Return stakes to all voters (for rejected submissions)
     */
    function _returnStakes(uint256 submissionId) private {
        address[] memory voters = allVoters[submissionId];
        
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            
            // Just return staked tokens (no reward)
            bugToken.transfer(voter, VOTE_STAKE_AMOUNT);
        }
    }
    
    /**
     * @dev Get submission details
     */
    function getSubmission(uint256 submissionId) 
        external 
        view 
        returns (
            address submitter,
            string memory ipfsHash,
            uint256 createdAt,
            uint256 votesFor,
            uint256 votesAgainst,
            bool resolved,
            bool approved,
            bool nftClaimed,
            uint256 nftTokenId
        ) 
    {
        Submission storage submission = submissions[submissionId];
        return (
            submission.submitter,
            submission.ipfsHash,
            submission.createdAt,
            submission.votesFor,
            submission.votesAgainst,
            submission.resolved,
            submission.approved,
            submission.nftClaimed,
            submission.nftTokenId
        );
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = bugToken.balanceOf(address(this));
        bugToken.transfer(owner(), balance);
    }
}
