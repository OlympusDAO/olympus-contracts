import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, util } from "chai";
import { BigNumber } from "ethers";
import { config, ethers } from "hardhat";
import {
    ERC20,
    ISwapRouter,
    LidoAllocator,
    LidoAllocator__factory,
    OlympusAuthority,
    OlympusTreasury,
    TreasuryExtender,
} from "../../types";
import { coins } from "../utils/coins";
import { helpers } from "../utils/helpers";
import { olympus } from "../utils/olympus";

const bne = helpers.bne;

describe("LidoAllocator", () => {
    // Signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // Contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: LidoAllocator;
    let factory: LidoAllocator__factory;
    let swapRouter: string;

    // Tokens
    let stETH: ERC20;
    let wstETH: string;
    let WETH: ERC20;
    let tokens: ERC20[];
    let utilTokens: ERC20[];

    // Network
    let url: string = config.networks.hardhat.forking!.url;

    // Variables
    let snapshotId: number = 0;
    let minRatio: number = 900;

    const amount: BigNumber = bne(10, 20);

    before(async () => {
        await helpers.pinBlock(14635126, url);

        WETH = await helpers.getCoin(coins.weth);
        tokens = [WETH];

        stETH = await helpers.getCoin(coins.steth);
        wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
        utilTokens = [stETH];

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

        swapRouter = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

        owner = (await ethers.getSigners())[0];

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        factory = (await ethers.getContractFactory("LidoAllocator")) as LidoAllocator__factory;
        factory = factory.connect(guardian);
        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [WETH.address],
                extender: extender.address,
            },
            olympus.treasury,
            swapRouter,
            stETH.address,
            wstETH,
            minRatio
        );
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("initialization", () => {
        it("should deploy single token allocator with correct info", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.swapRouter()).to.equal(swapRouter);
            expect(await allocator.lido()).to.equal(stETH.address);
            expect(await allocator.minETHstETHRatio()).to.equal(minRatio);
        });

        it("should fail if an address is set to zero", async () => {
            await expect(
                factory.deploy(
                    {
                        authority: authority.address,
                        tokens: [WETH.address],
                        extender: extender.address,
                    },
                    helpers.constants.addressZero,
                    swapRouter,
                    stETH.address,
                    wstETH,
                    minRatio
                )
            ).to.be.revertedWith("LidoAllocator_InvalidAddress()");
        });

        it("should fail if minimum ratio is greater than 1000", async () => {
            await expect(
                factory.deploy(
                    {
                        authority: authority.address,
                        tokens: [WETH.address],
                        extender: extender.address,
                    },
                    olympus.treasury,
                    swapRouter,
                    stETH.address,
                    wstETH,
                    1010
                )
            ).to.be.revertedWith("LidoAllocator_RatioTooLarge()");
        });

        it("should registerDeposit()", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("updates correctly", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(9, {
                allocated: bne(10, 23),
                loss: bne(10, 16),
            });

            await allocator.activate();

            await expect(() => extender.requestFundsFromTreasury(9, amount)).to.changeTokenBalance(
                WETH,
                allocator,
                amount
            );
        });

        it("should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(9)).to.be.reverted;
        });

        it("should allocate WETH to stETH", async () => {
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("0");
            await expect(() => allocator.update(9)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            // Conversion to stETH shares loses some precision
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                "999999999999999999999"
            );
            expect(await extender.getAllocatorAllocated(9)).to.equal("999999999999999999999");
        });

        it("should deposit more", async () => {
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("0");
            await expect(() => allocator.update(9)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            // Conversion to stETH shares loses some precision
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                "999999999999999999999"
            );
            expect(await extender.getAllocatorAllocated(9)).to.equal("999999999999999999999");

            await expect(() => extender.requestFundsFromTreasury(9, amount)).to.changeTokenBalance(
                WETH,
                allocator,
                amount
            );

            const balance: BigNumber = await utilTokens[0].balanceOf(allocator.address);
            await expect(() => allocator.update(9)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await utilTokens[0].balanceOf(allocator.address)).to.gt(balance);
            expect(await extender.getAllocatorAllocated(9)).to.equal(
                BigNumber.from("999999999999999999999").mul("2")
            );
        });

        context("with deposits", () => {
            beforeEach(async () => {
                await allocator.update(9);
            });

            // Not sure how to test this without somehow mocking Beacon chain...
            /*
            it("should gain over time", async () => {
                const balanceBefore = await utilTokens[0].balanceOf(allocator.address);
    
                await helpers.tmine(86400);
                await allocator.update(9);
    
                const balanceAfter = await utilTokens[0].balanceOf(allocator.address);
                
                expect(balanceAfter).to.be.gt(balanceBefore);
                expect(await allocator.amountAllocated(9)).to.equal(balanceAfter);
            });
            */

            it("should panic return in case of loss above limit", async () => {
                const impersonatedAllocator: SignerWithAddress = await helpers.impersonate(
                    allocator.address
                );

                const tempcoin: ERC20 = utilTokens[0].connect(impersonatedAllocator);
                await helpers.addEth(allocator.address, bne(10, 18));

                await tempcoin.transfer(owner.address, bne(10, 20).sub(10));

                await allocator.update(9);

                expect(await allocator.status()).to.equal(0);

                expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("1");
                expect(await tokens[0].balanceOf(allocator.address)).to.equal("0");
            });
        });
    });

    describe("deallocate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(9, {
                allocated: bne(10, 23),
                loss: bne(10, 16),
            });

            await allocator.activate();

            await expect(() => extender.requestFundsFromTreasury(9, amount)).to.changeTokenBalance(
                WETH,
                allocator,
                amount
            );

            await allocator.update(9);
        });

        it("should fail if sender is not guardian", async () => {
            await expect(allocator.connect(owner).deallocate([amount])).to.be.reverted;
        });

        it("should swap stETH to WETH", async () => {
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                "999999999999999999999"
            );
            expect(await WETH.balanceOf(allocator.address)).to.equal("0");

            await allocator.deallocate([amount]);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("0");
            // we lose some precision. probably because we have to convert stETH to wstETH,
            // then swap it with some level of slippage
            expect(await WETH.balanceOf(allocator.address)).to.equal("999256977472297504388");
        });
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            await extender.registerDeposit(allocator.address);
            await extender.setAllocatorLimits(9, {
                allocated: bne(10, 23),
                loss: bne(10, 16),
            });

            await allocator.activate();

            await expect(() => extender.requestFundsFromTreasury(9, amount)).to.changeTokenBalance(
                WETH,
                allocator,
                amount
            );

            await allocator.update(9);

            const mAllocator: LidoAllocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [WETH.address],
                    extender: extender.address,
                },
                olympus.treasury,
                swapRouter,
                stETH.address,
                wstETH,
                minRatio
            );

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(10, {
                allocated: bne(10, 23),
                loss: bne(10, 16),
            });

            await mAllocator.activate();
        });

        it("should successfully migrate", async () => {
            await allocator.prepareMigration();

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                "999999999999999999999"
            );
            expect(await WETH.balanceOf(allocator.address)).to.equal("0");
            expect(await allocator.status()).to.equal(2);

            await allocator.migrate();

            const mAddress: string = await extender.allocators(10);

            expect(await utilTokens[0].balanceOf(mAddress)).to.equal("999999999999999999998");
            expect(await WETH.balanceOf(mAddress)).to.equal("0");
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("1");
            expect(await WETH.balanceOf(allocator.address)).to.equal("0");

            expect(await allocator.status()).to.equal(0);
        });
    });
});
