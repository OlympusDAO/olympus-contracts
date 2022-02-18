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
    OlympusAuthority,
    MockERC20,
    AaveAllocatorV2,
    AaveAllocatorV2__factory,
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

describe("AaveAllocatorV2", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: AaveAllocatorV2;
    let factory: AaveAllocatorV2__factory;

    // tokens
    let frax: MockERC20;
    let dai: MockERC20;
    let weth: MockERC20;
    let afrax: MockERC20;
    let adai: MockERC20;
    let aweth: MockERC20;
    let usdc: MockERC20;
    let usdt: MockERC20;
    let tokens: MockERC20[];
    let utilTokens: MockERC20[];

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
        tokens = [frax, dai, weth];

	adai = await getCoin(coins.adai)
	afrax = await getCoin(coins.afrax)
	aweth = await getCoin(coins.aweth)

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

        factory = (await ethers.getContractFactory(
            "AaveAllocatorV2"
        )) as AaveAllocatorV2__factory;

        factory = factory.connect(guardian);

        allocator = await factory.deploy({
            authority: authority.address,
            tokens: [frax.address],
            extender: extender.address,
        });
    });

    beforeEach(async () => {
        snapshotId = await snapshot();
    });

    afterEach(async () => {
        await revert(snapshotId);
    });

    describe("initialization", () => {
        it("initial: should deploy single token allocator with correct info", async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address],
                extender: extender.address,
            });

            // not testing base allocator data because already tested
            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.pool()).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
            expect(await allocator.incentives()).to.equal(
                "0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5"
            );

	    expect(await allocator.referralCode()).to.equal(0)

            expect((await allocator.tokens())[0]).to.equal(frax.address);
	    expect(await frax.allowance(allocator.address, extender.address)).to.be.gt(0)

	    expect((await allocator.rewardTokens()).length).to.equal(0)
        });

	it("initial: should deploy multi token properly", async () => {
	    allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.pool()).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
            expect(await allocator.incentives()).to.equal(
                "0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5"
            );

	    expect(await allocator.referralCode()).to.equal(0)

            expect((await allocator.tokens())[0]).to.equal(frax.address);
            expect((await allocator.tokens())[1]).to.equal(dai.address);

	    expect(await frax.allowance(allocator.address, extender.address)).to.be.gt(0)
	    expect(await dai.allowance(allocator.address, extender.address)).to.be.gt(0)

	    expect((await allocator.rewardTokens()).length).to.equal(0)
	})

	it("passing: addAToken()", async () => {
	    allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

	    await allocator.addAToken(coins.afrax)
	    await allocator.addAToken(coins.adai)

	    const uTokens = await allocator.utilityTokens();

	    expect(uTokens[0]).to.equal(coins.afrax)
	    expect(uTokens[1]).to.equal(coins.adai)

	    expect(await adai.allowance(allocator.address, extender.address)).to.be.gt(0)
	    expect(await afrax.allowance(allocator.address, extender.address)).to.be.gt(0)
	})

	it("passing: setReferralCode()", async () => {
	    allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

	    await allocator.setReferralCode(5)

	    expect(await allocator.referralCode()).to.equal(5)
	})

	it("passing: addToken()", async () => {
	    allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

	    await allocator.addToken(coins.aweth)

	    const tokenz = await allocator.tokens()

	    expect(tokenz.length).to.equal(3)
	    expect(tokenz[2]).to.equal(coins.aweth)
	    expect(await aweth.allowance(allocator.address, extender.address)).to.be.gt(0)
	})

	it("passing: registerDeposit()", async () => {
	    allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address, weth.address],
                extender: extender.address,
            });

	    await allocator.addAToken(coins.afrax)
	    await allocator.addAToken(coins.adai)
	    await allocator.addAToken(coins.aweth)

	    await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
	    await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
	    await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;

	    const tokenIds = [await allocator.tokenIds(0), await allocator.tokenIds(1), await allocator.tokenIds(2)];
	})
    });
});
