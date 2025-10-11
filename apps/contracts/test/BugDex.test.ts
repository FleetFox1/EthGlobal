import { expect } from "chai";
import { ethers } from "hardhat";
import { BugToken, BugNFT, BugVoting } from "../typechain-types";

describe("BugDex Contracts", function () {
  let bugToken: BugToken;
  let bugNFT: BugNFT;
  let bugVoting: BugVoting;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy BugToken
    const BugToken = await ethers.getContractFactory("BugToken");
    bugToken = await BugToken.deploy();
    await bugToken.waitForDeployment();

    // Deploy BugNFT
    const BugNFT = await ethers.getContractFactory("BugNFT");
    bugNFT = await BugNFT.deploy();
    await bugNFT.waitForDeployment();

    // Deploy BugVoting
    const BugVoting = await ethers.getContractFactory("BugVoting");
    bugVoting = await BugVoting.deploy(
      await bugToken.getAddress(),
      await bugNFT.getAddress()
    );
    await bugVoting.waitForDeployment();

    // Setup authorizations
    await bugToken.addMinter(await bugVoting.getAddress());
    await bugNFT.authorizeMinter(await bugVoting.getAddress());
  });

  describe("BugToken", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await bugToken.name()).to.equal("Bug Token");
      expect(await bugToken.symbol()).to.equal("BUG");
    });

    it("Should have initial supply", async function () {
      const initialSupply = await bugToken.totalSupply();
      expect(initialSupply).to.equal(ethers.parseEther("10000000")); // 10M
    });

    it("Should allow claiming from faucet", async function () {
      await bugToken.connect(user1).claimFaucet();
      const balance = await bugToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should enforce faucet cooldown", async function () {
      await bugToken.connect(user1).claimFaucet();
      await expect(bugToken.connect(user1).claimFaucet()).to.be.revertedWith(
        "Faucet: Cooldown period not passed"
      );
    });
  });

  describe("BugNFT", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await bugNFT.name()).to.equal("BugDex NFT");
      expect(await bugNFT.symbol()).to.equal("BUGDEX");
    });

    it("Should allow authorized minters to mint", async function () {
      await bugNFT.authorizeMinter(owner.address);
      await bugNFT.mintBug(
        user1.address,
        "QmTestHash123",
        0, // COMMON rarity
        5 // 5 votes
      );

      expect(await bugNFT.balanceOf(user1.address)).to.equal(1);
      expect(await bugNFT.totalBugs()).to.equal(1);
    });
  });

  describe("BugVoting", function () {
    it("Should allow submitting a bug", async function () {
      const tx = await bugVoting.connect(user1).submitBug("QmTestHash", 0);
      await tx.wait();

      const submission = await bugVoting.getSubmission(1);
      expect(submission.submitter).to.equal(user1.address);
      expect(submission.ipfsHash).to.equal("QmTestHash");
    });

    it("Should allow voting with BUG tokens", async function () {
      // Give user1 tokens
      await bugToken.connect(user1).claimFaucet();
      
      // Submit bug
      await bugVoting.connect(user1).submitBug("QmTestHash", 0);
      
      // Approve and vote
      await bugToken.connect(user1).approve(
        await bugVoting.getAddress(),
        ethers.parseEther("10")
      );
      await bugVoting.connect(user1).vote(1, true);

      const submission = await bugVoting.getSubmission(1);
      expect(submission.votesFor).to.equal(1);
    });

    it("Should mint NFT when vote threshold is met", async function () {
      // Setup: Give tokens to voters
      await bugToken.connect(user1).claimFaucet();
      await bugToken.connect(user2).claimFaucet();
      await bugToken.transfer(user2.address, ethers.parseEther("100"));

      // Submit bug
      await bugVoting.connect(user1).submitBug("QmTestHash", 0);

      // Vote (need 5 votes)
      for (let i = 0; i < 5; i++) {
        const voter = i === 0 ? user1 : user2;
        await bugToken.connect(voter).approve(
          await bugVoting.getAddress(),
          ethers.parseEther("50")
        );
        await bugVoting.connect(voter).vote(1, true);
      }

      const submission = await bugVoting.getSubmission(1);
      expect(submission.resolved).to.be.true;
      expect(submission.approved).to.be.true;
      expect(submission.nftTokenId).to.be.greaterThan(0);
    });
  });
});
