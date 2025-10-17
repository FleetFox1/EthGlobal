"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckCircle, Coins } from "lucide-react";
import { ethers } from "ethers";

interface UnlockFaucetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

export function UnlockFaucetModal({
  open,
  onClose,
  onSuccess,
  walletAddress,
}: UnlockFaucetModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"eth" | "pyusd" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlockWithETH = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentMethod("eth");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use V2 contract for unlock functionality
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_V2_ADDRESS || process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
      if (!bugTokenAddress) {
        throw new Error("Contract address not configured");
      }

      const bugTokenABI = [
        "function unlockWithETH() external payable",
        "event FaucetUnlocked(address indexed user, string paymentMethod, uint256 amount)",
      ];

      const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, signer);

      console.log("💰 Unlocking faucet with ETH...");
      const tx = await bugToken.unlockWithETH({
        value: ethers.parseEther("0.00033"), // ~$1
      });

      console.log("⏳ Waiting for confirmation...");
      await tx.wait();

      console.log("✅ Faucet unlocked!");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to unlock:", error);
      setError(error.message || "Failed to unlock faucet");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockWithPYUSD = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentMethod("pyusd");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use V2 contract for unlock functionality
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_V2_ADDRESS || process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
      const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_ADDRESS;

      if (!bugTokenAddress || !pyusdAddress) {
        throw new Error("Contract addresses not configured");
      }

      // First, approve PYUSD spending
      const pyusdABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];
      const pyusd = new ethers.Contract(pyusdAddress, pyusdABI, signer);

      console.log("💰 Approving PYUSD...");
      const approveTx = await pyusd.approve(bugTokenAddress, ethers.parseUnits("1", 6)); // 1 PYUSD
      await approveTx.wait();

      // Then unlock with PYUSD
      const bugTokenABI = [
        "function unlockWithPYUSD() external",
      ];
      const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, signer);

      console.log("🔓 Unlocking faucet with PYUSD...");
      const tx = await bugToken.unlockWithPYUSD();

      console.log("⏳ Waiting for confirmation...");
      await tx.wait();

      console.log("✅ Faucet unlocked!");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to unlock:", error);
      setError(error.message || "Failed to unlock faucet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Unlock BugDex Voting
          </DialogTitle>
          <DialogDescription>
            One-time payment to unlock unlimited BUG token claims
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold text-sm">What you get:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                100 BUG tokens immediately
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Unlimited free faucet claims (1 per day)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Vote on community submissions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Earn rewards for correct votes
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <p className="text-3xl font-bold">$1</p>
            <p className="text-sm text-muted-foreground">One-time unlock fee</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Choose payment method:</p>

            {/* ETH Payment */}
            <Button
              onClick={handleUnlockWithETH}
              disabled={loading}
              className="w-full h-auto py-4 flex-col gap-2"
              variant="default"
            >
              {loading && paymentMethod === "eth" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Unlocking with ETH...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    <span className="font-semibold">Pay with ETH</span>
                  </div>
                  <span className="text-xs opacity-80">~0.00033 ETH</span>
                </>
              )}
            </Button>

            {/* PYUSD Payment */}
            <Button
              onClick={handleUnlockWithPYUSD}
              disabled={loading}
              className="w-full h-auto py-4 flex-col gap-2"
              variant="outline"
            >
              {loading && paymentMethod === "pyusd" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Unlocking with PYUSD...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    <span className="font-semibold">Pay with PYUSD</span>
                  </div>
                  <span className="text-xs opacity-80">1.00 PYUSD</span>
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Funds support gas pool for gasless operations. This is a one-time payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
