import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;

  console.log("🔧 Setting up BugVotingV2 permissions...\n");

  const BUG_VOTING_V2 = "0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9";
  const BUG_TOKEN_V2 = "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1";
  const BUG_NFT = "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267";

  // @ts-ignore
  const [deployer] = await ethers.getSigners();
  console.log("Executing with account:", deployer.address);
  console.log("");

  // 1. Authorize BugVotingV2 as NFT minter
  console.log("📝 Step 1: Authorize BugVotingV2 as NFT minter...");
  const bugNFT = await ethers.getContractAt("BugNFT", BUG_NFT);
  const tx1 = await bugNFT.authorizeMinter(BUG_VOTING_V2);
  await tx1.wait();
  console.log("✅ BugVotingV2 authorized to mint NFTs");
  console.log("   Transaction:", tx1.hash);
  console.log("");

  // 2. Fund BugVotingV2 with reward tokens
  console.log("📝 Step 2: Fund BugVotingV2 with reward tokens...");
  const bugToken = await ethers.getContractAt("BugTokenV2", BUG_TOKEN_V2);
  
  // Send 10,000 BUG tokens for rewards (enough for 2000 votes at 5 BUG per vote)
  const rewardAmount = ethers.parseEther("10000");
  const tx2 = await bugToken.transfer(BUG_VOTING_V2, rewardAmount);
  await tx2.wait();
  console.log("✅ Sent 10,000 BUG tokens to BugVotingV2 for rewards");
  console.log("   Transaction:", tx2.hash);
  console.log("");

  // Verify setup
  console.log("🔍 Verifying setup...");
  const isMinter = await bugNFT.authorizedMinters(BUG_VOTING_V2);
  const votingBalance = await bugToken.balanceOf(BUG_VOTING_V2);
  
  console.log("- BugVotingV2 is authorized minter:", isMinter);
  console.log("- BugVotingV2 reward balance:", ethers.formatEther(votingBalance), "BUG");
  console.log("");

  if (isMinter && votingBalance >= rewardAmount) {
    console.log("✅ Setup complete! BugVotingV2 is ready to use.");
  } else {
    console.log("⚠️ Setup incomplete. Please check the transactions.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
