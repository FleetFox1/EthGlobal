import { ethers } from "hardhat";

async function main() {
  // V3 Token with Pyth oracle
  const BUG_TOKEN_V3 = "0x5f7421B1e03D644CaFD3B13b2da2557748571a67";
  
  // Your test wallet
  const TEST_WALLET = process.env.TEST_WALLET || "0x5582A0d37309D81f9ad26607549DDaB6d6E736Bd";
  
  console.log("\n🔍 Checking Unlock Status...");
  console.log("=====================================");
  console.log("Token (V3):", BUG_TOKEN_V3);
  console.log("Wallet:", TEST_WALLET);
  console.log("=====================================\n");
  
  // Get contract
  const bugToken = await ethers.getContractAt("BugTokenV3", BUG_TOKEN_V3);
  
  // Check unlock status
  const hasUnlocked = await bugToken.hasUnlocked(TEST_WALLET);
  console.log("✅ Has Unlocked:", hasUnlocked);
  
  // Check balance
  const balance = await bugToken.balanceOf(TEST_WALLET);
  console.log("💰 BUG Balance:", ethers.formatEther(balance), "BUG");
  
  // Check last claim time
  const lastClaim = await bugToken.lastFaucetClaim(TEST_WALLET);
  const lastClaimDate = lastClaim > 0n ? new Date(Number(lastClaim) * 1000).toISOString() : "Never";
  console.log("🕐 Last Claim:", lastClaimDate);
  
  // Check if can claim now
  if (hasUnlocked) {
    const COOLDOWN = 24 * 60 * 60; // 1 day in seconds
    const now = Math.floor(Date.now() / 1000);
    const nextClaimTime = Number(lastClaim) + COOLDOWN;
    const canClaim = now >= nextClaimTime;
    
    console.log("⏰ Can Claim Now:", canClaim);
    if (!canClaim) {
      const timeUntil = nextClaimTime - now;
      const hours = Math.floor(timeUntil / 3600);
      const minutes = Math.floor((timeUntil % 3600) / 60);
      console.log(`   ⏳ Wait ${hours}h ${minutes}m`);
    }
  }
  
  console.log("\n=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
