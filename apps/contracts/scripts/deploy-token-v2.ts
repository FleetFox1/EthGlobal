import hre from "hardhat";

async function main() {
  // @ts-ignore - Hardhat Runtime Environment
  const { ethers } = hre;
  console.log("Starting BugTokenV2 deployment with $1 unlock system...\n");

  // PYUSD address on Sepolia testnet
  // Note: Replace with actual Sepolia PYUSD address if different
  const PYUSD_ADDRESS = process.env.PYUSD_ADDRESS || "0x..."; // Update this!

  if (!PYUSD_ADDRESS || PYUSD_ADDRESS === "0x...") {
    console.error("❌ Please set PYUSD_ADDRESS in .env or update this script");
    process.exit(1);
  }

  console.log("Configuration:");
  console.log("- PYUSD Address:", PYUSD_ADDRESS);
  console.log("- Network:", hre.network.name);
  console.log("");

  // Deploy BugTokenV2
  console.log("⏳ Deploying BugTokenV2...");
  const BugTokenV2 = await ethers.getContractFactory("BugTokenV2");
  const bugToken = await BugTokenV2.deploy(PYUSD_ADDRESS);
  await bugToken.waitForDeployment();

  const bugTokenAddress = await bugToken.getAddress();
  console.log("✅ BugTokenV2 deployed to:", bugTokenAddress);

  // Get deployer address
  // @ts-ignore - Hardhat ethers type issue
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log("\n📊 Initial State:");
  console.log("- Owner:", deployer.address);
  console.log("- Initial Supply: 10,000,000 BUG");
  console.log("- Max Supply: 100,000,000 BUG");
  console.log("- Faucet Amount: 100 BUG per claim");
  console.log("- ETH Unlock Cost: 0.00033 ETH (~$1)");
  console.log("- PYUSD Unlock Cost: 1.00 PYUSD");

  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("BugTokenV2:", bugTokenAddress);
  console.log("PYUSD:", PYUSD_ADDRESS);
  console.log("");

  console.log("📝 Next Steps:");
  console.log("1. Update .env.local in apps/web:");
  console.log(`   NEXT_PUBLIC_BUG_TOKEN_ADDRESS=${bugTokenAddress}`);
  console.log(`   NEXT_PUBLIC_PYUSD_ADDRESS=${PYUSD_ADDRESS}`);
  console.log("");
  console.log("2. If using BugVotingV2, authorize it as minter:");
  console.log(`   bugToken.addMinter(<VOTING_CONTRACT_ADDRESS>)`);
  console.log("");
  console.log("3. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${bugTokenAddress} ${PYUSD_ADDRESS}`);
  console.log("");
  console.log("4. Update deployment.json with new addresses");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BugTokenV2: bugTokenAddress,
      PYUSD: PYUSD_ADDRESS,
    },
    config: {
      ethUnlockCost: "0.00033 ETH",
      pyusdUnlockCost: "1.00 PYUSD",
      faucetAmount: "100 BUG",
      cooldown: "1 day",
    },
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
