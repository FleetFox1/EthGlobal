import hre from "hardhat";

async function main() {
  // @ts-ignore - Hardhat Runtime Environment ethers
  const { ethers } = hre;
  console.log("🚀 Deploying BugDex contracts...\n");

  // Get deployer account
  // @ts-ignore - Hardhat ethers type issue
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy BugToken
  console.log("1️⃣  Deploying BugToken...");
  const BugToken = await ethers.getContractFactory("BugToken");
  // @ts-ignore
  const bugToken = await BugToken.deploy();
  await bugToken.waitForDeployment();
  const bugTokenAddress = await bugToken.getAddress();
  console.log("✅ BugToken deployed to:", bugTokenAddress);
  console.log("   Initial supply:", ethers.formatEther(await bugToken.totalSupply()), "BUG\n");

  // Deploy BugNFT
  console.log("2️⃣  Deploying BugNFT...");
  const BugNFT = await ethers.getContractFactory("BugNFT");
  const bugNFT = await BugNFT.deploy();
  await bugNFT.waitForDeployment();
  const bugNFTAddress = await bugNFT.getAddress();
  console.log("✅ BugNFT deployed to:", bugNFTAddress);
  console.log("   Name:", await bugNFT.name());
  console.log("   Symbol:", await bugNFT.symbol(), "\n");

  // Deploy BugVoting
  console.log("3️⃣  Deploying BugVoting...");
  const BugVoting = await hre.ethers.getContractFactory("BugVoting");
  const bugVoting = await BugVoting.deploy(bugTokenAddress, bugNFTAddress);
  await bugVoting.waitForDeployment();
  const bugVotingAddress = await bugVoting.getAddress();
  console.log("✅ BugVoting deployed to:", bugVotingAddress, "\n");

  // Setup authorizations
  console.log("4️⃣  Setting up authorizations...");
  
  // Allow BugVoting to mint BUG tokens
  console.log("   - Authorizing BugVoting to mint BUG tokens...");
  const addMinterTx = await bugToken.addMinter(bugVotingAddress);
  await addMinterTx.wait();
  console.log("   ✅ BugVoting authorized");

  // Allow BugVoting to mint NFTs
  console.log("   - Authorizing BugVoting to mint NFTs...");
  const authorizeMinterTx = await bugNFT.authorizeMinter(bugVotingAddress);
  await authorizeMinterTx.wait();
  console.log("   ✅ BugVoting authorized\n");

  // Summary
  console.log("═".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   BugToken:  ", bugTokenAddress);
  console.log("   BugNFT:    ", bugNFTAddress);
  console.log("   BugVoting: ", bugVotingAddress);
  console.log("\n🔧 Configuration:");
  console.log("   Vote Stake Amount:", hre.ethers.formatEther(await bugVoting.VOTE_STAKE_AMOUNT()), "BUG");
  console.log("   Vote Threshold:   ", (await bugVoting.VOTE_THRESHOLD()).toString(), "votes");
  console.log("   Voting Period:    ", (await bugVoting.VOTING_PERIOD()).toString(), "seconds (3 days)");
  console.log("   Reward Per Vote:  ", hre.ethers.formatEther(await bugVoting.REWARD_PER_VOTE()), "BUG");
  console.log("\n💡 Next Steps:");
  console.log("   1. Update .env with contract addresses");
  console.log("   2. Verify contracts on block explorer (if on testnet)");
  console.log("   3. Test faucet: bugToken.claimFaucet()");
  console.log("   4. Submit a test bug and vote on it");
  console.log("\n═".repeat(60));

  // Save deployment addresses to file
  const fs = require("fs");
  const network = await deployer.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BugToken: bugTokenAddress,
      BugNFT: bugNFTAddress,
      BugVoting: bugVotingAddress,
    },
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
