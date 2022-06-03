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
const lusdAbi = require("../../abis/lusd.json");
const lusdStabilityPoolAbi = require("../../abis/lusd_stability_pool.json");
const oldTreasuryAbi = require("../../abis/old_treasury_abi.json");

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

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
        let lqtyStakingFake: FakeContract<ILQTYStaking>;
        let lusdTokenFake: FakeContract<IERC20Metadata>;
        let lqtyTokenFake: FakeContract<IERC20Metadata>;
        let wethTokenFake: FakeContract<IERC20>;
        let daiTokenFake: FakeContract<IERC20>;
        let swapRouterFake: FakeContract<ISwapRouter>;
        let lusdAllocator: LUSDAllocator;
        let aaveAllocator: AaveAllocator;
        let authority: OlympusAuthority;

        beforeEach(async () => {
            [owner, governor, guardian, other, alice, bob] = await ethers.getSigners();
            treasuryFake = await smock.fake<ITreasury>("ITreasury");
            stabilityPoolFake = await smock.fake<IStabilityPool>("IStabilityPool");
            lqtyStakingFake = await smock.fake<ILQTYStaking>("ILQTYStaking");
            lusdTokenFake = await smock.fake<IERC20Metadata>(
                "contracts/interfaces/IERC20Metadata.sol:IERC20Metadata"
            );
            lqtyTokenFake = await smock.fake<IERC20Metadata>(
                "contracts/interfaces/IERC20Metadata.sol:IERC20Metadata"
            );
            wethTokenFake = await smock.fake<IERC20>("contracts/interfaces/IERC20.sol:IERC20");
            daiTokenFake = await smock.fake<IERC20>("contracts/interfaces/IERC20.sol:IERC20");
            swapRouterFake = await smock.fake<ISwapRouter>("ISwapRouter");
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
            });
        });
    });
});
