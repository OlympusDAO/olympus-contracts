const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployMockContract } = require("@ethereum-waffle/mock-contract");
const IStaking = require("../artifacts/contracts/interfaces/IStaking.sol/IStaking.json");
const IERC20 = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
const IgOHM = require("../artifacts/contracts/interfaces/IgOHM.sol/IgOHM.json");

const TOTAL_GONS = 5000000000000000;

describe("sOlympusERC20Token", () => {
  let initializer;
  let alice, bob, charles;
  let blackhole;
  let OHM;
  let sOHM;
  let gOHM;
  let staking;

  beforeEach(async () => {
    [initializer, alice, bob, charles] = await ethers.getSigners();
    blackhole = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
    OHM = await deployMockContract(initializer, IERC20.abi);
    staking = await deployMockContract(initializer, IStaking.abi);
    gOHM = await deployMockContract(initializer, IgOHM.abi);

    let sOHMContract = await ethers.getContractFactory("sOlympus");
    sOHM = await sOHMContract.connect(initializer).deploy();
  });

  it("is constructed correctly", async () => {
    expect(await sOHM.name()).to.equal("Staked OHM");
    expect(await sOHM.symbol()).to.equal("sOHM");
    expect(await sOHM.decimals()).to.equal(9);
  });

  describe("initialization", () => {
    describe("setIndex", () => {
      it("sets the index", async () => {
        await sOHM.connect(initializer).setIndex(3);
        expect(await sOHM.index()).to.equal(3);
      });

      it("must be done by the initializer", async () => {
        await expect(sOHM.connect(alice).setIndex(3)).to.be.reverted;
      });

      it("cannot update the index if already set", async () => {
        await sOHM.connect(initializer).setIndex(3);
        await expect(sOHM.connect(initializer).setIndex(3)).to.be.reverted;
      });
    });

    describe("setgOHM", () => {
      it("sets gOHM", async () => {
        await sOHM.connect(initializer).setgOHM(gOHM.address);
        expect(await sOHM.gOHM()).to.equal(gOHM.address);
      });

      it("must be done by the initializer", async () => {
        await expect(sOHM.connect(alice).setgOHM(gOHM.address)).to.be.reverted;
      });

      it("won't set gOHM to 0 address", async () => {
        await expect(sOHM.connect(initializer).setgOHM(blackhole)).to.be.reverted;
      });
    });

    describe("initialize", () => {
      it("assigns TOTAL_GONS to the staking contract's balance", async () => {
        await sOHM.connect(initializer).initialize(staking.address);
        expect(await sOHM.balanceOf(staking.address)).to.equal(TOTAL_GONS);
      });

      it("emits Transfer event", async () => {
        await expect(sOHM.connect(initializer).initialize(staking.address)).
          to.emit(sOHM, "Transfer").withArgs(blackhole, staking.address, TOTAL_GONS);
      });

      it("emits LogStakingContractUpdated event", async () => {
        await expect(sOHM.connect(initializer).initialize(staking.address)).
          to.emit(sOHM, "LogStakingContractUpdated").withArgs(staking.address);
      });

      it("unsets the initializer, so it cannot be called again", async () => {
        await sOHM.connect(initializer).initialize(staking.address);
        await expect(sOHM.connect(initializer).initialize(staking.address)).to.be.reverted;
      });
    });
  });

  describe("post-initialization", () => {
    beforeEach(async () => {
      await sOHM.connect(initializer).setIndex(1);
      await sOHM.connect(initializer).setgOHM(gOHM.address);
      await sOHM.connect(initializer).initialize(staking.address);
    });

    describe("approve", () => {
      it("sets the allowed value between sender and spender", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        expect(await sOHM.allowance(alice.address, bob.address)).to.equal(10);
      });

      it("emits an Approval event", async () => {
        await expect(await sOHM.connect(alice).approve(bob.address, 10)).
          to.emit(sOHM, "Approval").withArgs(alice.address, bob.address, 10);
      });
    });

    describe("increaseAllowance", () => {
      it("increases the allowance between sender and spender", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        await sOHM.connect(alice).increaseAllowance(bob.address, 4);

        expect(await sOHM.allowance(alice.address, bob.address)).to.equal(14);
      });

      it("emits an Approval event", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        await expect(await sOHM.connect(alice).increaseAllowance(bob.address, 4)).
          to.emit(sOHM, "Approval").withArgs(alice.address, bob.address, 14);
      });
    });

    describe("decreaseAllowance", () => {
      it("decreases the allowance between sender and spender", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        await sOHM.connect(alice).decreaseAllowance(bob.address, 4);

        expect(await sOHM.allowance(alice.address, bob.address)).to.equal(6);
      });

      it("will not make the value negative", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        await sOHM.connect(alice).decreaseAllowance(bob.address, 11);

        expect(await sOHM.allowance(alice.address, bob.address)).to.equal(0);
      });

      it("emits an Approval event", async () => {
        await sOHM.connect(alice).approve(bob.address, 10);
        await expect(await sOHM.connect(alice).decreaseAllowance(bob.address, 4)).
          to.emit(sOHM, "Approval").withArgs(alice.address, bob.address, 6);
      });
    });

    describe("circulatingSupply", () => {
      it("is zero when all owned by staking contract", async () => {
        await staking.mock.supplyInWarmup.returns(0);
        await gOHM.mock.totalSupply.returns(0);
        await gOHM.mock.balanceFrom.returns(0);
        let totalSupply = await sOHM.circulatingSupply();
        expect(totalSupply).to.equal(0);
      });

      it("includes all supply owned by gOHM", async () => {
        await staking.mock.supplyInWarmup.returns(0);
        await gOHM.mock.totalSupply.returns(10);
        await gOHM.mock.balanceFrom.returns(10);
        let totalSupply = await sOHM.circulatingSupply();
        expect(totalSupply).to.equal(10);
      });


      it("includes all supply in warmup in staking contract", async () => {
        await staking.mock.supplyInWarmup.returns(50);
        await gOHM.mock.totalSupply.returns(0);
        await gOHM.mock.balanceFrom.returns(0);
        let totalSupply = await sOHM.circulatingSupply();
        expect(totalSupply).to.equal(50);
      });
    });
  });
});
