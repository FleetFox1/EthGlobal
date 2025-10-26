import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Redeploying BugTokenV3 with cooldown functions...");

  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Sepolia PYUSD
  const PYTH_ADDRESS = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21"; // Sepolia Pyth
  const ETH_USD_PRICE_FEED = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD

  const BugTokenV3 = await ethers.getContractFactory("BugTokenV3");
  const bugToken = await BugTokenV3.deploy(
    PYUSD_ADDRESS,
    PYTH_ADDRESS,
    ETH_USD_PRICE_FEED
  );

  await bugToken.waitForDeployment();
  const address = await bugToken.getAddress();

  console.log("✅ BugTokenV3 redeployed to:", address);
  console.log("\n📝 Update .env.local with:");
  console.log(`NEXT_PUBLIC_BUG_TOKEN_V3_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_BUG_TOKEN_ADDRESS=${address}`);
  
  console.log("\n⚠️ IMPORTANT:");
  console.log("1. Update Vercel environment variables");
  console.log("2. Users will need to unlock again on the new contract");
  console.log("3. Fund staking contract with new V3 tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
