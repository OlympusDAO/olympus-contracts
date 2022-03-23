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
import { CVXAllocatorV2, CVXAllocatorV2__factory, ILockedCvx } from "../../types";

/// SET TYPES HERE, VARIABLES ARE PRESET
const ALLOCATORN: string = "CVXAllocatorV2";
type ALLOCATORT = CVXAllocatorV2;
type FACTORYT = CVXAllocatorV2__factory;

/// INTERFACES
interface OperationData {
    cvxLocker: string;
    spendRatio: BigNumber;
    relock: boolean;
    crvDeposit: string;
    ccStaking: string;
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
    let url: string = config.networks.hardhat.forking!.url;
    let snapshotId: number = 0;

    /// TOKENS
    let underlying: ERC20[] = [];
    let utility: ERC20[] = [];
    let reward: ERC20[] = [];

    /////////////////// CUSTOM

    ////// DEFINE YOUR CUSTOM OBJECTS ONLY FOR USE IN FUNCTIONS HERE
    /// SIGNERS
    let notifier: SignerWithAddress;

    /// CONTRACTS
    let LOCKER: ILockedCvx;

    /// NETWORK
    // OBLIGATORY
    const pinBlockNumber: number = 14393415;

    /// TOKENS

    /// VARS
    let OD: OperationData;
    let AID: AllocatorInitData;
    let nrBef: number = 1;

    //////// FUNCTIONS
    // In future ( next test ) all of this will be delegated to a dedicated file as exports.

    // Async function are not valid inside this scope, so this will set up all of your vars from above
    // inside last part of the first before block. You can handles assignments, interactions in this and
    // it will be used below.

    async function setupTestingEnvironment(): Promise<void> {
        let cvxc = (await helpers.getCoin(coins.cvx)).connect(
            await helpers.impersonate("0x4e3fbd56cd56c3e72c1403e103b45db9da5b5d2b")
        );

        AID = {
            authority: olympus.authority,
            extender: olympus.extender,
            tokens: [coins.cvx, coins.crv, coins.cvxcrv],
        };

        OD = {
            cvxLocker: protocols.convex.cvxLocker,
            spendRatio: bnn(0),
            relock: true,
            crvDeposit: protocols.convex.crvDeposit,
            ccStaking: protocols.convex.ccStaking,
        };

        underlying = await helpers.getCoins([coins.cvx, coins.crv, coins.cvxcrv]);
        utility = await helpers.getCoins([coins.crv, coins.cvxcrv]);
        reward = await helpers.getCoins([coins.crv, coins.cvxcrv]);

        nrBef = (await extender.getTotalAllocatorCount()).toNumber();

        LOCKER = await helpers.summon<ILockedCvx>("ILockedCvx", protocols.convex.cvxLocker);

        notifier = await helpers.impersonate((await LOCKER.owner()) as string);

        await helpers.addEth(notifier.address, bne(10, 18));
        await helpers.addEth("0x4e3fbd56cd56c3e72c1403e103b45db9da5b5d2b", bne(10, 18));

        const bal = await cvxc.balanceOf(notifier.address);

        await cvxc.transfer(notifier.address, bal);

        cvxc = cvxc.connect(notifier);

        await cvxc.approve(LOCKER.address, bal);

        LOCKER = LOCKER.connect(notifier);
    }

    // These should test the initialization procedure. This means setting up parameters and adding
    // everything up until the point where funds can be added and harvested. This means, the last function
    // in these tests should be allocator.activate()

    async function beforeEachInitializationProcedureTest(): Promise<void> {
        snapshotId = await helpers.snapshot();
        allocator = await factory.connect(guardian).deploy(OD, AID);
        allocator = allocator.connect(guardian);
    }

    function initializationProcedureTests(): void {
        it("passing: should have properly initalized data", async () => {
            const opdata: OperationData = await allocator.opData();

            expect(OD.cvxLocker).to.equal(opdata.cvxLocker);
            expect(OD.spendRatio).to.equal(opdata.spendRatio);
            expect(OD.crvDeposit).to.equal(opdata.crvDeposit);
            expect(OD.relock).to.equal(opdata.relock);
            expect(OD.ccStaking).to.equal(opdata.ccStaking);
        });

        it("passing: setOperationData() setRelock()", async () => {
            const nOD: OperationData = {
                cvxLocker: helpers.constants.addressZero,
                spendRatio: bnn(0),
                crvDeposit: helpers.constants.addressZero,
                relock: false,
                ccStaking: helpers.constants.addressZero,
            };

            await allocator.setOperationData(nOD);

            const opdata: OperationData = await allocator.opData();

            expect(nOD.cvxLocker).to.equal(opdata.cvxLocker);
            expect(nOD.spendRatio).to.equal(opdata.spendRatio);
            expect(nOD.crvDeposit).to.equal(opdata.crvDeposit);
            expect(nOD.relock).to.equal(opdata.relock);
            expect(nOD.ccStaking).to.equal(opdata.ccStaking);

            await allocator.setRelock(true);

            const opdata2: OperationData = await allocator.opData();

            expect(opdata2.relock).to.be.true;
        });

        it("passing: registerDeposit() setAllocatorLimits() activate()", async () => {
            for (let i = 0; i < underlying.length; i++) {
                await extender.registerDeposit(allocator.address);
            }

            const nrNow: number = (await extender.getTotalAllocatorCount()).toNumber();

            expect(nrNow - 3).to.equal(nrBef);

            await extender.setAllocatorLimits(nrBef, {
                allocated: bne(10, 20),
                loss: bne(10, 19).div(2),
            });
            await extender.setAllocatorLimits(nrBef + 1, {
                allocated: bnn(0),
                loss: bne(10, 26),
            });
            await extender.setAllocatorLimits(nrBef + 2, { allocated: 0, loss: 0 });

            const limits: any[] = [
                await extender.getAllocatorLimits(nrBef),
                await extender.getAllocatorLimits(nrBef + 1),
                await extender.getAllocatorLimits(nrBef + 2),
            ];

            expect(limits[0].allocated).to.equal(bne(10, 20));
            expect(limits[1].loss).to.equal(bne(10, 26));
            expect(limits[2].loss.add(limits[2].allocated)).to.equal(0);

            await allocator.activate();
        });
    }

    async function afterEachInitializationProcedureTest(): Promise<void> {
        await helpers.revert(snapshotId);
    }

    // Now define a basic version so it can be repeatedly called.

    async function initialize(): Promise<void> {
        factory = factory.connect(guardian);
        allocator = await factory.deploy(OD, AID);
        allocator = allocator.connect(guardian);

        for (let i = 0; i < underlying.length; i++) {
            await extender.registerDeposit(allocator.address);
        }

        await extender.setAllocatorLimits(nrBef, {
            allocated: bne(10, 21),
            loss: bne(10, 19).div(2),
        });
        await extender.setAllocatorLimits(nrBef + 1, {
            allocated: bnn(0),
            loss: bne(10, 26),
        });
        await extender.setAllocatorLimits(nrBef + 2, { allocated: 0, loss: 0 });

        const limits: any[] = [
            await extender.getAllocatorLimits(nrBef),
            await extender.getAllocatorLimits(nrBef + 1),
            await extender.getAllocatorLimits(nrBef + 2),
        ];

        expect(limits[0].allocated).to.equal(bne(10, 21));
        expect(limits[1].loss).to.equal(bne(10, 26));
        expect(limits[2].loss.add(limits[2].allocated)).to.equal(0);

        await allocator.activate();

        await expect(() =>
            extender.requestFundsFromTreasury(nrBef, bne(10, 20))
        ).to.changeTokenBalance(underlying[0], allocator, bne(10, 20));
    }

    // Return out all deposit ids of the allocator in `TreasuryExtender`

    let depositIds: BigNumber[] = [];

    async function getDepositIds(): Promise<BigNumber[]> {
        return [bnn(nrBef), bnn(nrBef + 1), bnn(nrBef + 2)];
    }

    // And all other preparatory if they are necessary.

    async function beforeEachUtilityAndRewardsTest(): Promise<void> {
        const treasuryMan: SignerWithAddress = await helpers.impersonate(treasury.address);

        await helpers.addEth(treasury.address, bne(10, 25));

        await underlying[1]
            .connect(treasuryMan)
            .transfer(extender.address, await underlying[1].balanceOf(treasury.address));

        await underlying[2]
            .connect(treasuryMan)
            .transfer(extender.address, await underlying[2].balanceOf(treasury.address));
    }

    // UPDATE TESTS

    async function beforeEachUpdateTest(): Promise<void> {}

    // throw it blocks inside and use the naming optimally, it consists of
    // "passing:" and "revert:" and then specifiers after it

    function updateRevertingTests(): void {
        it("revert: should revert if non-guardian calls function", async () => {
            await expect(allocator.connect(owner).update(nrBef)).to.be.reverted;
        });
    }

    function updateGainTests(): void {
        it("passing: should be able to harvest properly with gain", async () => {
            let perf: any;

            await allocator.update(nrBef);
            perf = await extender.getAllocatorPerformance(nrBef);
            let ccGain = await allocator.amountAllocated(nrBef + 2);

            await helpers.tmine(24 * 3600 * 100);
            await allocator.update(nrBef);

            await LOCKER.checkpointEpoch();

            await helpers.tmine(24 * 3600 * 40);
            await allocator.update(nrBef);

            await LOCKER.checkpointEpoch();

            await helpers.tmine(24 * 3600 * 200);
            await allocator.update(nrBef);

            expect((await extender.getAllocatorPerformance(nrBef))[0]).to.be.gte(perf[0]);
            perf = await extender.getAllocatorPerformance(nrBef);

            expect(ccGain).to.be.lt(await allocator.amountAllocated(nrBef + 2));

            await helpers.tmine(24 * 3600 * 100);
            await LOCKER.checkpointEpoch();
            await allocator.update(nrBef);
            await helpers.tmine(24 * 3600 * 24);
            await allocator.update(nrBef);

            expect((await extender.getAllocatorPerformance(nrBef))[0]).to.be.gte(perf[0]);
        });
    }

    function updateLossTests(): void {
        it("passing: should be able to harvest properly with loss", async () => {
            const as: SignerWithAddress = await helpers.impersonate(allocator.address);
            let perf: any;
            let bal: BigNumber;

            await helpers.addEth(allocator.address, bne(10, 25));

            await allocator.update(nrBef);
            perf = await extender.getAllocatorPerformance(nrBef);

            await helpers.tmine(24 * 3600 * 24);
            await allocator.update(nrBef);
            await helpers.tmine(24 * 3600 * 104);
            await allocator.deallocate([1, 0]);

            bal = await utility[0].balanceOf(allocator.address);
            await utility[0].connect(as).transfer(treasury.address, bal.div(2));

            await allocator.update(nrBef);
            expect((await extender.getAllocatorPerformance(nrBef))[1]).to.be.gte(perf[1]);
            perf = await extender.getAllocatorPerformance(nrBef);

            await helpers.tmine(24 * 3600 * 24);
            await allocator.update(nrBef);
            await helpers.tmine(24 * 3600 * 104);
            await allocator.deallocate([1, 0]);

            bal = await utility[0].balanceOf(allocator.address);
            await utility[0].connect(as).transfer(treasury.address, bal.div(2));

            await allocator.update(nrBef);
            expect((await extender.getAllocatorPerformance(nrBef))[1]).to.be.gte(perf[1]);
        });
    }

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
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 104);

        return [bne(10, 20).div(2), bnn(0), bnn(0)];
    }

    // extender withdrawal, you need to deallocate before it

    async function beforeEachExtenderWithdrawalTest(): Promise<void> {
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 104);

        await allocator.deallocate([1, helpers.constants.uint256Max]);
    }

    // prepareMigration

    async function beforeEachPrepareMigrationTest(): Promise<void> {
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);
        await helpers.tmine(24 * 3600 * 104);
    }

    async function prepareMigrationRevertingTests(): Promise<void> {
        it("revert: should fail with wrong access ", async () => {
            await expect(allocator.connect(owner).prepareMigration()).to.be.reverted;
        });
    }

    async function prepareMigrationPassingTests(): Promise<void> {
        it("passing: should prepare migration", async () => {
            const bal1: BigNumber = await underlying[0].balanceOf(allocator.address);
            const bal2: BigNumber = await underlying[2].balanceOf(allocator.address);

            await allocator.prepareMigration();

            const bal3: BigNumber = await underlying[0].balanceOf(allocator.address);
            const bal4: BigNumber = await underlying[2].balanceOf(allocator.address);

            expect(bal3).to.be.gt(bal1);
            expect(bal4).to.be.gte(bal2);
        });
    }

    // migrate

    async function beforeEachMigrateTest(): Promise<void> {
        await allocator.update(nrBef);

        await helpers.tmine(24 * 3600 * 200);
        await allocator.update(nrBef);

        await helpers.tmine(24 * 3600 * 24);
        await allocator.update(nrBef);

        await helpers.tmine(24 * 3600 * 104);

        let fallocator: ALLOCATORT = await factory.deploy(OD, AID);
        fallocator = fallocator.connect(guardian);

        await extender.registerDeposit(fallocator.address);
        await extender.setAllocatorLimits(nrBef + 3, { allocated: bne(10, 21), loss: 0 });
        await fallocator.activate();

        await allocator.prepareMigration();
    }

    async function migrateRevertingTests(): Promise<void> {
        it("revert: should fail with wrong access ", async () => {
            await expect(allocator.connect(owner).migrate()).to.be.reverted;
            for (let i = nrBef; i < nrBef + 3; i++) {
                await expect(allocator.connect(owner).update(i)).to.be.reverted;
            }
        });
    }

    async function migratePassingTests(): Promise<void> {
        it("passing: should migrate", async () => {
            let balances: BigNumber[][] = [];

            for (let i = 0; i < 3; i++) {
                balances.push([
                    await underlying[i].balanceOf(allocator.address),
                    i < 2 ? await utility[i].balanceOf(allocator.address) : bnn(1),
                    i < 2 ? await reward[i].balanceOf(allocator.address) : bnn(1),
                ]);
            }

            await allocator.migrate();

            let arr: any[] = [underlying, utility, reward];

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(balances[i][j]).to.be.gte(
                        i < 2 || j == 0 ? await arr[i][j].balanceOf(allocator.address) : bnn(0)
                    );
                }
            }

            expect(balances[0][2]).to.be.gte(await arr[0][2].balanceOf(allocator.address));
        });
    }

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

    context("initialization procedure tests", () => {
        beforeEach(async () => {
            await beforeEachInitializationProcedureTest();
        });

        initializationProcedureTests();

        afterEach(async () => {
            await afterEachInitializationProcedureTest();
        });
    });

    // Now start all other tests.

    context("with initialization", () => {
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
