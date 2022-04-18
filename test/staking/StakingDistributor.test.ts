import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai, { expect } from "chai";
import { config, ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
    ITreasury,
    IOHM,
    Distributor__factory,
    Distributor,
    OlympusAuthority,
    OlympusAuthority__factory,
    IStaking,
    OlympusTreasury,
    OlympusStaking,
    MockERC20,
} from "../../types";
import { uniPairAbi } from "../utils/abi";
import { addressZero, getCoin, impersonate, pinBlock } from "../utils/scripts";
import { olympus } from "../utils/olympus";
import { coins } from "../utils/coins";

chai.use(smock.matchers);

// network
const url: string = config.networks.hardhat.forking!.url;

// variables
const snapshotId = 0;

describe("Distributor", () => {
    const advanceEpoch = async () => {
        await advanceTime(8 * 60 * 60);
    };

    const advanceTime = async (seconds: number) => {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine", []);
    };

    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let other: SignerWithAddress;

    // contracts
    let treasury: OlympusTreasury;
    let staking: OlympusStaking;
    let distributor: Distributor;
    let authority: OlympusAuthority;

    // uniswap
    let ohmDai: any;

    // tokens
    let ohm: MockERC20;

    before(async () => {
        await pinBlock(14609847, url);
    })

    beforeEach(async () => {
        [owner, other] = await ethers.getSigners();

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        staking = (await ethers.getContractAt(
            "OlympusStaking",
            olympus.staking
        )) as OlympusStaking;

        governor = await impersonate(await authority.governor());
        guardian = await impersonate(await authority.guardian());

        ohm = await getCoin(coins.ohm);

        ohmDai = await ethers.getContractAt(
            uniPairAbi,
            "0x055475920a8c93cffb64d039a8205f7acc7722d3"
        );
    });

    describe("constructor", () => {
        it("constructs correctly", async () => {
            const distributor = await new Distributor__factory(owner).deploy(
                treasury.address,
                ohm.address,
                staking.address,
                authority.address,
                "2000"
            );
        });
    });

    describe("post-construction", () => {
        const bounty = 1000000

        before(async () => {
            distributor = await new Distributor__factory(owner).deploy(
                treasury.address,
                ohm.address,
                staking.address,
                authority.address,
                "2000"
            );

            await treasury.connect(governor).enable("8", distributor.address, addressZero);

            await staking.connect(governor).setDistributor(distributor.address);
        });

        beforeEach(async () => {
            await distributor.connect(governor).setPools([]);
        });

        describe("triggerRebase", () => {
            it("can be called by anyone", async () => {
                await expect(distributor.connect(other).triggerRebase()).to.not.be.reverted;

                await expect(distributor.connect(governor).triggerRebase()).to.not.be.reverted;
            });

            it("mints to pools", async () => {
                await advanceEpoch();
                const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3"];
                await distributor.connect(governor).setPools(pools);

                let [reserve0, reserve1, timestamp] = await ohmDai.getReserves();
                const priceBefore = reserve1 / (reserve0 * 1000000000);
                const balanceBefore = await ohm.balanceOf(pools[0]);
                console.log(priceBefore);

                await distributor.triggerRebase();

                [reserve0, reserve1, timestamp] = await ohmDai.getReserves();
                const priceAfter = reserve1 / (reserve0 * 1000000000);
                const balanceAfter = await ohm.balanceOf(pools[0]);
                console.log(priceAfter);

                expect(balanceAfter).to.be.gt(balanceBefore);
                expect(priceBefore).to.be.gt(priceAfter);

                await advanceEpoch();
                await distributor.triggerRebase();
                await advanceEpoch();
                await distributor.triggerRebase();
                await advanceEpoch();
                await distributor.triggerRebase();

                [reserve0, reserve1, timestamp] = await ohmDai.getReserves();
                const price3 = reserve1 / (reserve0 * 1000000000);
                console.log(price3);

                expect(priceBefore).to.be.gt(price3);
            });
        });

        describe("distribute", () => {
            it("cannot be called when rebases are locked", async () => {
                await expect(distributor.connect(governor).distribute()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(distributor.connect(guardian).distribute()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(distributor.connect(owner).distribute()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(staking.rebase())
            });
        });

        describe("retrieveBounty", () => {
            it("can only be called by staking", async () => {
                await expect(distributor.connect(governor).retrieveBounty()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(distributor.connect(guardian).retrieveBounty()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(distributor.connect(owner).retrieveBounty()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(distributor.connect(other).retrieveBounty()).to.be.revertedWith(
                    "Only_Staking()"
                );

                await expect(staking.rebase()).to.not.be.reverted;
            });
        });

        describe("nextRewardFor", () => {
            it("returns 0 if the address is not a set pool", async () => {
                const reward = await distributor.nextRewardFor(other.address);

                expect(reward).to.equal(0);
            });

            it("returns the next reward for pool", async () => {
                const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3", "0x69b81152c5a8d35a67b32a4d3772795d96cae4da"];
                await distributor.connect(governor).setPools(pools);

                const reward = await distributor.nextRewardFor(pools[0]);
                expect(reward).to.equal(3555420587872);
            });
        });

        describe("setBounty", () => {
            beforeEach(async () => {
                await distributor.connect(governor).setBounty(0);
            });

            it("should revert if not called by governor", async () => {
                await expect(distributor.connect(owner).setBounty(bounty)).to.be.reverted;

                await expect(distributor.connect(other).setBounty(bounty)).to.be.reverted;
            });

            it("should change bounty", async () => {
                const bountyBefore = await distributor.bounty();

                expect(bountyBefore).to.equal(0);

                await distributor.connect(governor).setBounty(bounty);

                const bountyAfter = await distributor.bounty();

                expect(bountyAfter).to.equal(bounty);
            });
        });

        describe("setPools", () => {
            const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3", "0x69b81152c5a8d35a67b32a4d3772795d96cae4da"];

            beforeEach(async () => {
                await distributor.connect(governor).setPools([]);
            });

            it("should revert if not called by governor", async () => {
                await expect(distributor.connect(owner).setPools([])).to.be.reverted;

                await expect(distributor.connect(other).setPools([])).to.be.reverted;
            });

            it("should set pools", async () => {
                await distributor.connect(governor).setPools(pools);

                await expect((await distributor.pools(0)).toLowerCase()).to.equal(pools[0]);
                await expect((await distributor.pools(1)).toLowerCase()).to.equal(pools[1]);
            });
        });

        describe("removePools", () => {
            const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3", "0x69b81152c5a8d35a67b32a4d3772795d96cae4da"];

            beforeEach(async () => {
                await distributor.connect(governor).setPools(pools);
            });

            it("should revert if not called by governor", async () => {
                await expect(distributor.connect(owner).removePool(0, pools[0])).to.be.reverted;

                await expect(distributor.connect(other).removePool(0, pools[0])).to.be.reverted;
            });

            it("should revert with sanity check if pool doesn't match", async () => {
                await expect(distributor.connect(governor).removePool(0, pools[1])).to.be.revertedWith(
                    "Sanity_Check()"
                );

                await expect(distributor.connect(governor).removePool(1, pools[0])).to.be.revertedWith(
                    "Sanity_Check()"
                );
            });

            it("should remove pool", async () => {
                await expect(distributor.connect(governor).removePool(0, pools[0])).to.not.be.reverted;

                await expect((await distributor.pools(0)).toLowerCase()).to.equal(addressZero);
                await expect((await distributor.pools(1)).toLowerCase()).to.equal(pools[1]);

                await expect(distributor.connect(governor).removePool(1, pools[1])).to.not.be.reverted;

                await expect((await distributor.pools(0)).toLowerCase()).to.equal(addressZero);
                await expect((await distributor.pools(1)).toLowerCase()).to.equal(addressZero);
            });
        });

        describe("addPool", () => {
            const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3", "0x69b81152c5a8d35a67b32a4d3772795d96cae4da"];
            const newPool = "0xb8127f3fbfe1d18299028d89523d7eb5db89f155";

            beforeEach(async () => {
                await distributor.connect(governor).setPools(pools);
            });

            it("should revert if not called by governor", async () => {
                await expect(distributor.connect(owner).addPool(0, newPool)).to.be.reverted;

                await expect(distributor.connect(other).addPool(0, newPool)).to.be.reverted;
            });

            it("should push pool when index is taken", async () => {
                await distributor.connect(governor).addPool(0, newPool);

                await expect((await distributor.pools(2)).toLowerCase()).to.equal(newPool);
            });

            it("should put pool in index when index is empty", async () => {
                await distributor.connect(governor).removePool(0, pools[0]);
                await expect(await distributor.pools(0)).to.equal(addressZero);

                await distributor.connect(governor).addPool(0, newPool);

                await expect((await distributor.pools(0)).toLowerCase()).to.equal(newPool);
            });
        });

        describe("setAdjustment", () => {
            const add = false;
            const rate = 5;
            const target = 3000;

            const pools = ["0x055475920a8c93cffb64d039a8205f7acc7722d3"];

            before(async () => {
                await distributor.connect(governor).setPools(pools);
            });

            it("should revert if not called by governor", async () => {
                await expect(distributor.connect(owner).setAdjustment(add, rate, target)).to.be.revertedWith(
                    "Not_Permissioned()"
                );
                
                await expect(distributor.connect(other).setAdjustment(add, rate, target)).to.be.revertedWith(
                    "Not_Permissioned()"
                );
            });

            it("should set an increase adjustment", async () => {
                await distributor.connect(governor).setAdjustment(add, rate, target);

                const adjustment = await distributor.adjustment();

                expect(adjustment.add).to.equal(add);
                expect(adjustment.rate).to.equal(rate);
                expect(adjustment.target).to.equal(3000);
            });

            it("should populate adjustment to rewardRate on rebase", async () => {
                await advanceEpoch();
                await distributor.triggerRebase();

                await expect(await distributor.rewardRate()).to.equal(target);
            });

            it("will not adjust if rate is zero", async () => {
                await distributor.connect(governor).setAdjustment(false, 0, 4000);
                await advanceEpoch();
                await distributor.triggerRebase();

                await expect(await distributor.rewardRate()).to.equal(3000);
            });

            it("will stop decreasing when target is met", async () => {
                await distributor.connect(governor).setAdjustment(false, 5, 2995);
                const adjustment = await distributor.adjustment();
                expect(adjustment.rate).to.equal(5);

                await advanceEpoch();
                await distributor.triggerRebase();

                const adjustmentAfter = await distributor.adjustment();
                expect(adjustmentAfter.rate).to.equal(0);
            });

            it("will stop increasing when target is met", async () => {
                await distributor.connect(governor).setAdjustment(false, 5, 3000);
                const adjustment = await distributor.adjustment();
                expect(adjustment.rate).to.equal(5);

                await advanceEpoch();
                await distributor.triggerRebase();

                const adjustmentAfter = await distributor.adjustment();
                expect(adjustmentAfter.rate).to.equal(0);
            });
        });
    });
});
