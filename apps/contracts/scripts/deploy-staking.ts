import hre from "hardhat";

async function main() {
  // @ts-ignore - Hardhat Runtime Environment ethers
  const { ethers } = hre;
  console.log("🚀 Deploying BugSubmissionStaking contract...\n");

  // Get the deployer
  // @ts-ignore - Hardhat ethers type issue
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get BugTokenV2 address from deployment.json
  const BUG_TOKEN_ADDRESS = process.env.BUG_TOKEN_V2_ADDRESS || "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1";
  console.log("Using BugToken address:", BUG_TOKEN_ADDRESS);

  // Deploy BugSubmissionStaking
  const BugSubmissionStaking = await ethers.getContractFactory("BugSubmissionStaking");
  const staking = await BugSubmissionStaking.deploy(BUG_TOKEN_ADDRESS);
  await staking.waitForDeployment();

  const stakingAddress = await staking.getAddress();
  console.log("\n✅ BugSubmissionStaking deployed to:", stakingAddress);

  console.log("\n📝 Update your .env with:");
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=${stakingAddress}`);

  console.log("\n🔧 Next steps:");
  console.log("1. Fund the contract with BUG tokens for rewards:");
  console.log(`   await bugToken.transfer('${stakingAddress}', ethers.parseEther('1000'))`);
  console.log("\n2. Update /api/submit-for-voting to call stakeForSubmission()");
  console.log("3. Update /api/resolve-voting to call distributeRewards() or returnStake()");

  // Verify on Etherscan (if on live network)
  if (process.env.ETHERSCAN_API_KEY && process.env.SEPOLIA_RPC_URL) {
    console.log("\n⏳ Waiting 1 minute before verification...");
    await new Promise(resolve => setTimeout(resolve, 60000));

    try {
      console.log("\n🔍 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: stakingAddress,
        constructorArguments: [BUG_TOKEN_ADDRESS],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
