import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;
  
  console.log("🧪 Testing BugTokenV2 locally...\n");

  // Get signers
  // @ts-ignore
  const [owner, user1, user2] = await ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  console.log("");

  // Deploy Mock PYUSD
  console.log("📝 Deploying MockPYUSD...");
  const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = await MockPYUSD.deploy();
  await mockPYUSD.waitForDeployment();
  const pyusdAddress = await mockPYUSD.getAddress();
  console.log("✅ MockPYUSD deployed to:", pyusdAddress);
  console.log("");

  // Deploy BugTokenV2
  console.log("📝 Deploying BugTokenV2...");
  const BugTokenV2 = await ethers.getContractFactory("BugTokenV2");
  const bugToken = await BugTokenV2.deploy(pyusdAddress);
  await bugToken.waitForDeployment();
  const bugTokenAddress = await bugToken.getAddress();
  console.log("✅ BugTokenV2 deployed to:", bugTokenAddress);
  console.log("");

  // Give users some PYUSD
  console.log("💰 Minting PYUSD to users...");
  await mockPYUSD.mint(user1.address, ethers.parseUnits("100", 6));
  await mockPYUSD.mint(user2.address, ethers.parseUnits("100", 6));
  console.log("✅ Users funded with 100 PYUSD each");
  console.log("");

  // Test 1: User1 unlocks with ETH
  console.log("🔓 Test 1: User1 unlocks with ETH");
  console.log("- User1 is unlocked:", await bugToken.hasUnlocked(user1.address));
  
  const ethUnlockCost = ethers.parseEther("0.00033");
  const tx1 = await bugToken.connect(user1).unlockWithETH({ value: ethUnlockCost });
  await tx1.wait();
  
  console.log("✅ User1 unlocked!");
  console.log("- User1 is unlocked:", await bugToken.hasUnlocked(user1.address));
  console.log("- User1 BUG balance:", ethers.formatEther(await bugToken.balanceOf(user1.address)));
  console.log("- Gas pool:", ethers.formatEther(await bugToken.gasPool()), "ETH");
  console.log("");

  // Test 2: User2 unlocks with PYUSD
  console.log("🔓 Test 2: User2 unlocks with PYUSD");
  console.log("- User2 is unlocked:", await bugToken.hasUnlocked(user2.address));
  
  // Approve PYUSD spending
  const pyusdUnlockCost = ethers.parseUnits("1", 6);
  await mockPYUSD.connect(user2).approve(bugTokenAddress, pyusdUnlockCost);
  
  const tx2 = await bugToken.connect(user2).unlockWithPYUSD();
  await tx2.wait();
  
  console.log("✅ User2 unlocked!");
  console.log("- User2 is unlocked:", await bugToken.hasUnlocked(user2.address));
  console.log("- User2 BUG balance:", ethers.formatEther(await bugToken.balanceOf(user2.address)));
  console.log("- PYUSD pool:", ethers.formatUnits(await bugToken.pyusdPool(), 6), "PYUSD");
  console.log("");

  // Test 3: User1 claims from faucet
  console.log("🎰 Test 3: User1 claims from faucet");
  const balanceBefore = await bugToken.balanceOf(user1.address);
  
  const tx3 = await bugToken.connect(user1).claimFaucet();
  await tx3.wait();
  
  const balanceAfter = await bugToken.balanceOf(user1.address);
  console.log("✅ User1 claimed!");
  console.log("- Balance before:", ethers.formatEther(balanceBefore));
  console.log("- Balance after:", ethers.formatEther(balanceAfter));
  console.log("- Received:", ethers.formatEther(balanceAfter - balanceBefore));
  console.log("");

  // Test 4: Try to claim again (should fail - cooldown)
  console.log("⏰ Test 4: Try to claim again (should fail)");
  try {
    await bugToken.connect(user1).claimFaucet();
    console.log("❌ Should have failed but didn't!");
  } catch (error: any) {
    console.log("✅ Correctly rejected:", error.message.includes("Cooldown") ? "Cooldown active" : error.message);
  }
  console.log("");

  // Test 5: Check pool stats
  console.log("📊 Test 5: Pool Statistics");
  const [ethBalance, pyusdBalance, gasPoolBalance] = await bugToken.getPoolStats();
  console.log("- Contract ETH balance:", ethers.formatEther(ethBalance));
  console.log("- Contract PYUSD balance:", ethers.formatUnits(pyusdBalance, 6));
  console.log("- Gas pool tracked:", ethers.formatEther(gasPoolBalance));
  console.log("");

  // Test 6: Check if users can claim
  console.log("🔍 Test 6: Can Claim Status");
  console.log("- User1 can claim:", await bugToken.canClaimFaucet(user1.address));
  console.log("- User2 can claim:", await bugToken.canClaimFaucet(user2.address));
  console.log("");

  // Test 7: Owner withdraws from gas pool
  console.log("💸 Test 7: Owner withdraws from gas pool");
  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  
  const withdrawAmount = ethers.parseEther("0.0001");
  const tx7 = await bugToken.withdrawFromGasPool(owner.address, withdrawAmount);
  await tx7.wait();
  
  const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
  console.log("✅ Owner withdrew!");
  console.log("- Withdrew:", ethers.formatEther(withdrawAmount), "ETH");
  console.log("- Remaining gas pool:", ethers.formatEther(await bugToken.gasPool()), "ETH");
  console.log("");

  // Test 8: Owner withdraws PYUSD
  console.log("💸 Test 8: Owner withdraws PYUSD");
  const tx8 = await bugToken.withdrawPYUSD(owner.address);
  await tx8.wait();
  
  const ownerPYUSD = await mockPYUSD.balanceOf(owner.address);
  console.log("✅ Owner withdrew PYUSD!");
  console.log("- Owner PYUSD balance:", ethers.formatUnits(ownerPYUSD, 6));
  console.log("- Remaining PYUSD pool:", ethers.formatUnits(await bugToken.pyusdPool(), 6));
  console.log("");

  console.log("🎉 All tests passed!");
  console.log("");
  console.log("📋 Summary:");
  console.log("===========");
  console.log("BugTokenV2:", bugTokenAddress);
  console.log("MockPYUSD:", pyusdAddress);
  console.log("Total BUG minted:", ethers.formatEther(await bugToken.totalSupply()));
  console.log("Users unlocked: 2");
  console.log("");
  console.log("💡 To use in frontend:");
  console.log("NEXT_PUBLIC_BUG_TOKEN_ADDRESS=" + bugTokenAddress);
  console.log("NEXT_PUBLIC_PYUSD_ADDRESS=" + pyusdAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
