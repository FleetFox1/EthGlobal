import hre from "hardhat";

/**
 * Fund the BugSubmissionStaking contract with BUG tokens
 * So it can distribute rewards to users
 */
async function main() {
  // @ts-ignore - Hardhat Runtime Environment ethers
  const { ethers } = hre;
  
  console.log("💰 Funding BugSubmissionStaking contract with BUG tokens...\n");

  // @ts-ignore - Hardhat ethers type issue
  const [deployer] = await ethers.getSigners();
  console.log("Funding from account:", deployer.address);

  const BUG_TOKEN_ADDRESS = process.env.BUG_TOKEN_V3_ADDRESS || "0x5f7421B1e03D644CaFD3B13b2da2557748571a67";
  const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "0xD59Ae51dfb445660a1191b6F256A2ebD78460aa5";

  console.log("BugToken address:", BUG_TOKEN_ADDRESS);
  console.log("Staking contract:", STAKING_CONTRACT_ADDRESS);

  // Get BugToken contract
  const bugTokenABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ];
  const bugToken = new ethers.Contract(BUG_TOKEN_ADDRESS, bugTokenABI, deployer);

  // Check deployer's balance
  const balance = await bugToken.balanceOf(deployer.address);
  const balanceInBUG = ethers.formatEther(balance);
  console.log(`\nYour BUG balance: ${balanceInBUG} BUG`);

  // Fund with 1000 BUG (enough for ~100 submissions with rewards)
  const fundAmount = ethers.parseEther("1000");
  const fundAmountInBUG = ethers.formatEther(fundAmount);

  if (balance < fundAmount) {
    console.log(`\n⚠️  Warning: You only have ${balanceInBUG} BUG`);
    console.log(`You need ${fundAmountInBUG} BUG to fund the contract.`);
    console.log(`\nTransferring your entire balance instead...`);
    
    const tx = await bugToken.transfer(STAKING_CONTRACT_ADDRESS, balance);
    console.log(`\n📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    await tx.wait();
    
    console.log(`\n✅ Funded staking contract with ${balanceInBUG} BUG!`);
  } else {
    console.log(`\n📤 Transferring ${fundAmountInBUG} BUG to staking contract...`);
    
    const tx = await bugToken.transfer(STAKING_CONTRACT_ADDRESS, fundAmount);
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    await tx.wait();
    
    console.log(`\n✅ Funded staking contract with ${fundAmountInBUG} BUG!`);
  }

  // Verify contract balance
  const contractBalance = await bugToken.balanceOf(STAKING_CONTRACT_ADDRESS);
  const contractBalanceInBUG = ethers.formatEther(contractBalance);
  console.log(`\n💎 Staking contract now has: ${contractBalanceInBUG} BUG`);

  // Calculate how many rewards can be distributed
  const rewardsPerSubmission = 10 + (5 * 5); // 10 BUG stake + (5 upvotes × 5 BUG) = typical reward
  const possibleRewards = Math.floor(Number(contractBalanceInBUG) / rewardsPerSubmission);
  console.log(`📊 Can support ~${possibleRewards} submission rewards (assuming 5 upvotes each)`);

  console.log(`\n🎉 Ready to distribute rewards!`);
  console.log(`\nNext steps:`);
  console.log(`1. Test the staking flow end-to-end`);
  console.log(`2. Submit a bug for voting (stakes 10 BUG)`);
  console.log(`3. Vote on it from another wallet`);
  console.log(`4. Call /api/resolve-voting to distribute rewards`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
