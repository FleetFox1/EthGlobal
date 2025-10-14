"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Info
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
}

export default function CollectionPage() {
  const { walletAddress, isAuthenticated } = useUser();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      loadUploads();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, walletAddress]);

  const loadUploads = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/uploads?address=${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        setUploads(data.data.uploads);
      }
    } catch (error) {
      console.error('Failed to load uploads:', error);
    } finally {
      setLoading(false);
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
      ];

      const bugVoting = new ethers.Contract(bugVotingAddress, bugVotingABI, signer);

      console.log('📝 Submitting to blockchain...');
      const tx = await bugVoting.submitBug(upload.metadataCid, 0); // 0 = common rarity
      
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      // Update upload status
      await fetch('/api/uploads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: upload.id,
          transactionHash: receipt.hash,
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
      <div className="min-h-screen flex items-center justify-center pb-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Card key={upload.id} className="overflow-hidden">
              {/* Image */}
              <div className="relative aspect-square bg-muted">
                <img
                  src={upload.imageUrl}
                  alt="Bug photo"
                  className="w-full h-full object-cover"
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
                    onClick={() => submitToBlockchain(upload)}
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
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submitted
                    </Button>
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
    </div>
  );
}
