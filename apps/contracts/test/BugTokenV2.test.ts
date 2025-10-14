import { expect } from "chai";
import { ethers } from "hardhat";
import { BugTokenV2, MockPYUSD } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BugTokenV2 - $1 Unlock System", function () {
  let bugToken: BugTokenV2;
  let mockPYUSD: MockPYUSD;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const ETH_UNLOCK_COST = ethers.parseEther("0.00033"); // ~$1
  const PYUSD_UNLOCK_COST = ethers.parseUnits("1", 6); // 1 PYUSD
  const FAUCET_AMOUNT = ethers.parseEther("100"); // 100 BUG

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Mock PYUSD
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.waitForDeployment();

    // Deploy BugTokenV2
    const BugTokenV2 = await ethers.getContractFactory("BugTokenV2");
    bugToken = await BugTokenV2.deploy(await mockPYUSD.getAddress());
    await bugToken.waitForDeployment();

    // Give users some PYUSD for testing
    await mockPYUSD.mint(user1.address, ethers.parseUnits("100", 6)); // 100 PYUSD
    await mockPYUSD.mint(user2.address, ethers.parseUnits("100", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await bugToken.owner()).to.equal(owner.address);
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.parseEther("10000000"); // 10M
      expect(await bugToken.totalSupply()).to.equal(expectedSupply);
    });

    it("Should have correct unlock costs", async function () {
      expect(await bugToken.ETH_UNLOCK_COST()).to.equal(ETH_UNLOCK_COST);
      expect(await bugToken.PYUSD_UNLOCK_COST()).to.equal(PYUSD_UNLOCK_COST);
    });
  });

  describe("Unlock with ETH", function () {
    it("Should allow user to unlock with ETH", async function () {
      // Check user is not unlocked initially
      expect(await bugToken.hasUnlocked(user1.address)).to.be.false;

      // Unlock with ETH
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      // Check user is now unlocked
      expect(await bugToken.hasUnlocked(user1.address)).to.be.true;

      // Check user received 100 BUG
      expect(await bugToken.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should add ETH to gas pool", async function () {
      const initialGasPool = await bugToken.gasPool();

      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      const finalGasPool = await bugToken.gasPool();
      expect(finalGasPool - initialGasPool).to.equal(ETH_UNLOCK_COST);
    });

    it("Should revert if already unlocked", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      await expect(
        bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST })
      ).to.be.revertedWith("Already unlocked");
    });

    it("Should revert if insufficient ETH sent", async function () {
      await expect(
        bugToken.connect(user1).unlockWithETH({ value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("Should emit FaucetUnlocked event", async function () {
      await expect(bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST }))
        .to.emit(bugToken, "FaucetUnlocked")
        .withArgs(user1.address, "ETH", ETH_UNLOCK_COST);
    });
  });

  describe("Unlock with PYUSD", function () {
    it("Should allow user to unlock with PYUSD", async function () {
      // Approve PYUSD spending
      await mockPYUSD.connect(user1).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);

      // Unlock with PYUSD
      await bugToken.connect(user1).unlockWithPYUSD();

      // Check user is now unlocked
      expect(await bugToken.hasUnlocked(user1.address)).to.be.true;

      // Check user received 100 BUG
      expect(await bugToken.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should add PYUSD to pool", async function () {
      await mockPYUSD.connect(user1).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);

      const initialPYUSDPool = await bugToken.pyusdPool();

      await bugToken.connect(user1).unlockWithPYUSD();

      const finalPYUSDPool = await bugToken.pyusdPool();
      expect(finalPYUSDPool - initialPYUSDPool).to.equal(PYUSD_UNLOCK_COST);
    });

    it("Should revert if PYUSD not approved", async function () {
      await expect(
        bugToken.connect(user1).unlockWithPYUSD()
      ).to.be.reverted; // ERC20: insufficient allowance
    });

    it("Should emit FaucetUnlocked event", async function () {
      await mockPYUSD.connect(user1).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);

      await expect(bugToken.connect(user1).unlockWithPYUSD())
        .to.emit(bugToken, "FaucetUnlocked")
        .withArgs(user1.address, "PYUSD", PYUSD_UNLOCK_COST);
    });
  });

  describe("Claim Faucet", function () {
    beforeEach(async function () {
      // Unlock user1 with ETH
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });
    });

    it("Should allow unlocked user to claim", async function () {
      const initialBalance = await bugToken.balanceOf(user1.address);

      await bugToken.connect(user1).claimFaucet();

      const finalBalance = await bugToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(FAUCET_AMOUNT);
    });

    it("Should revert if user not unlocked", async function () {
      await expect(
        bugToken.connect(user2).claimFaucet()
      ).to.be.revertedWith("Must unlock first");
    });

    it("Should revert if cooldown not passed", async function () {
      await bugToken.connect(user1).claimFaucet();

      await expect(
        bugToken.connect(user1).claimFaucet()
      ).to.be.revertedWith("Cooldown period active");
    });

    it("Should allow claim after cooldown", async function () {
      await bugToken.connect(user1).claimFaucet();

      // Fast forward 1 day
      await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await bugToken.balanceOf(user1.address);
      await bugToken.connect(user1).claimFaucet();
      const finalBalance = await bugToken.balanceOf(user1.address);

      expect(finalBalance - initialBalance).to.equal(FAUCET_AMOUNT);
    });

    it("Should return correct canClaimFaucet status", async function () {
      // Can claim initially
      expect(await bugToken.canClaimFaucet(user1.address)).to.be.true;

      // Claim
      await bugToken.connect(user1).claimFaucet();

      // Cannot claim during cooldown
      expect(await bugToken.canClaimFaucet(user1.address)).to.be.false;

      // Fast forward 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);

      // Can claim again
      expect(await bugToken.canClaimFaucet(user1.address)).to.be.true;
    });
  });

  describe("Pool Management", function () {
    it("Should track gas pool correctly", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });
      await bugToken.connect(user2).unlockWithETH({ value: ETH_UNLOCK_COST });

      const expectedPool = ETH_UNLOCK_COST * 2n;
      expect(await bugToken.gasPool()).to.equal(expectedPool);
    });

    it("Should allow owner to withdraw from gas pool", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await bugToken.withdrawFromGasPool(owner.address, ETH_UNLOCK_COST);

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      await expect(
        bugToken.connect(user1).withdrawFromGasPool(user1.address, ETH_UNLOCK_COST)
      ).to.be.reverted; // Ownable: caller is not the owner
    });

    it("Should allow owner to withdraw PYUSD", async function () {
      await mockPYUSD.connect(user1).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);
      await bugToken.connect(user1).unlockWithPYUSD();

      await bugToken.withdrawPYUSD(owner.address);

      const ownerBalance = await mockPYUSD.balanceOf(owner.address);
      expect(ownerBalance).to.equal(PYUSD_UNLOCK_COST);
    });

    it("Should allow owner to deposit to gas pool", async function () {
      const depositAmount = ethers.parseEther("0.1");
      const initialPool = await bugToken.gasPool();

      await bugToken.depositToGasPool({ value: depositAmount });

      const finalPool = await bugToken.gasPool();
      expect(finalPool - initialPool).to.equal(depositAmount);
    });

    it("Should return correct pool stats", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });
      await mockPYUSD.connect(user2).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);
      await bugToken.connect(user2).unlockWithPYUSD();

      const [ethBalance, pyusdBalance, gasPoolBalance] = await bugToken.getPoolStats();

      expect(gasPoolBalance).to.equal(ETH_UNLOCK_COST);
      expect(pyusdBalance).to.equal(PYUSD_UNLOCK_COST);
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple ETH unlocks", async function () {
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });
      await bugToken.connect(user2).unlockWithETH({ value: ETH_UNLOCK_COST });

      expect(await bugToken.hasUnlocked(user1.address)).to.be.true;
      expect(await bugToken.hasUnlocked(user2.address)).to.be.true;
      expect(await bugToken.gasPool()).to.equal(ETH_UNLOCK_COST * 2n);
    });

    it("Should handle mixed payment methods", async function () {
      // User1 pays with ETH
      await bugToken.connect(user1).unlockWithETH({ value: ETH_UNLOCK_COST });

      // User2 pays with PYUSD
      await mockPYUSD.connect(user2).approve(await bugToken.getAddress(), PYUSD_UNLOCK_COST);
      await bugToken.connect(user2).unlockWithPYUSD();

      expect(await bugToken.hasUnlocked(user1.address)).to.be.true;
      expect(await bugToken.hasUnlocked(user2.address)).to.be.true;
      expect(await bugToken.gasPool()).to.equal(ETH_UNLOCK_COST);
      expect(await bugToken.pyusdPool()).to.equal(PYUSD_UNLOCK_COST);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle receiving ETH directly", async function () {
      const sendAmount = ethers.parseEther("0.1");
      
      await owner.sendTransaction({
        to: await bugToken.getAddress(),
        value: sendAmount,
      });

      // Should add to gas pool
      expect(await bugToken.gasPool()).to.equal(sendAmount);
    });

    it("Should check max supply", async function () {
      // This would take too long to test fully, but verify constant is set
      const maxSupply = await bugToken.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("100000000")); // 100M
    });
  });
});
