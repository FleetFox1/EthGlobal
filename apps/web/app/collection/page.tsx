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
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { ethers } from "ethers";

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
}

export default function CollectionPage() {
  const { walletAddress, isAuthenticated } = useUser();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false for faster initial render
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<UserUpload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      loadUploads();
    }
  }, [isAuthenticated, walletAddress]);

  const loadUploads = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/uploads?address=${walletAddress}`, {
        cache: 'no-store', // Always get fresh data
      });
      const data = await response.json();

      if (data.success) {
        const uploadsWithStatus = await Promise.all(
          data.data.uploads.map(async (upload: UserUpload) => {
            if (upload.submittedToBlockchain && upload.submissionId) {
              const status = await getSubmissionStatus(upload.submissionId);
              return { ...upload, blockchainStatus: status };
            }
            return upload;
          })
        );
        setUploads(uploadsWithStatus);
      }
    } catch (error) {
      console.error('Failed to load uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = async (submissionId: number) => {
    try {
      if (!window.ethereum) return null;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const bugVotingAddress = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS;
      
      if (!bugVotingAddress) return null;

      const bugVotingABI = [
        "function getSubmission(uint256 submissionId) external view returns (address submitter, string memory ipfsHash, uint256 createdAt, uint256 votesFor, uint256 votesAgainst, bool resolved, bool approved, bool nftClaimed, uint256 nftTokenId)",
      ];

      const bugVoting = new ethers.Contract(bugVotingAddress, bugVotingABI, provider);
      const result = await bugVoting.getSubmission(submissionId);

      return {
        resolved: result[5],
        approved: result[6],
        nftClaimed: result[7],
        votesFor: Number(result[3]),
        votesAgainst: Number(result[4]),
      };
    } catch (error) {
      console.error('Failed to get submission status:', error);
      return null;
    }
  };

  const submitToBlockchain = async (upload: UserUpload) => {
    if (!window.ethereum || !walletAddress) return;

    setSubmitting(upload.id);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const bugVotingAddress = process.env.NEXT_PUBLIC_BUG_VOTING_ADDRESS;
      if (!bugVotingAddress) {
        throw new Error('Contract address not configured');
      }

      const bugVotingABI = [
        "function submitBug(string memory metadataCid, uint8 rarity) external returns (uint256)",
        "event SubmissionCreated(uint256 indexed submissionId, address indexed submitter, string ipfsHash)",
      ];

      const bugVoting = new ethers.Contract(bugVotingAddress, bugVotingABI, signer);

      console.log('📝 Submitting to blockchain...');
      const tx = await bugVoting.submitBug(upload.metadataCid, 0); // 0 = common rarity
      
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      // Extract submission ID from event logs
      const submissionId = receipt.logs.length > 0 ? 
        parseInt(receipt.logs[0].topics[1], 16) : 
        undefined;

      // Update upload status
      await fetch('/api/uploads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: upload.id,
          transactionHash: receipt.hash,
          submissionId: submissionId,
        }),
      });

      console.log('✅ Submitted to blockchain!', receipt.hash);
      alert(`Bug submitted for community voting!\n\nTransaction: ${receipt.hash}`);

      // Reload uploads
      await loadUploads();
    } catch (error: any) {
      console.error('Failed to submit:', error);
      alert(`Failed to submit: ${error.message}`);
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
      alert(`🎉 Congratulations! Your Bug NFT has been minted!\n\nTransaction: ${receipt.hash}`);

      // Reload uploads to update status
      await loadUploads();
    } catch (error: any) {
      console.error('Failed to claim NFT:', error);
      alert(`Failed to claim NFT: ${error.message}`);
    } finally {
      setClaiming(null);
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

        {/* Empty State */}
        {uploads.length === 0 && (
          <Card className="p-12 text-center">
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No bugs yet!</h2>
            <p className="text-muted-foreground mb-6">
              Take your first bug photo to get started
            </p>
            <Link href="/">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Bug Photo
              </Button>
            </Link>
          </Card>
        )}

        {/* Grid of uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <Card 
              key={upload.id} 
              className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
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
                {upload.submittedToBlockchain && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
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

                {/* Action Button */}
                {!upload.submittedToBlockchain ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      submitToBlockchain(upload);
                    }}
                    disabled={submitting === upload.id}
                    className="w-full"
                  >
                    {submitting === upload.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit for Voting
                      </>
                    )}
                  </Button>
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
                          This submission didn't receive enough votes
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
          ))}
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
