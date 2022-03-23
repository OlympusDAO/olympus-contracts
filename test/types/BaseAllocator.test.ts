// libraries, functionality...
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { smock } from "@defi-wonderland/smock";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract } from "@defi-wonderland/smock";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    BaseAllocator,
    OlympusAuthority,
    ERC20,
    SimplestMockAllocator,
    SimplestMockAllocator__factory,
} from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;
const bnn = helpers.bnn;

describe("BaseAllocator", async () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: SimplestMockAllocator;

    // tokens
    let frax: ERC20;
    let usdc: ERC20;
    let dai: ERC20;
    let usdt: ERC20;
    let weth: ERC20;
    let tokens: ERC20[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;
    let localSnapId: number = 0;

    before(async () => {
        await helpers.pinBlock(14026252, url);

        frax = await helpers.getCoin(coins.frax);
        usdc = await helpers.getCoin(coins.usdc);
        dai = await helpers.getCoin(coins.dai);
        usdt = await helpers.getCoin(coins.usdt);
        weth = await helpers.getCoin(coins.weth);
        tokens = [frax, usdc, dai, usdt, weth];

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        const extenderFactory: TreasuryExtender__factory = (await ethers.getContractFactory(
            "TreasuryExtender"
        )) as TreasuryExtender__factory;

        extender = await extenderFactory.deploy(treasury.address, authority.address);

        owner = (await ethers.getSigners())[0];

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, helpers.constants.addressZero);
        treasury.enable(0, extender.address, helpers.constants.addressZero);

        let simplestFactory: SimplestMockAllocator__factory = (await ethers.getContractFactory(
            "SimplestMockAllocator"
        )) as SimplestMockAllocator__factory;

        simplestFactory = simplestFactory.connect(guardian);

        allocator = await simplestFactory.deploy({
            authority: authority.address,
            tokens: [frax.address],
            extender: extender.address,
        });
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    it("initial: proper contract config", async () => {
        expect((await allocator.ids()).length).to.equal(0);
        expect((await allocator.tokens())[0]).to.equal(frax.address);
        expect(await allocator.status()).to.equal(0);
        expect(await allocator.extender()).to.equal(extender.address);
        expect(await allocator.version()).to.equal("v2.0.0");
        expect((await allocator.rewardTokens())[0]).to.equal(dai.address);
        expect((await allocator.utilityTokens())[0]).to.equal(dai.address);
        expect(await allocator.amountAllocated(0)).to.equal(0);
    });

    describe("registerDeposit + setId", () => {
        it("revert: should revert if sender not expected", async () => {
            await expect(allocator.addId(2)).to.be.revertedWith(
                `BaseAllocator_OnlyExtender(\"${guardian.address}\")`
            );
        });

        it("passing: should register allocator", async () => {
            const snapId = await helpers.snapshot();
            await extender.registerDeposit(allocator.address);
            expect((await allocator.ids())[0]).to.equal(1);
            await helpers.revert(snapId);
        });
    });

    describe("activate", () => {
        it("revert: should revert if sender is not guardian or already activated", async () => {
            await expect(allocator.connect(owner).activate()).to.be.revertedWith("UNAUTHORIZED()");
        });

        it("passing: should activate allocator", async () => {
            await allocator.activate();
            expect(await allocator.status()).to.equal(1);
        });
    });

    describe("update", async () => {
        before(async () => {
            localSnapId = await helpers.snapshot();

            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 35),
                loss: bne(10, 35),
            });

            await allocator.activate();
        });

        beforeEach(async () => {
            await allocator.setGL(0, 0);
        });

        it("revert: should revert if sender is not guardian or if offline", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.revertedWith("UNAUTHORIZED()");

            await helpers.setStorage(allocator.address, bnn(4), bnn(0));

            expect(await allocator.status()).to.equal(0);

            await expect(allocator.update(1)).to.be.revertedWith(
                "BaseAllocator_AllocatorNotActivated()"
            );

            await helpers.setStorage(allocator.address, bnn(4), bnn(1));

            expect(await allocator.status()).to.equal(1);
        });

        it("passing: should do nothing if gain and loss zero", async () => {
            const response = await allocator.update(1);
            const receipt = await response.wait();
            expect(receipt.events!.length).to.equal(0);
        });

        it("passing: should report gain", async () => {
            await allocator.setGL(bne(10, 23), 0);

            const response = await allocator.update(1);
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(1);
            expect((await extender.getAllocatorPerformance(1))[0]).to.equal(bne(10, 23));
        });

        it("passing: should report loss, but no limit triggered", async () => {
            await allocator.setGL(0, bne(10, 21));

            // so we don't revert
            await extender.requestFundsFromTreasury(1, bne(10, 23));

            const response = await allocator.update(1);
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(1);

            expect((await extender.getAllocatorPerformance(1))[1]).to.equal(bne(10, 21));
            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 23).sub(bne(10, 21)));
        });

        it("passing: should report loss and trigger panic", async () => {
            await allocator.deactivate(false);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 35),
                loss: bne(10, 23).div(2),
            });

            await allocator.activate();

            await allocator.setGL(0, bne(10, 23).div(2));

            await extender.requestFundsFromTreasury(1, bne(10, 23));

            const response = await allocator.update(1);
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(3);
        });

        after(async () => {
            await helpers.revert(localSnapId);
        });
    });

    describe("prepareMigration + migrate", async () => {
        before(async () => {
            localSnapId = await helpers.snapshot();
            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 35),
                loss: bne(10, 35),
            });
            await allocator.activate();
        });

        it("revert: prepareMigration: guardian, migrating", async () => {
            await expect(allocator.connect(owner).prepareMigration()).to.be.revertedWith(
                "UNAUTHORIZED()"
            );
            await allocator.prepareMigration();
            await expect(allocator.prepareMigration()).to.be.revertedWith(
                "BaseAllocator_Migrating()"
            );
        });

        it("revert: migrate: guardian, not migrating", async () => {
            await expect(allocator.connect(owner).migrate()).to.be.revertedWith("UNAUTHORIZED()");
            await expect(allocator.migrate()).to.be.revertedWith("BaseAllocator_NotMigrating()");
        });

        it("passing: prepareMigration: should change contract status", async () => {
            await allocator.prepareMigration();
            expect(await allocator.status()).to.equal(2);
        });

        it("passing: migrate: should migrate funds", async () => {
            let fakeAllocator: FakeContract<BaseAllocator> = await smock.fake<BaseAllocator>(
                "BaseAllocator"
            );

            fakeAllocator.tokenIds.returns(0);
            fakeAllocator.tokens.returns([coins.frax]);

            await extender.registerDeposit(fakeAllocator.address);

            fakeAllocator.ids.returns([2]);
            fakeAllocator.status.returns(1);

            const treasuryWallet: SignerWithAddress = await helpers.impersonate(treasury.address);
            await helpers.addEth(treasuryWallet.address, bne(10, 23));

            await extender.requestFundsFromTreasury(1, bne(10, 23));
            await dai.connect(treasuryWallet).transfer(allocator.address, bne(10, 22));

            const amount1: BigNumber = bne(10, 23);
            const amount2: BigNumber = bne(10, 22);

            await allocator.prepareMigration();

            const response = await allocator.migrate();
            const receipt = await response.wait();

            const allocated = await extender.getAllocatorAllocated(1);

            expect(await frax.balanceOf(fakeAllocator.address)).to.equal(amount1);
            expect(await dai.balanceOf(fakeAllocator.address)).to.equal(amount2);
            expect(allocated).to.equal(0);
            expect(receipt.events!.length).to.equal(5);
        });

        after(async () => {
            await helpers.revert(localSnapId);
        });
    });
});

