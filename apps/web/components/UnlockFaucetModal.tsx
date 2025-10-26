"use client";

import { useState, useEffect } from "react";
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
  const [ethUnlockCost, setEthUnlockCost] = useState<string>("0.00033"); // Default fallback
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Fetch dynamic ETH unlock cost from Pyth oracle
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Use V3 contract with Pyth oracle
        const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_V3_ADDRESS || 
                                process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
        
        if (!bugTokenAddress) {
          console.warn("BugToken address not configured, using fallback price");
          setLoadingPrice(false);
          return;
        }

        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb"
        );

        const bugTokenABI = [
          "function getETHUnlockCost() public view returns (uint256)",
        ];

        const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, provider);
        const costInWei = await bugToken.getETHUnlockCost();
        const costInEth = ethers.formatEther(costInWei);
        
        console.log("💰 Dynamic ETH unlock cost from Pyth:", costInEth, "ETH");
        setEthUnlockCost(costInEth);
        setLoadingPrice(false);
      } catch (error) {
        console.error("Failed to fetch ETH price, using fallback:", error);
        setLoadingPrice(false);
      }
    };

    if (open) {
      fetchEthPrice();
    }
  }, [open]);

  const handleUnlockWithETH = async () => {
    setLoading(true);
    setError(null);
    setPaymentMethod("eth");

    try {
      console.log("🔍 Checking wallet provider...");
      console.log("window.ethereum exists:", !!window.ethereum);
      console.log("Expected wallet:", walletAddress);
      
      // Check for wallet provider (works on mobile MetaMask and desktop)
      if (!window.ethereum) {
        throw new Error("🦊 Please use MetaMask mobile browser to unlock. Open bugdex.life in MetaMask app → Browser tab");
      }

      console.log("✅ window.ethereum found, creating provider...");
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
            throw new Error("⚠️ Please switch to Sepolia testnet in MetaMask. You're on the wrong network!");
          }
        }
      }
      
      console.log("🔑 Getting signer...");
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log("Signer address:", signerAddress);
      console.log("Expected address:", walletAddress);
      
      // On mobile, ensure we're using the already-connected wallet
      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(`Wallet mismatch: Connected ${signerAddress}, expected ${walletAddress}`);
      }

      // Use V3 contract with Pyth oracle for dynamic pricing
      const bugTokenAddress = process.env.NEXT_PUBLIC_BUG_TOKEN_V3_ADDRESS || 
                              process.env.NEXT_PUBLIC_BUG_TOKEN_ADDRESS;
      if (!bugTokenAddress) {
        throw new Error("Contract address not configured");
      }

      const bugTokenABI = [
        "function unlockWithETH() external payable",
        "function getETHUnlockCost() public view returns (uint256)",
        "event FaucetUnlocked(address indexed user, string paymentMethod, uint256 amount)",
      ];

      const bugToken = new ethers.Contract(bugTokenAddress, bugTokenABI, signer);

      // Get current ETH unlock cost from Pyth oracle
      console.log("📊 Fetching current ETH/USD price from Pyth...");
      const requiredETH = await bugToken.getETHUnlockCost();
      const ethAmount = ethers.formatEther(requiredETH);
      console.log("💰 Required ETH for $1 unlock:", ethAmount, "ETH");

      console.log("💰 Unlocking faucet with ETH (dynamic price)...");
      const tx = await bugToken.unlockWithETH({
        value: requiredETH, // Dynamic price from Pyth oracle
      });

      console.log("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();

      console.log("✅ Faucet unlocked!");
      
      // Show Blockscout transaction link
      const { getTransactionUrl } = await import('@/lib/blockscout');
      const explorerUrl = getTransactionUrl(receipt.hash);
      alert(`✅ Faucet Unlocked with ETH!\n\n💰 Cost: ${ethAmount} ETH (live Pyth price)\n💎 You can now claim 100 BUG tokens daily!\n\n🔗 Opening explorer in new tab...`);
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      
      // Record unlock in database for mobile compatibility
      try {
        await fetch('/api/faucet/record-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            paymentMethod: 'ETH',
            transactionHash: receipt.hash,
            amount: ethAmount // Dynamic amount from Pyth
          })
        });
        console.log('✅ Unlock recorded in database');
      } catch (dbError) {
        console.warn('Failed to record unlock in database:', dbError);
        // Don't fail the whole operation if DB record fails
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Failed to unlock with ETH:", error);
      
      // Better error messages for mobile users
      if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        setError("💰 Insufficient funds. You need ~0.0005 ETH (unlock fee + gas). Get free Sepolia ETH at sepoliafaucet.com");
      } else if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
        setError("❌ Transaction cancelled");
      } else if (error.message?.includes('Wallet mismatch')) {
        setError(error.message);
      } else {
        setError(error.message || "Failed to unlock faucet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockWithPYUSD = async () => {
    setLoading(true);
    setError(null);
    setPaymentMethod("pyusd");

    try {
      console.log("🔍 Checking wallet provider (PYUSD)...");
      console.log("window.ethereum exists:", !!window.ethereum);
      console.log("Expected wallet:", walletAddress);
      
      // Check for wallet provider (works on mobile MetaMask and desktop)
      if (!window.ethereum) {
        throw new Error("🦊 Please use MetaMask mobile browser to unlock. Open bugdex.life in MetaMask app → Browser tab");
      }

      console.log("✅ window.ethereum found, creating provider...");
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
            throw new Error("⚠️ Please switch to Sepolia testnet in MetaMask. You're on the wrong network!");
          }
        }
      }
      
      console.log("🔑 Getting signer...");
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log("Signer address:", signerAddress);
      console.log("Expected address:", walletAddress);
      
      // On mobile, ensure we're using the already-connected wallet
      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error(`Wallet mismatch: Connected ${signerAddress}, expected ${walletAddress}`);
      }

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
      const receipt = await tx.wait();

      console.log("✅ Faucet unlocked!");
      
      // Show Blockscout transaction link
      const { getTransactionUrl } = await import('@/lib/blockscout');
      const explorerUrl = getTransactionUrl(receipt.hash);
      alert(`✅ Faucet Unlocked with PYUSD!\n\n💰 Cost: $1 PYUSD\n💎 You can now claim 100 BUG tokens daily!\n\n🔗 Opening explorer in new tab...`);
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      
      // Record unlock in database for mobile compatibility
      try {
        await fetch('/api/faucet/record-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            paymentMethod: 'PYUSD',
            transactionHash: receipt.hash,
            amount: '1.0'
          })
        });
        console.log('✅ Unlock recorded in database');
      } catch (dbError) {
        console.warn('Failed to record unlock in database:', dbError);
        // Don't fail the whole operation if DB record fails
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Failed to unlock with PYUSD:", error);
      
      // Better error messages for mobile users
      if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        setError("💰 Insufficient PYUSD or ETH for gas. You need $1 PYUSD + small ETH for gas fees");
      } else if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
        setError("❌ Transaction cancelled");
      } else if (error.message?.includes('Wallet mismatch')) {
        setError(error.message);
      } else {
        setError(error.message || "Failed to unlock faucet");
      }
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
            <p className="text-sm text-muted-foreground">One-time payment</p>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingPrice ? (
                "Loading current price..."
              ) : (
                <>Unlocks lifetime faucet access + 100 BUG tokens</>
              )}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Choose payment method:</p>

            {/* ETH Payment */}
            <Button
              onClick={handleUnlockWithETH}
              disabled={loading || loadingPrice}
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
                  <span className="text-xs opacity-80">
                    {loadingPrice ? (
                      <Loader2 className="h-3 w-3 animate-spin inline" />
                    ) : (
                      <>~{parseFloat(ethUnlockCost).toFixed(6)} ETH (live price via Pyth)</>
                    )}
                  </span>
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
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-3">
              <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Where Your $1 Goes:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li>• <strong>Gas Pool:</strong> Enables gasless transactions for you and others</li>
                <li>• <strong>Conservation:</strong> Supports bug conservation organizations</li>
              </ul>
            </div>
            <p className="text-amber-600 dark:text-amber-400 text-center">
              <strong>Note:</strong> BUG tokens have no monetary value and cannot be exchanged for fiat or cryptocurrency.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
