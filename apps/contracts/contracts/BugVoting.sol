// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BugToken.sol";
import "./BugNFT.sol";

/**
 * @title BugVoting
 * @dev Voting system for bug submissions
 * Users stake BUG tokens to vote on submissions
 * If vote threshold is met, the bug is minted as an NFT and voters are rewarded
 */
contract BugVoting is Ownable, ReentrancyGuard {
    BugToken public bugToken;
    BugNFT public bugNFT;
    
    // Voting parameters
    uint256 public constant VOTE_STAKE_AMOUNT = 10 * 10**18; // 10 BUG tokens
    uint256 public constant VOTE_THRESHOLD = 5; // 5 votes needed
    uint256 public constant VOTING_PERIOD = 3 days;
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
        uint256 nftTokenId;
        BugNFT.Rarity rarity;
    }
    
    // Track submissions
    mapping(uint256 => Submission) public submissions;
    uint256 public submissionCount;
    
    // Track votes per submission per user
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Track voters for rewards
    mapping(uint256 => address[]) public voters;
    
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
        uint256 nftTokenId
    );
    event RewardDistributed(
        uint256 indexed submissionId,
        address indexed voter,
        uint256 amount
    );
    
    constructor(address _bugToken, address _bugNFT) Ownable(msg.sender) {
        bugToken = BugToken(_bugToken);
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
        voters[submissionId].push(msg.sender);
        
        if (voteFor) {
            submission.votesFor++;
        } else {
            submission.votesAgainst++;
        }
        
        emit VoteCast(submissionId, msg.sender, voteFor);
        
        // Auto-resolve if threshold met
        if (submission.votesFor >= VOTE_THRESHOLD) {
            _resolveSubmission(submissionId, true);
        } else if (submission.votesAgainst >= VOTE_THRESHOLD) {
            _resolveSubmission(submissionId, false);
        }
    }
    
    /**
     * @dev Resolve submission (manual or auto-triggered)
     */
    function resolveSubmission(uint256 submissionId) external {
        Submission storage submission = submissions[submissionId];
        
        require(submission.id != 0, "Voting: Submission does not exist");
        require(!submission.resolved, "Voting: Already resolved");
        require(
            block.timestamp > submission.createdAt + VOTING_PERIOD ||
            msg.sender == owner(),
            "Voting: Voting period not ended"
        );
        
        bool approved = submission.votesFor > submission.votesAgainst;
        _resolveSubmission(submissionId, approved);
    }
    
    /**
     * @dev Internal resolution logic
     */
    function _resolveSubmission(uint256 submissionId, bool approved) private {
        Submission storage submission = submissions[submissionId];
        submission.resolved = true;
        submission.approved = approved;
        
        if (approved) {
            // Mint NFT for submitter
            uint256 nftTokenId = bugNFT.mintBug(
                submission.submitter,
                submission.ipfsHash,
                submission.rarity,
                submission.votesFor
            );
            submission.nftTokenId = nftTokenId;
            
            // Distribute rewards to voters who voted FOR
            _distributeRewards(submissionId);
        } else {
            // Return stakes to all voters
            _returnStakes(submissionId);
        }
        
        emit SubmissionResolved(submissionId, approved, submission.nftTokenId);
    }
    
    /**
     * @dev Distribute rewards to voters
     */
    function _distributeRewards(uint256 submissionId) private {
        address[] memory submissionVoters = voters[submissionId];
        
        for (uint256 i = 0; i < submissionVoters.length; i++) {
            address voter = submissionVoters[i];
            
            // Return staked tokens
            bugToken.transfer(voter, VOTE_STAKE_AMOUNT);
            
            // Mint reward tokens
            bugToken.mint(voter, REWARD_PER_VOTE);
            
            emit RewardDistributed(submissionId, voter, REWARD_PER_VOTE);
        }
    }
    
    /**
     * @dev Return stakes to voters (when submission rejected)
     */
    function _returnStakes(uint256 submissionId) private {
        address[] memory submissionVoters = voters[submissionId];
        
        for (uint256 i = 0; i < submissionVoters.length; i++) {
            bugToken.transfer(submissionVoters[i], VOTE_STAKE_AMOUNT);
        }
    }
    
    /**
     * @dev Get submission details
     */
    function getSubmission(uint256 submissionId) 
        external 
        view 
        returns (Submission memory) 
    {
        return submissions[submissionId];
    }
    
    /**
     * @dev Get all active submissions
     */
    function getActiveSubmissions() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 activeCount = 0;
        
        // Count active submissions
        for (uint256 i = 1; i <= submissionCount; i++) {
            if (!submissions[i].resolved && 
                block.timestamp <= submissions[i].createdAt + VOTING_PERIOD) {
                activeCount++;
            }
        }
        
        // Populate array
        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= submissionCount; i++) {
            if (!submissions[i].resolved && 
                block.timestamp <= submissions[i].createdAt + VOTING_PERIOD) {
                activeIds[index] = i;
                index++;
            }
        }
        
        return activeIds;
    }
}
