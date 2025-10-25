import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Redeploying BugNFT with public minting support...\n");

  // @ts-ignore
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log("🔑 Deploying with account:", deployer.address);
  // @ts-ignore
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy BugNFT
  console.log("1️⃣  Deploying BugNFT...");
  const BugNFT = await ethers.getContractFactory("BugNFT");
  const bugNFT = await BugNFT.deploy();
  await bugNFT.waitForDeployment();
  const bugNFTAddress = await bugNFT.getAddress();
  console.log("✅ BugNFT deployed to:", bugNFTAddress);

  // Enable public minting immediately
  console.log("\n2️⃣  Enabling public minting...");
  const tx = await bugNFT.enablePublicMinting();
  await tx.wait();
  console.log("✅ Public minting enabled!");

  // Verify the setting
  const isEnabled = await bugNFT.publicMintingEnabled();
  console.log("✨ Verification: Public minting enabled:", isEnabled);

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Summary:");
  console.log("  BugNFT:", bugNFTAddress);
  console.log("  Public Minting:", isEnabled ? "✅ ENABLED" : "❌ DISABLED");
  console.log("\n⚠️  IMPORTANT: Update NEXT_PUBLIC_BUG_NFT_ADDRESS in Vercel to:", bugNFTAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
