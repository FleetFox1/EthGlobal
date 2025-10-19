// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title UserProfileRegistry
 * @dev Simple on-chain registry mapping wallet addresses to IPFS profile hashes
 * 
 * Architecture:
 * - Users upload profile JSON to Lighthouse IPFS
 * - Store only IPFS hash on-chain (cheap!)
 * - Profile data includes: username, avatar, bio, social links
 * - Can be queried by any dApp
 */
contract UserProfileRegistry {
    // Mapping from wallet address to profile IPFS hash
    mapping(address => string) public profiles;
    
    // Track when profiles were last updated
    mapping(address => uint256) public lastUpdated;
    
    // Total number of profiles created
    uint256 public profileCount;
    
    // Events
    event ProfileUpdated(address indexed user, string ipfsHash, uint256 timestamp);
    event ProfileCreated(address indexed user, string ipfsHash, uint256 timestamp);
    
    /**
     * @dev Update or create user profile
     * @param ipfsHash IPFS hash of the profile JSON (e.g., "QmX7Kd9...")
     */
    function setProfile(string memory ipfsHash) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        bool isNewProfile = bytes(profiles[msg.sender]).length == 0;
        
        profiles[msg.sender] = ipfsHash;
        lastUpdated[msg.sender] = block.timestamp;
        
        if (isNewProfile) {
            profileCount++;
            emit ProfileCreated(msg.sender, ipfsHash, block.timestamp);
        } else {
            emit ProfileUpdated(msg.sender, ipfsHash, block.timestamp);
        }
    }
    
    /**
     * @dev Get profile IPFS hash for a user
     * @param user Wallet address to query
     * @return IPFS hash of the profile
     */
    function getProfile(address user) external view returns (string memory) {
        return profiles[user];
    }
    
    /**
     * @dev Check if user has a profile
     * @param user Wallet address to check
     * @return true if profile exists
     */
    function hasProfile(address user) external view returns (bool) {
        return bytes(profiles[user]).length > 0;
    }
    
    /**
     * @dev Get profile info including last update time
     * @param user Wallet address to query
     * @return ipfsHash Profile IPFS hash
     * @return updated Last update timestamp
     */
    function getProfileInfo(address user) external view returns (string memory ipfsHash, uint256 updated) {
        return (profiles[user], lastUpdated[user]);
    }
}
