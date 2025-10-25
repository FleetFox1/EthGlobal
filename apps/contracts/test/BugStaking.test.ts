import { expect } from "chai";
import { ethers } from "hardhat";
import { BugTokenV2, BugVotingV3 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Tests for BUG Token Staking & Rewards System
 * 
 * Tests the flow:
 * 1. User stakes 10 BUG to submit for voting
 * 2. Community votes (each voter stakes 10 BUG)
 * 3. Winner gets 5 BUG per upvote + stake back
 * 4. Losers get stake back only
 */
describe("BUG Staking & Rewards System", function () {
  let bugToken: BugTokenV2;
  let bugVoting: BugVotingV3;
  let owner: SignerWithAddress;
  let submitter: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;

  const STAKE_AMOUNT = ethers.parseEther("10"); // 10 BUG
  const REWARD_PER_VOTE = ethers.parseEther("5"); // 5 BUG per upvote
  const INITIAL_BALANCE = ethers.parseEther("1000"); // 1000 BUG for testing

  beforeEach(async function () {
    [owner, submitter, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy Mock PYUSD first (needed for BugTokenV2 constructor)
    const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
    const mockPYUSD = await MockPYUSD.deploy();
    await mockPYUSD.waitForDeployment();

    // Deploy BugTokenV2 with PYUSD address
    const BugTokenV2 = await ethers.getContractFactory("BugTokenV2");
    bugToken = await BugTokenV2.deploy(await mockPYUSD.getAddress());
    await bugToken.waitForDeployment();

    // Deploy BugNFT (needed for BugVotingV3)
    const BugNFT = await ethers.getContractFactory("BugNFT");
    const bugNFT = await BugNFT.deploy();
    await bugNFT.waitForDeployment();

    // Deploy BugVotingV3
    const BugVotingV3 = await ethers.getContractFactory("BugVotingV3");
    bugVoting = await BugVotingV3.deploy(
      await bugToken.getAddress(),
      await bugNFT.getAddress()
    );
    await bugVoting.waitForDeployment();

    // Give everyone BUG tokens for testing
    await bugToken.transfer(submitter.address, INITIAL_BALANCE);
    await bugToken.transfer(voter1.address, INITIAL_BALANCE);
    await bugToken.transfer(voter2.address, INITIAL_BALANCE);
    await bugToken.transfer(voter3.address, INITIAL_BALANCE);

    console.log("✅ Contracts deployed:");
    console.log("  BugToken:", await bugToken.getAddress());
    console.log("  BugVoting:", await bugVoting.getAddress());
  });

  describe("Balance Check (Like API does)", function () {
    it("Should verify user has >= 10 BUG before submission", async function () {
      const balance = await bugToken.balanceOf(submitter.address);
      
      console.log("\n📊 Balance Check:");
      console.log("  Submitter balance:", ethers.formatEther(balance), "BUG");
      console.log("  Required:", ethers.formatEther(STAKE_AMOUNT), "BUG");
      
      expect(balance).to.be.gte(STAKE_AMOUNT);
    });

    it("Should reject submission if user has < 10 BUG", async function () {
      // Create a new user with 0 BUG
      const [_, __, poorUser] = await ethers.getSigners();
      const balance = await bugToken.balanceOf(poorUser.address);
      
      console.log("\n❌ Insufficient Balance:");
      console.log("  Poor user balance:", ethers.formatEther(balance), "BUG");
      
      expect(balance).to.be.lt(STAKE_AMOUNT);
    });
  });

  describe("Submission Staking", function () {
    it("Should stake 10 BUG when submitting for voting", async function () {
      const balanceBefore = await bugToken.balanceOf(submitter.address);
      
      // Approve BugVoting to spend BUG tokens
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );

      // Submit for voting
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      const balanceAfter = await bugToken.balanceOf(submitter.address);
      const staked = balanceBefore - balanceAfter;

      console.log("\n💎 Submission Staking:");
      console.log("  Balance before:", ethers.formatEther(balanceBefore), "BUG");
      console.log("  Balance after:", ethers.formatEther(balanceAfter), "BUG");
      console.log("  Staked:", ethers.formatEther(staked), "BUG");

      expect(staked).to.equal(STAKE_AMOUNT);
    });

    it("Should track submission in contract", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      const submission = await bugVoting.submissions(1);
      
      console.log("\n📝 Submission Tracking:");
      console.log("  ID:", 1);
      console.log("  Submitter:", submission.submitter);
      console.log("  Status:", submission.approved ? "Approved" : "Pending");

      expect(submission.submitter).to.equal(submitter.address);
    });
  });

  describe("Voting & Rewards", function () {
    beforeEach(async function () {
      // Submitter creates a submission
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );
    });

    it("Should allow voting with 10 BUG stake per vote", async function () {
      // Approve and vote FOR
      await bugToken.connect(voter1).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );

      const balanceBefore = await bugToken.balanceOf(voter1.address);
      
      await bugVoting.connect(voter1).vote(1, true); // Vote FOR

      const balanceAfter = await bugToken.balanceOf(voter1.address);
      const staked = balanceBefore - balanceAfter;

      console.log("\n🗳️ Voting Stake:");
      console.log("  Voter balance before:", ethers.formatEther(balanceBefore), "BUG");
      console.log("  Voter balance after:", ethers.formatEther(balanceAfter), "BUG");
      console.log("  Staked:", ethers.formatEther(staked), "BUG");

      expect(staked).to.equal(STAKE_AMOUNT);
    });

    it("Should calculate rewards: 5 BUG per upvote", async function () {
      // 3 voters vote FOR
      for (const voter of [voter1, voter2, voter3]) {
        await bugToken.connect(voter).approve(
          await bugVoting.getAddress(),
          STAKE_AMOUNT
        );
        await bugVoting.connect(voter).vote(1, true); // Vote FOR
      }

      // Fast forward time to pass voting period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
      await ethers.provider.send("evm_mine", []);

      const submitterBalanceBefore = await bugToken.balanceOf(submitter.address);

      // Resolve voting
      await bugVoting.resolveVoting(1);

      const submitterBalanceAfter = await bugToken.balanceOf(submitter.address);
      const gained = submitterBalanceAfter - submitterBalanceBefore;

      // Expected: 10 BUG stake + (3 upvotes × 5 BUG) = 25 BUG
      const expectedReward = STAKE_AMOUNT + (REWARD_PER_VOTE * BigInt(3));

      console.log("\n💰 Rewards Calculation:");
      console.log("  Upvotes:", 3);
      console.log("  Reward per upvote:", ethers.formatEther(REWARD_PER_VOTE), "BUG");
      console.log("  Total rewards:", ethers.formatEther(REWARD_PER_VOTE * BigInt(3)), "BUG");
      console.log("  Stake returned:", ethers.formatEther(STAKE_AMOUNT), "BUG");
      console.log("  Total gained:", ethers.formatEther(gained), "BUG");
      console.log("  Expected:", ethers.formatEther(expectedReward), "BUG");

      expect(gained).to.equal(expectedReward);
    });

    it("Should return stake only if rejected (more downvotes)", async function () {
      // 2 voters vote AGAINST, 1 votes FOR
      await bugToken.connect(voter1).approve(await bugVoting.getAddress(), STAKE_AMOUNT);
      await bugVoting.connect(voter1).vote(1, false); // Vote AGAINST

      await bugToken.connect(voter2).approve(await bugVoting.getAddress(), STAKE_AMOUNT);
      await bugVoting.connect(voter2).vote(1, false); // Vote AGAINST

      await bugToken.connect(voter3).approve(await bugVoting.getAddress(), STAKE_AMOUNT);
      await bugVoting.connect(voter3).vote(1, true); // Vote FOR

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const submitterBalanceBefore = await bugToken.balanceOf(submitter.address);

      // Resolve voting
      await bugVoting.resolveVoting(1);

      const submitterBalanceAfter = await bugToken.balanceOf(submitter.address);
      const gained = submitterBalanceAfter - submitterBalanceBefore;

      console.log("\n❌ Rejected Submission:");
      console.log("  Upvotes:", 1);
      console.log("  Downvotes:", 2);
      console.log("  Stake returned:", ethers.formatEther(gained), "BUG");
      console.log("  Expected (stake only):", ethers.formatEther(STAKE_AMOUNT), "BUG");

      // Should only get stake back, no rewards
      expect(gained).to.equal(STAKE_AMOUNT);
    });

    it("Should return voter stakes correctly", async function () {
      // Voter1 votes FOR
      await bugToken.connect(voter1).approve(await bugVoting.getAddress(), STAKE_AMOUNT);
      const voter1BalanceBefore = await bugToken.balanceOf(voter1.address);
      await bugVoting.connect(voter1).vote(1, true);

      // Fast forward and resolve
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      await bugVoting.resolveVoting(1);

      const voter1BalanceAfter = await bugToken.balanceOf(voter1.address);
      const voter1Gained = voter1BalanceAfter - voter1BalanceBefore + STAKE_AMOUNT; // Add back initial stake

      // Voter who voted FOR on approved submission gets: stake + 5 BUG reward
      const expectedVoterReward = STAKE_AMOUNT + REWARD_PER_VOTE;

      console.log("\n🎉 Voter Rewards:");
      console.log("  Voter stake:", ethers.formatEther(STAKE_AMOUNT), "BUG");
      console.log("  Voter reward:", ethers.formatEther(REWARD_PER_VOTE), "BUG");
      console.log("  Voter gained:", ethers.formatEther(voter1Gained), "BUG");
      console.log("  Expected:", ethers.formatEther(expectedVoterReward), "BUG");

      expect(voter1Gained).to.equal(expectedVoterReward);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero votes (submission expires)", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      // Fast forward time without any votes
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const submitterBalanceBefore = await bugToken.balanceOf(submitter.address);

      await bugVoting.resolveVoting(1);

      const submitterBalanceAfter = await bugToken.balanceOf(submitter.address);
      const gained = submitterBalanceAfter - submitterBalanceBefore;

      console.log("\n⏰ Zero Votes Case:");
      console.log("  Stake returned:", ethers.formatEther(gained), "BUG");

      // With zero votes, should still get stake back
      expect(gained).to.equal(STAKE_AMOUNT);
    });

    it("Should prevent double staking on same submission", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      // Try to submit again (should fail)
      await expect(
        bugVoting.connect(submitter).submitForVoting(
          "ipfs://test-hash",
          "ipfs://test-metadata"
        )
      ).to.be.reverted;
    });

    it("Should prevent voting without sufficient BUG balance", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      // Create poor user with 5 BUG (less than required 10)
      const [_, __, poorUser] = await ethers.getSigners();
      await bugToken.transfer(poorUser.address, ethers.parseEther("5"));

      await bugToken.connect(poorUser).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );

      // Try to vote (should fail due to insufficient balance)
      await expect(
        bugVoting.connect(poorUser).vote(1, true)
      ).to.be.reverted;
    });
  });

  describe("Gas Costs", function () {
    it("Should measure gas cost of submission", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );

      const tx = await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );
      const receipt = await tx.wait();

      console.log("\n⛽ Gas Costs:");
      console.log("  Submission:", receipt?.gasUsed.toString(), "gas");
    });

    it("Should measure gas cost of voting", async function () {
      await bugToken.connect(submitter).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );
      await bugVoting.connect(submitter).submitForVoting(
        "ipfs://test-hash",
        "ipfs://test-metadata"
      );

      await bugToken.connect(voter1).approve(
        await bugVoting.getAddress(),
        STAKE_AMOUNT
      );

      const tx = await bugVoting.connect(voter1).vote(1, true);
      const receipt = await tx.wait();

      console.log("  Voting:", receipt?.gasUsed.toString(), "gas");
    });
  });
});
