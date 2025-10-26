import { ethers } from "hardhat";

async function main() {
  const stakingAddress = "0x68E8DF1350C3500270ae9226a81Ca1771F2eD542";
  const staking = await ethers.getContractAt("BugSubmissionStaking", stakingAddress);
  
  const bugTokenAddress = await staking.bugToken();
  console.log("✅ Staking contract uses BUG token:", bugTokenAddress);
  
  // Check what each version is
  console.log("\n📋 Known BUG token versions:");
  console.log("  V2:", "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1");
  console.log("  V3:", "0x5f7421B1e03D644CaFD3B13b2da2557748571a67");
}

main();
