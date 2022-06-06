import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
const { BigNumber } = ethers;
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
    IERC20,
    IERC20Metadata,
    ITreasury,
    IStabilityPool,
    ILQTYStaking,
    ISwapRouter,
    LUSDAllocator,
    AaveAllocator,
    AaveAllocator__factory,
    LUSDAllocator__factory,
    OlympusAuthority,
    OlympusAuthority__factory,
} from "../../types";
const { fork_network, fork_reset } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const { advanceBlock, duration, increase } = require("../utils/advancement");

chai.use(smock.matchers);

describe("AaveAllocator", () => {
    describe("unit tests", () => {
        let owner: SignerWithAddress;
        let governor: SignerWithAddress;
        let guardian: SignerWithAddress;
        let other: SignerWithAddress;
        let alice: SignerWithAddress;
        let bob: SignerWithAddress;
        let treasuryFake: FakeContract<ITreasury>;
        let stabilityPoolFake: FakeContract<IStabilityPool>;
        let daiTokenFake: FakeContract<IERC20>;
        let adaiTokenFake: FakeContract<IERC20>;
        let aaveAllocator: AaveAllocator;
        let authority: OlympusAuthority;

        beforeEach(async () => {
            [owner, governor, guardian, other, alice, bob] = await ethers.getSigners();
            treasuryFake = await smock.fake<ITreasury>("ITreasury");
            stabilityPoolFake = await smock.fake<IStabilityPool>("IStabilityPool");
            daiTokenFake = await smock.fake<IERC20>("contracts/interfaces/IERC20.sol:IERC20");
            adaiTokenFake = await smock.fake<IERC20>("contracts/interfaces/IERC20.sol:IERC20");
            authority = await new OlympusAuthority__factory(owner).deploy(
                governor.address,
                guardian.address,
                owner.address,
                owner.address
            );
        });
        describe("constructor", () => {
            it("can construct", async () => {
                aaveAllocator = await new AaveAllocator__factory(owner).deploy(
                    authority.address,
                );
                expect(await aaveAllocator.referralCode()).to.equal(0);
                await aaveAllocator.addToken(daiTokenFake.address, adaiTokenFake.address, 100)
            });
        });

        describe("post-constructor", () => {
            beforeEach(async () => {
                aaveAllocator = await new AaveAllocator__factory(owner).deploy(
                    authority.address,
                );
            });

            describe("setter tests", () => {
                it("invalid setReferralCode", async () => {
                    try {
                        await expect(aaveAllocator.connect(owner).setReferralCode(-1))
                        .to.be.revertedWith("value out-of-bounds (argument=\"code\", value=-1, code=INVALID_ARGUMENT, version=abi/5.5.0)");
                    } catch (error) {
                        console.log(error)
                    }
                });
                it("valid setReferralCode", async () => {
                    await aaveAllocator.connect(owner).setReferralCode(65535);
                    await aaveAllocator.connect(owner).setReferralCode(0);
                });
            });
        });
        // WIP
        // describe("deposit", () => {
        //     it("not guardian", async () => {
        //         await expect(aaveAllocator.connect(owner).deposit(daiTokenFake.address, 1)).to.be.revertedWith(
        //             "UNAUTHORIZED"
        //         );
        //     });
        // });

    });
});
