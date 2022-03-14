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
    MockERC20,
    LUSDAllocatorV2,
    LUSDAllocatorV2__factory,
    IStabilityPool,
    ILQTYStaking,
} from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;

describe("LUSDAllocatorV2", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let randomLUSDHolder: SignerWithAddress;
    let randomLQTYHolder: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: LUSDAllocatorV2;
    let factory: LUSDAllocatorV2__factory;
    let stabilityPool: IStabilityPool;
    let lqtyStaking: ILQTYStaking;

    // tokens
    let weth: MockERC20;
    let lusd: MockERC20;
    let lqty: MockERC20;
    let tokens: MockERC20[];
    let utilTokens: MockERC20[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;

    before(async () => {
        await helpers.pinBlock(14026252, url);

        weth = await helpers.getCoin(coins.weth);
        lusd = await helpers.getCoin(coins.lusd);
        tokens = [lusd];

        lqty = await helpers.getCoin(coins.lqty);
        utilTokens = [lqty, weth];

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        stabilityPool = (await ethers.getContractAt(
            "IStabilityPool",
            "0x66017D22b0f8556afDd19FC67041899Eb65a21bb"
        )) as IStabilityPool;

        lqtyStaking = (await ethers.getContractAt(
            "ILQTYStaking",
            "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d"
        )) as ILQTYStaking;

        const extenderFactory: TreasuryExtender__factory = (await ethers.getContractFactory(
            "TreasuryExtender"
        )) as TreasuryExtender__factory;

        extender = await extenderFactory.deploy(treasury.address, authority.address);

        owner = (await ethers.getSigners())[0];

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());
        randomLUSDHolder = await helpers.impersonate("0xE05fD1304C1CfE19dcc6AAb0767848CC4A8f54aa"); // No LUSD in treasury, get off this wallet
        randomLQTYHolder = await helpers.impersonate("0xd4A39d219ADB43aB00739DC5D876D98Fdf0121Bf"); // No LQTY in treasury, get off this wallet

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        await lusd.connect(randomLUSDHolder).transfer(treasury.address, bne(10, 23)); // Send LUSD to treasury

        await treasury.enable(3, extender.address, helpers.constants.addressZero);
        await treasury.enable(0, extender.address, helpers.constants.addressZero);

        factory = (await ethers.getContractFactory("LUSDAllocatorV2")) as LUSDAllocatorV2__factory;
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("initialization", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lusd.address],
                    extender: extender.address,
                },
                treasury.address,
                1000
            );
        });

        it("initial: should deploy the allocator with correct info", async () => {
            expect(await allocator.treasuryAddress()).to.equal(treasury.address);
            expect(await allocator.lusdStabilityPool()).to.equal(
                "0x66017D22b0f8556afDd19FC67041899Eb65a21bb"
            );
            expect(await allocator.lqtyStaking()).to.equal(
                "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d"
            );
            expect((await allocator.tokens())[0]).to.equal(lusd.address);
            expect((await allocator.rewardTokens())[0]).to.equal(lqty.address);
        });

        it("passing: setEthToLUSDRatio()", async () => {
            expect(await allocator.ethToLUSDRatio()).to.equal("330000");
            await allocator.connect(guardian).setEthToLUSDRatio(500000);
            expect(await allocator.ethToLUSDRatio()).to.equal("500000");
        });
    });

    describe("update()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lusd.address],
                    extender: extender.address,
                },
                treasury.address,
                3000
            );

            await extender.connect(guardian).registerDeposit(allocator.address);

            await extender.connect(guardian).setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.connect(guardian).activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() =>
                extender.connect(guardian).requestFundsFromTreasury(1, amount)
            ).to.changeTokenBalance(lusd, allocator, amount);

            await lqty
                .connect(randomLQTYHolder)
                .transfer(allocator.address, ethers.utils.parseEther("1000")); // Send LQTY to allocator
        });

        it("revert: should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.reverted;
        });

        it("revert: should revert if not second token", async () => {
            await expect(extender.registerDeposit(allocator.address)).to.be.reverted;
        });

        it("passing: update should deposit LUSD and LQTY", async () => {
            const amount: BigNumber = bne(10, 21);

            await expect(() => allocator.connect(guardian).update(1)).to.changeTokenBalance(
                lusd,
                allocator,
                BigNumber.from(0).sub(amount)
            );
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
            expect(await stabilityPool.getCompoundedLUSDDeposit(allocator.address)).to.equal(
                ethers.utils.parseEther("10000")
            );
            expect(await lqtyStaking.stakes(allocator.address)).to.equal(
                ethers.utils.parseEther("1000")
            );
        });

        it("passing: should also work if depositing more", async () => {
            const amount: BigNumber = bne(10, 21);

            await expect(() => allocator.connect(guardian).update(1)).to.changeTokenBalance(
                lusd,
                allocator,
                BigNumber.from(0).sub(amount)
            );
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);

            const amount2: BigNumber = bne(10, 19);

            await expect(() => extender.requestFundsFromTreasury(1, amount2)).to.changeTokenBalance(
                lusd,
                allocator,
                amount2
            );

            await expect(() => allocator.connect(guardian).update(1)).to.changeTokenBalance(
                lusd,
                allocator,
                BigNumber.from(0).sub(amount2)
            );

            expect(await extender.getAllocatorAllocated(1)).to.equal(amount.add(amount2));
        });

        it("passing: should report gains", async () => {
            await allocator.connect(guardian).update(1);

            await lusd.connect(randomLUSDHolder).transfer(allocator.address, bne(10, 18)); // Send LUSD to simulate autocompounding rewards
            await allocator.connect(guardian).update(1);

            let performace = await extender.getAllocatorPerformance(1);
            expect(performace[0]).to.equal(ethers.utils.parseEther("10"));
        });

        it("passing: should autocompound received eth to LUSD", async () => {
            const amount: BigNumber = bne(10, 21);

            await expect(() => allocator.connect(guardian).update(1)).to.changeTokenBalance(
                lusd,
                allocator,
                BigNumber.from(0).sub(amount)
            );

            await guardian.sendTransaction({
                to: allocator.address,
                value: ethers.utils.parseEther("10"),
            }); // Send ETH to allocator to simulate rewards autocompounding

            await allocator.connect(guardian).setMinETHLUSDRate(500);
            let initialBalance = await allocator.amountAllocated(0);
            await allocator.connect(guardian).update(1);
            let currentBalance = await allocator.amountAllocated(0);
            let difference = Number(ethers.utils.formatEther(currentBalance.sub(initialBalance)));
            await expect(difference).to.greaterThan(0);
        });

        it("failing: should fail swap if slippage too high", async () => {
            const amount: BigNumber = bne(10, 21);

            await expect(() => allocator.connect(guardian).update(1)).to.changeTokenBalance(
                lusd,
                allocator,
                BigNumber.from(0).sub(amount)
            );

            await guardian.sendTransaction({
                to: allocator.address,
                value: ethers.utils.parseEther("10"),
            }); // Send ETH to allocator to simulate rewards autocompounding

            await expect(allocator.connect(guardian).update(1)).to.be.reverted;
        });
    });

    describe("deallocate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lusd.address],
                    extender: extender.address,
                },
                treasury.address,
                1000
            );

            await extender.connect(guardian).registerDeposit(allocator.address);

            await extender.connect(guardian).setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.connect(guardian).activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() =>
                extender.connect(guardian).requestFundsFromTreasury(1, amount)
            ).to.changeTokenBalance(lusd, allocator, amount);

            await lqty
                .connect(randomLQTYHolder)
                .transfer(allocator.address, ethers.utils.parseEther("1000"));
            await allocator.connect(guardian).update(1);
        });

        it("revert: should fail if sender is not guardian", async () => {
            await expect(allocator.connect(owner).deallocate([1, 1])).to.be.reverted;
        });

        it("passing: should be able to deallocate all at once fully", async () => {
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("0")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("0")
            );

            let input: BigNumber[] = [
                ethers.utils.parseEther("10000"),
                ethers.utils.parseEther("1000"),
            ];
            await allocator.connect(guardian).deallocate(input);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("1000")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("10000")
            );
        });

        it("passing: should be able to deallocate one at a time", async () => {
            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("0")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("0")
            );

            let input: BigNumber[] = [
                ethers.utils.parseEther("10000"),
                ethers.utils.parseEther("0"),
            ];
            await allocator.connect(guardian).deallocate(input);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("0")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("10000")
            );

            let secondInput: BigNumber[] = [
                ethers.utils.parseEther("0"),
                ethers.utils.parseEther("1000"),
            ];
            await allocator.connect(guardian).deallocate(secondInput);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("1000")
            );
            expect(await tokens[0].balanceOf(allocator.address)).to.equal(
                ethers.utils.parseEther("10000")
            );
        });
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lusd.address],
                    extender: extender.address,
                },
                treasury.address,
                1000
            );

            await extender.connect(guardian).registerDeposit(allocator.address);

            await extender.connect(guardian).setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.connect(guardian).activate();

            const amount: BigNumber = bne(10, 21);

            await expect(() =>
                extender.connect(guardian).requestFundsFromTreasury(1, amount)
            ).to.changeTokenBalance(lusd, allocator, amount);

            await lqty
                .connect(randomLQTYHolder)
                .transfer(allocator.address, ethers.utils.parseEther("1000"));
            await allocator.connect(guardian).update(1);

            const mAllocator: LUSDAllocatorV2 = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [lusd.address],
                    extender: extender.address,
                },
                treasury.address,
                1000
            );

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await mAllocator.connect(guardian).activate();
        });

        it("passing: should succesfully migrate", async () => {
            await helpers.tmine(24 * 3600 * 10);

            await allocator.connect(guardian).prepareMigration();

            expect(await allocator.status()).to.equal(2);

            await allocator.connect(guardian).migrate();

            const maddress: string = await extender.allocators(2);

            expect(await tokens[0].balanceOf(maddress)).to.equal(ethers.utils.parseEther("10000"));
            expect(await allocator.status()).to.equal(0);
        });
    });
});
