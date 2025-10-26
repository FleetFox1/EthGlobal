import { ethers } from "hardhat";

/**
 * Send BUG tokens to a specific address
 * Usage: npx hardhat run scripts/send-bug-tokens.ts --network sepolia
 */
async function main() {
  // Configuration
  const RECIPIENT = "0x5582A0d37309D81f9ad26607549DDaB6d6E736Bd"; // Test wallet
  const AMOUNT = "100"; // 100 BUG tokens
  
  console.log("🚀 Sending BUG tokens...");
  console.log("📍 To:", RECIPIENT);
  console.log("💰 Amount:", AMOUNT, "BUG");
  
  // Get BugTokenV2 contract (the one staking uses!)
  const bugTokenAddress = "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1"; // V2 for staking
  const BugToken = await ethers.getContractAt("BugTokenV2", bugTokenAddress);
  
  // Check sender balance
  // @ts-ignore
  const signers = await ethers.getSigners();
  const sender = signers[0];
  const senderBalance = await BugToken.balanceOf(sender.address);
  console.log("👤 Sender:", sender.address);
  console.log("💼 Sender balance:", ethers.formatEther(senderBalance), "BUG");
  
  // Send tokens
  const amount = ethers.parseEther(AMOUNT);
  console.log("\n📤 Sending tokens...");
  const tx = await BugToken.transfer(RECIPIENT, amount);
  
  console.log("⏳ Transaction hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  if (receipt) {
    console.log("✅ Transaction confirmed!");
    console.log("📦 Block:", receipt.blockNumber);
  }
  
  // Check recipient balance
  const recipientBalance = await BugToken.balanceOf(RECIPIENT);
  console.log("\n💰 Recipient new balance:", ethers.formatEther(recipientBalance), "BUG");
  
  console.log("\n✨ Done! Tokens sent successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
