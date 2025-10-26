import { ethers } from "hardhat";

/**
 * Redeploy BugSubmissionStaking to use BugTokenV3
 */
async function main() {
  console.log("🚀 Redeploying BugSubmissionStaking with V3 token...\n");

  // @ts-ignore
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("🔑 Deploying with account:", deployer.address);
  // @ts-ignore
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Use BugTokenV3 address
  const BUG_TOKEN_V3 = "0x5f7421B1e03D644CaFD3B13b2da2557748571a67";
  
  console.log("📋 Configuration:");
  console.log("  BugTokenV3:", BUG_TOKEN_V3);
  console.log("");

  // Deploy staking contract
  console.log("📦 Deploying BugSubmissionStaking...");
  const BugSubmissionStaking = await ethers.getContractFactory("BugSubmissionStaking");
  const staking = await BugSubmissionStaking.deploy(BUG_TOKEN_V3);
  
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  
  console.log("✅ BugSubmissionStaking deployed to:", stakingAddress);
  console.log("");

  // Verify it's using V3
  const tokenAddress = await staking.bugToken();
  console.log("🔍 Staking contract using token:", tokenAddress);
  console.log("✅ Correct! Using V3:", tokenAddress === BUG_TOKEN_V3);
  
  console.log("\n📝 Update these environment variables:");
  console.log("NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=" + stakingAddress);
  
  console.log("\n⚠️ IMPORTANT: Fund the staking contract with BUG tokens for rewards!");
  console.log("Run: npx hardhat run scripts/fund-staking.ts --network sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
