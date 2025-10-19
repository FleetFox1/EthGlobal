import { ethers } from "ethers";

// Sepolia RPC
const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/zhDx7ikWXX8vnhobQBhMb");

// V2 Contract addresses
const BUG_TOKEN_V2 = "0x431185c8d1391fFD2eeB2aA4870015a1061f03e1";
const BUG_VOTING_V2 = "0xDD05459B4EAED043Ef5D12f45974D0f7468c28e9";
const BUG_NFT = "0x1d74A4DA29a40Aa7F9Fc849992AAe9dB03123267";

async function testContracts() {
  console.log("\n🔍 Testing V2 Contract Functions...\n");

  // Test BugTokenV2
  console.log("📝 BugTokenV2:", BUG_TOKEN_V2);
  try {
    const tokenCode = await provider.getCode(BUG_TOKEN_V2);
    console.log("  ✅ Contract exists, code length:", tokenCode.length);

    const token = new ethers.Contract(
      BUG_TOKEN_V2,
      [
        "function owner() view returns (address)",
        "function hasUnlocked(address user) view returns (bool)",
        "function name() view returns (string)",
        "function decimals() view returns (uint8)",
      ],
      provider
    );

    const [owner, name, decimals] = await Promise.all([
      token.owner(),
      token.name(),
      token.decimals(),
    ]);

    console.log("  ✅ owner():", owner);
    console.log("  ✅ name():", name);
    console.log("  ✅ decimals():", decimals);

    const testAddress = "0x71940fd31a77979F3a54391b86768C661C78c263";
    const unlocked = await token.hasUnlocked(testAddress);
    console.log("  ✅ hasUnlocked(" + testAddress + "):", unlocked);
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  // Test BugVotingV2
  console.log("\n📝 BugVotingV2:", BUG_VOTING_V2);
  try {
    const votingCode = await provider.getCode(BUG_VOTING_V2);
    console.log("  ✅ Contract exists, code length:", votingCode.length);

    const voting = new ethers.Contract(
      BUG_VOTING_V2,
      ["function owner() view returns (address)", "function submissionCount() view returns (uint256)"],
      provider
    );

    const [owner, count] = await Promise.all([voting.owner(), voting.submissionCount()]);

    console.log("  ✅ owner():", owner);
    console.log("  ✅ submissionCount():", count.toString());
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  // Test BugNFT
  console.log("\n📝 BugNFT:", BUG_NFT);
  try {
    const nftCode = await provider.getCode(BUG_NFT);
    console.log("  ✅ Contract exists, code length:", nftCode.length);

    const nft = new ethers.Contract(
      BUG_NFT,
      ["function owner() view returns (address)", "function totalBugs() view returns (uint256)"],
      provider
    );

    const [owner, total] = await Promise.all([nft.owner(), nft.totalBugs()]);

    console.log("  ✅ owner():", owner);
    console.log("  ✅ totalBugs():", total.toString());
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n✅ Contract verification complete!\n");
}

testContracts().catch(console.error);
