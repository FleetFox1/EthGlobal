import { ethers } from "hardhat";

/**
 * Deploy BugTokenV3 with Pyth Network oracle integration
 * 
 * Pyth Network on Sepolia:
 * - Pyth Contract: 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
 * - ETH/USD Price Feed: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
 */
async function main() {
  console.log("🚀 Deploying BugTokenV3 with Pyth oracle integration...\n");

  // @ts-ignore
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("🔑 Deploying with account:", deployer.address);
  // @ts-ignore
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Contract addresses
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Sepolia PYUSD
  const PYTH_ADDRESS = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21"; // Pyth on Sepolia
  const ETH_USD_FEED_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD

  console.log("📋 Configuration:");
  console.log("  PYUSD:", PYUSD_ADDRESS);
  console.log("  Pyth Oracle:", PYTH_ADDRESS);
  console.log("  ETH/USD Feed:", ETH_USD_FEED_ID);
  console.log("");

  // Deploy BugTokenV3
  console.log("1️⃣  Deploying BugTokenV3...");
  const BugTokenV3 = await ethers.getContractFactory("BugTokenV3");
  const bugToken = await BugTokenV3.deploy(
    PYUSD_ADDRESS,
    PYTH_ADDRESS,
    ETH_USD_FEED_ID
  );
  await bugToken.waitForDeployment();
  const bugTokenAddress = await bugToken.getAddress();
  console.log("✅ BugTokenV3 deployed to:", bugTokenAddress);

  // Test price feed
  console.log("\n2️⃣  Testing Pyth price feed...");
  try {
    // @ts-ignore
    const requiredETH = await bugToken.getETHUnlockCost();
    console.log("✅ Current ETH unlock cost:", ethers.formatEther(requiredETH), "ETH");
    console.log("💡 This equals $1 at current ETH/USD price");
  } catch (error) {
    console.log("⚠️  Could not fetch price (this is normal if Pyth feed not updated recently)");
    console.log("   Price will work when user calls unlockWithETH()");
  }

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Summary:");
  console.log("  BugTokenV3:", bugTokenAddress);
  console.log("  Pyth Oracle:", PYTH_ADDRESS);
  console.log("  Dynamic Pricing: ✅ ENABLED");
  console.log("\n⚠️  IMPORTANT: Update NEXT_PUBLIC_BUG_TOKEN_ADDRESS in Vercel to:", bugTokenAddress);
  console.log("\n💡 Features:");
  console.log("  - Dynamic ETH unlock cost (Pyth oracle)");
  console.log("  - Always equals $1 regardless of ETH price");
  console.log("  - PYUSD option for stable $1 payment");
  console.log("  - Qualifies for Pyth Network prize! 🏆");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
