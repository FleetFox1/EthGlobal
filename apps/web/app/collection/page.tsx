"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Sparkles,
  Info,
  Timer
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { ethers } from "ethers";
import { getRarityFromScore } from "@/types/rarityTiers";
import NFTWithRarityFrame from "@/components/NFTWithRarityFrame";

// Helper to get background color class from rarity
function getRarityBgColor(rarityName: string): string {
  switch (rarityName) {
    case "Legendary": return "bg-gradient-to-br from-orange-400 to-red-500";
    case "Epic": return "bg-gradient-to-br from-purple-400 to-pink-500";
    case "Rare": return "bg-gradient-to-br from-blue-400 to-cyan-500";
    case "Uncommon": return "bg-gradient-to-br from-green-400 to-emerald-500";
    case "Common": return "bg-gradient-to-br from-gray-300 to-gray-400";
    default: return "bg-gray-500";
  }
}

// Countdown Timer Component
function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const distance = end - now;

      if (distance < 0) {
        setIsExpired(true);
        setTimeLeft('Voting ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`flex items-center gap-1 ${isExpired ? 'text-gray-500' : 'text-blue-600 font-semibold'}`}>
      <Timer className="h-3 w-3" />
      <span className="text-xs">{timeLeft}</span>
    </div>
  );
}

// NFT Rarity tiers based on net vote score
type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface RarityInfo {
  tier: RarityTier;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

function calculateRarity(votesFor: number = 0, votesAgainst: number = 0): RarityInfo {
  const netVotes = votesFor - votesAgainst;
  
  if (netVotes >= 10) {
    return {
      tier: 'Legendary',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-400 to-red-500',
      borderColor: 'border-orange-500',
      emoji: '✨',
    };
  } else if (netVotes >= 7) {
    return {
      tier: 'Epic',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
      borderColor: 'border-purple-500',
      emoji: '💎',
    };
  } else if (netVotes >= 4) {
    return {
      tier: 'Rare',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      borderColor: 'border-blue-500',
      emoji: '💠',
    };
  } else if (netVotes >= 1) {
    return {
      tier: 'Uncommon',
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-400 to-emerald-500',
      borderColor: 'border-green-500',
      emoji: '🟢',
    };
  } else {
    return {
      tier: 'Common',
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-300 to-gray-400',
      borderColor: 'border-gray-400',
      emoji: '⚪',
    };
  }
}

interface UserUpload {
  id: string;
  imageCid: string;
  metadataCid: string;
  imageUrl: string;
  metadataUrl: string;
  discoverer: string;
  timestamp: number;
  location: {
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  bugInfo?: {
    commonName: string;
    scientificName: string;
    family: string;
    order: string;
    confidence: number;
    distribution: string;
    habitat: string;
    diet: string;
    size: string;
    isDangerous: boolean;
    dangerLevel: number;
    conservationStatus: string;
    interestingFacts: string[];
    characteristics: {
      venom: number;
      biteForce: number;
      disease: number;
      aggression: number;
      speed: number;
    };
    lifespan: string;
    rarity: string;
  };
  submittedToBlockchain: boolean;
  transactionHash?: string;
  submissionId?: number;
  blockchainStatus?: {
    resolved: boolean;
    approved: boolean;
    nftClaimed: boolean;
    votesFor: number;
    votesAgainst: number;
  };
  // Off-chain voting fields
  votingStatus?: 'not_submitted' | 'pending_voting' | 'approved' | 'rejected' | 'submitted_to_blockchain';
  votesFor?: number;
  votesAgainst?: number;
  votingDeadline?: string;
  votingResolved?: boolean;
  votingApproved?: boolean;
  // BUG token stake and rewards
  bugStaked?: number;
  bugRewardsEarned?: number;
  rewardsClaimed?: boolean;
}

export default function CollectionPage() {
  const { walletAddress, isAuthenticated } = useUser();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false for faster initial render
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<UserUpload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'off-chain' | 'on-chain'>('off-chain');

  const loadUploads = useCallback(async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      
      // First, resolve any expired voting periods
      try {
        console.log('🗳️ Checking for expired voting periods...');
        const resolveRes = await fetch('/api/resolve-voting');
        const resolveData = await resolveRes.json();
        if (resolveData.success && resolveData.resolved > 0) {
          console.log(`✅ Resolved ${resolveData.resolved} voting period(s)`, resolveData.resolved);
        }
      } catch (resolveError) {
        console.error('Failed to resolve voting periods:', resolveError);
        // Continue loading even if resolution fails
      }
      
      // Get submission IDs from blockchain for this user
      const VOTING_CONTRACT_ADDRESS = "0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9";
      const idsRes = await fetch(
        `/api/contract-read?address=${VOTING_CONTRACT_ADDRESS}&method=getSubmissionsBySubmitter&args=${walletAddress}`
      );
      const idsData = await idsRes.json();
      
      let blockchainUploads: UserUpload[] = [];
      
      // Load blockchain submissions if any exist
      // Load blockchain submissions if any exist
      if (idsData.result && idsData.result.length > 0) {
        // Load each submission's data from blockchain
        const submissionIds = idsData.result as bigint[];
        const uploadsWithStatus = await Promise.all(
          submissionIds.map(async (id: bigint) => {
          try {
            // Get submission details from blockchain
            const subRes = await fetch(
              `/api/contract-read?address=${VOTING_CONTRACT_ADDRESS}&method=submissions&args=${id.toString()}`
            );
            const subData = await subRes.json();
            
            console.log(`📦 Submission ${id} raw data:`, subData.result);
            
            if (!subData.result) return null;
            
            // Parse the submission array/tuple from Solidity
            // Submission struct: [id, submitter, ipfsHash, createdAt, votesFor, votesAgainst, resolved, approved, nftClaimed, nftTokenId, rarity]
            const subArray = subData.result;
            const sub = {
              id: subArray[0],
              submitter: subArray[1],
              ipfsHash: subArray[2],
              createdAt: subArray[3],
              votesFor: subArray[4],
              votesAgainst: subArray[5],
              resolved: subArray[6],
              approved: subArray[7],
              nftClaimed: subArray[8],
              nftTokenId: subArray[9],
              rarity: subArray[10],
            };
            
            // Fetch IPFS metadata
            let metadata: {
              location?: {
                state: string;
                country: string;
                latitude: number;
                longitude: number;
              };
              bugInfo?: UserUpload['bugInfo'];
              image?: string;
            } = {};
            let imageUrl = "/placeholder-bug.jpg";
            
            if (sub.ipfsHash) {
              try {
                const metaRes = await fetch(
                  `https://gateway.lighthouse.storage/ipfs/${sub.ipfsHash}`
                );
                metadata = await metaRes.json();
                
                if (metadata.image) {
                  imageUrl = metadata.image.replace(
                    "ipfs://",
                    "https://gateway.lighthouse.storage/ipfs/"
                  );
                }
              } catch (e) {
                console.error("Failed to load IPFS metadata:", e);
              }
            }

            // Construct UserUpload from blockchain + IPFS data
            return {
              id: id.toString(),
              imageCid: sub.ipfsHash || "",
              metadataCid: sub.ipfsHash || "",
              imageUrl,
              metadataUrl: sub.ipfsHash
                ? `https://gateway.lighthouse.storage/ipfs/${sub.ipfsHash}`
                : "",
              discoverer: walletAddress,
              timestamp: Number(sub.createdAt) * 1000, // Convert to ms
              location: metadata.location || {
                state: "Unknown",
                country: "Unknown",
                latitude: 0,
                longitude: 0,
              },
              bugInfo: metadata.bugInfo,
              submittedToBlockchain: true,
              submissionId: Number(id),
              blockchainStatus: {
                resolved: sub.resolved,
                approved: sub.approved,
                nftClaimed: sub.nftClaimed,
                votesFor: Number(sub.votesFor),
                votesAgainst: Number(sub.votesAgainst),
              },
            } as UserUpload;
          } catch (error) {
            console.error(`Failed to load submission ${id}:`, error);
            return null;
          }
        })
      );

        blockchainUploads = uploadsWithStatus.filter(Boolean) as UserUpload[];
      }
      
      // Always load database uploads (both submitted and not submitted)
      try {
        const localRes = await fetch(`/api/uploads?address=${walletAddress}`);
        const localData = await localRes.json();
        
        console.log('🔍 DEBUG: Raw database response:', localData);
        
        // API returns {success: true, data: {uploads: [...], count: X}}
        const dbUploads = localData.data?.uploads || localData.uploads || [];
        console.log('🔍 DEBUG: Number of uploads from DB:', dbUploads.length);
        
        if (dbUploads.length > 0) {
          // Filter out uploads that are already on blockchain
          const blockchainSubmissionIds = new Set(
            blockchainUploads.map(u => u?.submissionId).filter(Boolean)
          );
          
          console.log('🔍 DEBUG: Blockchain submission IDs:', Array.from(blockchainSubmissionIds));
          console.log('🔍 DEBUG: Database uploads before filtering:', dbUploads.map((u: any) => ({
            id: u.id,
            submissionId: u.submissionId,
            imageCid: u.imageCid,
            submitted: u.submittedToBlockchain
          })));
          
          const localUploads = dbUploads
            .filter((u: any) => !blockchainSubmissionIds.has(u.submissionId))
            .map((u: any) => ({
              ...u,
              submittedToBlockchain: false, // Explicitly mark as not on blockchain
            }));
          
          console.log(`📦 Found ${localUploads.length} local uploads not yet on blockchain`);
          console.log('🔍 DEBUG: Final combined uploads:', [...blockchainUploads, ...localUploads].length);
          
          // Combine blockchain and local uploads
          setUploads([...blockchainUploads, ...localUploads]);
        } else {
          // No database uploads, just show blockchain ones
          setUploads(blockchainUploads);
        }
      } catch (localError) {
        console.error("Failed to load local uploads:", localError);
        // Still use blockchain uploads even if local fails
        setUploads(blockchainUploads);
      }
    } catch (error) {
      console.error("Failed to load uploads from blockchain:", error);
      
      // If blockchain fails, try to load local uploads only
      try {
        const localRes = await fetch(`/api/uploads?address=${walletAddress}`);
        const localData = await localRes.json();
        
        // API returns {success: true, data: {uploads: [...], count: X}}
        const dbUploads = localData.data?.uploads || localData.uploads || [];
        
        if (dbUploads.length > 0) {
          setUploads(dbUploads.map((u: any) => ({
            ...u,
            submittedToBlockchain: false,
          })));
        }
      } catch (localError) {
        console.error("Failed to load local uploads:", localError);
        setUploads([]);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      loadUploads();
    }
  }, [isAuthenticated, walletAddress, loadUploads]);

  // Filter uploads by minted status
  const offChainUploads = uploads.filter(u => !u.blockchainStatus?.nftClaimed);
  const onChainUploads = uploads.filter(u => u.blockchainStatus?.nftClaimed);

  const submitForVoting = async (upload: UserUpload) => {
    if (!walletAddress) return;

    // Prevent duplicate submissions
    if (upload.votingStatus && upload.votingStatus !== 'not_submitted') {
      console.log('⚠️ Already submitted for voting');
      return;
    }

    setSubmitting(upload.id);

    try {
      console.log('🗳️  Staking 10 BUG and submitting for community voting...');

      // STEP 1: Get wallet provider and signer
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // CHECK NETWORK - Critical for testnet!
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const sepoliaChainId = 11155111;
      
      console.log('Current network:', currentChainId);
      console.log('Expected network:', sepoliaChainId);
      
      if (currentChainId !== sepoliaChainId) {
        console.log('❌ Wrong network! Requesting switch to Sepolia...');
        try {
          // Request network switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });
          console.log('✅ Switched to Sepolia testnet');
        } catch (switchError: any) {
          // If Sepolia isn't added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
            console.log('✅ Added and switched to Sepolia testnet');
          } else {
            throw new Error('⚠️ Please switch to Sepolia testnet in MetaMask');
          }
        }
      }
      
      const signer = await provider.getSigner();

      // Contract addresses
      const BUG_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_BUG_TOKEN_V2_ADDRESS;
      const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;

      if (!BUG_TOKEN_ADDRESS || !STAKING_CONTRACT_ADDRESS) {
        throw new Error('Contracts not configured');
      }

      // STEP 2: Approve BUG tokens
      console.log('💰 Approving 10 BUG tokens...');
      const bugTokenABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
      ];
      const bugToken = new ethers.Contract(BUG_TOKEN_ADDRESS, bugTokenABI, signer);
      
      // Check balance first
      const balance = await bugToken.balanceOf(walletAddress);
      const balanceInBUG = Number(ethers.formatEther(balance));
      if (balanceInBUG < 10) {
        throw new Error(`Insufficient BUG tokens. You have ${balanceInBUG.toFixed(2)} BUG but need 10 BUG.`);
      }

      const approveTx = await bugToken.approve(STAKING_CONTRACT_ADDRESS, ethers.parseEther("10"));
      console.log('⏳ Waiting for approval...');
      const approveReceipt = await approveTx.wait();
      console.log('✅ Approval confirmed!');
      
      // Show approval transaction on Blockscout
      const { getTransactionUrl } = await import('@/lib/blockscout');
      alert(`✅ Approval confirmed!\n\nView on explorer:\n${getTransactionUrl(approveReceipt.hash)}`);

      // STEP 3: Stake via contract
      console.log('🔒 Staking 10 BUG...');
      const stakingABI = (await import('@/lib/contracts/BugSubmissionStaking.json')).default;
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI.abi, signer);
      
      const stakeTx = await stakingContract.stakeForSubmission(upload.id);
      console.log('⏳ Waiting for stake transaction...');
      const stakeReceipt = await stakeTx.wait();
      console.log('✅ Stake confirmed!');
      
      // Show staking transaction on Blockscout
      const bugName = upload.bugInfo?.commonName || 'Bug submission';
      alert(`🎉 Stake successful!\n\n10 BUG staked for "${bugName}"\n\nView transaction:\n${getTransactionUrl(stakeReceipt.hash)}`);

      // STEP 4: Call backend API to update database
      console.log('📝 Updating database...');
      const res = await fetch('/api/submit-for-voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: upload.id,
          walletAddress: walletAddress,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit for voting');
      }

      console.log('✅ Submitted for voting!', data.data);

      const deadline = new Date(data.data.votingDeadline);
      
      // Immediately update local state to show pending status
      setUploads(prev => prev.map(u => 
        u.id === upload.id 
          ? { 
              ...u, 
              votingStatus: 'pending_voting',
              votingDeadline: data.data.votingDeadline,
              votesFor: 0,
              votesAgainst: 0,
              bugStaked: 10
            }
          : u
      ));

      alert(`Bug submitted for community voting! 🎉\n\n💎 10 BUG tokens staked in contract\n💰 You'll earn 5 BUG per upvote!\n🗳️ Voting period starts now\n⏰ Ends: ${deadline.toLocaleString()}\n\nCommunity members can now vote on your discovery!`);

      // Reload uploads to get fresh data from server
      await loadUploads();
    } catch (error) {
      const err = error as Error;
      console.error('Failed to submit for voting:', err);
      alert(`Failed to submit for voting: ${err.message}`);
    } finally {
      setSubmitting(null);
    }
  };

  const claimNFT = async (upload: UserUpload) => {
    if (!window.ethereum || !walletAddress || !upload.submissionId) return;

    setClaiming(upload.id);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const bugVotingAddress = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS;
      if (!bugVotingAddress) {
        throw new Error('Contract address not configured');
      }

      const bugVotingABI = [
        "function claimNFT(uint256 submissionId) external",
        "event NFTClaimed(uint256 indexed submissionId, address indexed claimer, uint256 nftTokenId)",
      ];

      const bugVoting = new ethers.Contract(bugVotingAddress, bugVotingABI, signer);

      console.log('🎁 Claiming NFT...');
      const tx = await bugVoting.claimNFT(upload.submissionId);
      
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      console.log('✅ NFT Claimed!', receipt.hash);
      
      // Show transaction on Blockscout
      const { getTransactionUrl } = await import('@/lib/blockscout');
      alert(`🎉 Congratulations! Your Bug NFT has been minted!\n\nView on explorer:\n${getTransactionUrl(receipt.hash)}`);

      // Reload uploads to update status
      await loadUploads();
    } catch (error) {
      const err = error as Error;
      console.error('Failed to claim NFT:', err);
      alert(`Failed to claim NFT: ${err.message}`);
    } finally {
      setClaiming(null);
    }
  };

  const mintNFT = async (upload: UserUpload) => {
    if (!window.ethereum || !walletAddress) return;

    setSubmitting(upload.id);

    try {
      console.log('🎨 Minting NFT...');

      // Check network and switch if needed
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const sepoliaChainId = 11155111;
      
      if (currentChainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } else {
            throw new Error('⚠️ Please switch to Sepolia testnet');
          }
        }
      }

      const signer = await provider.getSigner();

      // Get NFT contract address - Try V2 first (public minting), fallback to V1
      const BUG_NFT_ADDRESS = process.env.NEXT_PUBLIC_BUG_NFT_V2_ADDRESS || 
                              process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS ||
                              '0xfDe4C483EbF1d187aB75C0AfCDa1342f273bE7DF'; // V2 with public minting
      
      console.log('🎨 Using NFT contract:', BUG_NFT_ADDRESS);

      // Calculate rarity based on vote count
      const totalVotes = (upload.votesFor || 0) + (upload.votesAgainst || 0);
      let rarityLevel = 0; // COMMON
      if (totalVotes >= 20) rarityLevel = 4; // LEGENDARY
      else if (totalVotes >= 10) rarityLevel = 3; // EPIC
      else if (totalVotes >= 5) rarityLevel = 2; // RARE
      else if (totalVotes >= 2) rarityLevel = 1; // UNCOMMON

      // Import BugNFT ABI
      const bugNFTABI = (await import('@/lib/contracts/BugNFT.json')).default;
      const bugNFT = new ethers.Contract(BUG_NFT_ADDRESS, bugNFTABI, signer);

      console.log('📝 Minting with:', {
        to: walletAddress,
        ipfsHash: upload.metadataCid,
        rarity: rarityLevel,
        voteCount: upload.votesFor || 0,
      });

      // Call mintBug function
      const tx = await bugNFT.mintBug(
        walletAddress,
        upload.metadataCid,
        rarityLevel,
        upload.votesFor || 0
      );

      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      console.log('✅ NFT Minted!', receipt.hash);

      // Get the minted token ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = bugNFT.interface.parseLog(log);
          return parsed?.name === 'BugMinted';
        } catch {
          return false;
        }
      });

      let tokenId = 'Unknown';
      if (event) {
        const parsed = bugNFT.interface.parseLog(event);
        tokenId = parsed?.args?.tokenId?.toString() || 'Unknown';
      }

      alert(`🎉 NFT Minted Successfully!\n\n✨ Token ID: ${tokenId}\n🎨 Rarity: ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][rarityLevel]}\n📊 Based on ${upload.votesFor || 0} upvotes\n\n🔗 Transaction: ${receipt.hash}`);
      
      // Show Blockscout transaction link
      const { getTransactionUrl } = await import('@/lib/blockscout');
      setTimeout(() => {
        alert(`🔍 View on Explorer:\n${getTransactionUrl(receipt.hash)}`);
      }, 500);

      // Reload uploads to update status
      await loadUploads();
      
      // Switch to on-chain tab to show the newly minted NFT
      setActiveTab('on-chain');
    } catch (error: any) {
      const err = error as Error;
      console.error('Failed to mint NFT:', err);
      
      if (err.message?.includes('Not authorized to mint')) {
        alert(`❌ Minting Error\n\nThe contract needs to authorize minting. This requires the contract owner to call authorizeM inter(yourAddress).\n\nPlease contact the admin.`);
      } else {
        alert(`Failed to mint NFT: ${err.message}`);
      }
    } finally {
      setSubmitting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-24">
        <Card className="p-8 max-w-md w-full text-center">
          <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">My Collection</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your bug photos
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">My Collection</h1>
            <p className="text-muted-foreground">
              {uploads.length} {uploads.length === 1 ? 'bug photo' : 'bug photos'} uploaded
            </p>
          </div>
        </div>

        {/* Info Banner */}
        {uploads.length > 0 && uploads.some(u => !u.submittedToBlockchain) && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">How BugDex Works</h3>
                <p className="text-sm text-muted-foreground">
                  Your bug photos are <span className="font-semibold text-foreground">saved to IPFS</span> (decentralized storage) for free! 
                  <span className="font-semibold text-foreground"> Stake 10 BUG</span> to submit for community voting.
                  Voting is <span className="font-semibold text-foreground">FREE for everyone</span> (no gas fees!).
                  Earn <span className="font-semibold text-green-600">5 BUG per upvote</span>! More upvotes = rarer NFT!
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                  <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">💾 Free IPFS Storage</span>
                  <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">💎 Stake 10 BUG</span>
                  <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">🗳️ Free Voting</span>
                  <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">💰 5 BUG/upvote</span>
                  <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">🎨 NFT Rewards</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {uploads.length === 0 && (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No bugs yet!</h2>
            <p className="text-muted-foreground mb-4">
              Start discovering and documenting bugs around you
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm text-left space-y-2">
              <p><strong>📸 Take Photos:</strong> Snap bugs you discover</p>
              <p><strong>💾 Free Storage:</strong> Photos saved to IPFS (decentralized)</p>
              <p><strong>� Stake to Submit:</strong> Stake 10 BUG to submit for community voting</p>
              <p><strong>🗳️ Free Voting:</strong> Community votes for FREE (no gas fees!)</p>
              <p><strong>💰 Earn Rewards:</strong> Get 5 BUG per upvote! More votes = rarer NFT</p>
              <p><strong>🎨 Mint NFTs:</strong> If approved, mint your bug as an NFT</p>
              <p><strong>🌍 Help Science:</strong> Contribute to bug conservation data</p>
            </div>
            <Link href="/">
              <Button size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Take Your First Bug Photo
              </Button>
            </Link>
          </Card>
        )}

        {/* Tab Navigation */}
        {uploads.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeTab === 'off-chain' ? 'default' : 'outline'}
              onClick={() => setActiveTab('off-chain')}
              className="flex-1 sm:flex-initial"
            >
              📤 Off-Chain ({offChainUploads.length})
            </Button>
            <Button 
              variant={activeTab === 'on-chain' ? 'default' : 'outline'}
              onClick={() => setActiveTab('on-chain')}
              className="flex-1 sm:flex-initial"
            >
              ⛓️ On-Chain NFTs ({onChainUploads.length})
            </Button>
          </div>
        )}

        {/* Grid of uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'off-chain' ? offChainUploads : onChainUploads).map((upload) => {
            // Calculate rarity and status-based styling
            const netVotes = (upload.votesFor || 0) - (upload.votesAgainst || 0);
            const rarity = getRarityFromScore(netVotes);
            const isVoting = upload.votingStatus === 'pending_voting';
            const isApproved = upload.votingStatus === 'approved' || upload.votingApproved;
            const isRejected = upload.votingStatus === 'rejected';
            
            // Dynamic border and shadow based on status
            let cardClasses = "overflow-hidden cursor-pointer transition-all duration-300 ";
            if (isVoting) {
              cardClasses += "border-2 border-yellow-400 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30";
            } else if (isRejected) {
              cardClasses += "border-2 border-red-400 opacity-70";
            } else if (isApproved) {
              cardClasses += `border-2 ${rarity.cssClass || 'border-green-500'} hover:shadow-2xl`;
            } else {
              cardClasses += "border border-border hover:shadow-xl";
            }

            // Render NFTWithRarityFrame for on-chain tab
            if (activeTab === 'on-chain') {
              return (
                <div 
                  key={upload.id}
                  onClick={() => {
                    setSelectedBug(upload);
                    setIsModalOpen(true);
                  }}
                >
                  <NFTWithRarityFrame
                    imageUrl={upload.imageUrl}
                    voteScore={netVotes}
                    name={upload.bugInfo?.commonName || 'Unknown Bug'}
                    description={upload.bugInfo?.scientificName || ''}
                    votesFor={upload.votesFor}
                    votesAgainst={upload.votesAgainst}
                  />
                </div>
              );
            }

            // Regular card for off-chain tab
            return (
              <Card 
                key={upload.id} 
                className={cardClasses}
                onClick={() => {
                  setSelectedBug(upload);
                  setIsModalOpen(true);
                }}
              >
              {/* Image */}
              <div className="relative aspect-square bg-muted">
                <img
                  src={upload.imageUrl}
                  alt="Bug photo"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                {/* Status Badges */}
                {isVoting && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 font-semibold animate-pulse">
                    <Info className="h-3 w-3" />
                    Voting
                  </div>
                )}
                
                {isApproved && !upload.submittedToBlockchain && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 font-semibold">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                  </div>
                )}
                
                {isRejected && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Rejected
                  </div>
                )}
                
                {upload.submittedToBlockchain && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    On-Chain
                  </div>
                )}
                
                {upload.bugInfo && upload.bugInfo.confidence > 0.7 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI ID
                  </div>
                )}
                
                {/* Rarity Badge (bottom) - shown after voting ends */}
                {(isApproved || upload.submittedToBlockchain) && (
                  <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getRarityBgColor(rarity.name)} text-white flex items-center gap-1`}>
                    <span>{rarity.emoji}</span>
                    <span>{rarity.name}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                {/* Bug Identification */}
                {upload.bugInfo && (
                  <div className="border-b pb-3 space-y-1">
                    <h3 className="font-bold text-lg">{upload.bugInfo.commonName}</h3>
                    <p className="text-sm italic text-muted-foreground">
                      {upload.bugInfo.scientificName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Rarity Badge */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        upload.bugInfo.rarity === 'very rare' ? 'bg-purple-100 text-purple-700' :
                        upload.bugInfo.rarity === 'rare' ? 'bg-yellow-100 text-yellow-700' :
                        upload.bugInfo.rarity === 'uncommon' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {upload.bugInfo.rarity}
                      </span>
                      
                      {/* Danger Badge */}
                      {upload.bugInfo.isDangerous && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Caution
                        </span>
                      )}
                      
                      {/* Size */}
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {upload.bugInfo.size}
                      </span>
                    </div>
                    
                    {/* Quick Facts */}
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <div><strong>Family:</strong> {upload.bugInfo.family}</div>
                      <div><strong>Diet:</strong> {upload.bugInfo.diet}</div>
                      <div><strong>Habitat:</strong> {upload.bugInfo.habitat}</div>
                    </div>
                    
                    {/* Confidence */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Shield className="h-3 w-3" />
                      <span>{Math.round(upload.bugInfo.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{upload.location.state}, {upload.location.country}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(upload.timestamp).toLocaleDateString()}</span>
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  <a
                    href={upload.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View Image <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={upload.metadataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Metadata <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Action Button - Off-Chain Voting System */}
                {!upload.submittedToBlockchain ? (
                  <div className="space-y-2">
                    {/* Not yet submitted for voting */}
                    {(!upload.votingStatus || upload.votingStatus === 'not_submitted') && (
                      <>
                        <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-2 rounded border border-amber-200 dark:border-amber-800">
                          <span className="font-semibold">💾 Saved Off-Chain</span>
                          <p className="mt-1">Submit for community voting! Requires 10 BUG stake. Earn 5 BUG per upvote!</p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening
                            submitForVoting(upload);
                          }}
                          disabled={submitting === upload.id}
                          className="w-full"
                          variant="default"
                        >
                          {submitting === upload.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit for Voting (Stake 10 BUG)
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    
                    {/* Currently in voting */}
                    {upload.votingStatus === 'pending_voting' && upload.votingDeadline && (
                      <div className="text-sm bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-3 rounded-md border-2 border-yellow-400 dark:border-yellow-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold text-yellow-900 dark:text-yellow-100">🗳️ Active Voting</span>
                          </div>
                          <CountdownTimer deadline={upload.votingDeadline} />
                        </div>
                        
                        {/* BUG Stake Display */}
                        <div className="mb-2 bg-purple-100 dark:bg-purple-900/30 p-2 rounded border border-purple-300 dark:border-purple-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-700 dark:text-purple-300">💎 Staked</span>
                            <span className="text-sm font-bold text-purple-600">{upload.bugStaked || 10} BUG</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-purple-700 dark:text-purple-300">💰 Potential Rewards</span>
                            <span className="text-sm font-bold text-purple-600">{(upload.votesFor || 0) * 5} BUG</span>
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">
                            (5 BUG per upvote)
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded border border-green-300 dark:border-green-700">
                            <div className="text-xs text-green-700 dark:text-green-300">For</div>
                            <div className="text-lg font-bold text-green-600">{upload.votesFor || 0}</div>
                          </div>
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border border-red-300 dark:border-red-700">
                            <div className="text-xs text-red-700 dark:text-red-300">Against</div>
                            <div className="text-lg font-bold text-red-600">{upload.votesAgainst || 0}</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-center text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                          Net Score: <span className="font-bold">{(upload.votesFor || 0) - (upload.votesAgainst || 0)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Approved - Ready to mint */}
                    {upload.votingStatus === 'approved' && upload.votingApproved && (
                      <>
                        {(() => {
                          const rarity = calculateRarity(upload.votesFor, upload.votesAgainst);
                          const netVotes = (upload.votesFor || 0) - (upload.votesAgainst || 0);
                          
                          return (
                            <>
                              <div className={`text-sm p-3 rounded-md border-2 ${rarity.borderColor} bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold">✅ Approved by Community!</span>
                                </div>
                                
                                {/* Rarity Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${rarity.bgColor} text-white shadow-lg`}>
                                    <span>{rarity.emoji}</span>
                                    <span>{rarity.tier.toUpperCase()}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    (+{netVotes} net votes)
                                  </span>
                                </div>
                                
                                {/* BUG Rewards Earned */}
                                <div className="mb-2 bg-green-100 dark:bg-green-900/30 p-2 rounded border border-green-300 dark:border-green-700">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-green-700 dark:text-green-300">🎉 Rewards Earned</span>
                                    <span className="text-sm font-bold text-green-600">{upload.bugRewardsEarned || ((upload.votesFor || 0) * 5)} BUG</span>
                                  </div>
                                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                                    ({upload.votesFor || 0} upvotes × 5 BUG) + {upload.bugStaked || 10} BUG stake returned
                                  </div>
                                </div>
                                
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>👍 For:</span>
                                    <span className="font-semibold text-green-600">{upload.votesFor || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>👎 Against:</span>
                                    <span className="font-semibold text-red-600">{upload.votesAgainst || 0}</span>
                                  </div>
                                </div>
                                
                                <p className="text-xs mt-2 text-muted-foreground">
                                  Your NFT will have a <strong className={rarity.color}>{rarity.tier}</strong> design! Higher votes = rarer card. 🎨
                                </p>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mintNFT(upload);
                                }}
                                disabled={submitting === upload.id}
                                className={`w-full font-bold shadow-lg ${rarity.bgColor} hover:opacity-90 border-2 ${rarity.borderColor}`}
                              >
                                {submitting === upload.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Minting...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Mint {rarity.tier} NFT {rarity.emoji}
                                  </>
                                )}
                              </Button>
                            </>
                          );
                        })()}
                      </>
                    )}
                    
                    {/* Rejected */}
                    {upload.votingStatus === 'rejected' && !upload.votingApproved && (
                      <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-semibold">❌ Not Approved</span>
                        </div>
                        <div className="text-xs mt-1">
                          This submission didn&apos;t receive enough community votes.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Show voting status */}
                    {upload.blockchainStatus && !upload.blockchainStatus.resolved && (
                      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-4 w-4" />
                          <span className="font-semibold">In Voting</span>
                        </div>
                        <div className="text-xs">
                          Votes For: {upload.blockchainStatus.votesFor} / 5<br />
                          Votes Against: {upload.blockchainStatus.votesAgainst}
                        </div>
                      </div>
                    )}
                    
                    {/* Show approved status with claim button */}
                    {upload.blockchainStatus?.resolved && 
                     upload.blockchainStatus?.approved && 
                     !upload.blockchainStatus?.nftClaimed && (
                      <Button
                        onClick={() => claimNFT(upload)}
                        disabled={claiming === upload.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {claiming === upload.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Claim Your NFT
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* Show NFT claimed status */}
                    {upload.blockchainStatus?.nftClaimed && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        NFT Claimed
                      </Button>
                    )}
                    
                    {/* Show rejected status */}
                    {upload.blockchainStatus?.resolved && 
                     !upload.blockchainStatus?.approved && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-semibold">Not Approved</span>
                        </div>
                        <div className="text-xs mt-1">
                          This submission didn&apos;t receive enough votes
                        </div>
                      </div>
                    )}
                    
                    {/* If just submitted (no status yet) */}
                    {!upload.blockchainStatus && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submitted
                      </Button>
                    )}
                    
                    {upload.transactionHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${upload.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center justify-center gap-1"
                      >
                        View Transaction <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Bug Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBug && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedBug.bugInfo?.commonName || "Bug Details"}
                </DialogTitle>
                <DialogDescription>
                  {selectedBug.bugInfo?.scientificName && (
                    <span className="italic">{selectedBug.bugInfo.scientificName}</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedBug.imageUrl}
                    alt="Bug"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* AI Identification Section */}
                {selectedBug.bugInfo && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      AI Identification
                    </h3>
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Family</p>
                        <p className="font-medium">{selectedBug.bugInfo.family}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order</p>
                        <p className="font-medium">{selectedBug.bugInfo.order}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Size</p>
                        <p className="font-medium">{selectedBug.bugInfo.size}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lifespan</p>
                        <p className="font-medium">{selectedBug.bugInfo.lifespan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diet</p>
                        <p className="font-medium">{selectedBug.bugInfo.diet}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rarity</p>
                        <p className="font-medium capitalize">{selectedBug.bugInfo.rarity}</p>
                      </div>
                    </div>

                    {/* Characteristics */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Characteristics</p>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Venom</p>
                          <p className="font-bold">{selectedBug.bugInfo.characteristics.venom}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Bite</p>
                          <p className="font-bold">{selectedBug.bugInfo.characteristics.biteForce}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Disease</p>
                          <p className="font-bold">{selectedBug.bugInfo.characteristics.disease}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Aggression</p>
                          <p className="font-bold">{selectedBug.bugInfo.characteristics.aggression}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Speed</p>
                          <p className="font-bold">{selectedBug.bugInfo.characteristics.speed}/10</p>
                        </div>
                      </div>
                    </div>

                    {/* Habitat & Distribution */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Habitat</p>
                        <p className="font-medium">{selectedBug.bugInfo.habitat}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Distribution</p>
                        <p className="font-medium">{selectedBug.bugInfo.distribution}</p>
                      </div>
                    </div>

                    {/* Conservation Status */}
                    <div>
                      <p className="text-sm text-muted-foreground">Conservation Status</p>
                      <p className="font-medium">{selectedBug.bugInfo.conservationStatus}</p>
                    </div>

                    {/* Danger Level */}
                    {selectedBug.bugInfo.isDangerous && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-semibold text-red-500">Potentially Dangerous</p>
                          <p className="text-sm text-muted-foreground">Danger Level: {selectedBug.bugInfo.dangerLevel}/10</p>
                        </div>
                      </div>
                    )}

                    {/* Interesting Facts */}
                    {selectedBug.bugInfo.interestingFacts && selectedBug.bugInfo.interestingFacts.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Interesting Facts</p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedBug.bugInfo.interestingFacts.map((fact, index) => (
                            <li key={index} className="text-sm">{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Confidence */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>AI Confidence: {Math.round(selectedBug.bugInfo.confidence * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Location & Time */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    Discovery Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedBug.location.state}, {selectedBug.location.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(selectedBug.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {selectedBug.submittedToBlockchain ? (
                        <p className="font-medium text-green-500 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          On Blockchain
                        </p>
                      ) : (
                        <p className="font-medium text-muted-foreground">Not Submitted</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* IPFS Links */}
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="font-semibold text-sm text-muted-foreground">IPFS Data</h3>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={selectedBug.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View Image <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={selectedBug.metadataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View Metadata <ExternalLink className="h-3 w-3" />
                    </a>
                    {selectedBug.transactionHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${selectedBug.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View Transaction <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
