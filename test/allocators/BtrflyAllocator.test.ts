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
    BtrflyAllocator,
    BtrflyAllocator__factory,
} from "../../types";

import { xbtrflyAbi } from "../utils/abi";
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;

describe("BtrflyAllocator", () => {
    //signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: BtrflyAllocator;
    let factory: BtrflyAllocator__factory;

    // tokens
    let btrfly: MockERC20;
    let xBtrfly: any;

    let tokens: MockERC20[];
    let utilTokens: any[];

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

        btrfly = await helpers.getCoin(coins.btrfly);
        tokens = [btrfly];

        xBtrfly = await ethers.getContractAt(xbtrflyAbi, coins.xbtrfly);
        utilTokens = [xBtrfly];

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

        factory = (await ethers.getContractFactory("BtrflyAllocator")) as BtrflyAllocator__factory;
        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [btrfly.address],
                extender: extender.address,
            },
            treasury.address,
            xBtrfly.address,
            "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
            "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
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
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.xBtrfly()).to.equal(xBtrfly.address);
            expect(await allocator.staking()).to.equal(
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487"
            );
            expect(await allocator.stakingHelper()).to.equal(
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );
            expect((await allocator.tokens())[0]).to.equal(btrfly.address);
        });

        it("should register deposit", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("update()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(3, 10),
            });

            await allocator.activate();

            const amount: BigNumber = bne(5, 10);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                btrfly,
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
            const amount: BigNumber = bne(5, 10);

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await xBtrfly.balanceOf(allocator.address)).to.equal(amount);
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
        });

        it("should deposit more", async () => {
            const amount: BigNumber = bne(5, 10);

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect(await utilTokens[0].balanceOf(allocator.address)).to.be.gt("0");
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                btrfly,
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
                const amount: BigNumber = bne(5, 10);

                await allocator.update(1);
            });

            it("should gain over time", async () => {
                const bal = await btrfly.balanceOf(allocator.address);

                const balance = await utilTokens[0].balanceOf(allocator.address);
                console.log(balance);
                console.log(await xBtrfly.index());

                for (let i = 0; i < 1000; i++) {
                    await triggerRebase();
                }

                console.log(await xBtrfly.index());

                const balanceAfter = await utilTokens[0].balanceOf(allocator.address);
                console.log(balanceAfter);

                expect(balanceAfter).to.be.gt(balance);
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
                    (await tempcoin.balanceOf(allocator.address)).div("2")
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
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(3, 10),
            });

            await allocator.activate();

            const amount: BigNumber = bne(5, 10);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                btrfly,
                allocator,
                amount
            );

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                btrfly,
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
            console.log(await tokens[0].balanceOf(allocator.address));
        });

        it("should partially deallocate", async () => {
            const balance = await utilTokens[0].balanceOf(allocator.address);
            const input: BigNumber[] = [balance.div("2")];
            await allocator.deallocate(input);

            // Add one for precision error
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                balance.div("2").add("1")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(balance.div("2"));
        });
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 20),
                loss: bne(3, 10),
            });

            await allocator.activate();

            const amount: BigNumber = bne(5, 10);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                btrfly,
                allocator,
                amount
            );

            await expect(() => allocator.update(1)).to.changeTokenBalance(
                btrfly,
                allocator,
                BigNumber.from(0).sub(amount)
            );

            const mAllocator: BtrflyAllocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [btrfly.address],
                    extender: extender.address,
                },
                treasury.address,
                xBtrfly.address,
                "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487",
                "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf"
            );

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(2, {
                allocated: bne(5, 10),
                loss: bne(3, 10),
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
