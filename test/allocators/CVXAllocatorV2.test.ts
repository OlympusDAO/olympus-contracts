// I am experimenting with a test framework or something for allocators, where you
// follow the prompt kinda to set up tests to make it easier. I am typing lots of stuff
// to make it clear what we are using for tsserver.
// Stuff is categorized into preset or custom, so yeah you can just fill out stuff and add what
// you need.

//// PRESET

/// LIBS
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

/// TYPES
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20, OlympusTreasury, TreasuryExtender, OlympusAuthority } from "../../types";

/// DATA
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { protocols } from "../utils/protocols";
import { AllocatorInitData, AllocatorStatus } from "../utils/allocators";

const bne = helpers.bne;
const bnn = helpers.bnn;

/////////////////// CUSTOM

/// TYPES - IMPORT HERE

/// SET TYPES HERE, VARIABLES ARE PRESET
const ALLOCATORN: string;
type ALLOCATORT = typeof undefined;
type FACTORYT = typeof undefined;

/// INTERFACES

/// DATA

/// OTHER

/////////////////// DESCRIBE BLOCK

describe(ALLOCATORN, () => {
    /////////////////// PRESET

    /// SIGNERS
    let owner: SignerWithAddress; // this is simply 1st signer
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    /// CONTRACTS
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;

    let allocator: ALLOCATORT;
    let factory: FACTORYT;

    /// NETWORK
    let url: string = config.networks.hardhat.forking!.url;
    let snapshotId: number = 0;

    /// TOKENS
    let underlying: ERC20[] = [];
    let utility: ERC20[] = [];
    let reward: ERC20[] = [];

    /////////////////// CUSTOM

    ////// DEFINE YOUR CUSTOM OBJECTS ONLY FOR USE IN FUNCTIONS HERE
    /// SIGNERS

    /// CONTRACTS

    /// NETWORK
    // OBLIGATORY
    const pinBlockNumber: number = 14393415;

    /// TOKENS

    /// VARS

    //////// FUNCTIONS
    // In future ( next test ) all of this will be delegated to a dedicated file as exports.

    // Async function are not valid inside this scope, so this will set up all of your vars from above
    // inside last part of the first before block. You can handles assignments, interactions in this and
    // it will be used below.

    async function setupTestingEnvironment(): Promise<void> {}

    // These should test the initialization procedure. This means setting up parameters and adding
    // everything up until the point where funds can be added and harvested. This means, the last function
    // in these tests should be allocator.activate()

    async function beforeEachInitializationProcedureTest(): Promise<void> {}

    function initializationProcedureTests(): void {}

    async function afterEachInitializationProcedureTest(): Promise<void> {}

    // Now define a basic version so it can be repeatedly called.

    async function initialize(): Promise<void> {}

    // Return out all deposit ids of the allocator in `TreasuryExtender`

    let depositIds: BigNumber[] = [];

    async function getDepositIds(): Promise<BigNumber[]> {
        // sample return to fix compile
        return [BigNumber.from(0)];
    }

    // And all other preparatory if they are necessary.

    async function beforeEachUtilityAndRewardsTest(): Promise<void> {}

    // UPDATE TESTS

    async function beforeEachUpdateTest(): Promise<void> {}

    // throw it blocks inside and use the naming optimally, it consists of
    // "passing:" and "revert:" and then specifiers after it

    function updateRevertingTests(): void {}

    function updateGainTests(): void {}

    function updateLossTests(): void {}

    // DEALLOCATE

    // set errors ( as in, when withdrawing some then the error is define as:
    //
    // input to deallocate == expected out , someError == expectedOut - real out / 100
    //
    // same thing for all, but since the type(uint256).max flag is passed (uint256Max from helpers.constants)
    // then input to deallocate != expected out
    // This is obviously assuming input = expected out, which all allocators should try to implement,
    // if impossible, skip

    const deallocateSomeError: number = 3; // example: 3%
    const deallocateAllError: number = 3; // example: 3%

    // Return out input for deallocate *some*

    async function beforeEachDeallocateTest(): Promise<BigNumber[]> {
        return [BigNumber.from(0)];
    }

    // extender withdrawal, you need to deallocate before it

    async function beforeEachExtenderWithdrawalTest(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // prepareMigration

    async function beforeEachPrepareMigrationTest(): Promise<void> {}

    async function prepareMigrationRevertingTests(): Promise<void> {}

    async function prepareMigrationPassingTests(): Promise<void> {}

    // migrate

    async function beforeEachMigrateTest(): Promise<void> {}

    async function migrateRevertingTests(): Promise<void> {}

    async function migratePassingTests(): Promise<void> {}

    /// TESTS
    // IF A TEST DOESN'T WORK BECAUSE OF THE PROTOCOL, then don't delete but SKIP the test.
    // As in : `describe.skip`, `it.skip` etc.

    before(async () => {
        //////////////////// PRESET

        /// NETWORK
        await helpers.pinBlock(pinBlockNumber, url);

        /// OLYMPUS

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        extender = (await ethers.getContractAt(
            "TreasuryExtender",
            olympus.extender
        )) as TreasuryExtender;

        /// ALLOCATOR

        factory = (await ethers.getContractFactory(ALLOCATORN)) as FACTORYT;

        factory = factory.connect(guardian);

        /// ACCOUNTS + CONNECTIONS

        owner = (await ethers.getSigners())[0];

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        extender = extender.connect(guardian);
        treasury = treasury.connect(governor);

        /// INTERACTIONS (THIS WILL BE REMOVED ONCE EXTENDER IS ENABLED BY TREASURY)

        treasury.enable(3, extender.address, helpers.constants.addressZero);
        treasury.enable(0, extender.address, helpers.constants.addressZero);

        /// DATA

        depositIds = await getDepositIds();

        ///// CUSTOM

        await setupTestingEnvironment();
    });

    // Test initialization procedure

    context.skip("initialization procedure tests", () => {
        beforeEach(async () => {
            await beforeEachInitializationProcedureTest();
        });

        initializationProcedureTests();

        afterEach(async () => {
            await afterEachInitializationProcedureTest();
        });
    });

    // Now start all other tests.

    context.skip("with initialization", () => {
        ///// TEST ISOLATION /////
        beforeEach(async () => {
            snapshotId = await helpers.snapshot();
            await initialize();
        });

        afterEach(async () => {
            await helpers.revert(snapshotId);
        });

        it("passing: should have set each token correctly", async () => {
            const allTokens: string[] = await allocator.tokens();

            for (let i = 0; i < allTokens.length; i++) {
                expect(allTokens[i]).to.equal(underlying[i].address);
            }
        });

        describe("utility + rewards", () => {
            beforeEach(async () => {
                await beforeEachUtilityAndRewardsTest();
            });

            it("passing: it should have set each token correctly", async () => {
                const uTokens: string[] = await allocator.utilityTokens();
                const rTokens: string[] = await allocator.rewardTokens();

                for (let i = 0; i < utility.length; i++) {
                    expect(uTokens[i]).to.equal(utility[i].address);
                }

                for (let i = 0; i < reward.length; i++) {
                    expect(rTokens[i]).to.equal(reward[i].address);
                }
            });

            for (let i = 0; i < utility.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of utility token under index ${i}`, async () => {
                    // connected to owner
                    const uToken: ERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(
                        uToken.transferFrom(allocator.address, owner.address, balance.div(2))
                    ).to.be.reverted;
                });

                it(`passing: extender should be able to withdraw some of utility token under index ${i}`, async () => {
                    const uToken: ERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);
                    const amount: BigNumber = balance.div(2);

                    await expect(() =>
                        extender
                            .connect(guardian)
                            ["returnRewardsToTreasury(address,address,uint256)"](
                                allocator.address,
                                uToken.address,
                                amount
                            )
                    ).to.changeTokenBalance(uToken, extender, amount);
                });

                it(`passing: extender should be able to withdraw all of utility token under index ${i}`, async () => {
                    const uToken: ERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(() =>
                        extender
                            .connect(guardian)
                            ["returnRewardsToTreasury(address,address,uint256)"](
                                allocator.address,
                                uToken.address,
                                balance
                            )
                    ).to.changeTokenBalance(uToken, extender, balance);
                });
            }

            for (let i = 0; i < reward.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of reward token under index ${i}`, async () => {
                    // connected to owner
                    const rToken: ERC20 = reward[i];
                    const balance: BigNumber = await rToken.balanceOf(allocator.address);

                    await expect(
                        rToken.transferFrom(allocator.address, owner.address, balance.div(2))
                    ).to.be.reverted;
                });

                it(`passing: extender should be able to withdraw some of reward token under index ${i}`, async () => {
                    const rToken: ERC20 = reward[i];
                    const balance: BigNumber = await rToken.balanceOf(allocator.address);
                    const amount: BigNumber = balance.div(2);

                    await expect(() =>
                        extender
                            .connect(guardian)
                            ["returnRewardsToTreasury(address,address,uint256)"](
                                allocator.address,
                                rToken.address,
                                amount
                            )
                    ).to.changeTokenBalance(rToken, extender, amount);
                });

                it(`passing: extender should be able to withdraw all of reward token under index ${i}`, async () => {
                    const rToken: ERC20 = reward[i];
                    const balance: BigNumber = await rToken.balanceOf(allocator.address);

                    await expect(() =>
                        extender
                            .connect(guardian)
                            ["returnRewardsToTreasury(address,address,uint256)"](
                                allocator.address,
                                rToken.address,
                                balance
                            )
                    ).to.changeTokenBalance(rToken, extender, balance);
                });
            }
        });

        describe("update()", () => {
            beforeEach(async () => {
                await beforeEachUpdateTest();
            });
            updateRevertingTests();
            updateGainTests();
            updateLossTests();
        });

        let deallocateSomeInput: BigNumber[] = [];

        describe("deallocate()", () => {
            beforeEach(async () => {
                if (deallocateSomeInput.length == 0)
                    deallocateSomeInput = await beforeEachDeallocateTest();
                else await beforeEachDeallocateTest();
            });

            it(`passing: should be able to deallocate some of each token`, async () => {
                let expected: BigNumber[] = [];

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.equal(0);

                    expected[i] = deallocateSomeInput[i].sub(
                        deallocateSomeInput[i].mul(deallocateSomeError).div(100)
                    );
                }

                await allocator.connect(guardian).deallocate(deallocateSomeInput);

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.gte(expected[i]);
                }
            });

            it(`passing: should be able to deallocate all of each token`, async () => {
                const deallocateAllInput: BigNumber[] = new Array(deallocateSomeInput.length).fill(
                    helpers.constants.uint256Max
                );

                let expected: BigNumber[] = [];

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.equal(0);

                    expected[i] = (await extender.getAllocatorAllocated(depositIds[i])).add(
                        (await extender.getAllocatorPerformance(depositIds[i]))[1] // this is loss, loss + allocated = initial allocated
                    );

                    expected[i] = expected[i].sub(expected[i].mul(deallocateAllError).div(100));
                }

                await allocator.connect(guardian).deallocate(deallocateAllInput);

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.gte(expected[i]);
                }
            });

            context("with deallocated tokens", () => {
                beforeEach(async () => {
                    await beforeEachExtenderWithdrawalTest();
                });

                for (let i = 0; i < underlying.length; i++) {
                    it(`revert: a foreign address should not be able to withdraw some of token under index ${i}`, async () => {
                        // connected to owner
                        const unToken: ERC20 = underlying[i];
                        const balance: BigNumber = await unToken.balanceOf(allocator.address);

                        await expect(
                            unToken.transferFrom(allocator.address, owner.address, balance.div(2))
                        ).to.be.reverted;
                    });

                    it(`passing: should be able to return some of token under index ${i} to treasury`, async () => {
                        const unToken: ERC20 = underlying[i];
                        const balance: BigNumber = await unToken.balanceOf(allocator.address);
                        const amount: BigNumber = balance.div(2);

                        await expect(() =>
                            extender.connect(guardian).returnFundsToTreasury(depositIds[i], amount)
                        ).to.changeTokenBalance(unToken, treasury, amount);
                    });

                    it(`passing: should be able to return all of token under index ${i} to treasury`, async () => {
                        const unToken: ERC20 = underlying[i];
                        const balance: BigNumber = await unToken.balanceOf(allocator.address);

                        await expect(() =>
                            extender.connect(guardian).returnFundsToTreasury(depositIds[i], balance)
                        ).to.changeTokenBalance(unToken, treasury, balance);
                    });
                }
            });
        });

        describe("prepareMigration()", () => {
            beforeEach(async () => {
                await beforeEachPrepareMigrationTest();
            });

            prepareMigrationRevertingTests();
            prepareMigrationPassingTests();
        });

        describe("migrate()", () => {
            beforeEach(async () => {
                await beforeEachMigrateTest();
            });

            migrateRevertingTests();
            migratePassingTests();
        });
    });
});
