import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;

  console.log("\n🚀 Deploying UserProfileRegistry...\n");

  // @ts-ignore
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("");

  // Deploy UserProfileRegistry
  const UserProfileRegistry = await ethers.getContractFactory("UserProfileRegistry");
  const registry = await UserProfileRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("✅ UserProfileRegistry deployed to:", registryAddress);

  console.log("\n📝 Add to .env.local:");
  console.log(`NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS=${registryAddress}`);

  console.log("\n✅ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Add contract address to apps/web/.env.local");
  console.log("2. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
