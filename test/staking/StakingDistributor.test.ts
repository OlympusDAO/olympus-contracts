import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
    ITreasury,
    IOHM,
    Distributor__factory,
    Distributor,
    OlympusAuthority,
    OlympusAuthority__factory,
} from "../../types";

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("Distributor", () => {
    let owner: SignerWithAddress;
    let staking: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let other: SignerWithAddress;
    let ohmFake: FakeContract<IOHM>;
    let treasuryFake: FakeContract<ITreasury>;
    let distributor: Distributor;
    let authority: OlympusAuthority;

    beforeEach(async () => {
        [owner, staking, governor, guardian, other] = await ethers.getSigners();
        treasuryFake = await smock.fake<ITreasury>("ITreasury");
        ohmFake = await smock.fake<IOHM>("IOHM");
        authority = await new OlympusAuthority__factory(owner).deploy(
            governor.address,
            guardian.address,
            owner.address,
            owner.address
        );
    });

    describe("constructor", () => {
        it("constructs correctly", async () => {
            const distributor = await new Distributor__factory(owner).deploy(
                treasuryFake.address,
                ohmFake.address,
                staking.address,
                authority.address
            );
        });

        it("does not accept 0x0 as treasury address", async () => {
            await expect(
                new Distributor__factory(owner).deploy(
                    ZERO_ADDRESS,
                    ohmFake.address,
                    staking.address,
                    authority.address
                )
            ).to.be.reverted;
        });

        it("does not accept 0x0 as OHM address", async () => {
            await expect(
                new Distributor__factory(owner).deploy(
                    treasuryFake.address,
                    ZERO_ADDRESS,
                    staking.address,
                    authority.address
                )
            ).to.be.reverted;
        });

        it("does not accept 0x0 as staking address", async () => {
            await expect(
                new Distributor__factory(owner).deploy(
                    treasuryFake.address,
                    ohmFake.address,
                    ZERO_ADDRESS,
                    authority.address
                )
            ).to.be.reverted;
        });
    });

    describe("post-construction", () => {
        beforeEach(async () => {
            distributor = await new Distributor__factory(owner).deploy(
                treasuryFake.address,
                ohmFake.address,
                staking.address,
                authority.address
            );
        });

        describe("distribute", () => {
            it("will do nothing if there are no recipients", async () => {
                await distributor.connect(staking).distribute();

                expect(treasuryFake.mint).to.have.callCount(0);
            });

            it("can only be called by the staking contract", async () => {
                await expect(distributor.connect(governor).distribute()).to.be.revertedWith(
                    "Only staking"
                );

                await expect(distributor.connect(guardian).distribute()).to.be.revertedWith(
                    "Only staking"
                );

                await expect(distributor.connect(owner).distribute()).to.be.revertedWith(
                    "Only staking"
                );
            });

            it("mint from treasury and distribute to recipients", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);
                await distributor.connect(governor).addRecipient(other.address, 1521);

                ohmFake.totalSupply.returns(10000000);
                await distributor.connect(staking).distribute();

                expect(treasuryFake.mint).to.have.been.calledWith(staking.address, 29750);
                expect(treasuryFake.mint).to.have.been.calledWith(other.address, 15210);
            });

            describe("rate adjustments", () => {
                it("can decrease distribution rate", async () => {
                    await distributor.connect(governor).addRecipient(staking.address, 2975);
                    const index = 0;
                    const add = false;
                    const rate = 5;
                    const target = 2000;
                    await distributor.connect(governor).setAdjustment(index, add, rate, target);

                    await distributor.connect(staking).distribute();

                    const info = await distributor.info(0);
                    expect(info.rate).to.equal(2970);
                });

                it("can increase distribution rate", async () => {
                    await distributor.connect(governor).addRecipient(staking.address, 2975);
                    const index = 0;
                    const add = true;
                    const rate = 5;
                    const target = 3000;
                    await distributor.connect(governor).setAdjustment(index, add, rate, target);

                    await distributor.connect(staking).distribute();

                    const info = await distributor.info(0);
                    expect(info.rate).to.equal(2980);
                });

                it("will not adjust if adjustment rate is zero", async () => {
                    await distributor.connect(governor).addRecipient(staking.address, 2975);
                    const index = 0;
                    const add = true;
                    const rate = 0;
                    const target = 3000;
                    await distributor.connect(governor).setAdjustment(index, add, rate, target);

                    await distributor.connect(staking).distribute();

                    const info = await distributor.info(0);
                    expect(info.rate).to.equal(2975);
                });

                it("will stop decreasing once target it met", async () => {
                    await distributor.connect(governor).addRecipient(staking.address, 2975);
                    const index = 0;
                    const add = false;
                    const rate = 5;
                    const target = 2970;
                    await distributor.connect(governor).setAdjustment(index, add, rate, target);

                    await distributor.connect(staking).distribute();

                    const adjustment = await distributor.adjustments(0);
                    expect(adjustment.rate).to.equal(0);
                });

                it("will stop increasing once target it met", async () => {
                    await distributor.connect(governor).addRecipient(staking.address, 2975);
                    const index = 0;
                    const add = true;
                    const rate = 5;
                    const target = 2980;
                    await distributor.connect(governor).setAdjustment(index, add, rate, target);

                    await distributor.connect(staking).distribute();

                    const adjustment = await distributor.adjustments(0);
                    expect(adjustment.rate).to.equal(0);
                });
            });
        });

        describe("setAdjustment", () => {
            it("sets the adjustment at the given index", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);

                const index = 0;
                const add = true;
                const rate = 5;
                const target = 2000;
                await distributor.connect(governor).setAdjustment(index, add, rate, target);

                const adjustment = await distributor.adjustments(index);
                expect(adjustment.add).to.equal(add);
                expect(adjustment.rate).to.equal(rate);
                expect(adjustment.target).to.equal(target);
            });

            it("can only be done by governor or guardian", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);

                await expect(
                    distributor.connect(other).setAdjustment(0, false, 5, 2000)
                ).to.be.revertedWith("Caller is not governor or guardian");
            });

            it("allows governor to make large adjustments", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);

                const index = 0;
                const add = false;
                const rate = 2975;
                const target = 0;
                await distributor.connect(governor).setAdjustment(index, add, rate, target);

                const adjustment = await distributor.adjustments(index);
                expect(adjustment.add).to.equal(add);
                expect(adjustment.rate).to.equal(rate);
                expect(adjustment.target).to.equal(target);
            });

            it("allows guardian to make adjustments up to 2.5%", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 1000);

                const index = 0;
                const add = false;
                const rate = 25;
                const target = 0;
                await distributor.connect(guardian).setAdjustment(index, add, rate, target);

                const adjustment = await distributor.adjustments(index);
                expect(adjustment.add).to.equal(add);
                expect(adjustment.rate).to.equal(rate);
                expect(adjustment.target).to.equal(target);
            });

            it("restricts guardian to from making adjustments over 2.5%", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 1000);

                const rate = 26;
                await expect(
                    distributor.connect(guardian).setAdjustment(0, false, rate, 0)
                ).to.be.revertedWith("Limiter: cannot adjust by >2.5%");
            });
        });

        describe("nextRewardAt", () => {
            it("returns the number of OHM to be distributed in the next epoch", async () => {
                ohmFake.totalSupply.returns(3899568500546135);

                const rate = 2975;
                const reward = await distributor.nextRewardAt(rate);
                expect(reward).to.equal(11601216289124);
            });

            it("returns zero when rate is zero", async () => {
                ohmFake.totalSupply.returns(3899568500546135);

                const rate = 0;
                const reward = await distributor.nextRewardAt(rate);
                expect(reward).to.equal(0);
            });
        });

        describe("nextRewardFor", () => {
            it("returns the number of OHM to be distributed to the given address in the next epoch", async () => {
                const rate = 2975;
                await distributor.connect(governor).addRecipient(staking.address, rate);
                ohmFake.totalSupply.returns(3899568500546135);

                const reward = await distributor.nextRewardFor(staking.address);
                expect(reward).to.equal(11601216289124);
            });

            it("returns the 0 if the address is not a recipient", async () => {
                ohmFake.totalSupply.returns(3899568500546135);

                const reward = await distributor.nextRewardFor(other.address);
                expect(reward).to.equal(0);
            });
        });

        describe("addRecipient", () => {
            it("will append a recipient to the list", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);
                await distributor.connect(governor).addRecipient(other.address, 1000);

                const r0 = await distributor.info(0);
                expect(r0.recipient).to.equal(staking.address);
                expect(r0.rate).to.equal(2975);

                const r1 = await distributor.info(1);
                expect(r1.recipient).to.equal(other.address);
                expect(r1.rate).to.equal(1000);
            });

            it("can only be done by governor", async () => {
                await expect(distributor.connect(guardian).addRecipient(staking.address, 2975)).to
                    .be.reverted;

                await expect(distributor.connect(other).addRecipient(staking.address, 2975)).to.be
                    .reverted;
            });
        });

        describe("removeRecipeint", () => {
            it("will set reciepent and rate to 0", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);
                await distributor.connect(governor).removeRecipient(0);

                const r0 = await distributor.info(0);
                expect(r0.recipient).to.equal(ZERO_ADDRESS);
                expect(r0.rate).to.equal(0);
            });

            it("can be done by the guardian", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);
                await distributor.connect(guardian).removeRecipient(0);

                const r0 = await distributor.info(0);
                expect(r0.recipient).to.equal(ZERO_ADDRESS);
                expect(r0.rate).to.equal(0);
            });

            it("must be done by either governor or guardian", async () => {
                await distributor.connect(governor).addRecipient(staking.address, 2975);
                await expect(distributor.connect(other).removeRecipient(0)).to.be.revertedWith(
                    "Caller is not governor or guardian"
                );
            });
        });
    });
});
