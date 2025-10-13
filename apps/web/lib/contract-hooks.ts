'use client';

// Browser-compatible contract interaction helpers using wagmi
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Contract addresses from environment
const BUG_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS as `0x${string}`;
const BUG_NFT_ADDRESS = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS as `0x${string}`;
const BUG_VOTING_ADDRESS = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS as `0x${string}`;

// ABIs for contract interactions
const BUG_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimFaucet',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const BUG_NFT_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'discoverer', type: 'address' }],
    name: 'getBugsByDiscoverer',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getBugMetadata',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'ipfsHash', type: 'string' },
          { name: 'rarity', type: 'uint8' },
          { name: 'discoverer', type: 'address' },
          { name: 'discoveryTime', type: 'uint256' },
          { name: 'voteCount', type: 'uint256' },
          { name: 'verified', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const BUG_VOTING_ABI = [
  {
    inputs: [
      { name: 'ipfsHash', type: 'string' },
      { name: 'rarity', type: 'uint8' },
    ],
    name: 'submitBug',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'submissionId', type: 'uint256' },
      { name: 'voteFor', type: 'bool' },
    ],
    name: 'vote',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'getSubmission',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'submitter', type: 'address' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'votesFor', type: 'uint256' },
          { name: 'votesAgainst', type: 'uint256' },
          { name: 'resolved', type: 'bool' },
          { name: 'approved', type: 'bool' },
          { name: 'nftTokenId', type: 'uint256' },
          { name: 'rarity', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveSubmissions',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'submissionCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'submissionId', type: 'uint256' }],
    name: 'claimNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Hook for BugVoting contract interactions
 */
export function useBugVoting() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  /**
   * Submit a bug for community voting
   * @param metadataCid - IPFS CID of the bug metadata
   * @param rarity - Rarity level (0-3: common, rare, epic, legendary)
   * @returns Transaction hash
   */
  const submitBug = async (metadataCid: string, rarity: number = 0) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (!BUG_VOTING_ADDRESS) {
      throw new Error('BugVoting contract address not configured');
    }

    const { request } = await publicClient!.simulateContract({
      address: BUG_VOTING_ADDRESS,
      abi: BUG_VOTING_ABI,
      functionName: 'submitBug',
      args: [metadataCid, rarity as any],
      account: address,
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  };

  /**
   * Vote on a bug submission
   * @param submissionId - ID of the submission
   * @param voteFor - true to vote real, false to vote fake
   * @returns Transaction hash
   */
  const vote = async (submissionId: number, voteFor: boolean) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (!BUG_VOTING_ADDRESS) {
      throw new Error('BugVoting contract address not configured');
    }

    const { request } = await publicClient!.simulateContract({
      address: BUG_VOTING_ADDRESS,
      abi: BUG_VOTING_ABI,
      functionName: 'vote',
      args: [BigInt(submissionId), voteFor],
      account: address,
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  };

  /**
   * Get submission details
   * @param submissionId - ID of the submission
   * @returns Submission data
   */
  const getSubmission = async (submissionId: number) => {
    if (!publicClient || !BUG_VOTING_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const data = await publicClient.readContract({
      address: BUG_VOTING_ADDRESS,
      abi: BUG_VOTING_ABI,
      functionName: 'getSubmission',
      args: [BigInt(submissionId)],
    });

    return data;
  };

  /**
   * Get all active submissions
   * @returns Array of submission IDs
   */
  const getActiveSubmissions = async () => {
    if (!publicClient || !BUG_VOTING_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const data = await publicClient.readContract({
      address: BUG_VOTING_ADDRESS,
      abi: BUG_VOTING_ABI,
      functionName: 'getActiveSubmissions',
    });

    return data;
  };

  /**
   * Claim NFT for an approved submission
   * @param submissionId - ID of the approved submission
   * @returns Transaction hash
   */
  const claimNFT = async (submissionId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (!BUG_VOTING_ADDRESS) {
      throw new Error('BugVoting contract address not configured');
    }

    const { request } = await publicClient!.simulateContract({
      address: BUG_VOTING_ADDRESS,
      abi: BUG_VOTING_ABI,
      functionName: 'claimNFT',
      args: [BigInt(submissionId)],
      account: address,
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  };

  return {
    submitBug,
    vote,
    getSubmission,
    getActiveSubmissions,
    claimNFT,
  };
}

/**
 * Hook for BugNFT contract interactions
 */
export function useBugNFT() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  /**
   * Get user's NFT balance
   * @param userAddress - Address to check (defaults to connected wallet)
   * @returns Number of NFTs owned
   */
  const getBalance = async (userAddress?: string) => {
    if (!publicClient || !BUG_NFT_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const addr = (userAddress || address) as `0x${string}`;
    if (!addr) {
      throw new Error('No address provided');
    }

    const balance = await publicClient.readContract({
      address: BUG_NFT_ADDRESS,
      abi: BUG_NFT_ABI,
      functionName: 'balanceOf',
      args: [addr],
    });

    return Number(balance);
  };

  /**
   * Get all bugs discovered by a user
   * @param discoverer - Address of the discoverer
   * @returns Array of token IDs
   */
  const getBugsByDiscoverer = async (discoverer?: string) => {
    if (!publicClient || !BUG_NFT_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const addr = (discoverer || address) as `0x${string}`;
    if (!addr) {
      throw new Error('No address provided');
    }

    const tokenIds = await publicClient.readContract({
      address: BUG_NFT_ADDRESS,
      abi: BUG_NFT_ABI,
      functionName: 'getBugsByDiscoverer',
      args: [addr],
    });

    return tokenIds.map((id) => Number(id));
  };

  /**
   * Get metadata for a specific bug NFT
   * @param tokenId - Token ID
   * @returns Bug metadata
   */
  const getBugMetadata = async (tokenId: number) => {
    if (!publicClient || !BUG_NFT_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const metadata = await publicClient.readContract({
      address: BUG_NFT_ADDRESS,
      abi: BUG_NFT_ABI,
      functionName: 'getBugMetadata',
      args: [BigInt(tokenId)],
    });

    return metadata;
  };

  return {
    getBalance,
    getBugsByDiscoverer,
    getBugMetadata,
  };
}

/**
 * Hook for BugToken contract interactions
 */
export function useBugToken() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  /**
   * Get BUG token balance
   * @param userAddress - Address to check (defaults to connected wallet)
   * @returns Balance in BUG tokens
   */
  const getBalance = async (userAddress?: string) => {
    if (!publicClient || !BUG_TOKEN_ADDRESS) {
      throw new Error('Contract not configured');
    }

    const addr = (userAddress || address) as `0x${string}`;
    if (!addr) {
      throw new Error('No address provided');
    }

    const balance = await publicClient.readContract({
      address: BUG_TOKEN_ADDRESS,
      abi: BUG_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [addr],
    });

    return formatEther(balance);
  };

  /**
   * Claim faucet tokens (100 BUG)
   * @returns Transaction hash
   */
  const claimFaucet = async () => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (!BUG_TOKEN_ADDRESS) {
      throw new Error('BugToken contract address not configured');
    }

    const { request } = await publicClient!.simulateContract({
      address: BUG_TOKEN_ADDRESS,
      abi: BUG_TOKEN_ABI,
      functionName: 'claimFaucet',
      account: address,
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  };

  return {
    getBalance,
    claimFaucet,
  };
}

/**
 * Get contract addresses
 */
export const getContractAddresses = () => ({
  bugToken: BUG_TOKEN_ADDRESS,
  bugNFT: BUG_NFT_ADDRESS,
  bugVoting: BUG_VOTING_ADDRESS,
});

/**
 * Check if contracts are configured
 */
export const areContractsConfigured = () => {
  return !!(BUG_TOKEN_ADDRESS && BUG_NFT_ADDRESS && BUG_VOTING_ADDRESS);
};
