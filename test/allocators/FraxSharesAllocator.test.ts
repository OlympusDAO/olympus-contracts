import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
const { BigNumber } = ethers;
import { deployMockContract } from "ethereum-waffle";
import { FakeContract, smock } from '@defi-wonderland/smock'
import {
  IERC20,
  ITreasury,
  IveFXSYieldDistributorV4,
  IveFXS,
  FraxSharesAllocator,
  FraxSharesAllocator__factory,
} from '../../types';
const { fork_network, fork_reset } = require("../utils/network_fork");

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
const MAX_TIME = 4 * 365 * 86400;

describe("FraxSharesAllocator", () => {
    describe("unit tests", () => {
        let owner: SignerWithAddress;
        let other: SignerWithAddress;
        let alice: SignerWithAddress;
        let bob: SignerWithAddress;
        let treasuryFake: FakeContract<ITreasury>;
        let veFXSYieldDistributorFake: FakeContract<IveFXSYieldDistributorV4>;
        let veFXSFake: FakeContract<IveFXS>;
        let fxsFake: FakeContract<IERC20>;
        let allocator: FraxSharesAllocator;

        beforeEach(async () => {
            [owner, other, alice, bob] = await ethers.getSigners();
            treasuryFake = await smock.fake<ITreasury>("ITreasury");
            veFXSYieldDistributorFake = await smock.fake<IveFXSYieldDistributorV4>("IveFXSYieldDistributorV4");
            veFXSFake = await smock.fake<IveFXS>("IveFXS");
            fxsFake = await smock.fake<IERC20>("IERC20");
        });

        describe("constructor", () => {
            it("can construct", async () => {
                allocator = await (new FraxSharesAllocator__factory(owner)).deploy(
                    treasuryFake.address,
                    fxsFake.address,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                );
            });

            it("reverts on zero treasury address", async () => {
                await expect((new FraxSharesAllocator__factory(owner)).deploy(
                    ZERO_ADDRESS,
                    fxsFake.address,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                )).to.be.revertedWith("zero treasury address");
            });

            it("reverts on zero FXS address", async () => {
                await expect((new FraxSharesAllocator__factory(owner)).deploy(
                    treasuryFake.address,
                    ZERO_ADDRESS,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                )).to.be.revertedWith("zero FXS address");
            });
            
            it("reverts on zero veFXS address", async () => {
                await expect((new FraxSharesAllocator__factory(owner)).deploy(
                    treasuryFake.address,
                    fxsFake.address,
                    ZERO_ADDRESS,
                    veFXSYieldDistributorFake.address,
                )).to.be.revertedWith("zero veFXS address");
            });

            it("reverts on zero veFXSYieldDistributorV4 address", async () => {
                await expect((new FraxSharesAllocator__factory(owner)).deploy(
                    treasuryFake.address,
                    fxsFake.address,
                    veFXSFake.address,
                    ZERO_ADDRESS,
                )).to.be.revertedWith("zero veFXSYieldDistributorV4 address");
            });
        });

        describe("post-construction", () => {
            beforeEach(async () => {
                allocator = await (new FraxSharesAllocator__factory(owner)).deploy(
                    treasuryFake.address,
                    fxsFake.address,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                );
            });

            describe("deposit", () => {
                it("can only be called by the owner", async () => {
                    await expect(allocator.connect(alice).deposit(1000))
                        .to.be.reverted;
                });

                it("requests funds from the treasury and tracks the deployed amount", async () => {
                    const AMOUNT = 100
                    await allocator.deposit(AMOUNT);

                    expect(treasuryFake.manage).to.be.calledWith(fxsFake.address, AMOUNT);
                    expect(await allocator.totalAmountDeployed()).to.equal(AMOUNT);
                });

                it("creates a new lock on first call", async () => {
                    const AMOUNT = 100
                    await allocator.deposit(AMOUNT);

                    expect(veFXSFake.create_lock).to.be.calledWith(AMOUNT, MAX_TIME);
                });

                it("increases amounts and unlock time on subsequent calls", async () => {
                    const AMOUNT = 100
                    await allocator.deposit(AMOUNT);
                    await allocator.deposit(AMOUNT);

                    expect(veFXSFake.increase_amount).to.be.calledWith(AMOUNT);
                    expect(veFXSFake.increase_unlock_time).to.be.calledWith(MAX_TIME);
                });
            });

            describe("harvest", () => {
                it("increases total amount deployed by the yield", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.getYield.returns(YIELD);
                    await allocator.harvest();
                    expect(await allocator.totalAmountDeployed()).to.equal(YIELD);
                });

                it("increases veFXS by amount and extends lock", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.getYield.returns(YIELD);
                    await allocator.harvest();

                    expect(veFXSFake.increase_amount).to.be.calledWith(YIELD);
                    expect(veFXSFake.increase_unlock_time).to.be.calledWith(MAX_TIME);
                });
            });

            describe("getPendingRewards", () => {
                it("delegates to veFXSYieldDistributorV4", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.yields.whenCalledWith(allocator.address).returns(YIELD);

                    expect(await allocator.getPendingRewards()).to.equal(YIELD);
                })
            });
        });
    });

    describe("integration tests", () => {
        let owner: SignerWithAddress;
        let other: SignerWithAddress;
        let alice: SignerWithAddress;
        let bob: SignerWithAddress;
        let allocator: FraxSharesAllocator;

        before(async () => {
            await fork_network(13487643);

            [owner, other, alice, bob] = await ethers.getSigners();
            let allocatorContract = await ethers.getContractFactory("FraxSharesAllocator");
            allocator = await allocatorContract.deploy(
                "0x31f8cc382c9898b273eff4e0b7626a6987c846e8", // treasury address
                "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", // FXS address
                "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0", // veFXS address
                // TODO: find the real address for this
                "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0", // veFXSYieldDistributorV4 address
            ) as FraxSharesAllocator;
        });

        after(async () => {
            await fork_reset();
        });

        it("works", async () => {
            console.log("Huzzah")
        });
    })
});
