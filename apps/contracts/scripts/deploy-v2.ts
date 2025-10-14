import { ethers } from "hardhat";

async function main() {
  console.log("Starting BugVotingV2 deployment...");

  // Get existing contract addresses (from deployment.json or .env)
  const BUG_TOKEN_ADDRESS = "0x1E79bFaE1Bd2e0D4D0b13c0B3f8C7F6E1A4B2C3D"; // Replace with your BugToken address
  const BUG_NFT_ADDRESS = "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267"; // Your current BugNFT address

  console.log("Using existing contracts:");
  console.log("- BugToken:", BUG_TOKEN_ADDRESS);
  console.log("- BugNFT:", BUG_NFT_ADDRESS);

  // Deploy BugVotingV2
  const BugVotingV2 = await ethers.getContractFactory("BugVotingV2");
  const bugVotingV2 = await BugVotingV2.deploy(BUG_TOKEN_ADDRESS, BUG_NFT_ADDRESS);
  await bugVotingV2.waitForDeployment();

  const votingAddress = await bugVotingV2.getAddress();
  console.log("\n✅ BugVotingV2 deployed to:", votingAddress);

  // Update BugNFT to authorize new voting contract
  console.log("\n⏳ Authorizing BugVotingV2 as minter...");
  const bugNFT = await ethers.getContractAt("BugNFT", BUG_NFT_ADDRESS);
  const authTx = await bugNFT.authorizeMinter(votingAddress);
  await authTx.wait();
  console.log("✅ BugVotingV2 authorized as minter");

  // Remove authorization from old contract (optional)
  const OLD_VOTING_ADDRESS = "0x85E82a36fF69f85b995eE4de27dFB33925c7d35A";
  console.log("\n⏳ Removing old BugVoting authorization...");
  const removeAuthTx = await bugNFT.revokeMinter(OLD_VOTING_ADDRESS);
  await removeAuthTx.wait();
  console.log("✅ Old BugVoting removed as minter");

  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("BugToken:", BUG_TOKEN_ADDRESS);
  console.log("BugNFT:", BUG_NFT_ADDRESS);
  console.log("BugVotingV2:", votingAddress);
  console.log("\n📝 Next steps:");
  console.log("1. Update .env.local in apps/web:");
  console.log(`   NEXT_PUBLIC_BUG_VOTING_ADDRESS=${votingAddress}`);
  console.log("2. Update deployment.json with new address");
  console.log("3. Verify contract on Etherscan if desired");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
