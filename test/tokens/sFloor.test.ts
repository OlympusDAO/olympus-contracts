import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from '@defi-wonderland/smock'

import {
  IStaking,
  IERC20,
  IgFLOOR,
  FloorERC20Token,
  FloorERC20Token__factory,
  SFLOOR,
  SFLOOR__factory,
  GFLOOR,
  FloorAuthority__factory,
  ITreasury,
} from '../../types';

const TOTAL_GONS = 5000000000000000;
const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("sFLOOR", () => {
  let initializer: SignerWithAddress;
  let treasury: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let floor: FloorERC20Token;
  let sFloor: SFLOOR;
  let gFloorFake: FakeContract<GFLOOR>;
  let stakingFake: FakeContract<IStaking>;
  let treasuryFake: FakeContract<ITreasury>;

  beforeEach(async () => {
    [initializer, alice, bob] = await ethers.getSigners();
    stakingFake = await smock.fake<IStaking>('IStaking');
    treasuryFake = await smock.fake<ITreasury>('ITreasury');
    gFloorFake = await smock.fake<GFLOOR>('gFLOOR');

    const authority = await (new FloorAuthority__factory(initializer)).deploy(initializer.address, initializer.address, initializer.address, initializer.address);
    floor = await (new FloorERC20Token__factory(initializer)).deploy(authority.address);
    sFloor = await (new SFLOOR__factory(initializer)).deploy();
  });

  it("is constructed correctly", async () => {
    expect(await sFloor.name()).to.equal("Staked FLOOR");
    expect(await sFloor.symbol()).to.equal("sFLOOR");
    expect(await sFloor.decimals()).to.equal(9);
  });

  describe("initialization", () => {
    describe("setIndex", () => {
      it("sets the index", async () => {
        await sFloor.connect(initializer).setIndex(3);
        expect(await sFloor.index()).to.equal(3);
      });

      it("must be done by the initializer", async () => {
        await expect(sFloor.connect(alice).setIndex(3)).to.be.reverted;
      });

      it("cannot update the index if already set", async () => {
        await sFloor.connect(initializer).setIndex(3);
        await expect(sFloor.connect(initializer).setIndex(3)).to.be.reverted;
      });
    });

    describe("setgFLOOR", () => {
      it("sets gFloorFake", async () => {
        await sFloor.connect(initializer).setgFLOOR(gFloorFake.address);
        expect(await sFloor.gFLOOR()).to.equal(gFloorFake.address);
      });

      it("must be done by the initializer", async () => {
        await expect(sFloor.connect(alice).setgFLOOR(gFloorFake.address)).to.be.reverted;
      });

      it("won't set gFloorFake to 0 address", async () => {
        await expect(sFloor.connect(initializer).setgFLOOR(ZERO_ADDRESS)).to.be.reverted;
      });
    });

    describe("initialize", () => {
      it("assigns TOTAL_GONS to the stakingFake contract's balance", async () => {
        await sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address);
        expect(await sFloor.balanceOf(stakingFake.address)).to.equal(TOTAL_GONS);
      });

      it("emits Transfer event", async () => {
        await expect(sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address)).
          to.emit(sFloor, "Transfer").withArgs(ZERO_ADDRESS, stakingFake.address, TOTAL_GONS);
      });

      it("emits LogStakingContractUpdated event", async () => {
        await expect(sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address)).
          to.emit(sFloor, "LogStakingContractUpdated").withArgs(stakingFake.address);
      });

      it("unsets the initializer, so it cannot be called again", async () => {
        await sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address);
        await expect(sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address)).to.be.reverted;
      });
    });
  });

  describe("post-initialization", () => {
    beforeEach(async () => {
      await sFloor.connect(initializer).setIndex(1);
      await sFloor.connect(initializer).setgFLOOR(gFloorFake.address);
      await sFloor.connect(initializer).initialize(stakingFake.address, treasuryFake.address);
    });

    describe("approve", () => {
      it("sets the allowed value between sender and spender", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        expect(await sFloor.allowance(alice.address, bob.address)).to.equal(10);
      });

      it("emits an Approval event", async () => {
        await expect(await sFloor.connect(alice).approve(bob.address, 10)).
          to.emit(sFloor, "Approval").withArgs(alice.address, bob.address, 10);
      });
    });

    describe("increaseAllowance", () => {
      it("increases the allowance between sender and spender", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        await sFloor.connect(alice).increaseAllowance(bob.address, 4);

        expect(await sFloor.allowance(alice.address, bob.address)).to.equal(14);
      });

      it("emits an Approval event", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        await expect(await sFloor.connect(alice).increaseAllowance(bob.address, 4)).
          to.emit(sFloor, "Approval").withArgs(alice.address, bob.address, 14);
      });
    });

    describe("decreaseAllowance", () => {
      it("decreases the allowance between sender and spender", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        await sFloor.connect(alice).decreaseAllowance(bob.address, 4);

        expect(await sFloor.allowance(alice.address, bob.address)).to.equal(6);
      });

      it("will not make the value negative", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        await sFloor.connect(alice).decreaseAllowance(bob.address, 11);

        expect(await sFloor.allowance(alice.address, bob.address)).to.equal(0);
      });

      it("emits an Approval event", async () => {
        await sFloor.connect(alice).approve(bob.address, 10);
        await expect(await sFloor.connect(alice).decreaseAllowance(bob.address, 4)).
          to.emit(sFloor, "Approval").withArgs(alice.address, bob.address, 6);
      });
    });

    describe("circulatingSupply", () => {
      it("is zero when all owned by stakingFake contract", async () => {
        await stakingFake.supplyInWarmup.returns(0);
        await gFloorFake.totalSupply.returns(0);
        await gFloorFake.balanceFrom.returns(0);

        const totalSupply = await sFloor.circulatingSupply();
        expect(totalSupply).to.equal(0);
      });

      it("includes all supply owned by gFloorFake", async () => {
        await stakingFake.supplyInWarmup.returns(0);
        await gFloorFake.totalSupply.returns(10);
        await gFloorFake.balanceFrom.returns(10);

        const totalSupply = await sFloor.circulatingSupply();
        expect(totalSupply).to.equal(10);
      });


      it("includes all supply in warmup in stakingFake contract", async () => {
        await stakingFake.supplyInWarmup.returns(50);
        await gFloorFake.totalSupply.returns(0);
        await gFloorFake.balanceFrom.returns(0);

        const totalSupply = await sFloor.circulatingSupply();
        expect(totalSupply).to.equal(50);
      });
    });
  });
});