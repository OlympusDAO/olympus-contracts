// libraries, functionality...
import { ethers, waffle, network, config } from "hardhat";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber } from "ethers";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract } from "@defi-wonderland/smock";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    BaseAllocator,
    OlympusAuthority,
    MockERC20,
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
    pinBlock,
    addressZero,
} from "../utils/scripts";

chai.should();
chai.use(smock.matchers);

describe("TreasuryExtender", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;

    // mocks
    let fakeAllocator: FakeContract<BaseAllocator>;

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

        fakeAllocator = await smock.fake<BaseAllocator>("BaseAllocator");

        fakeAllocator.name.returns("FakeAllocator");
        fakeAllocator.ids.returns([0]);
        fakeAllocator.version.returns("v2.0.0");
        fakeAllocator.status.returns(0);
        fakeAllocator.tokens.returns([coins.frax]);
        fakeAllocator.utilityTokens.returns([coins.usdc, coins.dai, coins.usdt, coins.weth]);
        fakeAllocator.rewardTokens.returns(coins.weth);
        fakeAllocator.amountAllocated.returns(0);

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
    });

    describe("registerDeposit", () => {
        before(async () => {
            start = await snapshot();
        });

        it("pre: should check if setup ok", async () => {
            expect(await fakeAllocator.name()).to.equal("FakeAllocator");
        });

        it("initial: is initialized to zero", async () => {
            expect(await extender.getAllocatorByID(0)).to.equal(addressZero);
        });

        it("revert: should revert if sender is not guardian", async () => {
            extender = extender.connect(owner);
            await expect(extender.registerDeposit(fakeAllocator.address)).to.be.revertedWith(
                "UNAUTHORIZED"
            );
            extender = extender.connect(guardian);
        });

        it("passing: should be able to register the allocator", async () => {
            await extender.registerDeposit(fakeAllocator.address);

            expect(fakeAllocator.addId).to.have.been.calledOnce;
            expect(fakeAllocator.addId).to.have.been.calledWith(1);
            expect(await extender.getAllocatorByID(1)).to.equal(fakeAllocator.address);

            const performance: any = await extender.getAllocatorPerformance(1);

            expect(performance[0]).to.equal(0);
            expect(performance[1]).to.equal(0);
        });

        it("passing: should try registering another allocator", async () => {
            const fakeAllocatorTwo = await smock.fake<BaseAllocator>("BaseAllocator");

            fakeAllocatorTwo.tokenIds.returns(0);
            fakeAllocatorTwo.tokens.returns([coins.frax]);

            await extender.registerDeposit(fakeAllocatorTwo.address);

            expect(fakeAllocatorTwo.addId).to.have.been.calledOnce;
            expect(fakeAllocatorTwo.addId).to.have.been.calledWith(2);

            expect(await extender.getAllocatorByID(2)).to.equal(fakeAllocatorTwo.address);
        });

        after(async () => {
            await revert(start);
        });
    });

    describe("setAllocatorLimits", () => {
        before(async () => {
            start = await snapshot();
            await extender.registerDeposit(fakeAllocator.address);
            fakeAllocator.ids.returns([1]);
        });

        it("pre: should check if setup ok", async () => {
            expect(await fakeAllocator.name()).to.equal("FakeAllocator");
            await expect(extender.getAllocatorByID(2)).to.be.reverted;
        });

        it("initial: should check if limits 0", async () => {
            const limits: any = await extender.getAllocatorLimits(1);

            expect(limits[0]).to.equal(0);
            expect(limits[1]).to.equal(0);
        });

        it("revert: should revert if sender is not guardian", async () => {
            extender = extender.connect(owner);

            await expect(
                extender.setAllocatorLimits(1, { allocated: bne(10, 27), loss: bne(10, 20) })
            ).to.be.revertedWith("UNAUTHORIZED");

            extender = extender.connect(guardian);
        });

        it("revert: should revert is allocator is online", async () => {
            fakeAllocator.status.returns(1);

            await expect(
                extender.setAllocatorLimits(1, { allocated: bne(10, 27), loss: bne(10, 20) })
            ).to.be.revertedWith("TreasuryExtender_AllocatorNotOffline()");

            fakeAllocator.status.returns(0);
        });

        it("passing: should properly set limits if sender = guardian", async () => {
            const _allocated: BigNumber = bne(10, 27);
            const _loss: BigNumber = bne(10, 20);

            await extender.setAllocatorLimits(1, {
                allocated: _allocated,
                loss: _loss,
            });

            let result: any = await extender.getAllocatorLimits(1);

            expect(result[0]).to.equal(_allocated);
            expect(result[1]).to.equal(_loss);
        });

        after(async () => {
            await revert(start);
            fakeAllocator.ids.returns([0]);
        });
    });

    let rewardAllocator: FakeContract<BaseAllocator>;
    let daiWhale: SignerWithAddress;

    describe("returnRewardsToTreasury", async () => {
        before(async () => {
            start = await snapshot();

            rewardAllocator = await smock.fake<BaseAllocator>("BaseAllocator");

            rewardAllocator.name.returns("RewardAllocator");
            rewardAllocator.ids.returns([0]);
            rewardAllocator.version.returns("v2.0.0");
            rewardAllocator.status.returns(0);
            rewardAllocator.tokens.returns([coins.frax]);
            rewardAllocator.utilityTokens.returns([coins.usdc, coins.dai, coins.usdt, coins.weth]);
            rewardAllocator.rewardTokens.returns(coins.dai);
            rewardAllocator.amountAllocated.returns(0);

            await extender.registerDeposit(rewardAllocator.address);

            rewardAllocator.ids.returns([1]);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 20),
            });

            rewardAllocator.status.returns(1);
        });

        it("pre: should set up balance", async () => {
            daiWhale = await impersonate("0x1dDb61FD4E70426eDb59e7ECDDf0f049d9cF3906");

            await network.provider.send("hardhat_setBalance", [
                rewardAllocator.address,
                "0x56BC75E2D63100000",
            ]);

            // funds alloc with dai
            dai = dai.connect(daiWhale);

            await expect(() =>
                dai.transfer(rewardAllocator.address, bne(10, 22))
            ).to.changeTokenBalance(dai, rewardAllocator.wallet, bne(10, 22));

            // alloc approves ex
            dai = dai.connect(rewardAllocator.wallet);

            await dai.approve(extender.address, bne(10, 22));
        });

        it("revert: should fail if sender not guardian", async () => {
            extender = extender.connect(owner);
            await expect(
                extender["returnRewardsToTreasury(uint256,address,uint256)"](
                    1,
                    coins.dai,
                    bne(10, 21).mul(5)
                )
            ).to.be.revertedWith("UNAUTHORIZED");
            extender = extender.connect(guardian);
        });

        it("passing: should return if sender is guardian", async () => {
            await expect(() =>
                extender["returnRewardsToTreasury(uint256,address,uint256)"](
                    1,
                    coins.dai,
                    bne(10, 21).mul(5)
                )
            ).to.changeTokenBalance(dai, treasury, bne(10, 21).mul(5));

            expect(await dai.balanceOf(extender.address)).to.equal(0);
        });

        it("passing: should return all if guardian asks for too much", async () => {
            await expect(() =>
                extender["returnRewardsToTreasury(uint256,address,uint256)"](
                    1,
                    coins.dai,
                    bne(10, 24).mul(5)
                )
            ).to.changeTokenBalance(dai, treasury, bne(10, 21).mul(5));

            expect(await dai.balanceOf(extender.address)).to.equal(0);
        });

        after(async () => {
            await revert(start);
            rewardAllocator.ids.returns([0]);
            rewardAllocator.status.returns(0);
        });
    });

    let veryfakeAllocator: FakeContract<BaseAllocator>;

    describe("requestFundsFromTreasury", async () => {
        before(async () => {
            start = await snapshot();

            await extender.registerDeposit(fakeAllocator.address);

            fakeAllocator.ids.returns([1]);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 20),
            });

            fakeAllocator.status.returns(1);

            veryfakeAllocator = await smock.fake<BaseAllocator>("BaseAllocator");
            veryfakeAllocator.name.returns("VeryfakeAllocator");
            veryfakeAllocator.ids.returns(0);
            veryfakeAllocator.version.returns("v2.0.0");
            veryfakeAllocator.status.returns(0);
            veryfakeAllocator.tokens.returns([coins.dai]);
            veryfakeAllocator.utilityTokens.returns([coins.weth]);
            veryfakeAllocator.rewardTokens.returns(coins.weth);
            veryfakeAllocator.amountAllocated.returns(0);

            await extender.registerDeposit(veryfakeAllocator.address);

            veryfakeAllocator.ids.returns([2]);

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 24),
                loss: bne(10, 21),
            });

            veryfakeAllocator.status.returns(1);
        });

        it("initial: check if everything initalized to 0/token", async () => {
            for (const token of tokens) {
                expect(await token.balanceOf(fakeAllocator.address)).to.equal(0);
                expect(await token.balanceOf(extender.address)).to.equal(0);
            }

            expect(await extender.getAllocatorAllocated(1)).to.equal(0);
            expect((await fakeAllocator.tokens())[0]).to.equal(frax.address);
        });

        it("revert: check if it will revert if not guardian, offline or above limit", async () => {
            // UNAUTHORIZED
            extender = extender.connect(owner);
            await expect(extender.requestFundsFromTreasury(1, bne(10, 21))).to.be.revertedWith(
                "UNAUTHORIZED"
            );
            extender = extender.connect(guardian);

            // OFFLINE
            fakeAllocator.status.returns(0);
            await expect(extender.requestFundsFromTreasury(1, bne(10, 21))).to.be.revertedWith(
                "TreasuryExtender_AllocatorNotActivated()"
            );
            fakeAllocator.status.returns(1);

            // LIMIT
            expect((await extender.getAllocatorLimits(1))[0]).to.equal(bne(10, 23));

            await expect(extender.requestFundsFromTreasury(1, bne(10, 25))).to.be.revertedWith(
                "TreasuryExtender_MaxAllocation(100000000000000000000000000, 1000000000000000000000000)"
            );
        });

        it("passing: should be able to transfer", async () => {
            await expect(() =>
                extender.requestFundsFromTreasury(1, bne(10, 21).mul(99))
            ).to.changeTokenBalance(frax, fakeAllocator.wallet, bne(10, 21).mul(99));

            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 21).mul(99));
            expect(await frax.balanceOf(extender.address)).to.equal(0);
        });

        it("revert: should revert if we add exactly enough to hit limit", async () => {
            // add exactly to 10^23
            await expect(() =>
                extender.requestFundsFromTreasury(1, bne(10, 21))
            ).to.changeTokenBalance(frax, fakeAllocator.wallet, bne(10, 21));

            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 23));
            expect(await frax.balanceOf(extender.address)).to.equal(0);

            // now try adding literally 1
            await expect(extender.requestFundsFromTreasury(1, bne(10, 21))).to.be.revertedWith(
                "TreasuryExtender_MaxAllocation(1010000000000000000000000, 1000000000000000000000000)"
            );
        });

        it("passing: stay correct over multiple allocators", async () => {
            let balance: BigNumber = bne(10, 22).mul(76);

            await expect(() => extender.requestFundsFromTreasury(2, balance)).to.changeTokenBalance(
                dai,
                veryfakeAllocator.wallet,
                balance
            );

            expect(await extender.getAllocatorAllocated(2)).to.equal(balance);
            expect(await usdc.balanceOf(extender.address)).to.equal(0);
        });
    });

    describe("report", () => {
        before(async () => {
            await network.provider.send("hardhat_setBalance", [
                fakeAllocator.address,
                bne(10, 22)._hex,
            ]);
            await network.provider.send("hardhat_setBalance", [
                veryfakeAllocator.address,
                bne(10, 22)._hex,
            ]);
        });

        it("initial: performance should be 0", async () => {
            let perf1: any = await extender.getAllocatorPerformance(1);
            let perf2: any = await extender.getAllocatorPerformance(2);

            expect(perf1[0]).to.equal(0);
            expect(perf1[0]).to.equal(0);
            expect(perf2[1]).to.equal(0);
            expect(perf2[1]).to.equal(0);
        });

        it("revert: should revert if allocator offline or allocator not sender", async () => {
            let input: BigNumber = bne(10, 22);

            await expect(extender.report(0, input, 0)).to.be.reverted;

            await expect(extender.report(0, 0, input)).to.be.reverted;

            await expect(extender.report(0, input, input)).to.be.reverted;

            extender = extender.connect(veryfakeAllocator.wallet);

            await expect(extender.report(1, input, 0)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(1, \"${veryfakeAllocator.address}\")`
            );

            await expect(extender.report(1, 0, input)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(1, \"${veryfakeAllocator.address}\")`
            );

            await expect(extender.report(1, input, input)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(1, \"${veryfakeAllocator.address}\")`
            );

            extender = extender.connect(fakeAllocator.wallet);

            await expect(extender.report(2, input, 0)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(2, \"${fakeAllocator.address}\")`
            );
            await expect(extender.report(2, 0, input)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(2, \"${fakeAllocator.address}\")`
            );
            await expect(extender.report(2, input, input)).to.be.revertedWith(
                `TreasuryExtender_OnlyAllocator(2, \"${fakeAllocator.address}\")`
            );
        });

        it("passing: should properly accept gain or loss report", async () => {
            // note down balances, set vars
            let allocated1: BigNumber = await extender.getAllocatorAllocated(1);
            let allocated2: BigNumber = await extender.getAllocatorAllocated(2);

            let gain: BigNumber = bne(10, 20);
            let loss: BigNumber = bne(10, 22);

            // gain reporting
            // fakeAllocator
            const response1 = await extender.report(1, gain, 0);
            const receipt1 = await response1.wait();

            expect(receipt1.events![0].event).to.equal("AllocatorReportedGain");
            expect(await extender.getAllocatorAllocated(1)).to.equal(allocated1);

            let performance1: any = await extender.getAllocatorPerformance(1);

            expect(performance1[0]).to.equal(gain);
            expect(performance1[1]).to.equal(0);

            // loss reporting
            // fakeAllocator
            const response2 = await extender.report(1, 0, loss);
            const receipt2 = await response2.wait();

            allocated1 = allocated1.sub(loss);

            expect(receipt2.events![0].event).to.equal("AllocatorReportedLoss");
            expect(await extender.getAllocatorAllocated(1)).to.equal(allocated1);

            performance1 = await extender.getAllocatorPerformance(1);

            expect(performance1[0]).to.equal(gain);
            expect(performance1[1]).to.equal(loss);

            // gain reporting
            // veryfakeAllocator
            extender = extender.connect(veryfakeAllocator.wallet);

            const response3 = await extender.report(2, gain, 0);
            const receipt3 = await response3.wait();

            expect(receipt3.events![0].event).to.equal("AllocatorReportedGain");
            expect(await extender.getAllocatorAllocated(2)).to.equal(allocated2);

            let performance2: any = await extender.getAllocatorPerformance(2);

            expect(performance2[0]).to.equal(gain);
            expect(performance2[1]).to.equal(0);

            // loss reporting
            // veryfakeAllocator
            const response4 = await extender.report(2, 0, loss);
            const receipt4 = await response4.wait();

            allocated2 = allocated2.sub(loss);

            expect(receipt4.events![0].event).to.equal("AllocatorReportedLoss");
            expect(await extender.getAllocatorAllocated(2)).to.equal(allocated2);

            performance2 = await extender.getAllocatorPerformance(2);

            expect(performance2[0]).to.equal(gain);
            expect(performance2[1]).to.equal(loss);
        });
    });

    describe("returnFundsToTreasury", () => {
        it("pre: transfer rewards to simulate them actually having rewards, and remove loss", async () => {
            const balancef: BigNumber = await extender.getAllocatorAllocated(1);
            const balancev: BigNumber = await extender.getAllocatorAllocated(2);

            const performancef: any = await extender.getAllocatorPerformance(1);
            const performancev: any = await extender.getAllocatorPerformance(2);

            const fraxWhale: SignerWithAddress = await impersonate(
                "0x0e274455110A233Bb7577c73Aa58d75a0939F56E"
            );

            frax = frax.connect(fraxWhale);
            dai = dai.connect(daiWhale);

            // add rewards
            await expect(() =>
                frax.transfer(fakeAllocator.address, performancef[0])
            ).to.changeTokenBalance(frax, fakeAllocator, performancef[0]);
            await expect(() =>
                dai.transfer(veryfakeAllocator.address, performancev[0])
            ).to.changeTokenBalance(dai, veryfakeAllocator, performancev[0]);

            // remove loss
            expect(await frax.balanceOf(fakeAllocator.address)).to.equal(
                balancef.add(performancef[1]).add(performancef[0])
            );
            expect(await dai.balanceOf(veryfakeAllocator.address)).to.equal(
                balancev.add(performancev[1]).add(performancef[0])
            );

            frax = frax.connect(fakeAllocator.wallet);
            dai = dai.connect(veryfakeAllocator.wallet);

            await expect(() => frax.transfer(owner.address, performancef[1])).to.changeTokenBalance(
                frax,
                fakeAllocator,
                performancef[1].mul(-1)
            );
            await expect(() => dai.transfer(owner.address, performancev[1])).to.changeTokenBalance(
                dai,
                veryfakeAllocator,
                performancev[1].mul(-1)
            );

            await frax.approve(extender.address, balancef.add(performancef[0]));
            await dai.approve(extender.address, balancev.add(performancev[0]));
        });

        it("revert: should revert if sender not guardian", async () => {
            extender = extender.connect(owner);
            await expect(extender.returnFundsToTreasury(1, 1)).to.be.revertedWith("UNAUTHORIZED");
            await expect(extender.returnFundsToTreasury(2, 1)).to.be.revertedWith("UNAUTHORIZED");
            extender = extender.connect(guardian);
        });

        it("passing: if 0 withdrawn, everything stays them", async () => {
            const internalSnap: number = await snapshot();

            let balf: BigNumber = await extender.getAllocatorAllocated(1);
            let balv: BigNumber = await extender.getAllocatorAllocated(2);

            let tvf: BigNumber = await treasury.tokenValue(frax.address, balf);
            let tvv: BigNumber = await treasury.tokenValue(dai.address, balv);

            let pf: any = await extender.getAllocatorPerformance(1);
            let pv: any = await extender.getAllocatorPerformance(2);

            await expect(() => extender.returnFundsToTreasury(1, 0)).to.changeTokenBalance(
                frax,
                treasury,
                0
            );
            await expect(() => extender.returnFundsToTreasury(2, 0)).to.changeTokenBalance(
                dai,
                treasury,
                0
            );

            let balfe: BigNumber = await extender.getAllocatorAllocated(1);
            let balve: BigNumber = await extender.getAllocatorAllocated(2);

            let tvfe: BigNumber = await treasury.tokenValue(frax.address, balfe);
            let tvve: BigNumber = await treasury.tokenValue(dai.address, balve);

            let pfe: any = await extender.getAllocatorPerformance(1);
            let pve: any = await extender.getAllocatorPerformance(2);

            let res: any[] = [balf, balv];
            let rese: any[] = [balfe, balve];

            res = res.concat(pf).concat(pv).concat([tvf, tvv]);
            rese = rese.concat(pfe).concat(pve).concat([tvfe, tvve]);

            for (let i = 0; i < res.length; i++) {
                expect(res[i]).to.equal(rese[i]);
            }

            await revert(internalSnap);
        });

        it("passing: withdraw allocated partially", async () => {
            const internalSnap: number = await snapshot();

            let balf: BigNumber = await extender.getAllocatorAllocated(1);
            let balv: BigNumber = await extender.getAllocatorAllocated(2);

            let pf: any = await extender.getAllocatorPerformance(1);
            let pv: any = await extender.getAllocatorPerformance(2);

            let withf: BigNumber = balf.sub(balf.div(2));
            let withv: BigNumber = balv.sub(balv.div(2));

            await expect(() => extender.returnFundsToTreasury(1, withf)).to.changeTokenBalance(
                frax,
                treasury,
                withf
            );
            await expect(() => extender.returnFundsToTreasury(2, withv)).to.changeTokenBalance(
                dai,
                treasury,
                withv
            );

            let balfe: BigNumber = await extender.getAllocatorAllocated(1);
            let balve: BigNumber = await extender.getAllocatorAllocated(2);

            let pfe: any = await extender.getAllocatorPerformance(1);
            let pve: any = await extender.getAllocatorPerformance(2);

            expect(balfe).to.equal(balf.sub(withf));
            expect(balve).to.equal(balv.sub(withv));

            expect(pf[0]).to.equal(pfe[0]);
            expect(pf[1]).to.equal(pfe[1]);

            expect(pv[0]).to.equal(pve[0]);
            expect(pv[1]).to.equal(pve[1]);

            await revert(internalSnap);
        });

        it("passing: if withdrawing only allocated, gain stays in tact", async () => {
            const internalSnap: number = await snapshot();

            let balf: BigNumber = await extender.getAllocatorAllocated(1);
            let balv: BigNumber = await extender.getAllocatorAllocated(2);

            let pf: any = await extender.getAllocatorPerformance(1);
            let pv: any = await extender.getAllocatorPerformance(2);

            await expect(() => extender.returnFundsToTreasury(1, balf)).to.changeTokenBalance(
                frax,
                treasury,
                balf
            );
            await expect(() => extender.returnFundsToTreasury(2, balv)).to.changeTokenBalance(
                dai,
                treasury,
                balv
            );

            let balfe: BigNumber = await extender.getAllocatorAllocated(1);
            let balve: BigNumber = await extender.getAllocatorAllocated(2);

            let pfe: any = await extender.getAllocatorPerformance(1);
            let pve: any = await extender.getAllocatorPerformance(2);

            expect(balfe).to.equal(0);
            expect(balve).to.equal(0);

            expect(pf[0]).to.equal(pfe[0]);
            expect(pf[1]).to.equal(pfe[1]);

            expect(pv[0]).to.equal(pve[0]);
            expect(pv[1]).to.equal(pve[1]);

            await revert(internalSnap);
        });

        it("passing: if withdrawing gain, it properly decrements together with allocated", async () => {
            const internalSnap: number = await snapshot();

            let balf: BigNumber = await extender.getAllocatorAllocated(1);
            let balv: BigNumber = await extender.getAllocatorAllocated(2);

            let pf: any = await extender.getAllocatorPerformance(1);
            let pv: any = await extender.getAllocatorPerformance(2);

            let withf: BigNumber = balf.add(pf[0].div(2));
            let withv: BigNumber = balv.add(pv[0].div(2));

            await expect(() => extender.returnFundsToTreasury(1, withf)).to.changeTokenBalance(
                frax,
                treasury,
                withf
            );

            await expect(() => extender.returnFundsToTreasury(2, withv)).to.changeTokenBalance(
                dai,
                treasury,
                withv
            );

            let balfe: BigNumber = await extender.getAllocatorAllocated(1);
            let balve: BigNumber = await extender.getAllocatorAllocated(2);

            let pfe: any = await extender.getAllocatorPerformance(1);
            let pve: any = await extender.getAllocatorPerformance(2);

            expect(balfe).to.equal(0);
            expect(balve).to.equal(0);

            expect(balf.add(pf[0]).sub(withf)).to.equal(pfe[0]);
            expect(balv.add(pv[0]).sub(withv)).to.equal(pve[0]);

            expect(pv[1]).to.equal(pve[1]);
            expect(pf[1]).to.equal(pfe[1]);

            await revert(internalSnap);
        });

        it("passing: withdrawing everything", async () => {
            const internalSnap: number = await snapshot();

            let balf: BigNumber = await extender.getAllocatorAllocated(1);
            let balv: BigNumber = await extender.getAllocatorAllocated(2);

            let pf: any = await extender.getAllocatorPerformance(1);
            let pv: any = await extender.getAllocatorPerformance(2);

            let withf: BigNumber = balf.add(pf[0]);
            let withv: BigNumber = balv.add(pv[0]);

            await expect(() => extender.returnFundsToTreasury(1, withf)).to.changeTokenBalance(
                frax,
                treasury,
                withf
            );

            await expect(() => extender.returnFundsToTreasury(2, withv)).to.changeTokenBalance(
                dai,
                treasury,
                withv
            );

            let balfe: BigNumber = await extender.getAllocatorAllocated(1);
            let balve: BigNumber = await extender.getAllocatorAllocated(2);

            let pfe: any = await extender.getAllocatorPerformance(1);
            let pve: any = await extender.getAllocatorPerformance(2);

            expect(balfe).to.equal(0);
            expect(balve).to.equal(0);

            expect(pfe[0]).to.equal(0);
            expect(pve[0]).to.equal(0);

            expect(pv[1]).to.equal(pve[1]);
            expect(pf[1]).to.equal(pfe[1]);

            await revert(internalSnap);
        });
    });
});
