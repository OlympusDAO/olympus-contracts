const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { deployMockContract } = require("@ethereum-waffle/mock-contract");
const IERC20 = require("../../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
const IgOHM = require("../../artifacts/contracts/interfaces/IgOHM.sol/IgOHM.json");
const IsOHM = require("../../artifacts/contracts/interfaces/IsOHM.sol/IsOHM.json");
const IDistributor = require("../../artifacts/contracts/interfaces/IDistributor.sol/IDistributor.json");

describe("OlympusStaking", () => {
  let owner;
  let alice, bob, charles;
  let blackhole;
  let OHM;
  let sOHM;
  let gOHM;
  let StakingContract;
  let staking;

  beforeEach(async () => {
    [owner, alice, bob, charles] = await ethers.getSigners();
    blackhole = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
    OHM = await deployMockContract(owner, IERC20.abi);
    gOHM = await deployMockContract(owner, IgOHM.abi);
    sOHM = await deployMockContract(owner, IsOHM.abi);
  });

  describe("constructor", () => {
    it("can be constructed", async () => {
      let StakingContract = await ethers.getContractFactory("OlympusStaking");
      let staking = await StakingContract.connect(owner).deploy(OHM.address, sOHM.address, 2200, 1, 102201);

      expect(await staking.OHM()).to.equal(OHM.address);
      expect(await staking.sOHM()).to.equal(sOHM.address);
      epoch = await staking.epoch();
      expect(epoch._length).to.equal(BigNumber.from(2200));
      expect(epoch.number).to.equal(BigNumber.from(1));
      expect(epoch.endBlock).to.equal(BigNumber.from(102201));

      expect(await staking.governor()).to.equal(owner.address);
    });

    it("will not allow a 0x0 OHM address", async () => {
      let StakingContract = await ethers.getContractFactory("OlympusStaking");
      await expect(StakingContract.connect(owner).deploy(blackhole, sOHM.address, 2200, 1, 102201)).
        to.be.reverted;
    });

    it("will not allow a 0x0 sOHM address", async () => {
      let StakingContract = await ethers.getContractFactory("OlympusStaking");
      await expect(StakingContract.connect(owner).deploy(OHM.address, blackhole, 2200, 1, 102201)).
        to.be.reverted;
    });
  });

  describe("post-construction", () => {
    let currentEpoch;
    beforeEach(async () => {
      StakingContract = await ethers.getContractFactory("OlympusStaking");
      let currentBlock = await ethers.provider.send("eth_blockNumber");
      currentEpoch = 1;
      let nextRebase = BigNumber.from(currentBlock).add(10000); // set the rebase far enough in the future to not hit it
      staking = await StakingContract.connect(owner).deploy(OHM.address, sOHM.address, 2200, currentEpoch, nextRebase);
      await staking.setContract(1, gOHM.address);
    });

    describe("setWarmup", () => {
      it("sets the number of epochs of warmup are required", async () => {
        expect(await staking.warmupPeriod()).to.equal(0);
        await staking.connect(owner).setWarmup(2);
        expect(await staking.warmupPeriod()).to.equal(2);
      });

      it("emits a WarmupSet event", async () => {
        await expect(staking.connect(owner).setWarmup(2)).
          to.emit(staking, "WarmupSet").withArgs(2);
      });

      it("can only be set by the governor", async () => {
        expect(await staking.governor()).to.equal(owner.address);
        await expect(staking.connect(bob).setWarmup()).to.be.reverted;
      });
    });

    describe("stake", () => {
      it("adds amount to the warmup when claim is false", async () => {
        let amount = 1000;
        let gons = 10;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);
        await sOHM.mock.balanceForGons.withArgs(gons).returns(amount);

        await staking.connect(alice).stake(amount, alice.address, true, false);

        expect(await staking.supplyInWarmup()).to.equal(amount);
        expect(await staking.warmupPeriod()).to.equal(0);
        let warmupInfo = await staking.warmupInfo(alice.address);
        expect(warmupInfo.deposit).to.equal(amount);
        expect(warmupInfo.gons).to.equal(gons);
        expect(warmupInfo.expiry).to.equal(currentEpoch);
        expect(warmupInfo.lock).to.equal(false);
      });

      it("transfers sOHM when claim is true and rebasing is true", async () => {
        let amount = 1000;
        let rebasing = true;
        let claim = true;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);

        await sOHM.mock.balanceForGons.withArgs(0).returns(0);
        expect(await staking.supplyInWarmup()).to.equal(0);
      });

      it("mints gOHM when claim is true and rebasing is true", async () => {
        let amount = 1000;
        let indexedAmount = 10000;
        let rebasing = false;
        let claim = true;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await gOHM.mock.mint.withArgs(alice.address, indexedAmount).returns();
        await gOHM.mock.balanceTo.withArgs(amount).returns(indexedAmount);

        expect(await staking.gOHM()).to.equal(gOHM.address);

        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);
      });

      it("adds amount to warmup when claim is true and warmup period > 0", async () => {
        let amount = 1000;
        let gons = 10;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);
        await sOHM.mock.balanceForGons.withArgs(gons).returns(amount);

        await staking.connect(owner).setWarmup(1);
        await staking.connect(alice).stake(amount, alice.address, true, true);

        expect(await staking.supplyInWarmup()).to.equal(amount);
        let warmupInfo = await staking.warmupInfo(alice.address);
        expect(warmupInfo.deposit).to.equal(amount);
        expect(warmupInfo.gons).to.equal(gons);
        expect(warmupInfo.expiry).to.equal(currentEpoch + 1);
        expect(warmupInfo.lock).to.equal(false);
      });

      it("disables external deposits when locked", async () => {
        let amount = 1000;
        let gons = 10;
        let rebasing = false;
        let claim = false;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);

        await staking.connect(alice).toggleLock();

        await expect(staking.connect(alice).stake(amount, bob.address, rebasing, claim)).
          to.be.revertedWith("External deposits for account are locked" );
      });

      it("allows self deposits when locked", async () => {
        let amount = 1000;
        let gons = 10;
        let rebasing = false;
        let claim = false;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);

        await staking.connect(alice).toggleLock();

        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);
      });
    });

    describe("claim", () => {
      async function createClaim(wallet, amount, gons) {
        let rebasing = true;
        let claim = false;
        await OHM.mock.transferFrom.withArgs(wallet.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);
        await staking.connect(wallet).stake(amount, wallet.address, rebasing, claim);
      }

      it("transfers sOHM when rebasing is true", async () => {
        let amount = 1000;
        let gons = 10;
        await createClaim(alice, amount, gons);
        await sOHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await sOHM.mock.balanceForGons.withArgs(gons).returns(amount);

        await staking.connect(alice).claim(alice.address, true);

        await sOHM.mock.balanceForGons.withArgs(0).returns(0);
        expect(await staking.supplyInWarmup()).to.equal(0);
      });

      it("mints gOHM when rebasing is false", async () => {
        let indexedAmount = 10000;
        let amount = 1000;
        let gons = 10;
        await createClaim(alice, amount, gons);
        await gOHM.mock.balanceTo.withArgs(amount).returns(indexedAmount);
        await gOHM.mock.mint.withArgs(alice.address, indexedAmount).returns();
        await sOHM.mock.balanceForGons.withArgs(gons).returns(amount);

        await staking.connect(alice).claim(alice.address, false);

        await sOHM.mock.balanceForGons.withArgs(0).returns(0);
        expect(await staking.supplyInWarmup()).to.equal(0);
      });

      it("prevents external claims when locked", async () => {
        let amount = 1000;
        let gons = 10;
        await createClaim(alice, amount, gons);
        await staking.connect(alice).toggleLock();

        await expect(staking.connect(alice).claim(bob.address, false)).
          to.be.revertedWith("External claims for account are locked");
      });

      it("allows internal claims when locked", async () => {
        let amount = 1000;
        let gons = 10;
        await createClaim(alice, amount, gons);
        await staking.connect(alice).toggleLock();

        await sOHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await sOHM.mock.balanceForGons.withArgs(gons).returns(amount);

        await staking.connect(alice).claim(alice.address, true);
      });

      it("does nothing when there is nothing to claim", async () => {
        await staking.connect(bob).claim(bob.address, true);
        // none of the mocks have been called
      });

      it("does nothing when the warmup isn't over", async () => {
        await staking.connect(owner).setWarmup(2);
        await createClaim(alice, 1000, 10);

        await staking.connect(alice).claim(alice.address, true);
        // none of the mocks have been called
      });
    });

    describe("forfeit", () => {
      let amount, gons;

      beforeEach(async () => {
        // alice has a claim
        amount = 1000;
        gons = 10;
        let rebasing = true;
        let claim = false;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.gonsForBalance.withArgs(amount).returns(gons);
        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);
      });

      it("removes stake from warmup and returns OHM", async () => {
        await OHM.mock.transfer.withArgs(alice.address, amount).returns(true);

        await staking.connect(alice).forfeit();

        await sOHM.mock.balanceForGons.withArgs(0).returns(0);
        expect(await staking.supplyInWarmup()).to.equal(0);
      });

      it("transfers zero if there is no balance in warmup", async () => {
        await OHM.mock.transfer.withArgs(bob.address, 0).returns(true);
        await staking.connect(bob).forfeit();
      });
    });

    describe("unstake", () => {
      it("can redeem sOHM for OHM", async () => {
        let amount = 1000;
        let rebasing = true;
        let claim = true;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await sOHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);

        await sOHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await OHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await staking.connect(alice).unstake(amount, false, rebasing);
      });

      it("can redeem gOHM for OHM", async () => {
        let amount = 1000;
        let indexedAmount = 10000;
        let rebasing = false;
        let claim = true;
        await OHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);
        await gOHM.mock.balanceTo.withArgs(amount).returns(indexedAmount);
        await gOHM.mock.mint.withArgs(alice.address, indexedAmount).returns();
        await staking.connect(alice).stake(amount, alice.address, rebasing, claim);

        await gOHM.mock.balanceFrom.withArgs(indexedAmount).returns(amount);
        await gOHM.mock.burn.withArgs(alice.address, indexedAmount).returns();
        await OHM.mock.transfer.withArgs(alice.address, amount).returns(true);
        await staking.connect(alice).unstake(indexedAmount, false, rebasing);
      });
    });

    describe("wrap", () => {
      it("converts sOHM into gOHM", async () => {
        let amount = 1000;
        let indexedAmount = 10000;

        await gOHM.mock.balanceTo.withArgs(amount).returns(indexedAmount);
        await gOHM.mock.mint.withArgs(alice.address, indexedAmount).returns();
        await sOHM.mock.transferFrom.withArgs(alice.address, staking.address, amount).returns(true);

        await staking.connect(alice).wrap(amount);
      });
    });

    describe("unwrap", () => {
      it("converts gOHM into sOHM", async () => {
        let amount = 1000;
        let indexedAmount = 10000;

        await gOHM.mock.balanceFrom.withArgs(indexedAmount).returns(amount);
        await gOHM.mock.burn.withArgs(alice.address, indexedAmount).returns();
        await sOHM.mock.transfer.withArgs(alice.address, amount).returns(true);

        await staking.connect(alice).unwrap(indexedAmount);
      });
    });

    describe("rebase", () => {
      it("does nothing if the block is before the epoch end block", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let epoch = await staking.epoch();
        expect(BigNumber.from(currentBlock)).to.be.lt(BigNumber.from(epoch.endBlock));

        await staking.connect(alice).rebase();
      });

      it("increments epoch number and calls rebase ", async () => {
        let epochLength = 2200;
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        staking = await StakingContract.connect(owner).deploy(OHM.address, sOHM.address, epochLength, currentEpoch, BigNumber.from(currentBlock));
        let epoch = await staking.epoch();
        expect(BigNumber.from(currentBlock)).to.equal(BigNumber.from(epoch.endBlock));

        await sOHM.mock.rebase.withArgs(BigNumber.from(epoch.distribute), BigNumber.from(epoch.number)).returns(0);
        await OHM.mock.balanceOf.withArgs(staking.address).returns(10);
        await sOHM.mock.circulatingSupply.returns(10);
        await staking.connect(alice).rebase();

        let nextEpoch = await staking.epoch();
        expect(BigNumber.from(nextEpoch.number)).to.equal(BigNumber.from(epoch.number).add(1));
        expect(BigNumber.from(nextEpoch.distribute)).to.equal(0);
        expect(BigNumber.from(nextEpoch.endBlock)).to.equal(BigNumber.from(currentBlock).add(epochLength));
      });

      it("will plan to distribute the difference between staked and total supply", async () => {
        let epochLength = 2200;
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        staking = await StakingContract.connect(owner).deploy(OHM.address, sOHM.address, epochLength, currentEpoch, BigNumber.from(currentBlock));
        let epoch = await staking.epoch();
        expect(BigNumber.from(currentBlock)).to.equal(BigNumber.from(epoch.endBlock));

        await sOHM.mock.rebase.withArgs(BigNumber.from(epoch.distribute), BigNumber.from(epoch.number)).returns(0);
        await OHM.mock.balanceOf.withArgs(staking.address).returns(10);
        await sOHM.mock.circulatingSupply.returns(5);
        await staking.connect(alice).rebase();

        let nextEpoch = await staking.epoch();
        expect(BigNumber.from(nextEpoch.distribute)).to.equal(5);
      });

      it("will call the distributor, if set", async () => {
        let epochLength = 2200;
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        staking = await StakingContract.connect(owner).deploy(OHM.address, sOHM.address, epochLength, currentEpoch, BigNumber.from(currentBlock));
        let distributor = await deployMockContract(owner, IDistributor.abi);
        await staking.setContract(0, distributor.address);

        let epoch = await staking.epoch();
        expect(BigNumber.from(currentBlock)).to.equal(BigNumber.from(epoch.endBlock));

        await sOHM.mock.rebase.withArgs(BigNumber.from(epoch.distribute), BigNumber.from(epoch.number)).returns(0);
        await OHM.mock.balanceOf.withArgs(staking.address).returns(10);
        await sOHM.mock.circulatingSupply.returns(5);
        await distributor.mock.distribute.returns(true);
        await staking.connect(alice).rebase();
      });
    });
  });
});
