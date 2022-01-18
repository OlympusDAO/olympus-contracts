import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";

import {
    OlympusStaking,
    OlympusTreasury,
    OlympusERC20Token,
    OlympusERC20Token__factory,
    SOlympus,
    SOlympus__factory,
    GOHM,
    OlympusAuthority__factory,
} from "../../types";

const TOTAL_GONS = 5000000000000000;
const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("sOhm", () => {
    let initializer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let ohm: OlympusERC20Token;
    let sOhm: SOlympus;
    let gOhmFake: FakeContract<GOHM>;
    let stakingFake: FakeContract<OlympusStaking>;
    let treasuryFake: FakeContract<OlympusTreasury>;

    beforeEach(async () => {
        [initializer, alice, bob] = await ethers.getSigners();
        stakingFake = await smock.fake<OlympusStaking>("OlympusStaking");
        treasuryFake = await smock.fake<OlympusTreasury>("OlympusTreasury");
        gOhmFake = await smock.fake<GOHM>("gOHM");

        const authority = await new OlympusAuthority__factory(initializer).deploy(
            initializer.address,
            initializer.address,
            initializer.address,
            initializer.address
        );
        ohm = await new OlympusERC20Token__factory(initializer).deploy(authority.address);
        sOhm = await new SOlympus__factory(initializer).deploy();
    });

    it("is constructed correctly", async () => {
        expect(await sOhm.name()).to.equal("Staked OHM");
        expect(await sOhm.symbol()).to.equal("sOHM");
        expect(await sOhm.decimals()).to.equal(9);
    });

    describe("initialization", () => {
        describe("setIndex", () => {
            it("sets the index", async () => {
                await sOhm.connect(initializer).setIndex(3);
                expect(await sOhm.index()).to.equal(3);
            });

            it("must be done by the initializer", async () => {
                await expect(sOhm.connect(alice).setIndex(3)).to.be.reverted;
            });

            it("cannot update the index if already set", async () => {
                await sOhm.connect(initializer).setIndex(3);
                await expect(sOhm.connect(initializer).setIndex(3)).to.be.reverted;
            });
        });

        describe("setgOHM", () => {
            it("sets gOhmFake", async () => {
                await sOhm.connect(initializer).setgOHM(gOhmFake.address);
                expect(await sOhm.gOHM()).to.equal(gOhmFake.address);
            });

            it("must be done by the initializer", async () => {
                await expect(sOhm.connect(alice).setgOHM(gOhmFake.address)).to.be.reverted;
            });

            it("won't set gOhmFake to 0 address", async () => {
                await expect(sOhm.connect(initializer).setgOHM(ZERO_ADDRESS)).to.be.reverted;
            });
        });

        describe("initialize", () => {
            it("assigns TOTAL_GONS to the stakingFake contract's balance", async () => {
                await sOhm
                    .connect(initializer)
                    .initialize(stakingFake.address, treasuryFake.address);
                expect(await sOhm.balanceOf(stakingFake.address)).to.equal(TOTAL_GONS);
            });

            it("emits Transfer event", async () => {
                await expect(
                    sOhm.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                )
                    .to.emit(sOhm, "Transfer")
                    .withArgs(ZERO_ADDRESS, stakingFake.address, TOTAL_GONS);
            });

            it("emits LogStakingContractUpdated event", async () => {
                await expect(
                    sOhm.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                )
                    .to.emit(sOhm, "LogStakingContractUpdated")
                    .withArgs(stakingFake.address);
            });

            it("unsets the initializer, so it cannot be called again", async () => {
                await sOhm
                    .connect(initializer)
                    .initialize(stakingFake.address, treasuryFake.address);
                await expect(
                    sOhm.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                ).to.be.reverted;
            });
        });
    });

    describe("post-initialization", () => {
        beforeEach(async () => {
            await sOhm.connect(initializer).setIndex(1);
            await sOhm.connect(initializer).setgOHM(gOhmFake.address);
            await sOhm.connect(initializer).initialize(stakingFake.address, treasuryFake.address);
        });

        describe("approve", () => {
            it("sets the allowed value between sender and spender", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                expect(await sOhm.allowance(alice.address, bob.address)).to.equal(10);
            });

            it("emits an Approval event", async () => {
                await expect(await sOhm.connect(alice).approve(bob.address, 10))
                    .to.emit(sOhm, "Approval")
                    .withArgs(alice.address, bob.address, 10);
            });
        });

        describe("increaseAllowance", () => {
            it("increases the allowance between sender and spender", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                await sOhm.connect(alice).increaseAllowance(bob.address, 4);

                expect(await sOhm.allowance(alice.address, bob.address)).to.equal(14);
            });

            it("emits an Approval event", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                await expect(await sOhm.connect(alice).increaseAllowance(bob.address, 4))
                    .to.emit(sOhm, "Approval")
                    .withArgs(alice.address, bob.address, 14);
            });
        });

        describe("decreaseAllowance", () => {
            it("decreases the allowance between sender and spender", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                await sOhm.connect(alice).decreaseAllowance(bob.address, 4);

                expect(await sOhm.allowance(alice.address, bob.address)).to.equal(6);
            });

            it("will not make the value negative", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                await sOhm.connect(alice).decreaseAllowance(bob.address, 11);

                expect(await sOhm.allowance(alice.address, bob.address)).to.equal(0);
            });

            it("emits an Approval event", async () => {
                await sOhm.connect(alice).approve(bob.address, 10);
                await expect(await sOhm.connect(alice).decreaseAllowance(bob.address, 4))
                    .to.emit(sOhm, "Approval")
                    .withArgs(alice.address, bob.address, 6);
            });
        });

        describe("circulatingSupply", () => {
            it("is zero when all owned by stakingFake contract", async () => {
                await stakingFake.supplyInWarmup.returns(0);
                await gOhmFake.totalSupply.returns(0);
                await gOhmFake.balanceFrom.returns(0);

                const totalSupply = await sOhm.circulatingSupply();
                expect(totalSupply).to.equal(0);
            });

            it("includes all supply owned by gOhmFake", async () => {
                await stakingFake.supplyInWarmup.returns(0);
                await gOhmFake.totalSupply.returns(10);
                await gOhmFake.balanceFrom.returns(10);

                const totalSupply = await sOhm.circulatingSupply();
                expect(totalSupply).to.equal(10);
            });

            it("includes all supply in warmup in stakingFake contract", async () => {
                await stakingFake.supplyInWarmup.returns(50);
                await gOhmFake.totalSupply.returns(0);
                await gOhmFake.balanceFrom.returns(0);

                const totalSupply = await sOhm.circulatingSupply();
                expect(totalSupply).to.equal(50);
            });
        });
    });
});
