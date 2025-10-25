import { ethers } from "hardhat";

/**
 * Authorize addresses to mint NFTs
 * 
 * This script allows specific addresses to call mintBug() on BugNFT contract.
 * By default, only the owner can mint. This grants minting rights to other addresses.
 */
async function main() {
  // @ts-ignore
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("🔑 Authorizing minter with account:", deployer.address);

  // Get BugNFT contract
  const bugNFTAddress = process.env.NEXT_PUBLIC_BUG_NFT_ADDRESS || "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267";
  console.log("📝 BugNFT contract:", bugNFTAddress);

  const BugNFT = await ethers.getContractAt("BugNFT", bugNFTAddress);

  // Option 1: Authorize deployer to mint (for admin use)
  console.log("\n1️⃣ Authorizing deployer address...");
  const tx1 = await BugNFT.authorizeMinter(deployer.address);
  await tx1.wait();
  console.log("✅ Deployer authorized!");

  // Option 2: Make minting public (allow anyone to mint their approved bugs)
  console.log("\n2️⃣ Making minting public...");
  const tx2 = await BugNFT.authorizeMinter(ethers.ZeroAddress); // Special: allows anyone
  await tx2.wait();
  console.log("✅ Public minting enabled!");

  // Verify authorization
  const isAuthorized = await BugNFT.authorizedMinters(deployer.address);
  console.log("\n✨ Verification:");
  console.log("  Deployer authorized:", isAuthorized);

  console.log("\n📋 Summary:");
  console.log("  Contract:", bugNFTAddress);
  console.log("  Authorized minters:");
  console.log("    -", deployer.address, "(deployer) ✅");
  console.log("\n💡 To authorize more addresses:");
  console.log("  Set MINTER_ADDRESS env var and run this script again");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
