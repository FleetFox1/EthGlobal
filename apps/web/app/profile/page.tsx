"use client";

import { useUser } from "@/lib/useUser";
import { useWallet } from "@/lib/useWallet";
import { useBugToken, useBugNFT, areContractsConfigured } from "@/lib/contract-hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Wallet, 
  Trophy, 
  Target, 
  TrendingUp, 
  Loader2, 
  Camera,
  User,
  Bell,
  Lock,
  Palette,
  DollarSign,
  Save,
  Check
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OnChainStats {
  bugTokenBalance: string;
  nftCount: number;
  pyusdValue: string;
}

export default function ProfileV2() {
  const { profile, loading: userLoading, isAuthenticated } = useUser();
  const { isConnected, address } = useWallet();
  const { getBalance: getBugBalance } = useBugToken();
  const { getBalance: getNFTBalance } = useBugNFT();
  
  const [onChainStats, setOnChainStats] = useState<OnChainStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Profile Settings State
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [voteNotifications, setVoteNotifications] = useState(true);
  const [mintNotifications, setMintNotifications] = useState(true);
  
  // Privacy Settings
  const [publicCollection, setPublicCollection] = useState(true);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  
  // Display Preferences
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [currency, setCurrency] = useState<"USD" | "ETH" | "PYUSD">("USD");
  
  // Blockchain Settings
  const [defaultPayment, setDefaultPayment] = useState<"ETH" | "PYUSD">("ETH");

  // Load blockchain stats
  useEffect(() => {
    if (isConnected && address) {
      loadOnChainStats();
    }
  }, [isConnected, address]);

  // Initialize settings from profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      // Load other settings from profile when available
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      // TODO: Save profile settings to backend/blockchain
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      
      console.log("Saving profile:", {
        username,
        bio,
        profilePicture,
        emailNotifications,
        voteNotifications,
        mintNotifications,
        publicCollection,
        showWalletAddress,
        shareLocation,
        theme,
        currency,
        defaultPayment,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadOnChainStats = async () => {
    setIsLoadingStats(true);
    
    try {
      if (!areContractsConfigured() || !isConnected || !address) {
        // Mock data when contracts not configured
        setOnChainStats({
          bugTokenBalance: "600",
          nftCount: 6,
          pyusdValue: "6.00",
        });
        setIsLoadingStats(false);
        return;
      }

      // Fetch real on-chain data
      const [bugBalance, nftCount] = await Promise.all([
        getBugBalance(address).catch(() => "0"),
        getNFTBalance(address).catch(() => 0),
      ]);

      // Calculate PYUSD value (100 BUG = 1 PYUSD)
      const pyusdValue = (parseFloat(bugBalance) / 100).toFixed(2);

      setOnChainStats({
        bugTokenBalance: parseFloat(bugBalance).toFixed(0),
        nftCount,
        pyusdValue,
      });
    } catch (error) {
      console.error("Failed to load on-chain stats:", error);
      // Fallback to mock data
      setOnChainStats({
        bugTokenBalance: "600",
        nftCount: 6,
        pyusdValue: "6.00",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-muted rounded-lg animate-pulse" />
              <div className="h-24 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view your profile
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" aria-label="Back to home">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your BugDex experience</p>
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Profile</h2>
          </div>
          
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    username?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Profile Picture</p>
                <p className="text-xs text-muted-foreground">Click the camera icon to upload</p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={profile?.username || "Enter username"}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Wallet Address */}
            <div>
              <label className="text-sm font-medium mb-2 block">Wallet Address</label>
              <div className="px-3 py-2 bg-muted border border-border rounded-lg font-mono text-sm text-muted-foreground">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Button
                variant={emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                {emailNotifications ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Vote Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when your submissions receive votes</p>
              </div>
              <Button
                variant={voteNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setVoteNotifications(!voteNotifications)}
              >
                {voteNotifications ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mint Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when you can claim NFTs</p>
              </div>
              <Button
                variant={mintNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setMintNotifications(!mintNotifications)}
              >
                {mintNotifications ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Collection</p>
                <p className="text-sm text-muted-foreground">Allow others to view your bug collection</p>
              </div>
              <Button
                variant={publicCollection ? "default" : "outline"}
                size="sm"
                onClick={() => setPublicCollection(!publicCollection)}
              >
                {publicCollection ? "Public" : "Private"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Wallet Address</p>
                <p className="text-sm text-muted-foreground">Display your full wallet address on profile</p>
              </div>
              <Button
                variant={showWalletAddress ? "default" : "outline"}
                size="sm"
                onClick={() => setShowWalletAddress(!showWalletAddress)}
              >
                {showWalletAddress ? "Show" : "Hide"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Location</p>
                <p className="text-sm text-muted-foreground">Share location data with bug submissions</p>
              </div>
              <Button
                variant={shareLocation ? "default" : "outline"}
                size="sm"
                onClick={() => setShareLocation(!shareLocation)}
              >
                {shareLocation ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Display Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Display</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Currency Display</p>
                <p className="text-sm text-muted-foreground">Preferred currency for values</p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "ETH" | "PYUSD")}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
                <option value="PYUSD">PYUSD</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Blockchain Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Blockchain</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Payment Method</p>
                <p className="text-sm text-muted-foreground">Preferred payment for unlocking faucet</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={defaultPayment === "ETH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDefaultPayment("ETH")}
                >
                  ETH
                </Button>
                <Button
                  variant={defaultPayment === "PYUSD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDefaultPayment("PYUSD")}
                >
                  PYUSD
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        {onChainStats && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{onChainStats.nftCount}</p>
                <p className="text-xs text-muted-foreground">Bugs Collected</p>
              </div>
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{parseInt(onChainStats.bugTokenBalance)}</p>
                <p className="text-xs text-muted-foreground">BUG Tokens</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">${onChainStats.pyusdValue}</p>
                <p className="text-xs text-muted-foreground">PYUSD Value</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link href="/collection">
                <Button variant="outline" className="w-full">
                  View Collection
                </Button>
              </Link>
              <Link href="/voting">
                <Button variant="outline" className="w-full">
                  Vote on Bugs
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
