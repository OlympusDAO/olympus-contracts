// libraries, functionality...
import { ethers, waffle, network, config } from "hardhat";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber } from "ethers";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
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

chai.should();
chai.use(smock.matchers);

async function impersonate(address: string): Promise<SignerWithAddress> {
    await network.provider.send("hardhat_impersonateAccount", [address]);
    return await ethers.getSigner(address);
}

async function snapshot(): Promise<number> {
    return await network.provider.send("evm_snapshot", []);
}

async function revert(moment: number): Promise<void> {
    await network.provider.send("evm_revert", [moment]);
}

async function getCoin(address: string): Promise<MockERC20> {
    return await ethers.getContractAt("MockERC20", address);
}

async function getCoins(addresses: string[]): Promise<MockERC20[]> {
    const result: MockERC20[] = [];

    for (const address of addresses) {
        result.push(await getCoin(address));
    }

    return result;
}

function bnn(num: number): BigNumber {
    return BigNumber.from(num);
}

function bne(base: number, expo: number): BigNumber {
    let bn: BigNumber = bnn(base);
    for (expo; expo > 0; expo--) bn = bn.mul(base);
    return bn;
}

async function pinBlock(bnum: number, url: string): Promise<void> {
    await network.provider.send("hardhat_reset", [
        { forking: { jsonRpcUrl: url, blockNumber: bnum } },
    ]);
}

const addressZero = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

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
        fakeAllocator.id.returns(0);
        fakeAllocator.version.returns("v2.0.0");
        fakeAllocator.status.returns(0);
        fakeAllocator.getToken.returns(coins.frax);
        fakeAllocator.utilityTokens.returns([coins.usdc, coins.dai, coins.usdt, coins.weth]);
        fakeAllocator.rewardTokens.returns(coins.weth);
        fakeAllocator.estimateTotalAllocated.returns(0);
        fakeAllocator.estimateTotalRewards.returns(0);

        treasury = await ethers.getContractAt("OlympusTreasury", olympus.treasury);
        authority = await ethers.getContractAt("OlympusAuthority", olympus.authority);

        const extenderFactory: TreasuryExtender__factory = await ethers.getContractFactory(
            "TreasuryExtender"
        );

        extender = await extenderFactory.deploy(treasury.address, authority.address);

        owner = (await ethers.getSigners())[0];

        guardian = await impersonate(await authority.guardian());
        governor = await impersonate(await authority.governor());

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, addressZero);
        treasury.enable(0, extender.address, addressZero);
    });

    describe("registerAllocator", () => {
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
            await expect(extender.registerAllocator(fakeAllocator.address)).to.be.revertedWith(
                "UNAUTHORIZED"
            );
            extender = extender.connect(guardian);
        });

        it("passing: should be able to register the allocator", async () => {
            await extender.registerAllocator(fakeAllocator.address);

            expect(fakeAllocator.setId).to.have.been.calledOnce;
            expect(fakeAllocator.setId).to.have.been.calledWith(1);
            expect(await extender.getAllocatorByID(1)).to.equal(fakeAllocator.address);

            const performance: any = await extender.getAllocatorPerformance(1);

            expect(performance[0]).to.equal(0);
            expect(performance[1]).to.equal(0);
        });

        it("passing: should try registering another allocator", async () => {
            const fakeAllocatorTwo = await smock.fake<BaseAllocator>("BaseAllocator");

            await extender.registerAllocator(fakeAllocatorTwo.address);

            expect(fakeAllocatorTwo.setId).to.have.been.calledOnce;
            expect(fakeAllocatorTwo.setId).to.have.been.calledWith(2);

            expect(await extender.getAllocatorByID(2)).to.equal(fakeAllocatorTwo.address);
        });

        after(async () => {
            await revert(start);
        });
    });

    describe("setAllocatorLimits", () => {
        before(async () => {
            start = await snapshot();
            await extender.registerAllocator(fakeAllocator.address);
            fakeAllocator.id.returns(1);
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
                extender["setAllocatorLimits(address,(uint128,uint128))"](fakeAllocator.address, {
                    allocated: bne(10, 27),
                    loss: bne(10, 20),
                })
            ).to.be.revertedWith("UNAUTHORIZED");

            await expect(
                extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                    allocated: bne(10, 27),
                    loss: bne(10, 20),
                })
            ).to.be.revertedWith("UNAUTHORIZED");

            extender = extender.connect(guardian);
        });

        it("revert: should revert is allocator is online", async () => {
            fakeAllocator.status.returns(1);

            await expect(
                extender["setAllocatorLimits(address,(uint128,uint128))"](fakeAllocator.address, {
                    allocated: bne(10, 27),
                    loss: bne(10, 20),
                })
            ).to.be.revertedWith("TreasuryExtender::AllocatorActivated");

            await expect(
                extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                    allocated: bne(10, 27),
                    loss: bne(10, 20),
                })
            ).to.be.revertedWith("TreasuryExtender::AllocatorActivated");

            fakeAllocator.status.returns(0);
        });

        it("passing: should properly set limits if sender = guardian", async () => {
            const _allocated: BigNumber = bne(10, 27);
            const _loss: BigNumber = bne(10, 20);

            await extender["setAllocatorLimits(address,(uint128,uint128))"](fakeAllocator.address, {
                allocated: _allocated,
                loss: _loss,
            });

            let result: any = await extender.getAllocatorLimits(1);

            expect(result[0]).to.equal(_allocated);
            expect(result[1]).to.equal(_loss);

            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                allocated: _allocated,
                loss: _loss,
            });

            result = await extender.getAllocatorLimits(1);

            expect(result[0]).to.equal(_allocated);
            expect(result[1]).to.equal(_loss);
        });

        after(async () => {
            await revert(start);
            fakeAllocator.id.returns(0);
        });
    });

    let rewardAllocator: FakeContract<BaseAllocator>;

    describe("returnRewardsToTreasury", async () => {
        before(async () => {
            start = await snapshot();

            rewardAllocator = await smock.fake<BaseAllocator>("BaseAllocator");

            rewardAllocator.name.returns("RewardAllocator");
            rewardAllocator.id.returns(0);
            rewardAllocator.version.returns("v2.0.0");
            rewardAllocator.status.returns(0);
            rewardAllocator.getToken.returns(coins.frax);
            rewardAllocator.utilityTokens.returns([coins.usdc, coins.dai, coins.usdt, coins.weth]);
            rewardAllocator.rewardTokens.returns(coins.dai);
            rewardAllocator.estimateTotalAllocated.returns(0);
            rewardAllocator.estimateTotalRewards.returns(0);

            await extender.registerAllocator(rewardAllocator.address);

            rewardAllocator.id.returns(1);

            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                allocated: bne(10, 23),
                loss: bne(10, 20),
            });

            rewardAllocator.status.returns(1);
        });

        it("pre: should set up balance", async () => {
            let daiWhale: SignerWithAddress = await impersonate(
                "0x1dDb61FD4E70426eDb59e7ECDDf0f049d9cF3906"
            );

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
        });

        after(async () => {
            await revert(start);
            rewardAllocator.id.returns(0);
            rewardAllocator.status.returns(0);
        });
    });

    let veryfakeAllocator: FakeContract<BaseAllocator>;

    describe("requestFundsFromTreasury", async () => {
        before(async () => {
            start = await snapshot();

            await extender.registerAllocator(fakeAllocator.address);

            fakeAllocator.id.returns(1);

            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](1, {
                allocated: bne(10, 23),
                loss: bne(10, 20),
            });

            fakeAllocator.status.returns(1);

            veryfakeAllocator = await smock.fake<BaseAllocator>("BaseAllocator");
            veryfakeAllocator.name.returns("VeryfakeAllocator");
            veryfakeAllocator.id.returns(0);
            veryfakeAllocator.version.returns("v2.0.0");
            veryfakeAllocator.status.returns(0);
            veryfakeAllocator.getToken.returns(coins.dai);
            veryfakeAllocator.utilityTokens.returns([coins.weth]);
            veryfakeAllocator.rewardTokens.returns(coins.weth);
            veryfakeAllocator.estimateTotalAllocated.returns(0);
            veryfakeAllocator.estimateTotalRewards.returns(0);

            await extender.registerAllocator(veryfakeAllocator.address);

            veryfakeAllocator.id.returns(2);

            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](2, {
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
            expect(await fakeAllocator.getToken()).to.equal(frax.address);
            expect(await extender.getTotalValueAllocated()).to.equal(0);
        });

        it("revert: check if it will revert if not guardian, offline or above limit", async () => {
            const innerStart = await snapshot();

            // UNAUTHORIZED
            extender = extender.connect(owner);
            await expect(
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 21))
            ).to.be.revertedWith("UNAUTHORIZED");
            extender = extender.connect(guardian);

            // OFFLINE
            fakeAllocator.status.returns(0);
            await expect(
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 21))
            ).to.be.revertedWith("TreasuryExtender::AllocatorOffline");
            fakeAllocator.status.returns(1);

            // LIMIT
            expect((await extender.getAllocatorLimits(1))[0]).to.equal(bne(10, 23));

            await expect(
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 25))
            ).to.be.revertedWith("TreasuryExtender::MaxAllocation");

            revert(innerStart);
        });

        it("passing: should be able to transfer", async () => {
            await expect(() =>
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 21).mul(99))
            ).to.changeTokenBalance(frax, fakeAllocator.wallet, bne(10, 21).mul(99));

            expect(await extender.getTotalValueAllocated()).to.equal(
                await treasury.tokenValue(coins.frax, bne(10, 21).mul(99))
            );
            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 21).mul(99));
            expect(await frax.balanceOf(extender.address)).to.equal(0);
        });

        it("revert: should revert if we add exactly enough to hit limit", async () => {
            // add exactly to 10^23
            await expect(() =>
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 21))
            ).to.changeTokenBalance(frax, fakeAllocator.wallet, bne(10, 21));

            expect(await extender.getTotalValueAllocated()).to.equal(
                await treasury.tokenValue(coins.frax, bne(10, 23))
            );
            expect(await extender.getAllocatorAllocated(1)).to.equal(bne(10, 23));
            expect(await frax.balanceOf(extender.address)).to.equal(0);

            // now try adding literally 1
            await expect(
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(10, 21))
            ).to.be.revertedWith("TreasuryExtender::MaxAllocation");
        });

        it("passing: stay correct over multiple allocators", async () => {
            let balance: BigNumber = bne(10, 22).mul(76);

            await expect(() =>
                extender["requestFundsFromTreasury(uint256,uint256)"](2, balance)
            ).to.changeTokenBalance(dai, veryfakeAllocator.wallet, balance);

            expect(await extender.getTotalValueAllocated()).to.equal(
                (await treasury.tokenValue(coins.dai, balance)).add(
                    await treasury.tokenValue(coins.frax, bne(10, 23))
                )
            );
            expect(await extender.getAllocatorAllocated(2)).to.equal(balance);
            expect(await usdc.balanceOf(extender.address)).to.equal(0);
        });
    });
});
