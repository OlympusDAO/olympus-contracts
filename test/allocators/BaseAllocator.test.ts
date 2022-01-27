// libraries, functionality...
import { ethers, waffle, network, config } from "hardhat";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber, BaseContract } from "ethers";

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
    let allocator: MockContract<SimplestMockAllocator>;

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
    let start: number = 0;

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

        let simplestFactory: MockContractFactory<SimplestMockAllocator__factory> = await smock.mock(
            "SimplestMockAllocator"
        );

        simplestFactory = simplestFactory.connect(guardian);

        allocator = await simplestFactory.deploy({
            authority: authority.address,
            token: frax.address,
            extender: extender.address,
        });

        // now set up allocator functions up

        allocator.rewardTokens.returns([dai.address]);
        allocator.utilityTokens.returns([dai.address]);
        allocator.name.returns("SimpleFraxAllocator");
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

    let snapshotId: number = 0;

    describe("activate", () => {
        before(async () => {
            snapshotId = await snapshot();

            await extender.registerAllocator(allocator.address);
            //           await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
            //               allocated: bne(10, 22),
            //               loss: bne(10, 21),
            //           });
        });

        it("revert: should revert if sender is not guardian or already activated", async () => {
            // revertedWith doesn't work so need hacky solution

            try {
                await allocator.connect(owner).activate();
                expect(false).to.be.true;
            } catch (e: any) {}

            await setStorage(allocator.address, bnn(2), bnn(1));

            try {
                await allocator.activate();
                expect(false).to.be.true;
            } catch (e: any) {}

            await setStorage(allocator.address, bnn(2), bnn(0));
        });

        it("passing: should activate allocator", async () => {
            await allocator.activate();
            expect(await allocator.status()).to.equal(1);
        });

        after(async () => {
            await revert(snapshotId);
        });
    });

    describe("update", async () => {
        before(async () => {
            snapshotId = await snapshot();
            await extender.registerAllocator(allocator.address);
            await allocator.activate();
        });

        beforeEach(async () => {
            await allocator.setGL(0, 0);
        });

        it("revert: should revert if sender is not guardian or if offline", async () => {
            try {
                await allocator.connect(owner).update();
                expect(false).to.be.true;
            } catch (e: any) {}

            await setStorage(allocator.address, bnn(2), bnn(0));

            try {
                await allocator.update();
                expect(false).to.be.true;
            } catch (e: any) {}

            await setStorage(allocator.address, bnn(2), bnn(1));
        });

        after(async () => {
            await revert(snapshotId);
        });
    });
});
