import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    OlympusAuthority,
    MockERC20,
    LobiAllocator,
    LobiAllocator__factory,
} from "../../types";

import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;

describe("LobiAllocator", () => {
    //signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: LobiAllocator;
    let factory: LobiAllocator__factory;

    // tokens
    let lobi: MockERC20;
    let sLobi: MockERC20;

    let tokens: MockERC20[];
    let utilTokens: MockERC20[];

    // network
    const url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId = 0;

    const triggerRebase = async () => {
        await helpers.tmine(28800);
        await allocator.callRebase();
    };

    before(async () => {
        await helpers.pinBlock(14367489, url);

        lobi = await helpers.getCoin(coins.lobi);
        tokens = [lobi];

        sLobi = await helpers.getCoin(coins.slobi);
        utilTokens = [sLobi];

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

        const lobiWhale: SignerWithAddress = await helpers.impersonate(
            "0xc53bf13F351E2B43eaeB5B3cD03aF28F6ACABaEb"
        );
        await helpers.addEth(lobiWhale.address, bne(10, 23));
        await lobi.connect(lobiWhale).approve(treasury.address, "1000000000000000000000");

        treasury = treasury.connect(governor);
        // queue and toggle lobi whale as reserve depositor
        await treasury.enable("0", lobiWhale.address, helpers.constants.addressZero);
        // queue and toggle lobi whale as liquidity depositor
        await treasury.enable("4", lobiWhale.address, helpers.constants.addressZero);
        // queue and toggle LOBI as reserve token
        await treasury.enable("2", lobi.address, helpers.constants.addressZero);

        await treasury.connect(lobiWhale).deposit("1000000000000", lobi.address, "0");

        treasury.enable(3, extender.address, helpers.constants.addressZero);
        treasury.enable(0, extender.address, helpers.constants.addressZero);

        factory = (await ethers.getContractFactory("LobiAllocator")) as LobiAllocator__factory;
        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [lobi.address],
                extender: extender.address,
            },
            treasury.address,
            sLobi.address,
            "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
            "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
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
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.sLobi()).to.equal(sLobi.address);
            expect(await allocator.staking()).to.equal(
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90"
            );
            expect(await allocator.stakingHelper()).to.equal(
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );
            expect((await allocator.tokens())[0]).to.equal(lobi.address);
        });

        it("should register deposit", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("update()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(10, 8),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 9);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                lobi,
                allocator,
                amount
            );
        });

        it("should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.reverted;
        });

        it("should revert if not second token", async () => {
            await expect(extender.registerDeposit(allocator.address)).to.be.reverted;
        });

        it("should update", async () => {
            const amount: BigNumber = bne(10, 9);

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await sLobi.balanceOf(allocator.address)).to.equal(amount);
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
        });

        it("should deposit more", async () => {
            const amount: BigNumber = bne(10, 9);

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await utilTokens[0].balanceOf(allocator.address)).to.be.gt("0");
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                lobi,
                allocator,
                amount
            );

            const balance: BigNumber = await utilTokens[0].balanceOf(allocator.address);
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await utilTokens[0].balanceOf(allocator.address)).to.be.gt(balance);
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount.mul("2"));
        });

        context("with deposits", () => {
            beforeEach(async () => {
                const amount: BigNumber = bne(10, 9);

                await allocator.update(1);
            });

            it("should gain over time", async () => {
                const bal = await lobi.balanceOf(allocator.address);

                const balance = await utilTokens[0].balanceOf(allocator.address);

                for (let i = 0; i < 1000; i++) {
                    await triggerRebase();
                }

                const balanceAfter = await utilTokens[0].balanceOf(allocator.address);

                // should really be .gt but Lobi rewards are shut off right now
                expect(balanceAfter).to.be.gte(balance);
                expect(await allocator.amountAllocated(1)).to.equal(balanceAfter);
            });

            it("should report gain on increase", async () => {
                await triggerRebase();
                await triggerRebase();

                await allocator.update(1);
                expect(
                    (await extender.getAllocatorAllocated(1)).add(
                        (await extender.getAllocatorPerformance(1))[0]
                    )
                ).to.equal(await utilTokens[0].balanceOf(allocator.address));
            });

            it("should cause panic return in case of loss above limit", async () => {
                await helpers.tmine(24 * 60 * 60 * 10);

                const wallocator: SignerWithAddress = await helpers.impersonate(allocator.address);

                const tempcoin: MockERC20 = utilTokens[0].connect(wallocator);
                await helpers.addEth(allocator.address, bne(10, 23));

                await tempcoin.transfer(
                    owner.address,
                    (await tempcoin.balanceOf(allocator.address)).mul("19").div("20")
                );

                await allocator.update(1);

                expect(await allocator.status()).to.equal(0);

                expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("0");
                expect(await tokens[0].balanceOf(allocator.address)).to.equal("0");
            });
        });
    });

    describe("deallocate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(10, 8),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 9);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                lobi,
                allocator,
                amount
            );

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                lobi,
                allocator,
                BigNumber.from(0).sub(amount)
            );
        });

        it("should revert if sender is not guardian", async () => {
            await expect(allocator.connect(owner).deallocate([1])).to.be.reverted;
        });

        it("should fully deallocate", async () => {
            for (let i = 0; i < 1000; i++) {
                await triggerRebase();
            }

            const balance = await utilTokens[0].balanceOf(allocator.address);
            const input: BigNumber[] = [balance];
            await allocator.deallocate(input);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal("0");
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(balance);
        });

        it("should partially deallocate", async () => {
            const balance = await utilTokens[0].balanceOf(allocator.address);
            const input: BigNumber[] = [balance.div("2")];
            await allocator.deallocate(input);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(balance.div("2"));
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(balance.div("2"));
        });
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(10, 8),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 9);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                lobi,
                allocator,
                amount
            );

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                lobi,
                allocator,
                BigNumber.from(0).sub(amount)
            );

            const mAllocator: LobiAllocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lobi.address],
                    extender: extender.address,
                },
                treasury.address,
                sLobi.address,
                "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90",
                "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F"
            );

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 20),
                loss: bne(10, 8),
            });

            await mAllocator.activate();
        });

        it("should successfully migrate", async () => {
            await helpers.tmine(24 * 60 * 60 * 10);

            const xBalance = await utilTokens[0].balanceOf(allocator.address);

            await allocator.prepareMigration();

            expect(await allocator.status()).to.equal(2);

            await allocator.migrate();

            const maddress: string = await extender.allocators(2);

            expect(await utilTokens[0].balanceOf(maddress)).to.be.gte(xBalance);

            expect(await allocator.status()).to.equal(0);
        });
    });
});
