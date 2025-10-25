// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BugNFT
 * @dev NFT contract for bug collection
 * Each bug is represented as a unique NFT with metadata stored on IPFS
 */
contract BugNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Bug rarity levels
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    
    // Bug metadata structure
    struct BugMetadata {
        string ipfsHash;
        Rarity rarity;
        address discoverer;
        uint256 discoveryTime;
        uint256 voteCount;
        bool verified;
    }
    
    // Mapping from token ID to bug metadata
    mapping(uint256 => BugMetadata) public bugs;
    
    // Authorized minters (e.g., Voting contract)
    mapping(address => bool) public authorizedMinters;
    
    // Public minting flag - allows anyone to mint their approved bugs
    bool public publicMintingEnabled;
    
    // Track bugs discovered by address
    mapping(address => uint256[]) public discoveriesByAddress;
    
    event BugMinted(
        uint256 indexed tokenId,
        address indexed discoverer,
        string ipfsHash,
        Rarity rarity
    );
    event BugVerified(uint256 indexed tokenId);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    constructor() ERC721("BugDex NFT", "BUGDEX") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new bug NFT
     * @param to Address to mint to
     * @param ipfsHash IPFS hash of bug image and metadata
     * @param rarity Rarity level of the bug
     * @param voteCount Number of votes received (if applicable)
     */
    function mintBug(
        address to,
        string memory ipfsHash,
        Rarity rarity,
        uint256 voteCount
    ) external returns (uint256) {
        require(
            publicMintingEnabled || authorizedMinters[msg.sender] || msg.sender == owner(),
            "BugNFT: Not authorized to mint"
        );
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(to, newTokenId);
        
        // Set token URI to IPFS hash
        string memory tokenURI = string(abi.encodePacked("ipfs://", ipfsHash));
        _setTokenURI(newTokenId, tokenURI);
        
        // Store bug metadata
        bugs[newTokenId] = BugMetadata({
            ipfsHash: ipfsHash,
            rarity: rarity,
            discoverer: to,
            discoveryTime: block.timestamp,
            voteCount: voteCount,
            verified: voteCount > 0 // Verified if it went through voting
        });
        
        // Track discoveries
        discoveriesByAddress[to].push(newTokenId);
        
        emit BugMinted(newTokenId, to, ipfsHash, rarity);
        
        return newTokenId;
    }
    
    /**
     * @dev Verify a bug (mark as legitimate)
     */
    function verifyBug(uint256 tokenId) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "BugNFT: Not authorized"
        );
        require(_exists(tokenId), "BugNFT: Token does not exist");
        
        bugs[tokenId].verified = true;
        emit BugVerified(tokenId);
    }
    
    /**
     * @dev Add authorized minter
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    /**
     * @dev Revoke minter authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    /**
     * @dev Enable public minting (anyone can mint)
     */
    function enablePublicMinting() external onlyOwner {
        publicMintingEnabled = true;
    }
    
    /**
     * @dev Disable public minting (only authorized minters can mint)
     */
    function disablePublicMinting() external onlyOwner {
        publicMintingEnabled = false;
    }
    
    /**
     * @dev Get all bugs discovered by an address
     */
    function getBugsByDiscoverer(address discoverer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return discoveriesByAddress[discoverer];
    }
    
    /**
     * @dev Get bug metadata
     */
    function getBugMetadata(uint256 tokenId) 
        external 
        view 
        returns (BugMetadata memory) 
    {
        require(_exists(tokenId), "BugNFT: Token does not exist");
        return bugs[tokenId];
    }
    
    /**
     * @dev Get total number of bugs minted
     */
    function totalBugs() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
