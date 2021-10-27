const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { deployMockContract } = require("@ethereum-waffle/mock-contract");
const ITreasury = require("../../artifacts/contracts/interfaces/ITreasury.sol/ITreasury.json");
const IERC20 = require("../../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

describe("Distributor", () => {
  let owner;
  let staking;
  let other;
  let guardian;
  let blackhole;
  let OHM;
  let treasury;
  let DistributorContract;
  const epochLength = 2200;

  beforeEach(async () => {
    [owner, staking, other, guardian] = await ethers.getSigners();
    blackhole = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
    OHM = await deployMockContract(owner, IERC20.abi);
    treasury = await deployMockContract(owner, ITreasury.abi);
    DistributorContract = await ethers.getContractFactory("Distributor");
  });

  describe("constructor", () => {
    it("constructs correctly", async () => {
      const nextEpochBlock = 1;
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, nextEpochBlock);

      expect(await distributor.epochLength()).to.equal(epochLength);
      expect(await distributor.nextEpochBlock()).to.equal(nextEpochBlock);
    });

    it("does not accept 0x0 as OHM address", async () => {
      const nextEpochBlock = 1;
      await expect(DistributorContract.connect(owner).deploy(treasury.address, blackhole, epochLength, nextEpochBlock)).
        to.be.reverted;
    });

    it("does not accept 0x0 as treasury address", async () => {
      const nextEpochBlock = 1;
      await expect(DistributorContract.connect(owner).deploy(blackhole, OHM.address, epochLength, nextEpochBlock)).
        to.be.reverted;
    });
  });

  describe("distribute", () => {
    it("will do nothing if epoch is not complete", async () => {
      let currentBlock = await ethers.provider.send("eth_blockNumber");
      // each await is a transaction in its own block, so we need to be 3
      // blocks ahead to not rebase
      let nextEpochBlock = BigNumber.from(currentBlock).add(3);
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, nextEpochBlock);

      await distributor.distribute();

      expect(BigNumber.from(await distributor.nextEpochBlock())).
        to.equal(nextEpochBlock);
    });

    it("only advances the epoch if there are no recipients", async () => {
      let currentBlock = await ethers.provider.send("eth_blockNumber");
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));

      await distributor.distribute();

      expect(await distributor.nextEpochBlock()).to.equal(BigNumber.from(currentBlock).add(epochLength));
    });

    it("mint from treasury and distribute to recipients", async () => {
      let currentBlock = await ethers.provider.send("eth_blockNumber");
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
      await distributor.addRecipient(staking.address, 2975);
      await distributor.addRecipient(other.address, 1521);

      await OHM.mock.totalSupply.returns(1000000);
      await treasury.mock.mint.withArgs(staking.address, 2975).returns();
      await treasury.mock.mint.withArgs(other.address, 1521).returns();
      await distributor.distribute();

      let info = await distributor.info(0);
      expect(info.rate).to.equal(2975);
    });

    describe("rate adjustments", () => {
      it("can decrease distribution rate", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
        await distributor.addRecipient(staking.address, 2975);
        const index = 0;
        const add = false;
        const rate = 5;
        const target = 2000;
        await distributor.setAdjustment(index, add, rate, target);

        await OHM.mock.totalSupply.returns(1000000);
        await treasury.mock.mint.withArgs(staking.address, 2975).returns();
        await distributor.distribute();

        let info = await distributor.info(0);
        expect(info.rate).to.equal(2970);
      });

      it("can increase distribution rate", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
        await distributor.addRecipient(staking.address, 2975);
        const index = 0;
        const add = true;
        const rate = 5;
        const target = 3000;
        await distributor.setAdjustment(index, add, rate, target);

        await OHM.mock.totalSupply.returns(1000000);
        await treasury.mock.mint.withArgs(staking.address, 2975).returns();
        await distributor.distribute();

        let info = await distributor.info(0);
        expect(info.rate).to.equal(2980);
      });

      it("will not adjust if adjustment rate is zero", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
        await distributor.addRecipient(staking.address, 2975);
        const index = 0;
        const add = false;
        const rate = 0;
        const target = 2975;
        await distributor.setAdjustment(index, add, rate, target);

        await OHM.mock.totalSupply.returns(1000000);
        await treasury.mock.mint.withArgs(staking.address, 2975).returns();
        await distributor.distribute();

        let info = await distributor.info(0);
        expect(info.rate).to.equal(2975);
      });

      it("will stop decreasing once target it met", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
        await distributor.addRecipient(staking.address, 2975);
        const index = 0;
        const add = false;
        const rate = 5;
        const target = 2970;
        await distributor.setAdjustment(index, add, rate, target);

        await OHM.mock.totalSupply.returns(1000000);
        await treasury.mock.mint.withArgs(staking.address, 2975).returns();
        await distributor.distribute();

        let info = await distributor.info(0);
        expect(info.rate).to.equal(2970);
        let adjustment = await distributor.adjustments(0);
        expect(adjustment.rate).to.equal(0);
      });

      it("will stop increasing once target it met", async () => {
        let currentBlock = await ethers.provider.send("eth_blockNumber");
        let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, BigNumber.from(currentBlock));
        await distributor.addRecipient(staking.address, 2975);
        const index = 0;
        const add = true;
        const rate = 5;
        const target = 2980;
        await distributor.setAdjustment(index, add, rate, target);

        await OHM.mock.totalSupply.returns(1000000);
        await treasury.mock.mint.withArgs(staking.address, 2975).returns();
        await distributor.distribute();

        let info = await distributor.info(0);
        expect(info.rate).to.equal(2980);
        let adjustment = await distributor.adjustments(0);
        expect(adjustment.rate).to.equal(0);
      });
    });
  });

  describe("setAdjustment", () => {
    it("sets the adjustment at the given index", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).addRecipient(staking.address, 2975);

      const index = 0;
      const add = true;
      const rate = 5;
      const target = 2000;
      await distributor.connect(owner).setAdjustment(index, add, rate, target);

      let adjustment = await distributor.adjustments(index);
      expect(adjustment.add).to.equal(add);
      expect(adjustment.rate).to.equal(rate);
      expect(adjustment.target).to.equal(target);
    });

    it("can only be done by governor or guardian", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).addRecipient(staking.address, 2975);

      await expect(distributor.connect(other).setAdjustment(0, false, 5, 2000)).
        to.be.revertedWith("Caller is not governor or guardian");
    });

    it("allows governor to make large adjustments", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).addRecipient(staking.address, 2975);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      const index = 0;
      const add = false;
      const rate = 2975;
      const target = 0;
      await distributor.connect(owner).setAdjustment(index, add, rate, target);

      let adjustment = await distributor.adjustments(index);
      expect(adjustment.add).to.equal(add);
      expect(adjustment.rate).to.equal(rate);
      expect(adjustment.target).to.equal(target);
    });

    it("allows guardian to make adjustments up to 2.5%", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).addRecipient(staking.address, 1000);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      const index = 0;
      const add = false;
      const rate = 25;
      const target = 0;
      await distributor.connect(guardian).setAdjustment(index, add, rate, target);

      let adjustment = await distributor.adjustments(index);
      expect(adjustment.add).to.equal(add);
      expect(adjustment.rate).to.equal(rate);
      expect(adjustment.target).to.equal(target);
    });

    it("restricts guardian to from making adjustments over 2.5%", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).addRecipient(staking.address, 1000);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      const rate = 26
      await expect(distributor.connect(guardian).setAdjustment(0, false, rate, 0)).
        to.be.revertedWith("Limiter: cannot adjust by >2.5%");
    });
  });

  describe("nextRewardAt", () => {
    it("returns the number of OHM to be distributed in the next epoch", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await OHM.mock.totalSupply.returns(3899568500546135);

      const rate = 2975
      let reward = await distributor.nextRewardAt(rate);
      expect(reward).to.equal(11601216289124);
    });
  });

  describe("nextRewardFor", () => {
    it("returns the number of OHM to be distributed to the given address in the next epoch", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      const rate = 2975
      await distributor.addRecipient(staking.address, rate);
      await OHM.mock.totalSupply.returns(3899568500546135);

      let reward = await distributor.nextRewardFor(staking.address);
      expect(reward).to.equal(11601216289124);
    });

    it("returns the 0 if the address is not a recipient", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await OHM.mock.totalSupply.returns(3899568500546135);

      let reward = await distributor.nextRewardFor(other.address);
      expect(reward).to.equal(0);
    });
  });

  describe("addRecipient", () => {
    it("will append a recipent to the list", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.addRecipient(staking.address, 2975);
      await distributor.addRecipient(other.address, 1000);

      let r0 = await distributor.info(0);
      expect(r0.recipient).to.equal(staking.address);
      expect(r0.rate).to.equal(2975);

      let r1 = await distributor.info(1);
      expect(r1.recipient).to.equal(other.address);
      expect(r1.rate).to.equal(1000);
    });

    it("can only be done by governor", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      await expect(distributor.connect(guardian).addRecipient(staking.address, 2975)).
        to.be.reverted;
    });
  });

  describe("removeRecipeint", () => {
    it("will set reciepent and rate to 0", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.addRecipient(staking.address, 2975);
      await distributor.removeRecipient(0, staking.address);

      let r0 = await distributor.info(0);
      expect(r0.recipient).to.equal(blackhole);
      expect(r0.rate).to.equal(0);
    });

    it("will revert if address is incorrect", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.addRecipient(staking.address, 2975);
      await expect(distributor.removeRecipient(0, other.address)).to.be.reverted;
    });

    it("can be done by the guardian", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      await distributor.addRecipient(staking.address, 2975);
      await distributor.connect(guardian).removeRecipient(0, staking.address);

      let r0 = await distributor.info(0);
      expect(r0.recipient).to.equal(blackhole);
      expect(r0.rate).to.equal(0);
    });

    it("must be done by either governor or guardian", async () => {
      let distributor = await DistributorContract.connect(owner).deploy(treasury.address, OHM.address, epochLength, 0);
      await distributor.connect(owner).pushGuardian(guardian.address);
      await distributor.connect(guardian).pullGuardian();

      await distributor.addRecipient(staking.address, 2975);
      await expect(distributor.connect(other).removeRecipient(0, staking.address)).
        to.be.revertedWith("Caller is not governor or guardian");
    });
  });
});
