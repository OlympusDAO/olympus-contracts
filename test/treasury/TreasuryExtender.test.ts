// libraries, functionality...
import { ethers, waffle, network } from "hardhat";
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
import { TypechainConfig } from "@typechain/hardhat/dist/types";

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

function bne(base: number, expo: number): BigNumber {
    let bn: BigNumber = BigNumber.from(base);
    for (expo; expo > 0; expo--) bn = bn.mul(base);
    return bn;
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

    // variables
    let start = 0;

    before(async () => {
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

        it("runtime: should be able to register the allocator", async () => {
            await extender.registerAllocator(fakeAllocator.address);

            expect(fakeAllocator.setId).to.have.been.calledOnce;
            expect(fakeAllocator.setId).to.have.been.calledWith(1);
            expect(await extender.getAllocatorByID(1)).to.equal(fakeAllocator.address);

            const performance: any = await extender.getAllocatorPerformance(1);

            expect(performance[0]).to.equal(0);
            expect(performance[1]).to.equal(0);
        });

        it("runtime: should try registering another allocator", async () => {
            const fakeAllocatorTwo = await smock.fake<BaseAllocator>("BaseAllocator");

            await extender.registerAllocator(fakeAllocatorTwo.address);

            expect(fakeAllocatorTwo.setId).to.have.been.calledOnce;
            expect(fakeAllocatorTwo.setId).to.have.been.calledWith(2);

            expect(await extender.getAllocatorByID(2)).to.equal(fakeAllocatorTwo.address);
        });

        after(async () => {
            revert(start);
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

        it("runtime: should properly set limits if sender = guardian", async () => {
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
            revert(start);
            fakeAllocator.id.returns(0);
        });
    });

    let frax: MockERC20;
    let usdc: MockERC20;
    let dai: MockERC20;
    let usdt: MockERC20;
    let weth: MockERC20;

    let tokens: MockERC20[];

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

            frax = await getCoin(coins.frax);
            usdc = await getCoin(coins.usdc);
            dai = await getCoin(coins.dai);
            usdt = await getCoin(coins.usdt);
            weth = await getCoin(coins.weth);

            tokens = [frax, usdc, dai, usdt, weth];
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
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(1, 22))
            ).to.be.revertedWith("UNAUTHORIZED");
            extender = extender.connect(guardian);

            // OFFLINE
            fakeAllocator.status.returns(0);
            await expect(
                extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(1, 22))
            ).to.be.revertedWith("TreasuryExtender::AllocatorOffline");
            fakeAllocator.status.returns(1);

            // LIMIT
            //	    await expect(extender["requestFundsFromTreasury(uint256,uint256)"](1, bne(1,26))).to.be.revertedWith("TreasuryExtender::MaxAllocation")

            revert(innerStart);
        });

        after(async () => {
            revert(start);
        });
    });
});
