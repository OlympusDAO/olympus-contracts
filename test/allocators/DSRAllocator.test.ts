import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { config, ethers } from "hardhat";
import { DSRAllocator, DSRAllocator__factory, ERC20, OlympusAuthority, OlympusTreasury, TreasuryExtender } from "../../types";
import { dsrAbi } from "../utils/abi";
import { coins } from "../utils/coins";
import { helpers } from "../utils/helpers";
import { olympus } from "../utils/olympus";

const bne = helpers.bne;
const bnn = helpers.bnn;

describe("DSRAllocator", () => {
    // Signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // Contracts
    let treasury: OlympusTreasury;
    let extender: TreasuryExtender;
    let authority: OlympusAuthority;
    let allocator: DSRAllocator;
    let factory: DSRAllocator__factory;
    let dsr: any;

    // Tokens
    let dai: ERC20;

    // Network
    let url: string = config.networks.hardhat.forking!.url;
    let snapshotId: number = 0;

    before(async () => {
        await helpers.pinBlock(16176939, url);

        dai = await helpers.getCoin(coins.dai);

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

        dsr = await ethers.getContractAt(
            dsrAbi,
            "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7"
        );

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        factory = (await ethers.getContractFactory("DSRAllocator")) as DSRAllocator__factory;
        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [dai.address],
                extender: extender.address,
            },
            treasury.address
        );

        allocator = allocator.connect(guardian);
        extender = extender.connect(guardian);
        treasury = treasury.connect(guardian);

        await helpers.addEth(guardian.address, bne(100, 18));
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("Initialization", () => {
        it("should initialize proxy", async () => {
            const proxyAddress = await allocator.proxy();
            expect(proxyAddress).to.not.eq(ethers.constants.AddressZero);
        });

        it("should set DAI approval for proxy", async () => {
            const proxyAddress = await allocator.proxy();
            expect(await dai.allowance(allocator.address, proxyAddress)).to.eq(helpers.constants.uint256Max);
        });
    });

    describe("Updates correctly", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(11, bne(10, 23));
        });

        it("should deposit DAI to DSR", async () => {
            await expect(() => allocator.update(11)).to.changeTokenBalance(
                dai,
                allocator,
                bnn(0).sub(bne(10, 23))
            );

            const proxyAddress = await allocator.proxy();
            const pie = await dsr.pie(proxyAddress);
            const chi = await dsr.chi();

            // Make sure deposit is correct, 10^23 DAI but will have slight precision loss
            expect(BigNumber.from(pie).mul(chi).div("1000000000000000000000000000")).to.eq("999999999999999999999999");
        });
    });

    describe("Deallocates", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(11, bne(10, 23));

            await allocator.update(11);
        });

        it("Should withdraw DAI from DSR", async () => {
            const proxyAddress = await allocator.proxy();
            const pieBefore = await dsr.pie(proxyAddress);

            // We experience a slight loss of precision
            await expect(() => allocator.deallocate([bne(10, 23)])).to.changeTokenBalance(
                dai,
                allocator,
                "999999999999999999999999"
            );

            const pieAfter = await dsr.pie(proxyAddress);
            expect(pieBefore).to.be.gt(pieAfter);
        });
    });

    describe("Deactivates", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(11, bne(10, 23));

            await allocator.update(11);
        });

        it("Should withdraw to allocator", async () => {
            const daiBalBefore = await dai.balanceOf(allocator.address);
            await allocator.deactivate(false);
            const daiBalAfter = await dai.balanceOf(allocator.address);

            const proxyAddress = await allocator.proxy();
            expect(await dsr.pie(proxyAddress)).to.eq(0);
            expect(daiBalAfter).to.be.gt(daiBalBefore);
        });

        it("Should withdraw to treasury", async () => {
            const daiBalBefore = await dai.balanceOf(treasury.address);
            await allocator.deactivate(true);
            const daiBalAfter = await dai.balanceOf(treasury.address);

            const proxyAddress = await allocator.proxy();
            expect(await dsr.pie(proxyAddress)).to.eq(0);
            expect(daiBalAfter).to.be.gt(daiBalBefore);
        });
    });

    describe("Prepares for migration", () => {
        beforeEach(async () => {
            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(11, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await extender.requestFundsFromTreasury(11, bne(10, 23));

            await allocator.update(11);
        });

        it("Should withdraw to allocator", async () => {
            const daiBalBefore = await dai.balanceOf(allocator.address);
            await allocator.prepareMigration();
            const daiBalAfter = await dai.balanceOf(allocator.address);

            const proxyAddress = await allocator.proxy();
            expect(await dsr.pie(proxyAddress)).to.eq(0);
            expect(daiBalAfter).to.be.gt(daiBalBefore);
        });
    })
});
