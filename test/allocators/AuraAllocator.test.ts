import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    OlympusTreasury,
    TreasuryExtender,
    OlympusAuthority,
    ERC20,
    AuraAllocator,
    AuraAllocator__factory
} from "../../types";
import { auraBoosterABI, auraPoolABI, auraLockerABI } from "../utils/auraAllocatorAbis";
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;
const bnn = helpers.bnn;

describe("AuraAllocator", () => {
    /// Signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    /// Contracts
    let treasury: OlympusTreasury;
    let extender: TreasuryExtender;
    let authority: OlympusAuthority;
    let allocator: AuraAllocator;
    let factory: AuraAllocator__factory;
    let booster: any;
    let auraPool: any;
    let auraLocker: any;

    /// Tokens
    let bpt: ERC20;
    let aura: ERC20;
    let bal: ERC20;

    /// Network
    let url: string = config.networks.hardhat.forking!.url;

    let snapshotId: number = 0;

    before(async () => {
        await helpers.pinBlock(15539981, url);

        bpt = (await ethers.getContractAt("contracts/types/ERC20.sol:ERC20", "0xc45D42f801105e861e86658648e3678aD7aa70f9")) as ERC20;

        aura = await helpers.getCoin(coins.aura);
        bal = await helpers.getCoin(coins.bal);

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

        booster = await ethers.getContractAt(
            auraBoosterABI,
            "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"
        );

        auraPool = await ethers.getContractAt(
            auraPoolABI,
            "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3"
        );

        auraLocker = await ethers.getContractAt(
            auraLockerABI,
            "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC"
        );

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        factory = (await ethers.getContractFactory("AuraAllocator")) as AuraAllocator__factory;
        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [],
                extender: extender.address,
            },
            treasury.address
        );

        allocator = allocator.connect(guardian);
        extender = extender.connect(guardian);
        treasury = treasury.connect(governor);
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("Initialization", () => {
        it("should have max approval to lock aura", async () => {
            expect((await aura.allowance(allocator.address, auraLocker.address))).to.equal(helpers.constants.uint256Max);
        });

        it("should add deposit info", async () => {
            await allocator.addBPT(bpt.address, "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3", 30, [aura.address, bal.address]);
            expect((await bpt.allowance(allocator.address, extender.address))).to.equal(helpers.constants.uint256Max);
            expect((await bpt.allowance(allocator.address, "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"))).to.equal(helpers.constants.uint256Max);
            expect((await aura.allowance(allocator.address, extender.address))).to.equal(helpers.constants.uint256Max);
            expect((await bal.allowance(allocator.address, extender.address))).to.equal(helpers.constants.uint256Max);
        });
    });

    describe("Updates correctly", () => {
        beforeEach(async () => {
            await allocator.addBPT(bpt.address, "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3", 30, [aura.address, bal.address]);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(10, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(10, bne(10, 23));
        });

        it("should deposit BPT to Aura", async () => {
            await expect(() => allocator.update(10)).to.changeTokenBalance(
                bpt,
                allocator,
                bnn(0).sub(bne(10, 23))
            );
        });

        it("can lock Aura", async () => {
            /// Setup
            const auraHolder = await helpers.impersonate("0xe97b3791a03706c58f5c6bc3554213c3e6eb8550");
            await helpers.addEth("0xe97b3791a03706c58f5c6bc3554213c3e6eb8550", bne(10, 18));
            await aura.connect(auraHolder).transfer(allocator.address, bne(10, 21));
            await allocator.toggleShouldLock();

            await expect(() => allocator.update(10)).to.changeTokenBalance(
                aura,
                allocator,
                bnn(0).sub(bne(10, 21))
            );

            expect((await auraLocker.lockedBalances(allocator.address))[0]).to.equal(bne(10, 21));
        });

        it("should claim rewards", async () => {
            await expect(() => allocator.update(10)).to.changeTokenBalance(
                bpt,
                allocator,
                bnn(0).sub(bne(10, 23))
            );

            const balBalanceBefore = await bal.balanceOf(allocator.address);
            const auraBalanceBefore = await aura.balanceOf(allocator.address);

            await helpers.tmine(7 * 24 * 60 * 60);

            await allocator.update(10);
            expect((await bal.balanceOf(allocator.address))).to.be.gt(balBalanceBefore);
            expect((await aura.balanceOf(allocator.address))).to.be.gt(auraBalanceBefore);
        });
    });

    describe("Deallocates", () => {
        beforeEach(async () => {
            await allocator.addBPT(bpt.address, "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3", 30, [aura.address, bal.address]);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(10, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(10, bne(10, 23));

            await allocator.update(10);
        });

        it("Should withdraw BPT from Aura", async () => {
            await expect(() => allocator.deallocate([bne(10, 23)])).to.changeTokenBalance(
                bpt,
                allocator,
                bne(10, 23)
            );
        });
    });

    describe("Deactivates", () => {
        beforeEach(async () => {
            await allocator.addBPT(bpt.address, "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3", 30, [aura.address, bal.address]);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(10, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(10, bne(10, 23));

            await allocator.update(10);
        });

        it("Should withdraw to allocator", async () => {
            await expect(() => allocator.deactivate(false)).to.changeTokenBalance(
                bpt,
                allocator,
                bne(10, 23)
            );
            expect((await allocator.status())).to.equal(0);
        });

        it("Should withdraw to treasury", async () => {
            await expect(() => allocator.deactivate(true)).to.changeTokenBalance(
                bpt,
                treasury,
                bne(10, 23)
            );
            expect((await allocator.status())).to.equal(0);
        });
    });

    describe("Prepares for migration", () => {
        beforeEach(async () => {
            await allocator.addBPT(bpt.address, "0xF01e29461f1FCEdD82f5258Da006295E23b4Fab3", 30, [aura.address, bal.address]);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(10, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(10, bne(10, 23));

            await allocator.update(10);
        });

        it("Should withdraw to allocator", async () => {
            await expect(() => allocator.prepareMigration()).to.changeTokenBalance(
                bpt,
                allocator,
                bne(10, 23)
            );
            expect((await allocator.status())).to.equal(2);
        });
    });
});