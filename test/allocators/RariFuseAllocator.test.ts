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
import { MockERC20, OlympusTreasury, TreasuryExtender, OlympusAuthority } from "../../types";

/// DATA
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { protocols } from "../utils/protocols";
import { AllocatorInitData, AllocatorStatus } from "../utils/allocators.ts";

const bne: Promise<BigNumber> = helpers.bne;
const bnn: Promise<BigNumber> = helpers.bnn;

/////////////////// CUSTOM

/// TYPES - IMPORT HERE
import { RariFuseAllocator, RariFuseAllocator__factory } from "../../types";

/// SET TYPES HERE, VARIABLES ARE PRESET
const ALLOCATORN: string = "RariFuseAllocator";
const ALLOCATORT: any = RariFuseAllocator;
const FACTORYT: any = RariFuseAllocator__factory;

/// INTERFACES
interface fData {
    idTroller: BigNumber;
    token: string;
}

interface fDataExpanded {
    f: fData;
    base: string;
    rT: string;
}

interface ProtocolSpecificData {
    treasury: string;
    rewards: string;
}

interface FuseAllocatorInitData {
    base: AllocatorInitData;
    spec: ProtocolSpecificData;
}

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
    const pinBlockNumber: number = 14393415;
    let url: string = config.networks.hardhat.forking!.url;

    /// TOKENS
    let underlying: MockERC20[];
    let utility: MockERC20[];
    let reward: MockERC20[];

    /////////////////// CUSTOM

    /// VARS
    const tetrasLockerId: number = 6;
    let snapshotId: number = 0;

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
            olympus.treasury
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

        //////////////////// CUSTOM

        underlying = await helpers.getCoins([coins.dai, coins.lusd, coins.frax, coins.weth]);
    });

    /// TESTS
    // If a test is preset then don't change the logic or only add to the logic, otherwise
    // fill out the logic for the test. All fields are obligatory for safety purposes.
    //
    // IF A TEST DOESN'T WORK BECAUSE OF THE PROTOCOL, then don't delete but SKIP the test.
    // As in :
    // `describe.skip`, `it.skip` etc.
    //
    // PRESET and CUSTOM will be tagged.

    describe("initialization procedure", () => {
        beforeEach(async () => {
            snapshotId = await helpers.snapshot();
        });

        it("passing: should initialize all values properly", async () => {});

        afterEach(async () => {
            await helpers.revert(snapshotId);
        });
    });

    // Now define a basic version so it can be repeatedly called.

    async function initialize(): Promise<void> {}

    // Return out all deposit ids of the allocator in `TreasuryExtender`

    async function depositIds(): Promise<BigNumber[]> {}

    // And all other preparatory if they are necessary.

    async function beforeEachUtilityAndRewardsTest(): Promise<void> {}

    async function beforeEachUpdateTest(): Promise<void> {}

    // set errors ( as in, when withdrawing some then the error is define as:
    //
    // input to deallocate == expected out , someError == expectedOut - real out / 100
    //
    // same thing for all, but since the type(uint256).max flag is passed (uint256Max from helpers.constants)
    // then input to deallocate != expected out
    // This is obviously assuming input = expected out, which all allocators should try to implement,
    // if impossible, skip

    const deallocateSomeError: BigNumber = 3; // example: 3%
    const deallocateAllError: BigNumber = 3; // example: 3%

    // Return out input for deallocate *some*

    async function beforeEachDeallocateTest(): Promise<BigNumber[]> {}

    async function beforeEachExtenderWithdrawalTest(): Promise<void> {}

    async function beforeEachPrepareMigrationTest(): Promise<void> {}

    async function beforeEachMigrateTest(): Promise<void> {}

    // Now start all other tests.

    context("with initialization", () => {
        ///// TEST ISOLATION /////
        beforeEach(async () => {
            /////////////////// PRESET
            snapshotId = await helpers.snapshot();

            /////////////////// CUSTOM

            /////////////////// PRESET
            await initialize();

            /////////////////// CUSTOM
        });

        afterEach(async () => {
            /////////////////// CUSTOM

            /////////////////// PRESET
            await helpers.revert(snapshotId);
        });

        describe("utility + rewards", () => {
            beforeEach(async () => {
                await beforeEachUtilityAndRewardsTest();
            });

            for (let i = 0; i < utility.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of utility token under index ${i}`, async () => {
                    // connected to owner
                    const uToken: MockERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(
                        uToken.transferFrom(allocator.address, owner.address, balance.div(2))
                    ).to.be.reverted;
                });

                it(`passing: extender should be able to withdraw some of utility token under index ${i}`, async () => {
                    const uToken: MockERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);
                    const amount: BigNumber = balance.div(2);

                    await expect(() =>
                        extender.returnRewardsToTreasury(allocator.address, uToken.address, amount)
                    ).to.changeTokenBalance(uToken, extender, amount);
                });

                it(`passing: extender should be able to withdraw all of utility token under index ${i}`, async () => {
                    const uToken: MockERC20 = underlying[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(() =>
                        extender.returnRewardsToTreasury(allocator.address, uToken.address, balance)
                    ).to.changeTokenBalance(uToken, extender, balance);
                });
            }

            for (let i = 0; i < rewards.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of reward token under index ${i}`, async () => {
                    // connected to owner
                    const rToken: MockERC20 = rewards[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(
                        rToken.transferFrom(allocator.address, owner.address, balance.div(2))
                    ).to.be.reverted;
                });

                it(`passing: extender should be able to withdraw some of reward token under index ${i}`, async () => {
                    const rToken: MockERC20 = rewards[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);
                    const amount: BigNumber = balance.div(2);

                    await expect(() =>
                        extender.returnRewardsToTreasury(allocator.address, rToken.address, amount)
                    ).to.changeTokenBalance(rToken, extender, amount);
                });

                it(`passing: extender should be able to withdraw all of reward token under index ${i}`, async () => {
                    const rToken: MockERC20 = rewards[i];
                    const balance: BigNumber = await uToken.balanceOf(allocator.address);

                    await expect(() =>
                        extender.returnRewardsToTreasury(allocator.address, rToken.address, balance)
                    ).to.changeTokenBalance(rToken, extender, balance);
                });
            }
        });

        describe("update()", () => {
            beforeEach(async () => {
                await beforeEachUpdateTest();
            });
        });

        const deallocateSomeInput: BigNumber[];

        describe("deallocate()", () => {
            beforeEach(async () => {
                deallocateSomeInput = await beforeEachDeallocateTest();
            });

            it(`passing: should be able to deallocate some of each token`, async () => {
                let expected: BigNumber[] = [];

                for (let i = 0; i < underlying.length; i++) {
                    expected[i] = deallocateSomeInput[i].sub(
                        deallocateSomeInput[i].mul(deallocateSomeError).div(100)
                    );
                }

                await allocator.deallocate(deallocateSomeInput);

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.gte(expected[i]);
                }
            });

            it(`passing: should be able to deallocate all of each token`, async () => {
                const deallocateAllInput: BigNumber[] = new Array(deallocateSomeInput.length).fill(
                    helpers.constants.uint256Max
                );
                const depositIds: BigNumber[] = await depositIds();

                let expected: BigNumber[] = [];

                for (let i = 0; i < underlying.length; i++) {
                    expected[i] = (await extender.getAllocatorAllocated(depositIds[i])).add(
                        (await extender.getAllocatorPerformance(depositIds[i]))[1] // this is loss, loss + allocated = initial allocated
                    );
                    expected[i] = expected[i].sub(expected[i].mul(deallocateAllError).div(100));
                }

                await allocator.deallocate(deallocateAllInput);

                for (let i = 0; i < underlying.length; i++) {
                    expect(await underlying[i].balanceOf(allocator.address)).to.be.gte(expected[i]);
                }
            });

            context("with deallocated tokens", () => {
                beforeEach(async () => {
                    await beforeEachExtenderWithdrawalTest();
                });

                for (let i = 0; i < underlying.length; i++) {
                    it(`revert: a foreign address should not be able to withdraw some of token under index ${i}`, async () => {});

                    it(`passing: should be able to return some of token under index ${i} to treasury`, async () => {});

                    it(`passing: should be able to return all of token under index ${i} to treasury`, async () => {});
                }
            });
        });

        describe("prepareMigration()", () => {
            beforeEach(async () => {
                await beforeEachPrepareMigrationTest();
            });
        });

        describe("migrate()", () => {
            beforeEach(async () => {
                await beforeEachMigrateTest();
            });
        });
    });
});
