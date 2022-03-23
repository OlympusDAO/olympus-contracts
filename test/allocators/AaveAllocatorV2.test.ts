// libraries, functionality...
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    OlympusAuthority,
    ERC20,
    AaveAllocatorV2,
    AaveAllocatorV2__factory,
} from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;

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
    let frax: ERC20;
    let dai: ERC20;
    let weth: ERC20;
    let afrax: ERC20;
    let adai: ERC20;
    let aweth: ERC20;
    let usdc: ERC20;
    let usdt: ERC20;
    let tokens: ERC20[];
    let utilTokens: ERC20[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;

    before(async () => {
        await helpers.pinBlock(14026252, url);

        frax = await helpers.getCoin(coins.frax);
        usdc = await helpers.getCoin(coins.usdc);
        dai = await helpers.getCoin(coins.dai);
        usdt = await helpers.getCoin(coins.usdt);
        weth = await helpers.getCoin(coins.weth);
        tokens = [frax, dai, weth];

        adai = await helpers.getCoin(coins.adai);
        afrax = await helpers.getCoin(coins.afrax);
        aweth = await helpers.getCoin(coins.aweth);
        utilTokens = [afrax, adai, aweth];

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

        factory = (await ethers.getContractFactory("AaveAllocatorV2")) as AaveAllocatorV2__factory;

        factory = factory.connect(guardian);

        allocator = await factory.deploy({
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

            expect(await allocator.referralCode()).to.equal(0);

            expect((await allocator.tokens())[0]).to.equal(frax.address);
            expect(await frax.allowance(allocator.address, extender.address)).to.be.gt(0);

            expect((await allocator.rewardTokens()).length).to.equal(0);
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

            expect(await allocator.referralCode()).to.equal(0);

            expect((await allocator.tokens())[0]).to.equal(frax.address);
            expect((await allocator.tokens())[1]).to.equal(dai.address);

            expect(await frax.allowance(allocator.address, extender.address)).to.be.gt(0);
            expect(await dai.allowance(allocator.address, extender.address)).to.be.gt(0);

            expect((await allocator.rewardTokens()).length).to.equal(0);
        });

        it("passing: addAToken()", async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

            await allocator.addAToken(coins.afrax);
            await allocator.addAToken(coins.adai);

            const uTokens = await allocator.utilityTokens();

            expect(uTokens[0]).to.equal(coins.afrax);
            expect(uTokens[1]).to.equal(coins.adai);

            expect(await adai.allowance(allocator.address, extender.address)).to.be.gt(0);
            expect(await afrax.allowance(allocator.address, extender.address)).to.be.gt(0);
        });

        it("passing: setReferralCode()", async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

            await allocator.setReferralCode(5);

            expect(await allocator.referralCode()).to.equal(5);
        });

        it("passing: addToken()", async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address],
                extender: extender.address,
            });

            await allocator.addToken(coins.aweth);

            const tokenz = await allocator.tokens();

            expect(tokenz.length).to.equal(3);
            expect(tokenz[2]).to.equal(coins.aweth);
            expect(await aweth.allowance(allocator.address, extender.address)).to.be.gt(0);
        });

        it("passing: registerDeposit()", async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address, weth.address],
                extender: extender.address,
            });

            await allocator.addAToken(coins.afrax);
            await allocator.addAToken(coins.adai);
            await allocator.addAToken(coins.aweth);

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("update()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address, weth.address],
                extender: extender.address,
            });

            await allocator.addAToken(coins.afrax);
            await allocator.addAToken(coins.adai);
            await allocator.addAToken(coins.aweth);

            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(3, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                frax,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(2, amount)).to.changeTokenBalance(
                dai,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(3, amount)).to.changeTokenBalance(
                weth,
                allocator,
                amount
            );
        });

        it("revert: should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.reverted;
            await expect(allocator.connect(owner).update(2)).to.be.reverted;
            await expect(allocator.connect(owner).update(3)).to.be.reverted;
        });

        it("revert: should revert if not fourth token", async () => {
            await expect(extender.registerDeposit(allocator.address)).to.be.reverted;
        });

        it("passing: update should work for all coins", async () => {
            const amount: BigNumber = bne(10, 21);

            for (let i = 0; i < 3; i++) {
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.equal(0);
                await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                    tokens[i],
                    allocator,
                    BigNumber.from(0).sub(amount)
                );
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.gt(0);
                expect(await extender.getAllocatorAllocated(i + 1)).to.equal(amount);
                expect(await extender.getAllocatorAllocated(i + 1)).to.equal(
                    await utilTokens[i].balanceOf(allocator.address)
                );
            }
        });

        it("passing: should also work if depositing more", async () => {
            const amount: BigNumber = bne(10, 21);

            for (let i = 0; i < 3; i++) {
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.equal(0);
                await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                    tokens[i],
                    allocator,
                    BigNumber.from(0).sub(amount)
                );
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.gt(0);
                expect(await extender.getAllocatorAllocated(i + 1)).to.equal(amount);
            }

            const amount2: BigNumber = bne(10, 19);

            await expect(() => extender.requestFundsFromTreasury(1, amount2)).to.changeTokenBalance(
                frax,
                allocator,
                amount2
            );
            await expect(() => extender.requestFundsFromTreasury(2, amount2)).to.changeTokenBalance(
                dai,
                allocator,
                amount2
            );
            await expect(() => extender.requestFundsFromTreasury(3, amount2)).to.changeTokenBalance(
                weth,
                allocator,
                amount2
            );

            for (let i = 0; i < 3; i++) {
                const balance: BigNumber = await utilTokens[i].balanceOf(allocator.address);

                await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                    tokens[i],
                    allocator,
                    BigNumber.from(0).sub(amount2)
                );

                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.gt(balance);
                expect(await extender.getAllocatorAllocated(i + 1)).to.equal(amount.add(amount2));
            }
        });

        context("with deposited", () => {
            beforeEach(async () => {
                const amount: BigNumber = bne(10, 21);

                for (let i = 0; i < 3; i++) {
                    await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                        tokens[i],
                        allocator,
                        BigNumber.from(0).sub(amount)
                    );
                }
            });

            it("passing: should increases over time", async () => {
                const ibalances: BigNumber[] = [];

                for (let i = 0; i < 3; i++) {
                    ibalances.push(await utilTokens[i].balanceOf(allocator.address));
                }

                await helpers.tmine(24 * 60 * 60 * 10);

                for (let i = 0; i < 3; i++) {
                    const bal: BigNumber = await utilTokens[i].balanceOf(allocator.address);
                    expect(bal).to.be.gt(ibalances[i]);
                    expect(bal).to.equal(await allocator.amountAllocated(i + 1));
                }
            });

            it("passing: should report gain through increase", async () => {
                const ibalances: BigNumber[] = [];

                for (let i = 0; i < 3; i++) {
                    ibalances.push(await utilTokens[i].balanceOf(allocator.address));
                }

                await helpers.tmine(24 * 60 * 60 * 100);

                const receipts: any = [];

                for (let i = 1; i < 4; i++) {
                    receipts[i - 1] = await (await allocator.update(i)).wait();
                    expect(
                        (await extender.getAllocatorAllocated(i)).add(
                            (await extender.getAllocatorPerformance(i))[0]
                        )
                    ).to.equal(await utilTokens[i - 1].balanceOf(allocator.address));
                }
            });

            for (let i = 0; i < 3; i++) {
                it(`passing: should cause panic return in case of loss above limit for token undex index ${i}`, async () => {
                    await helpers.tmine(24 * 60 * 60 * 10);

                    const wallocator: SignerWithAddress = await helpers.impersonate(
                        allocator.address
                    );

                    const tempcoin: ERC20 = utilTokens[i].connect(wallocator);

                    await helpers.addEth(allocator.address, bne(10, 23));

                    await tempcoin.transfer(
                        owner.address,
                        (await tempcoin.balanceOf(allocator.address)).div(2)
                    );

                    await allocator.update(i + 1);

                    expect(await allocator.status()).to.equal(0);

                    for (let j = 0; j < 3; j++) {
                        expect(await utilTokens[i].balanceOf(allocator.address)).to.equal(0);
                        expect(await tokens[i].balanceOf(allocator.address)).to.equal(0);
                    }
                });
            }
        });
    });

    describe("deallocate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address, weth.address],
                extender: extender.address,
            });

            await allocator.addAToken(coins.afrax);
            await allocator.addAToken(coins.adai);
            await allocator.addAToken(coins.aweth);

            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(3, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                frax,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(2, amount)).to.changeTokenBalance(
                dai,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(3, amount)).to.changeTokenBalance(
                weth,
                allocator,
                amount
            );

            for (let i = 0; i < 3; i++) {
                await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                    tokens[i],
                    allocator,
                    BigNumber.from(0).sub(amount)
                );
            }
        });

        it("revert: should fail if sender is not guardian", async () => {
            await expect(allocator.connect(owner).deallocate([1, 2, 3])).to.be.reverted;
        });

        it("passing: should be able to deall all at once fully", async () => {
            let input: BigNumber[] = new Array(3).fill(bne(10, 21).div(2));
            await allocator.deallocate(input);

            for (let i = 0; i < 3; i++) {
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.lte(
                    input[0].add(bne(10, 15))
                );
                expect(await tokens[i].balanceOf(allocator.address)).to.equal(input[0]);
            }
        });

        it("passing: should be able to deall all at once fully", async () => {
            let input: BigNumber[] = new Array(3).fill(bne(10, 21));
            await allocator.deallocate(input);

            for (let i = 0; i < 3; i++) {
                expect(await utilTokens[i].balanceOf(allocator.address)).to.be.lte(bne(10, 17));
                expect(await tokens[i].balanceOf(allocator.address)).to.equal(input[0]);
            }
        });

        for (let i = 0; i < 3; i++) {
            it(`passing: should be able to deallocate token under index ${i} partially`, async () => {
                let input: BigNumber[] = new Array(3).fill(BigNumber.from(0));
                input[i] = bne(10, 21).div(2);

                await allocator.deallocate(input);

                expect(await utilTokens[i].balanceOf(allocator.address)).to.lte(
                    input[i].add(bne(10, 15))
                );
                expect(await tokens[i].balanceOf(allocator.address)).to.equal(input[i]);
            });

            it(`passing: should be able to deallocate token under index ${i} fully`, async () => {
                let input: BigNumber[] = new Array(3).fill(BigNumber.from(0));
                input[i] = bne(10, 21);

                await allocator.deallocate(input);
                expect(await tokens[i].balanceOf(allocator.address)).to.equal(input[i]);
            });
        }
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address, dai.address, weth.address],
                extender: extender.address,
            });

            await allocator.addAToken(coins.afrax);
            await allocator.addAToken(coins.adai);
            await allocator.addAToken(coins.aweth);

            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);
            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await extender.setAllocatorLimits(3, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                frax,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(2, amount)).to.changeTokenBalance(
                dai,
                allocator,
                amount
            );
            await expect(() => extender.requestFundsFromTreasury(3, amount)).to.changeTokenBalance(
                weth,
                allocator,
                amount
            );

            for (let i = 0; i < 3; i++) {
                await expect(() => allocator.update(i + 1)).to.changeTokenBalance(
                    tokens[i],
                    allocator,
                    BigNumber.from(0).sub(amount)
                );
            }

            const mAllocator: AaveAllocatorV2 = await factory.deploy({
                authority: authority.address,
                tokens: [frax.address],
                extender: extender.address,
            });

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(4, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await mAllocator.activate();
        });

        it("passing: should succesfully migrate", async () => {
            await helpers.tmine(24 * 3600 * 10);

            const balances: BigNumber[] = [
                await utilTokens[0].balanceOf(allocator.address),
                await utilTokens[1].balanceOf(allocator.address),
                await utilTokens[2].balanceOf(allocator.address),
            ];

            await allocator.prepareMigration();

            expect(await allocator.status()).to.equal(2);

            await allocator.migrate();

            const maddress: string = await extender.allocators(4);

            expect(await utilTokens[0].balanceOf(maddress)).to.be.gte(balances[0]);
            expect(await utilTokens[1].balanceOf(maddress)).to.be.gte(balances[1]);
            expect(await utilTokens[2].balanceOf(maddress)).to.be.gte(balances[2]);

            expect(await allocator.status()).to.equal(0);
        });
    });
});
