import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { config, ethers } from "hardhat";
import { AuraAllocatorV2, AuraAllocatorV2__factory, ERC20, OlympusAuthority, OlympusTreasury, TreasuryExtender } from "../../types";
import { auraBalStakingABI } from "../utils/abi";
import { auraLockerABI } from "../utils/auraAllocatorAbis";
import { coins } from "../utils/coins";
import { helpers } from "../utils/helpers";
import { olympus } from "../utils/olympus";

const bne = helpers.bne;
const bnn = helpers.bnn;

describe("AuraAllocatorV2", () => {
    // Signers
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // Contracts
    let treasury: OlympusTreasury;
    let extender: TreasuryExtender;
    let authority: OlympusAuthority;
    let allocator: AuraAllocatorV2;
    let factory: AuraAllocatorV2__factory;
    let auraLocker: any;
    let auraBalStaking: any;

    // Tokens
    let aura: ERC20;
    let auraBal: ERC20;
    let bal: ERC20;
    let bbAUsd: ERC20;

    // Network
    let url: string = config.networks.hardhat.forking!.url;
    let snapshotId: number = 0;

    before(async () => {
        await helpers.pinBlock(16436744, url);

        // Get tokens
        aura = await helpers.getCoin(coins.aura);
        auraBal = await helpers.getCoin(coins.auraBal);
        bal = await helpers.getCoin(coins.bal);
        bbAUsd = await helpers.getCoin(coins.bbAUsd);

        // Get deployed contracts
        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        extender = (await ethers.getContractAt(
            "TreasuryExtender",
            olympus.extender
        )) as TreasuryExtender;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        auraLocker = await ethers.getContractAt(
            auraLockerABI,
            "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC"
        );

        auraBalStaking = await ethers.getContractAt(
            auraBalStakingABI,
            "0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2"
        );

        // Get signers
        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        // Deploy allocator
        factory = (await ethers.getContractFactory("AuraAllocatorV2")) as AuraAllocatorV2__factory;
        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [aura.address],
                extender: extender.address,
            },
            treasury.address,
            aura.address,
            auraBal.address,
            auraLocker.address,
            auraBalStaking.address
        );

        // Connect contracts to signers
        allocator = allocator.connect(guardian);
        extender = extender.connect(guardian);
        treasury = treasury.connect(governor);

        // Transfer AURA from governor to treasury
        await aura.connect(governor).transfer(treasury.address, bne(10, 22));

        // Add BAL and bb-a-USD as reward tokens
        await allocator.addRewardToken(bal.address);
        await allocator.addRewardToken(bbAUsd.address);
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("Initialization", () => {
        it("should have max approval to lock Aura to vlAura", async () => {
            expect(await aura.allowance(allocator.address, auraLocker.address)).to.equal(
                helpers.constants.uint256Max
            );
        });

        it("should have max approval to stake auraBal into Aura Bal Staking contract", async () => {
            expect(await auraBal.allowance(allocator.address, auraBalStaking.address)).to.equal(
                helpers.constants.uint256Max
            );
        });

        it("should have max approval for the extender to take auraBal", async () => {
            expect(await auraBal.allowance(allocator.address, extender.address)).to.equal(
                helpers.constants.uint256Max
            );
        });

        it("should have Aura tracked in the tokens array", async () => {
            expect((await allocator.tokens())[0]).to.equal(aura.address);
        });
    });

    describe("Updates correctly", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));
        });

        it("should lock AURA in vlAura", async () => {
            const auraLockerBalanceBefore = await aura.balanceOf(auraLocker.address);

            await expect(() => allocator.update(11)).to.changeTokenBalance(
                aura,
                allocator,
                bnn(0).sub(bne(10, 22))
            );

            const auraLockerBalanceAfter = await aura.balanceOf(auraLocker.address);
            expect(auraLockerBalanceAfter.sub(auraLockerBalanceBefore)).to.equal(bne(10, 22));
        });

        it("should claim auraBal rewards", async () => {
            await allocator.update(11);

            const auraBalStakingBalanceBefore = await auraBal.balanceOf(auraBalStaking.address);
            const allocatorStakedBalanceBefore = await auraBalStaking.balanceOf(allocator.address);

            await helpers.tmine(30 * 24 * 60 * 60); // 30 days

            await allocator.update(11);
            expect(await auraBal.balanceOf(auraBalStaking.address)).to.be.gt(auraBalStakingBalanceBefore);
            expect(await auraBalStaking.balanceOf(allocator.address)).to.be.gt(allocatorStakedBalanceBefore);
        });
    });

    describe("Deallocates", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));

            await allocator.update(11);
        });

        it("Should withdraw expired Aura from vlAura", async () => {
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days
            
            const auraBalanceBefore = await aura.balanceOf(allocator.address);

            await allocator.deallocate([bne(10, 22), 0]);

            const auraBalanceAfter = await aura.balanceOf(allocator.address);

            expect(auraBalanceAfter.sub(auraBalanceBefore)).to.equal(bne(10, 22));
        });

        it("Should withdraw auraBal from auraBal staking", async () => {
            // Stake auraBal
            await helpers.tmine(30 * 24 * 60 * 60); // 30 days
            await allocator.update(11);

            const stakedAuraBalBefore = await auraBalStaking.balanceOf(allocator.address);

            await allocator.deallocate([0, stakedAuraBalBefore]);

            const stakedAuraBalAfter = await auraBalStaking.balanceOf(allocator.address);

            expect(stakedAuraBalBefore).to.be.gt(stakedAuraBalAfter);
            expect(stakedAuraBalAfter).to.equal(0);
            expect(await auraBal.balanceOf(allocator.address)).to.eq(stakedAuraBalBefore);
        });
    });

    describe("Deactivates", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));

            await allocator.update(11);
        });

        it("Should withdraw expired Aura from vlAura to allocator", async () => {
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days
            
            const auraBalanceBefore = await aura.balanceOf(allocator.address);

            await allocator.deactivate(false);

            const auraBalanceAfter = await aura.balanceOf(allocator.address);

            expect(auraBalanceAfter.sub(auraBalanceBefore)).to.equal(bne(10, 22));
        });

        it("Should withdraw staked auraBal to allocator", async () => {
            // Stake auraBal
            await helpers.tmine(30 * 24 * 60 * 60); // 30 days
            await allocator.update(11);

            const stakedAuraBalBefore = await auraBalStaking.balanceOf(allocator.address);

            await allocator.deactivate(false);

            const stakedAuraBalAfter = await auraBalStaking.balanceOf(allocator.address);

            expect(stakedAuraBalBefore).to.be.gt(stakedAuraBalAfter);
            expect(stakedAuraBalAfter).to.equal(0);
            expect(await auraBal.balanceOf(allocator.address)).to.eq(stakedAuraBalBefore);
        });

        it("Should withdraw expired Aura from vlAura to treasury", async () => {
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days
            
            const auraBalanceBefore = await aura.balanceOf(treasury.address);

            await allocator.deactivate(true);

            const auraBalanceAfter = await aura.balanceOf(treasury.address);

            expect(auraBalanceAfter.sub(auraBalanceBefore)).to.equal(bne(10, 22));
        });

        it("Should withdraw staked auraBal to treasury", async () => {
            // Stake auraBal
            await helpers.tmine(30 * 24 * 60 * 60); // 30 days
            await allocator.update(11);

            const stakedAuraBalBefore = await auraBalStaking.balanceOf(allocator.address);

            await allocator.deactivate(true);

            const stakedAuraBalAfter = await auraBalStaking.balanceOf(allocator.address);

            expect(stakedAuraBalBefore).to.be.gt(stakedAuraBalAfter);
            expect(stakedAuraBalAfter).to.equal(0);
            expect(await auraBal.balanceOf(treasury.address)).to.eq(stakedAuraBalBefore);
        });

        it("Should set status to inactive", async () => {
            await allocator.deactivate(false);

            expect(await allocator.status()).to.equal(0);
        });
    });

    describe("Prepares for migration", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));

            await allocator.update(11);
        });

        it("Should withdraw expired Aura from vlAura to allocator", async () => {
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days
            
            const auraBalanceBefore = await aura.balanceOf(allocator.address);

            await allocator.prepareMigration();

            const auraBalanceAfter = await aura.balanceOf(allocator.address);

            expect(auraBalanceAfter.sub(auraBalanceBefore)).to.equal(bne(10, 22));
        });

        it("Should withdraw staked auraBal to allocator", async () => {
            // Stake auraBal
            await helpers.tmine(30 * 24 * 60 * 60); // 30 days
            await allocator.update(11);

            // Make locks expire
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days

            const stakedAuraBalBefore = await auraBalStaking.balanceOf(allocator.address);

            await allocator.prepareMigration();

            const stakedAuraBalAfter = await auraBalStaking.balanceOf(allocator.address);

            expect(stakedAuraBalBefore).to.be.gt(stakedAuraBalAfter);
            expect(stakedAuraBalAfter).to.equal(0);
            expect(await auraBal.balanceOf(allocator.address)).to.eq(stakedAuraBalBefore);
        });

        it("Should set status to inactive", async () => {
            // Make locks expire
            await helpers.tmine(120 * 24 * 60 * 60); // 120 days

            await allocator.prepareMigration();

            expect(await allocator.status()).to.equal(2);
        });
    });

    describe("Reports Aura allocated", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));

            await allocator.update(11);
        });

        it("Should report allocated Aura", async () => {
            expect(await allocator.amountAllocated(11)).to.eq(bne(10, 22));
        });
    });

    describe("Delegates voting power", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 22),
                loss: bne(10, 21),
            });

            await allocator.activate();
            await allocator.setShouldLock(true);

            await extender.requestFundsFromTreasury(11, bne(10, 22));

            await allocator.update(11);
        });

        it("Should delegate voting power to DAO MS", async () => {
            await allocator.delegate("0x245cc372c84b3645bf0ffe6538620b04a217988b");
            expect(await auraLocker.delegates(allocator.address)).to.eq("0x245cc372C84B3645Bf0Ffe6538620B04a217988B");
        });
    });

    describe("Toggle lock", () => {
        it("Should toggle lock", async () => {
            await allocator.setShouldLock(true);
            expect(await allocator.shouldLock()).to.be.true;

            await allocator.setShouldLock(false);
            expect(await allocator.shouldLock()).to.be.false;
        });
    });
});
