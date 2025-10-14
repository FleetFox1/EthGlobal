import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;

  console.log("Starting BugVotingV3 deployment...\n");
  console.log("⚠️  V3 Changes:");
  console.log("- REQUIRES 3 day voting period (no early resolution)");
  console.log("- REQUIRES minimum 5 'for' votes to approve");
  console.log("- Vote count saved as NFT popularity score");
  console.log("- Prevents abuse with strict thresholds\n");

  // Use deployed addresses
  const BUG_TOKEN_V2 = process.env.BUG_TOKEN_V2_ADDRESS || "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1";
  const BUG_NFT = process.env.BUG_NFT_ADDRESS || "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267";

  console.log("Configuration:");
  console.log("- BugTokenV2:", BUG_TOKEN_V2);
  console.log("- BugNFT:", BUG_NFT);
  console.log("");

  // Get deployer
  // @ts-ignore
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("");

  // Deploy BugVotingV3
  console.log("⏳ Deploying BugVotingV3...");
  const BugVotingV3 = await ethers.getContractFactory("BugVotingV3");
  const bugVoting = await BugVotingV3.deploy(BUG_TOKEN_V2, BUG_NFT);
  await bugVoting.waitForDeployment();

  const bugVotingAddress = await bugVoting.getAddress();
  console.log("✅ BugVotingV3 deployed to:", bugVotingAddress);
  console.log("");

  console.log("📊 V3 Voting Rules:");
  console.log("- Vote Stake: 10 BUG tokens");
  console.log("- Vote Threshold: 5 votes REQUIRED");
  console.log("- Voting Period: 3 days MANDATORY");
  console.log("- Reward per Vote: 5 BUG");
  console.log("- Manual NFT Claiming: ✅");
  console.log("- Popularity Score: Saved to NFT");
  console.log("- No Early Resolution: Must wait 3 days");
  console.log("");

  console.log("📋 Deployment Summary:");
  console.log("=======================");
  console.log("BugVotingV3:", bugVotingAddress);
  console.log("BugTokenV2:", BUG_TOKEN_V2);
  console.log("BugNFT:", BUG_NFT);
  console.log("");

  console.log("📝 Next Steps:");
  console.log("1. Authorize BugVotingV3 as NFT minter:");
  console.log("   bugNFT.authorizeMinter(" + bugVotingAddress + ")");
  console.log("");
  console.log("2. Fund BugVotingV3 with BUG tokens for rewards:");
  console.log("   bugToken.transfer(" + bugVotingAddress + ", amount)");
  console.log("");
  console.log("3. Update .env.local in apps/web:");
  console.log("   NEXT_PUBLIC_BUG_VOTING_ADDRESS=" + bugVotingAddress);
  console.log("");
  console.log("4. Verify contract on Etherscan:");
  console.log("   npx hardhat verify --network sepolia " + bugVotingAddress + " " + BUG_TOKEN_V2 + " " + BUG_NFT);
  console.log("");

  console.log("⚖️  V2 vs V3 Comparison:");
  console.log("┌─────────────────────────┬───────────────┬───────────────┐");
  console.log("│ Feature                 │ V2            │ V3            │");
  console.log("├─────────────────────────┼───────────────┼───────────────┤");
  console.log("│ Early Resolution        │ ✅ Yes        │ ❌ No         │");
  console.log("│ Minimum Votes Required  │ ❌ No         │ ✅ 5 votes    │");
  console.log("│ Voting Period           │ 3 days        │ 3 days        │");
  console.log("│ Popularity Score        │ ✅ Yes        │ ✅ Yes        │");
  console.log("│ Abuse Prevention        │ ⚠️ Weak       │ ✅ Strong     │");
  console.log("└─────────────────────────┴───────────────┴───────────────┘");
  console.log("");

  console.log("💾 Deployment Info:");
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BugVotingV3: bugVotingAddress,
      BugTokenV2: BUG_TOKEN_V2,
      BugNFT: BUG_NFT
    },
    config: {
      voteStake: "10 BUG",
      voteThreshold: "5 votes (REQUIRED)",
      votingPeriod: "3 days (MANDATORY)",
      rewardPerVote: "5 BUG",
      manualClaiming: true,
      earlyResolution: false,
      popularityScore: true
    }
  };
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
