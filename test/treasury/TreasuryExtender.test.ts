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
        fakeAllocator.getToken.returns(coins.mim);
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

        extender = extender.connect(guardian);
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
        });

        it("pre: should check if setup ok", async () => {
            expect(await fakeAllocator.name()).to.equal("FakeAllocator");
            await expect(extender.getAllocatorByID(2)).to.be.reverted;
        });

        it("initial: should check if limits 0", async () => {
            let limits: any = await extender.getAllocatorLimits(1);

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
                extender["setAllocatorLimits(uint256,(uint128,uint128))"](fakeAllocator.address, {
                    allocated: bne(10, 27),
                    loss: bne(10, 20),
                })
            ).to.be.revertedWith("UNAUTHORIZED");
        });

        it("runtime: should properly set limits if sender = guardian", async () => {
            extender = extender.connect(guardian);
            let _allocated: BigNumber = bne(10, 27);
            let _loss: BigNumber = bne(10, 20);

            await extender["setAllocatorLimits(address,(uint128,uint128))"](fakeAllocator.address, {
                allocated: _allocated,
                loss: _loss,
            });

            let result: any = await extender.getAllocatorLimits(1);

            expect(result[0]).to.equal(_allocated);
            expect(result[1]).to.equal(_allocated);

            await extender["setAllocatorLimits(uint256,(uint128,uint128))"](fakeAllocator.address, {
                allocated: _allocated,
                loss: _loss,
            });

            result = await extender.getAllocatorLimits(1);

            expect(result[0]).to.equal(_allocated);
            expect(result[1]).to.equal(_allocated);
        });

        after(async () => {
            revert(start);
        });
    });
});
