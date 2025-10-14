import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;
  
  const bugTokenAddress = "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1";
  const walletAddress = "0x71940fd31a77979F3a54391b86768C661C78c263";
  
  console.log("Checking BugTokenV2 balance...\n");
  
  const bugToken = await ethers.getContractAt("BugTokenV2", bugTokenAddress);
  
  const balance = await bugToken.balanceOf(walletAddress);
  const decimals = await bugToken.decimals();
  const symbol = await bugToken.symbol();
  
  console.log("Wallet:", walletAddress);
  console.log("Token:", bugTokenAddress);
  console.log("");
  console.log("Raw Balance:", balance.toString());
  console.log("Decimals:", decimals);
  console.log("Human Readable:", ethers.formatUnits(balance, decimals), symbol);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
