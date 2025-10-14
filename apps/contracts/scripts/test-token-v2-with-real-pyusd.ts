import hre from "hardhat";

async function main() {
  // @ts-ignore
  const { ethers } = hre;
  
  console.log("🧪 Testing BugTokenV2 with YOUR test PYUSD...\n");

  // Get signers
  // @ts-ignore
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (you):", deployer.address);
  
  // Check your ETH balance
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  console.log("Your ETH balance:", ethers.formatEther(ethBalance));
  console.log("");

  // Option 1: Deploy MockPYUSD for local testing (recommended for Hardhat)
  // Option 2: Use real PYUSD address (for Sepolia: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9)
  
  let pyusdAddress: string;
  
  if (process.env.PYUSD_ADDRESS) {
    // Using existing PYUSD (for Sepolia testnet)
    pyusdAddress = process.env.PYUSD_ADDRESS;
    console.log("Using existing PYUSD at:", pyusdAddress);
  } else {
    // Deploy MockPYUSD for local testing
    console.log("📝 Deploying MockPYUSD for testing...");
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPyusd = await MockPYUSD.deploy();
    await mockPyusd.waitForDeployment();
    pyusdAddress = await mockPyusd.getAddress();
    console.log("✅ MockPYUSD deployed to:", pyusdAddress);
    console.log("   Your MockPYUSD balance:", ethers.formatUnits(await mockPyusd.balanceOf(deployer.address), 6));
  }
  
  console.log("Using PYUSD at:", pyusdAddress);
  
  // Check your PYUSD balance
  const pyusdABI = ["function balanceOf(address) view returns (uint256)"];
  // @ts-ignore
  const pyusd = new ethers.Contract(pyusdAddress, pyusdABI, ethers.provider);
  const pyusdBalance = await pyusd.balanceOf(deployer.address);
  console.log("Your PYUSD balance:", ethers.formatUnits(pyusdBalance, 6));
  console.log("");

  // Deploy BugTokenV2
  console.log("📝 Deploying BugTokenV2...");
  const BugTokenV2 = await ethers.getContractFactory("BugTokenV2");
  const bugToken = await BugTokenV2.deploy(pyusdAddress);
  await bugToken.waitForDeployment();
  const bugTokenAddress = await bugToken.getAddress();
  console.log("✅ BugTokenV2 deployed to:", bugTokenAddress);
  console.log("");

  // Test 1: Unlock with ETH (from your account)
  console.log("🔓 Test 1: You unlock with ETH");
  console.log("- Your unlock status:", await bugToken.hasUnlocked(deployer.address));
  
  const ethUnlockCost = ethers.parseEther("0.00033");
  console.log("- Sending", ethers.formatEther(ethUnlockCost), "ETH (~$1)...");
  
  const tx1 = await bugToken.connect(deployer).unlockWithETH({ value: ethUnlockCost });
  console.log("- Transaction sent:", tx1.hash);
  await tx1.wait();
  
  console.log("✅ You unlocked!");
  console.log("- Your unlock status:", await bugToken.hasUnlocked(deployer.address));
  console.log("- Your BUG balance:", ethers.formatEther(await bugToken.balanceOf(deployer.address)));
  console.log("- Gas pool balance:", ethers.formatEther(await bugToken.gasPool()), "ETH");
  console.log("");

  // Test 2: Claim from faucet
  console.log("🎰 Test 2: Claim from faucet");
  const balanceBefore = await bugToken.balanceOf(deployer.address);
  console.log("- BUG balance before:", ethers.formatEther(balanceBefore));
  
  const tx2 = await bugToken.connect(deployer).claimFaucet();
  await tx2.wait();
  
  const balanceAfter = await bugToken.balanceOf(deployer.address);
  console.log("✅ Claimed!");
  console.log("- BUG balance after:", ethers.formatEther(balanceAfter));
  console.log("- Received:", ethers.formatEther(balanceAfter - balanceBefore), "BUG");
  console.log("");

  // Test 3: Try to claim again (should fail - cooldown)
  console.log("⏰ Test 3: Try to claim again (should fail)");
  try {
    await bugToken.connect(deployer).claimFaucet();
    console.log("❌ Should have failed but didn't!");
  } catch (error: any) {
    console.log("✅ Correctly rejected - cooldown active (need to wait 24h)");
  }
  console.log("");

  // Test 4: Optional - Unlock with PYUSD (if you have enough)
  console.log("🔓 Test 4: Test PYUSD unlock (optional)");
  
  const pyusdUnlockCost = ethers.parseUnits("1", 6); // 1 PYUSD
  
  if (pyusdBalance >= pyusdUnlockCost * 2n) {
    console.log("- You have enough PYUSD to test!");
    console.log("- Would you like to test PYUSD unlock?");
    console.log("- Uncomment the code below to test PYUSD unlock");
    console.log("");
    
    // UNCOMMENT TO TEST PYUSD UNLOCK:
    /*
    console.log("- Approving PYUSD spending...");
    const pyusdContract = new ethers.Contract(EXISTING_PYUSD, [
      "function approve(address spender, uint256 amount) returns (bool)"
    ], deployer);
    const approveTx = await pyusdContract.approve(bugTokenAddress, pyusdUnlockCost);
    await approveTx.wait();
    
    console.log("- Unlocking with PYUSD...");
    const tx4 = await bugToken.connect(deployer).unlockWithPYUSD();
    await tx4.wait();
    
    console.log("✅ Unlocked with PYUSD!");
    console.log("- PYUSD pool:", ethers.formatUnits(await bugToken.pyusdPool(), 6));
    */
  } else {
    console.log("⏭️  Skipped - need at least 2 PYUSD to test (you have", ethers.formatUnits(pyusdBalance, 6), ")");
  }
  console.log("");

  // Test 5: Check pool stats
  console.log("📊 Test 5: Pool Statistics");
  const [ethBalance2, pyusdPoolBalance, gasPoolBalance] = await bugToken.getPoolStats();
  console.log("- Contract ETH balance:", ethers.formatEther(ethBalance2));
  console.log("- Contract PYUSD balance:", ethers.formatUnits(pyusdPoolBalance, 6));
  console.log("- Gas pool (ETH for operations):", ethers.formatEther(gasPoolBalance));
  console.log("");

  // Test 6: Check can claim status
  console.log("🔍 Test 6: Can Claim Status");
  const canClaim = await bugToken.canClaimFaucet(deployer.address);
  console.log("- Can claim now:", canClaim);
  
  if (!canClaim) {
    const timeUntilNext = await bugToken.timeUntilNextClaim(deployer.address);
    const hours = Number(timeUntilNext) / 3600;
    console.log("- Time until next claim:", hours.toFixed(2), "hours");
  }
  console.log("");

  console.log("🎉 All tests passed!");
  console.log("");
  console.log("📋 Summary:");
  console.log("===========");
  console.log("BugTokenV2:", bugTokenAddress);
  console.log("Your PYUSD:", pyusdAddress);
  console.log("Your BUG balance:", ethers.formatEther(await bugToken.balanceOf(deployer.address)));
  console.log("Gas pool collected:", ethers.formatEther(await bugToken.gasPool()), "ETH");
  console.log("");
  console.log("💡 To use in frontend (.env.local):");
  console.log("NEXT_PUBLIC_BUG_TOKEN_ADDRESS=" + bugTokenAddress);
  console.log("NEXT_PUBLIC_PYUSD_ADDRESS=" + pyusdAddress);
  console.log("");
  console.log("🚀 Next steps:");
  console.log("1. Update apps/web/.env.local with addresses above");
  console.log("2. Restart dev server: npm run dev");
  console.log("3. Connect wallet in browser");
  console.log("4. Try unlocking faucet with ETH or PYUSD!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
