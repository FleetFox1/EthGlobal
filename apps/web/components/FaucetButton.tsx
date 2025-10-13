"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";
import { Loader2, Coins, CheckCircle, XCircle } from "lucide-react";
import { ethers } from "ethers";

export function FaucetButton() {
  const { walletAddress, isAuthenticated } = useUser();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const claimFaucet = async () => {
    if (!walletAddress || !isAuthenticated) {
      setError("Please connect your wallet first");
      return;
    }

    setClaiming(true);
    setMessage("");
    setError("");

    try {
      // Get provider from window.ethereum (MetaMask/Privy)
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // BugToken contract address (Sepolia)
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS!;
      
      // BugToken ABI (just the claimFaucet function)
      const bugTokenABI = [
        "function claimFaucet() external",
        "function canClaimFaucet(address account) external view returns (bool)",
        "function timeUntilNextClaim(address account) external view returns (uint256)",
      ];

      const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, signer);

      // Claim from faucet (contract will revert if cooldown not passed)
      console.log("🎰 Claiming 100 BUG tokens...");
      
      // Add a timeout to prevent hanging forever
      const txPromise = bugToken.claimFaucet();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transaction timeout")), 30000)
      );
      
      const tx = await Promise.race([txPromise, timeoutPromise]);
      
      setMessage("⏳ Transaction submitted... waiting for confirmation");
      
      const receipt = await tx.wait();
      
      console.log("✅ Faucet claimed!", receipt);
      setMessage("🎉 Successfully claimed 100 BUG tokens!");
      setError("");

    } catch (err: any) {
      console.error("❌ Faucet claim failed:", err);
      
      // Parse contract revert reasons
      if (err.reason) {
        setError(err.reason);
      } else if (err.message.includes("Cooldown period not passed")) {
        setError("⏰ Please wait 24 hours between claims");
      } else if (err.message.includes("wait")) {
        setError(err.message);
      } else if (err.code === "ACTION_REJECTED" || err.message.includes("user rejected")) {
        setError("❌ Transaction cancelled");
      } else if (err.message.includes("insufficient funds")) {
        setError("❌ Insufficient ETH for gas fees");
      } else {
        // Show a more user-friendly message
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

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Coins className="h-8 w-8 text-green-500" />
        <div>
          <h3 className="text-lg font-bold">Free BUG Tokens</h3>
          <p className="text-sm text-muted-foreground">Claim 100 BUG every 24 hours</p>
        </div>
      </div>

      <Button 
        onClick={claimFaucet} 
        disabled={claiming}
        className="w-full"
        size="lg"
      >
        {claiming ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Claiming...
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
