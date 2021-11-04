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
  LUSDAllocator,
  LUSDAllocator__factory,
} from '../../types';

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("LUSDAllocator", () => {
  let owner: SignerWithAddress;
  let governor: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let treasuryFake: FakeContract<ITreasury>;
  let stabilityPoolFake: FakeContract<IStabilityPool>;
  let lusdTokenFake: FakeContract<IERC20>;
  let lusdAllocator: LUSDAllocator;

  beforeEach(async () => {
    [owner, governor, alice, bob] = await ethers.getSigners();
    treasuryFake = await smock.fake<ITreasury>("ITreasury");
    stabilityPoolFake = await smock.fake<IStabilityPool>("IStabilityPool");
    lusdTokenFake = await smock.fake<IERC20>("IERC20");
  });

  describe("constructor", () => {
    it("can construct", async () => {
      lusdAllocator = await (new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        stabilityPoolFake.address,
        ZERO_ADDRESS
      );
      expect(await lusdAllocator.lusdTokenAddress()).to.equal(lusdTokenFake.address);
    });

    it("does not allow treasury to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        ZERO_ADDRESS,
        lusdTokenFake.address,
        stabilityPoolFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("treasury address cannot be 0x0");
    });

    it("does not allow stability pool to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        ZERO_ADDRESS,
        ZERO_ADDRESS
      )).to.be.revertedWith("stabilityPool address cannot be 0x0");
    });

    it("does not allow LUSD token to be 0x0", async () => {
      await expect((new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        ZERO_ADDRESS,
        stabilityPoolFake.address,
        ZERO_ADDRESS
      )).to.be.revertedWith("LUSD token address cannot be 0x0");
    });
  });
  
  describe("post-constructor", () => {
    beforeEach(async () => {
      lusdAllocator = await (new LUSDAllocator__factory(owner)).deploy(
        treasuryFake.address,
        lusdTokenFake.address,
        stabilityPoolFake.address,
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
      })
    });
  });
});
