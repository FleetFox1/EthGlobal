"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";
import { Loader2, Coins, CheckCircle, XCircle, Lock } from "lucide-react";
import { ethers } from "ethers";
import { UnlockFaucetModal } from "./UnlockFaucetModal";

export function FaucetButton() {
  const { walletAddress, isAuthenticated } = useUser();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);
  const [canClaim, setCanClaim] = useState(true);

  const checkUnlockStatus = async () => {
    if (!walletAddress || !isAuthenticated) {
      setCheckingUnlock(false);
      return;
    }

    try {
      // STEP 1: Check database first (source of truth for unlock status)
      console.log('📡 Checking database unlock status...');
      const dbRes = await fetch(`/api/faucet/check-unlock?wallet=${walletAddress}`);
      const dbData = await dbRes.json();
      
      const dbUnlocked = dbData.success && dbData.hasUnlocked;
      console.log('💾 Database unlock status:', dbUnlocked);
      
      setHasUnlocked(dbUnlocked);
      
      // STEP 2: If unlocked, check cooldown from contract
      if (dbUnlocked && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
          
          console.log('🔍 Using BUG token address:', bugTokenAddress);
          
          if (bugTokenAddress) {
            const bugTokenABI = [
              "function hasUnlocked(address) external view returns (bool)",
              "function canClaimFaucet(address) external view returns (bool)",
              "function timeUntilNextClaim(address) external view returns (uint256)",
            ];

            const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, provider);
            
            // Check if can claim now
            const canClaimNow = await bugToken.canClaimFaucet(walletAddress);
            const timeRemaining = await bugToken.timeUntilNextClaim(walletAddress);
            
            console.log('⏰ Can claim:', canClaimNow, 'Time until next:', Number(timeRemaining), 'seconds');
            setCanClaim(canClaimNow);
            setTimeUntilNextClaim(Number(timeRemaining));
          } else {
            console.error('❌ No BUG token address configured!');
          }
        } catch (contractError) {
          console.error('⚠️ Contract cooldown check failed:', contractError);
          // Keep current state - don't change canClaim
        }
      }
      
    } catch (error) {
      console.error("Failed to check unlock status:", error);
      setHasUnlocked(false); // Default to locked on error
    } finally {
      setCheckingUnlock(false);
    }
  };

  useEffect(() => {
    checkUnlockStatus();
  }, [walletAddress, isAuthenticated]);

  // Countdown timer
  useEffect(() => {
    if (timeUntilNextClaim <= 0) {
      setCanClaim(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeUntilNextClaim((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCanClaim(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilNextClaim]);

  const handleUnlockSuccess = () => {
    setShowUnlockModal(false);
    setHasUnlocked(true);
    setMessage("🎉 Faucet unlocked! You received 100 BUG tokens!");
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Ready to claim!";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const claimFaucet = async () => {
    if (!walletAddress || !isAuthenticated) {
      setError("Please connect your wallet first");
      return;
    }

    setClaiming(true);
    setMessage("");
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // CHECK NETWORK - Critical for testnet!
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const sepoliaChainId = 11155111;
      
      console.log("Current network:", currentChainId);
      console.log("Expected network:", sepoliaChainId);
      
      if (currentChainId !== sepoliaChainId) {
        console.log("❌ Wrong network! Requesting switch to Sepolia...");
        try {
          // Request network switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });
          console.log("✅ Switched to Sepolia testnet");
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
            console.log("✅ Added and switched to Sepolia testnet");
          } else {
            throw new Error("⚠️ Please switch to Sepolia testnet in MetaMask");
          }
        }
      }
      
      const signer = await provider.getSigner();
      // Use current BUG token contract (V3) for claiming
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
      
      const bugTokenABI = [
        "function claimFaucet() external",
        "function canClaimFaucet(address account) external view returns (bool)",
        "function timeUntilNextClaim(address account) external view returns (uint256)",
      ];

      const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, signer);

      console.log("🎰 Claiming 100 BUG tokens...");
      
      const txPromise = bugToken.claimFaucet();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transaction timeout")), 30000)
      );
      
      const tx = await Promise.race([txPromise, timeoutPromise]);
      setMessage("⏳ Transaction submitted... waiting for confirmation");
      
      const receipt = await tx.wait();
      
      console.log("✅ Faucet claimed!", receipt);
      
      // Show Blockscout transaction link with confirm dialog
      const { getTransactionUrl } = await import('@/lib/blockscout');
      const explorerUrl = getTransactionUrl(receipt.hash);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(explorerUrl);
      }
      
      const shouldOpen = confirm(
        `✅ Successfully claimed 100 BUG tokens!\n\n` +
        `🔗 Transaction link copied to clipboard!\n\n` +
        `Click OK to open Blockscout Explorer`
      );
      
      if (shouldOpen) {
        window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      }
      
      setMessage("🎉 Successfully claimed 100 BUG tokens!");
      setError("");
      
      // Refresh cooldown status
      setTimeout(() => checkUnlockStatus(), 2000);
    } catch (err: any) {
      console.error("❌ Faucet claim failed:", err);
      
      if (err.reason) {
        setError(err.reason);
      } else if (err.message && err.message.includes("Cooldown period not passed")) {
        setError("⏰ Please wait 24 hours between claims");
      } else if (err.message && err.message.includes("wait")) {
        setError(err.message);
      } else if (err.code === "ACTION_REJECTED" || (err.message && err.message.includes("user rejected"))) {
        setError("❌ Transaction cancelled");
      } else if (err.message && err.message.includes("insufficient funds")) {
        setError("❌ Insufficient ETH for gas fees");
      } else {
        setError(err.shortMessage || err.message || "Failed to claim faucet");
      }
      setMessage("");
    } finally {
      setClaiming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <Coins className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to claim free BUG tokens
        </p>
      </div>
    );
  }

  if (checkingUnlock) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Checking faucet status...</p>
      </div>
    );
  }

  if (!hasUnlocked) {
    return (
      <>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-bold">Unlock BugDex Voting</h3>
              <p className="text-sm text-muted-foreground">One-time $1 payment</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowUnlockModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Lock className="h-4 w-4 mr-2" />
            Unlock for $1
          </Button>

          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <p>✨ Get 100 BUG tokens immediately</p>
            <p>♾️ Unlimited free claims (1 per day)</p>
            <p>🗳️ Vote on community submissions</p>
          </div>
        </div>

        <UnlockFaucetModal
          open={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onSuccess={handleUnlockSuccess}
          walletAddress={walletAddress!}
        />
      </>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Coins className="h-8 w-8 text-green-500" />
        <div>
          <h3 className="text-lg font-bold">Free BUG Tokens</h3>
          <p className="text-sm text-muted-foreground">
            {canClaim ? "Claim 100 BUG every 24 hours" : `Next claim in ${formatTimeRemaining(timeUntilNextClaim)}`}
          </p>
        </div>
      </div>

      <Button 
        onClick={claimFaucet} 
        disabled={claiming || !canClaim}
        className="w-full"
        size="lg"
      >
        {claiming ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Claiming...
          </>
        ) : !canClaim ? (
          <>
            ⏰ {formatTimeRemaining(timeUntilNextClaim)}
          </>
        ) : (
          <>
            <Coins className="h-4 w-4 mr-2" />
            Claim 100 BUG
          </>
        )}
      </Button>

      {message && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500">{message}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 Use BUG tokens to vote on bug submissions and earn rewards!
        </p>
      </div>
    </div>
  );
}
