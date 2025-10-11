import { ethers } from "ethers";

// Contract addresses from environment
const BUG_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
const BUG_NFT_ADDRESS = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS!;
const BUG_VOTING_ADDRESS = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS!;

// RPC configuration
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Import ABIs (you'll need to copy these from artifacts after deployment)
// For now, we'll define minimal ABIs for the functions we need
const BUG_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function claimFaucet() returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
];

const BUG_NFT_ABI = [
  "function mintBug(address to, string memory ipfsHash, uint8 rarity, uint256 voteCount) returns (uint256)",
  "function getBugMetadata(uint256 tokenId) view returns (tuple(string ipfsHash, uint8 rarity, address discoverer, uint256 discoveryTime, uint256 voteCount, bool verified))",
  "function getBugsByDiscoverer(address discoverer) view returns (uint256[])",
  "function totalBugs() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const BUG_VOTING_ABI = [
  "function submitBug(string memory ipfsHash, uint8 rarity) returns (uint256)",
  "function vote(uint256 submissionId, bool voteFor) returns (bool)",
  "function getSubmission(uint256 submissionId) view returns (tuple(uint256 id, address submitter, string ipfsHash, uint256 createdAt, uint256 votesFor, uint256 votesAgainst, bool resolved, bool approved, uint256 nftTokenId, uint8 rarity))",
  "function getActiveSubmissions() view returns (uint256[])",
  "function submissionCount() view returns (uint256)",
];

/**
 * Get provider (read-only)
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Get signer (for transactions) - server-side only
 */
export function getSigner(): ethers.Wallet {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in environment");
  }
  const provider = getProvider();
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

/**
 * Get BugToken contract instance
 */
export function getBugTokenContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  if (!BUG_TOKEN_ADDRESS) {
    throw new Error("BUG_TOKEN_ADDRESS not set");
  }
  return new ethers.Contract(
    BUG_TOKEN_ADDRESS,
    BUG_TOKEN_ABI,
    signerOrProvider || getProvider()
  );
}

/**
 * Get BugNFT contract instance
 */
export function getBugNFTContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  if (!BUG_NFT_ADDRESS) {
    throw new Error("BUG_NFT_ADDRESS not set");
  }
  return new ethers.Contract(
    BUG_NFT_ADDRESS,
    BUG_NFT_ABI,
    signerOrProvider || getProvider()
  );
}

/**
 * Get BugVoting contract instance
 */
export function getBugVotingContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  if (!BUG_VOTING_ADDRESS) {
    throw new Error("BUG_VOTING_ADDRESS not set");
  }
  return new ethers.Contract(
    BUG_VOTING_ADDRESS,
    BUG_VOTING_ABI,
    signerOrProvider || getProvider()
  );
}

/**
 * Submit a bug for voting (server-side)
 */
export async function submitBugToVoting(
  ipfsHash: string,
  rarity: number
): Promise<{ submissionId: number; txHash: string }> {
  try {
    const signer = getSigner();
    const votingContract = getBugVotingContract(signer);

    const tx = await votingContract.submitBug(ipfsHash, rarity);
    const receipt = await tx.wait();

    // Parse submissionId from events
    const submissionId = await votingContract.submissionCount();

    console.log("✅ Bug submitted for voting:", {
      submissionId: submissionId.toString(),
      txHash: receipt.hash,
    });

    return {
      submissionId: Number(submissionId),
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("❌ Error submitting bug:", error);
    throw error;
  }
}

/**
 * Get submission details
 */
export async function getSubmissionDetails(submissionId: number) {
  try {
    const votingContract = getBugVotingContract();
    const submission = await votingContract.getSubmission(submissionId);

    return {
      id: Number(submission.id),
      submitter: submission.submitter,
      ipfsHash: submission.ipfsHash,
      createdAt: Number(submission.createdAt),
      votesFor: Number(submission.votesFor),
      votesAgainst: Number(submission.votesAgainst),
      resolved: submission.resolved,
      approved: submission.approved,
      nftTokenId: Number(submission.nftTokenId),
      rarity: Number(submission.rarity),
    };
  } catch (error) {
    console.error("❌ Error fetching submission:", error);
    throw error;
  }
}

/**
 * Get all active submissions
 */
export async function getActiveSubmissions() {
  try {
    const votingContract = getBugVotingContract();
    const activeIds = await votingContract.getActiveSubmissions();

    const submissions = await Promise.all(
      activeIds.map((id: bigint) => getSubmissionDetails(Number(id)))
    );

    return submissions;
  } catch (error) {
    console.error("❌ Error fetching active submissions:", error);
    throw error;
  }
}

/**
 * Get user's BUG token balance
 */
export async function getBugBalance(userAddress: string): Promise<string> {
  try {
    const tokenContract = getBugTokenContract();
    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("❌ Error fetching balance:", error);
    throw error;
  }
}

/**
 * Get user's NFT collection
 */
export async function getUserNFTs(userAddress: string) {
  try {
    const nftContract = getBugNFTContract();
    const tokenIds = await nftContract.getBugsByDiscoverer(userAddress);

    const nfts = await Promise.all(
      tokenIds.map(async (id: bigint) => {
        const metadata = await nftContract.getBugMetadata(id);
        return {
          tokenId: Number(id),
          ipfsHash: metadata.ipfsHash,
          rarity: Number(metadata.rarity),
          discoverer: metadata.discoverer,
          discoveryTime: Number(metadata.discoveryTime),
          voteCount: Number(metadata.voteCount),
          verified: metadata.verified,
        };
      })
    );

    return nfts;
  } catch (error) {
    console.error("❌ Error fetching user NFTs:", error);
    throw error;
  }
}

/**
 * Rarity enum mapping
 */
export enum BugRarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
}

export const RARITY_NAMES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
