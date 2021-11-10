import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
const { BigNumber } = ethers;
import { deployMockContract } from "ethereum-waffle";
import { FakeContract, smock } from '@defi-wonderland/smock'
import {
  IERC20,
  ITreasury,
  IStabilityPool,
  ILQTYStaking,
  LUSDAllocator,
  LUSDAllocator__factory,
} from '../../types';

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("LUSDAllocator", () => {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let treasuryFake: FakeContract<ITreasury>;
  let stabilityPoolFake: FakeContract<IStabilityPool>;
  let lqtyStakingFake: FakeContract<ILQTYStaking>;
  let lusdTokenFake: FakeContract<IERC20>;
  let lqtyTokenFake: FakeContract<IERC20>;
  let lusdAllocator: LUSDAllocator;

  beforeEach(async () => {
    [owner, other, alice, bob] = await ethers.getSigners();
    treasuryFake = await smock.fake<ITreasury>("ITreasury");
    stabilityPoolFake = await smock.fake<IStabilityPool>("IStabilityPool");
    lqtyStakingFake = await smock.fake<ILQTYStaking>("ILQTYStaking");
    lusdTokenFake = await smock.fake<IERC20>("IERC20");
    lqtyTokenFake = await smock.fake<IERC20>("IERC20");
  });

  describe("constructor", () => {
    it("can construct", async () => {
      lusdAllocator = await (new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        lqtyTokenFake.address,
        stabilityPoolFake.address,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      );
      expect(await lusdAllocator.lusdTokenAddress()).to.equal(lusdTokenFake.address);
    });

    it("does not allow treasury to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        ZERO_ADDRESS,
        lusdTokenFake.address,
        lqtyTokenFake.address,
        stabilityPoolFake.address,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("treasury address cannot be 0x0");
    });

    it("does not allow stability pool to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        lqtyTokenFake.address,
        ZERO_ADDRESS,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("stabilityPool address cannot be 0x0");
    });

    it("does not allow LUSD token to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        ZERO_ADDRESS,
        lqtyTokenFake.address,
        stabilityPoolFake.address,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("LUSD token address cannot be 0x0");
    });

    it("does not allow LQTY token to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        ZERO_ADDRESS,
        stabilityPoolFake.address,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("LQTY token address cannot be 0x0");
    });

    it("does not allow LQTY staking address to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        lqtyTokenFake.address,
        stabilityPoolFake.address,
        ZERO_ADDRESS,
        ZERO_ADDRESS
      )).to.be.revertedWith("LQTY staking address cannot be 0x0");
    });    
  });
  
  describe("post-constructor", () => {
    beforeEach(async () => {
      lusdAllocator = await (new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        lqtyTokenFake.address,
        stabilityPoolFake.address,
        lqtyStakingFake.address,
        ZERO_ADDRESS
      );
    });

    describe("deposit", () => {
      it("withdraws amount of token from treasury and deposits in pool", async () => {
        const AMOUNT = 12345;
        const VALUE = 999999;
        treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, AMOUNT).returns(VALUE);
        await lusdAllocator.connect(owner).deposit(lusdTokenFake.address, AMOUNT);

        expect(treasuryFake.manage).to.be.calledWith(lusdTokenFake.address, AMOUNT);
        expect(lusdTokenFake.approve).to.be.calledWith(stabilityPoolFake.address, AMOUNT);
        expect(stabilityPoolFake.provideToSP).to.be.calledWith(AMOUNT, ZERO_ADDRESS);

        expect(await lusdAllocator.totalAmountDeployed()).to.equal(AMOUNT);
        expect(await lusdAllocator.totalValueDeployed()).to.equal(VALUE);
      });

      it("can perform additional deposit", async () => {
        const AMOUNT = 12345;
        const VALUE = 999999;
        treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, AMOUNT).returns(VALUE);
        await lusdAllocator.connect(owner).deposit(lusdTokenFake.address, AMOUNT);
        await lusdAllocator.connect(owner).deposit(lusdTokenFake.address, AMOUNT);

        expect(await lusdAllocator.totalAmountDeployed()).to.equal(AMOUNT + AMOUNT);
        expect(await lusdAllocator.totalValueDeployed()).to.equal(VALUE + VALUE);
      });

      it("reverts if non-LUSD token is passed", async () => {
        await expect(lusdAllocator.connect(owner).deposit(other.address, 12345))
          .to.be.revertedWith("token address does not match LUSD token");
      });

      it("can only be called by the owner", async () => {
        await expect(lusdAllocator.connect(other).deposit(lusdTokenFake.address, 12345))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("withdraw", () => {
      const DEPOSIT_AMOUNT = 12345;
      const DEPOSIT_VALUE = 999999;
      beforeEach(async () => {
        treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, DEPOSIT_AMOUNT).returns(DEPOSIT_VALUE);
        await lusdAllocator.connect(owner).deposit(lusdTokenFake.address, DEPOSIT_AMOUNT);
      });

      it("can withdraw all the funds", async () => {
        lusdTokenFake.balanceOf.whenCalledWith(lusdAllocator.address).returns(DEPOSIT_AMOUNT);
        treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, DEPOSIT_AMOUNT).returns(DEPOSIT_VALUE);
        await lusdAllocator.connect(owner).withdraw(lusdTokenFake.address, DEPOSIT_AMOUNT);

        expect(stabilityPoolFake.withdrawFromSP).to.be.calledWith(DEPOSIT_AMOUNT);
        expect(treasuryFake.deposit).to.be.calledWith(DEPOSIT_AMOUNT, lusdTokenFake.address, DEPOSIT_VALUE);
        expect(lusdTokenFake.balanceOf).to.be.calledWith(lusdAllocator.address);
        expect(lusdTokenFake.approve).to.be.calledWith(treasuryFake.address, DEPOSIT_AMOUNT);

        expect(await lusdAllocator.totalAmountDeployed()).to.equal(0);
        expect(await lusdAllocator.totalValueDeployed()).to.equal(0);
      });

      it("can do do a partial withdraw", async () => {
        const PARTIAL_AMOUNT = 4321;
        const PARTIAL_VALUE = 8888;
        lusdTokenFake.balanceOf.whenCalledWith(lusdAllocator.address).returns(PARTIAL_AMOUNT);
        treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, PARTIAL_AMOUNT).returns(PARTIAL_VALUE);
        await lusdAllocator.connect(owner).withdraw(lusdTokenFake.address, PARTIAL_AMOUNT);

        expect(stabilityPoolFake.withdrawFromSP).to.be.calledWith(PARTIAL_AMOUNT);
        expect(treasuryFake.deposit).to.be.calledWith(PARTIAL_AMOUNT, lusdTokenFake.address, PARTIAL_VALUE);
        expect(lusdTokenFake.balanceOf).to.be.calledWith(lusdAllocator.address);
        expect(lusdTokenFake.approve).to.be.calledWith(treasuryFake.address, PARTIAL_AMOUNT);

        expect(await lusdAllocator.totalAmountDeployed()).to.equal(DEPOSIT_AMOUNT - PARTIAL_AMOUNT);
        expect(await lusdAllocator.totalValueDeployed()).to.equal(DEPOSIT_VALUE - PARTIAL_VALUE);
      });

      it("reverts if non-LUSD token is passed", async () => {
        await expect(lusdAllocator.connect(owner).withdraw(other.address, 12345))
          .to.be.revertedWith("token address does not match LUSD token");
      });

      it("can only be called by the owner", async () => {
        await expect(lusdAllocator.connect(other).withdraw(lusdTokenFake.address, 12345))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
