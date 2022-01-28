// libraries, functionality...
import { ethers, waffle, network, config } from "hardhat";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber, BaseContract, ContractFactory, Contract } from "ethers";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract, MockContract, MockContractFactory } from "@defi-wonderland/smock";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    BaseAllocator,
    OlympusAuthority,
    MockERC20,
    SimplestMockAllocator,
    SimplestMockAllocator__factory,
} from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import {
    impersonate,
    snapshot,
    revert,
    getCoin,
    bne,
    bnn,
    pinBlock,
    addressZero,
    setStorage,
    addEth,
} from "../utils/scripts";

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
    let frax: MockERC20;
    let usdc: MockERC20;
    let dai: MockERC20;
    let usdt: MockERC20;
    let weth: MockERC20;
    let tokens: MockERC20[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;
    let localSnapId: number = 0;

    before(async () => {
        await pinBlock(14026252, url);

        frax = await getCoin(coins.frax);
        usdc = await getCoin(coins.usdc);
        dai = await getCoin(coins.dai);
        usdt = await getCoin(coins.usdt);
        weth = await getCoin(coins.weth);
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

        guardian = await impersonate(await authority.guardian());
        governor = await impersonate(await authority.governor());

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, addressZero);
        treasury.enable(0, extender.address, addressZero);

        let simplestFactory: SimplestMockAllocator__factory = (await ethers.getContractFactory(
            "SimplestMockAllocator"
        )) as SimplestMockAllocator__factory;

        simplestFactory = simplestFactory.connect(guardian);

        allocator = await simplestFactory.deploy({
            authority: authority.address,
            token: frax.address,
            extender: extender.address,
        });
    });

    beforeEach(async () => {
        snapshotId = await snapshot();
    });

    afterEach(async () => {
        await revert(snapshotId);
    });

    it("initial: proper contract config", async () => {
        expect(await allocator.id()).to.equal(0);
        expect(await allocator.getToken()).to.equal(frax.address);
        expect(await allocator.status()).to.equal(0);
        expect(await allocator.extender()).to.equal(extender.address);
        expect(await allocator.version()).to.equal("v2.0.0");
        expect((await allocator.rewardTokens())[0]).to.equal(dai.address);
        expect((await allocator.utilityTokens())[0]).to.equal(dai.address);
        expect(await allocator.estimateTotalAllocated()).to.equal(0);
    });

    describe("registerAllocator + setId", () => {
        it("revert: should revert if sender not expected", async () => {
            await expect(allocator.setId(2)).to.be.revertedWith(
                `BaseAllocator_OnlyExtender(\"${guardian.address}\")`
            );
        });

        it("passing: should register allocator", async () => {
            const snapId = await snapshot();
            await extender.registerAllocator(allocator.address);
            expect(await allocator.id()).to.equal(1);
            await revert(snapId);
        });
    });

    describe("activate", () => {
        it("revert: should revert if sender is not guardian or already activated", async () => {
            await expect(allocator.connect(owner).activate()).to.be.revertedWith("UNAUTHORIZED()");

            await setStorage(allocator.address, bnn(2), bnn(1));

            await expect(allocator.activate()).to.be.revertedWith(
                "BaseAllocator_AllocatorActivated()"
            );

            await setStorage(allocator.address, bnn(2), bnn(0));
        });

        it("passing: should activate allocator", async () => {
            await allocator.activate();
            expect(await allocator.status()).to.equal(1);
        });
    });

    describe("update", async () => {
        before(async () => {
            localSnapId = await snapshot();

            await extender.registerAllocator(allocator.address);
            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                allocated: bne(10, 35),
                loss: bne(10, 35),
            });
            await allocator.activate();
        });

        beforeEach(async () => {
            await allocator.setGL(0, 0);
        });

        it("revert: should revert if sender is not guardian or if offline", async () => {
            await expect(allocator.connect(owner).update()).to.be.revertedWith("UNAUTHORIZED()");

            await setStorage(allocator.address, bnn(2), bnn(0));

            expect(await allocator.status()).to.equal(0);

            await expect(allocator.update()).to.be.revertedWith("BaseAllocator_AllocatorOffline()");

            await setStorage(allocator.address, bnn(2), bnn(1));

            expect(await allocator.status()).to.equal(1);
        });

        it("passing: should do nothing if gain and loss zero", async () => {
            const response = await allocator.update();
            const receipt = await response.wait();
            expect(receipt.events!.length).to.equal(0);
        });

        it("passing: should report gain", async () => {
            await allocator.setGL(bne(10, 23), 0);

            const response = await allocator.update();
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(1);
            expect((await extender.getAllocatorPerformance(1))[0]).to.equal(bne(10, 23));
        });

        it("passing: should report loss, but no limit triggered", async () => {
            await allocator.setGL(0, bne(10, 21));

            // so we don't revert
            await extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 23));

            const response = await allocator.update();
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(1);

            expect((await extender.getAllocatorPerformance(1))[1]).to.equal(bne(10, 21));
            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 23).sub(bne(10, 21)));
            expect(await extender.getTotalValueAllocated()).to.equal(
                await treasury.tokenValue(coins.frax, bne(10, 23).sub(bne(10, 21)))
            );
        });

        it("passing: should report loss and trigger panic", async () => {
            await allocator.deactivate(false);
            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                allocated: bne(10, 35),
                loss: bne(10, 23).div(2),
            });
            await allocator.activate();

            await allocator.setGL(0, bne(10, 23).div(2));
            await extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 23));

            const response = await allocator.update();
            const receipt = await response.wait();

            expect(receipt.events!.length).to.equal(3);
        });

        after(async () => {
            await revert(localSnapId);
        });
    });

    describe("prepareMigration + migrate", async () => {
        before(async () => {
            localSnapId = await snapshot();
            await extender.registerAllocator(allocator.address);
            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
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
            await expect(allocator.connect(owner).migrate(owner.address)).to.be.revertedWith(
                "UNAUTHORIZED()"
            );
            await expect(allocator.migrate(owner.address)).to.be.revertedWith(
                "BaseAllocator_NotMigrating()"
            );
        });

        it("passing: prepareMigration: should change contract status", async () => {
            await allocator.prepareMigration();
            expect(await allocator.status()).to.equal(2);
        });

        it("passing: migrate: should migrate funds", async () => {
            let fakeAllocator: FakeContract<BaseAllocator> = await smock.fake<BaseAllocator>(
                "BaseAllocator"
            );
            fakeAllocator.id.returns(2);

            const treasuryWallet: SignerWithAddress = await impersonate(treasury.address);
            await addEth(treasuryWallet.address, bne(10, 23));

            await extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 23));
            await dai.connect(treasuryWallet).transfer(allocator.address, bne(10, 22));

            const amount1: BigNumber = bne(10, 23);
            const amount2: BigNumber = bne(10, 22);

            await allocator.prepareMigration();

            const response = await allocator.migrate(fakeAllocator.address);
            const receipt = await response.wait();

            const allocated = await extender.getAllocatorAllocated(1);

            expect(await frax.balanceOf(fakeAllocator.address)).to.equal(amount1);
            expect(await dai.balanceOf(fakeAllocator.address)).to.equal(amount2);
            expect(allocated).to.equal(0);
            expect(receipt.events!.length).to.equal(5);
        });

        after(async () => {
            await revert(localSnapId);
        });
    });
});
