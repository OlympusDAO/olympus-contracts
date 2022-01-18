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

describe("LUSDAllocator", () => {
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
                wethTokenFake.approve.returns(true);
                lusdTokenFake.approve.returns(true);
                lqtyTokenFake.approve.returns(true);
                lusdAllocator = await new LUSDAllocator__factory(owner).deploy(
                    authority.address,
                    treasuryFake.address,
                    lusdTokenFake.address,
                    lqtyTokenFake.address,
                    stabilityPoolFake.address,
                    lqtyStakingFake.address,
                    ZERO_ADDRESS,
                    wethTokenFake.address,
                    daiTokenFake.address,
                    swapRouterFake.address
                );
                expect(await lusdAllocator.lusdTokenAddress()).to.equal(lusdTokenFake.address);
            });
        });

        describe("post-constructor", () => {
            beforeEach(async () => {
                wethTokenFake.approve.returns(true);
                lusdTokenFake.approve.returns(true);
                lqtyTokenFake.approve.returns(true);
                lusdAllocator = await new LUSDAllocator__factory(owner).deploy(
                    authority.address,
                    treasuryFake.address,
                    lusdTokenFake.address,
                    lqtyTokenFake.address,
                    stabilityPoolFake.address,
                    lqtyStakingFake.address,
                    ZERO_ADDRESS,
                    wethTokenFake.address,
                    daiTokenFake.address,
                    swapRouterFake.address
                );
            });

            describe("setter tests", () => {
                it("invalid setEthToLUSDRatio", async () => {
                    await expect(
                        lusdAllocator.connect(guardian).setEthToLUSDRatio(1e6 + 1)
                    ).to.be.revertedWith("Value must be between 0 and 1e6");
                });

                it("valid setEthToLUSDRatio", async () => {
                    await lusdAllocator.connect(guardian).setEthToLUSDRatio(1e6);
                    await lusdAllocator.connect(guardian).setEthToLUSDRatio(0);
                });

                it("invalid poolfee", async () => {
                    await expect(
                        lusdAllocator.connect(guardian).setPoolFee(10000 + 1)
                    ).to.be.revertedWith("Value must be between 0 and 10000");
                });
                it("valid poolfee", async () => {
                    await lusdAllocator.connect(guardian).setPoolFee(10000);
                    await lusdAllocator.connect(guardian).setPoolFee(0);
                });
            });

            describe("deposit", () => {
                it("not guardian", async () => {
                    const AMOUNT = 12345;
                    await expect(lusdAllocator.connect(owner).deposit(AMOUNT)).to.be.revertedWith(
                        "UNAUTHORIZED"
                    );
                });

                it("withdraws amount of token from treasury and deposits in pool", async () => {
                    const AMOUNT = 12345;
                    const VALUE = AMOUNT * 10 ** 8;
                    lusdTokenFake.decimals.returns(1);
                    await lusdAllocator.connect(guardian).deposit(AMOUNT);

                    expect(treasuryFake.manage).to.be.calledWith(lusdTokenFake.address, AMOUNT);
                    expect(stabilityPoolFake.provideToSP).to.be.calledWith(AMOUNT, ZERO_ADDRESS);

                    expect(await lusdAllocator.totalAmountDeployed()).to.equal(AMOUNT);
                    expect(await lusdAllocator.totalValueDeployed()).to.equal(VALUE);
                });

                it("can perform additional deposit", async () => {
                    const AMOUNT = 12345;
                    const VALUE = AMOUNT * 10 ** 8;
                    lusdTokenFake.decimals.returns(1);
                    await lusdAllocator.connect(guardian).deposit(AMOUNT);
                    await lusdAllocator.connect(guardian).deposit(AMOUNT);

                    expect(await lusdAllocator.totalAmountDeployed()).to.equal(AMOUNT + AMOUNT);
                    expect(await lusdAllocator.totalValueDeployed()).to.equal(VALUE + VALUE);
                });
            });

            describe("harvest", () => {
                it("harvest testing", async () => {
                    const AMOUNT = 12345;
                    const WETH_TO_TREASURY = 8147; //AMOUNT * .66 = 8147.7, truncated to 8147
                    const LQTY_REWARDS = 444;
                    const LUSD_REWARDS = 555;
                    const LUSD_REWARDS_VALUE = LUSD_REWARDS * 10 ** 8;
                    const ETHLUSD_RATE = 3500;

                    lusdTokenFake.decimals.returns(1);
                    stabilityPoolFake.getDepositorETHGain.returns(AMOUNT);
                    lqtyTokenFake.balanceOf.returns(LQTY_REWARDS); //Non-zero forces a call to staking contract
                    lusdTokenFake.balanceOf.returns(LUSD_REWARDS);

                    wethTokenFake.balanceOf.returns(WETH_TO_TREASURY);
                    wethTokenFake.transfer.returns(true);
                    swapRouterFake.exactInput.returns(222);

                    await alice.sendTransaction({
                        to: lusdAllocator.address,
                        value: AMOUNT,
                    });
                    await lusdAllocator.connect(guardian).harvest(ETHLUSD_RATE);

                    /**
        1.  Harvest from LUSD StabilityPool to get ETH+LQTY rewards
        2.  Stake LQTY rewards from #1.  This txn will also give out any outstanding ETH+LUSD rewards from prior staking
        3.  If we have eth, convert to weth, then swap a percentage of it to LUSD.  If swap successul then send all remaining WETH to treasury
        4.  Deposit LUSD from #2 and potentially #3 into StabilityPool
           */

                    // Step #1
                    expect(stabilityPoolFake.withdrawFromSP).to.be.calledWith(0);
                    // Step #2
                    expect(lqtyStakingFake.stake).to.be.calledWith(LQTY_REWARDS);
                    // Step #3
                    expect(wethTokenFake.transfer).to.be.calledWith(
                        treasuryFake.address,
                        WETH_TO_TREASURY
                    );
                    // Step #4
                    expect(stabilityPoolFake.provideToSP).to.be.calledWith(
                        LUSD_REWARDS,
                        ZERO_ADDRESS
                    );
                    // Step #4 - bookkeeping
                    expect(await lusdAllocator.totalAmountDeployed()).to.equal(LUSD_REWARDS);
                    expect(await lusdAllocator.totalValueDeployed()).to.equal(LUSD_REWARDS_VALUE);
                });
            });

            describe("withdraw", () => {
                const DEPOSIT_AMOUNT = 12345;
                const DEPOSIT_VALUE = DEPOSIT_AMOUNT * 10 ** 8;
                beforeEach(async () => {
                    lusdTokenFake.decimals.returns(1);
                    // treasuryFake.tokenValue.whenCalledWith(lusdTokenFake.address, DEPOSIT_AMOUNT).returns(DEPOSIT_VALUE);
                    await lusdAllocator.connect(guardian).deposit(DEPOSIT_AMOUNT);
                });

                it("not guardian", async () => {
                    const AMOUNT = 12345;
                    await expect(
                        lusdAllocator.connect(owner).withdraw(lusdTokenFake.address, DEPOSIT_AMOUNT)
                    ).to.be.revertedWith("UNAUTHORIZED");
                });

                it("can withdraw all the funds", async () => {
                    lusdTokenFake.balanceOf
                        .whenCalledWith(lusdAllocator.address)
                        .returns(DEPOSIT_AMOUNT);
                    treasuryFake.tokenValue
                        .whenCalledWith(lusdTokenFake.address, DEPOSIT_AMOUNT)
                        .returns(DEPOSIT_VALUE);
                    await lusdAllocator
                        .connect(guardian)
                        .withdraw(lusdTokenFake.address, DEPOSIT_AMOUNT);

                    expect(stabilityPoolFake.withdrawFromSP).to.be.calledWith(DEPOSIT_AMOUNT);
                    expect(treasuryFake.deposit).to.be.calledWith(
                        DEPOSIT_AMOUNT,
                        lusdTokenFake.address,
                        DEPOSIT_VALUE
                    );
                    expect(lusdTokenFake.balanceOf).to.be.calledWith(lusdAllocator.address);

                    expect(await lusdAllocator.totalAmountDeployed()).to.equal(0);
                    expect(await lusdAllocator.totalValueDeployed()).to.equal(0);
                });

                it("can do do a partial withdraw", async () => {
                    const PARTIAL_AMOUNT = 4321;
                    const PARTIAL_VALUE = PARTIAL_AMOUNT * 10 ** 8;
                    lusdTokenFake.decimals.returns(1);
                    lusdTokenFake.balanceOf
                        .whenCalledWith(lusdAllocator.address)
                        .returns(PARTIAL_AMOUNT);
                    treasuryFake.tokenValue
                        .whenCalledWith(lusdTokenFake.address, PARTIAL_AMOUNT)
                        .returns(PARTIAL_VALUE);
                    await lusdAllocator
                        .connect(guardian)
                        .withdraw(lusdTokenFake.address, PARTIAL_AMOUNT);

                    expect(stabilityPoolFake.withdrawFromSP).to.be.calledWith(PARTIAL_AMOUNT);
                    expect(treasuryFake.deposit).to.be.calledWith(
                        PARTIAL_AMOUNT,
                        lusdTokenFake.address,
                        PARTIAL_VALUE
                    );
                    expect(lusdTokenFake.balanceOf).to.be.calledWith(lusdAllocator.address);

                    expect(await lusdAllocator.totalAmountDeployed()).to.equal(
                        DEPOSIT_AMOUNT - PARTIAL_AMOUNT
                    );
                    expect(await lusdAllocator.totalValueDeployed()).to.equal(
                        DEPOSIT_VALUE - PARTIAL_VALUE
                    );
                });

                it("withdraw LQTY", async () => {
                    const PARTIAL_AMOUNT = 4321;
                    const PARTIAL_VALUE = PARTIAL_AMOUNT * 10 ** 8;
                    lqtyTokenFake.decimals.returns(1);
                    lqtyTokenFake.balanceOf
                        .whenCalledWith(lusdAllocator.address)
                        .returns(PARTIAL_AMOUNT);
                    lqtyTokenFake.transfer
                        .whenCalledWith(treasuryFake.address, PARTIAL_AMOUNT)
                        .returns(true);
                    // treasuryFake.tokenValue.whenCalledWith(lqtyTokenFake.address, PARTIAL_AMOUNT).returns(PARTIAL_VALUE);
                    await lusdAllocator
                        .connect(guardian)
                        .withdraw(lqtyTokenFake.address, PARTIAL_AMOUNT);

                    expect(lqtyStakingFake.unstake).to.be.calledWith(PARTIAL_AMOUNT);
                    // expect(treasuryFake.deposit).to.be.calledWith(PARTIAL_AMOUNT, lqtyTokenFake.address, PARTIAL_VALUE);
                    expect(lqtyTokenFake.balanceOf).to.be.calledWith(lusdAllocator.address);
                    expect(lqtyTokenFake.transfer).to.be.calledWith(
                        treasuryFake.address,
                        PARTIAL_AMOUNT
                    );
                });

                it("reverts if non-LUSD non-LQTY token is passed", async () => {
                    await expect(
                        lusdAllocator.connect(guardian).withdraw(other.address, 12345)
                    ).to.be.revertedWith("token address does not match LUSD nor LQTY token");
                });
            });
        });
    });

    interface IOldTreasury {
        enable: any;
        toggle: any;
        connect: any;
        address: string;
    }

    async function advance(count: number) {
        for (let i = 0; i < count; i++) {
            await advanceBlock();
        }
    }

    describe.skip("integration tests", () => {
        let owner: SignerWithAddress;
        let manager: SignerWithAddress;
        let allocator: LUSDAllocator;
        let oldTreasury: IOldTreasury;
        let lusd: IERC20;
        let lusdStabilityPool: IStabilityPool;

        const LUSD_TOKEN_ADDRESS = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
        const STABILITY_POOL_ADDRESS = "0x66017D22b0f8556afDd19FC67041899Eb65a21bb";
        // const ACTIVE_POOL = "0x741d21A9dd5dcc14cc5cd84cD91fd74638AFA313";
        // const DEFAULT_POOL = "0x896a3F03176f05CFbb4f006BfCd8723F2B0D741C";

        before(async () => {
            await fork_network(13797676);

            const OLYMPUS_AUTHORITY = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";
            const TREASURY_ADDRESS = "0x31f8cc382c9898b273eff4e0b7626a6987c846e8";
            const TREASURY_MANAGER = "0x245cc372c84b3645bf0ffe6538620b04a217988b"; //This is also our guardian
            const LQTY_TOKEN_ADDRESS = "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D";
            const LQTY_STAKING_ADDRESS = "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d";
            const WETH_ADDRESS = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
            const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
            const UNISWAPV3_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

            [owner] = await ethers.getSigners();
            allocator = await new LUSDAllocator__factory(owner).deploy(
                OLYMPUS_AUTHORITY,
                TREASURY_ADDRESS,
                LUSD_TOKEN_ADDRESS,
                LQTY_TOKEN_ADDRESS,
                STABILITY_POOL_ADDRESS,
                LQTY_STAKING_ADDRESS,
                ZERO_ADDRESS,
                WETH_ADDRESS,
                DAI_ADDRESS,
                UNISWAPV3_ROUTER_ADDRESS
            );

            oldTreasury = new ethers.Contract(
                TREASURY_ADDRESS,
                oldTreasuryAbi,
                ethers.provider
            ) as unknown as IOldTreasury;
            lusd = new ethers.Contract(LUSD_TOKEN_ADDRESS, lusdAbi, ethers.provider) as IERC20;
            lusdStabilityPool = new ethers.Contract(
                STABILITY_POOL_ADDRESS,
                lusdStabilityPoolAbi,
                ethers.provider
            ) as IStabilityPool;

            await impersonateAccount(TREASURY_MANAGER);
            manager = await ethers.getSigner(TREASURY_MANAGER);
        });

        after(async () => {
            await fork_reset();
        });

        // these tests are not independent
        const TREASURY_BALANCE = ethers.BigNumber.from("76679064561310247224296926");
        const STABILITY_POOL_BALANCE = ethers.BigNumber.from("565196951535056715675940849");
        const DEPOSIT_AMOUNT = ethers.BigNumber.from("6811323944565489588901");
        const DEPOSIT_AMOUNT_2 = ethers.BigNumber.from("4324323944565482342342");

        const STABILITY_POOL_TOTAL_BALANCE = ethers.BigNumber.from("565203762859001281165529750");
        const ZERO = ethers.BigNumber.from("0");

        it("cannot deposit without RESERVE_MANAGER role", async () => {
            await expect(allocator.connect(manager).deposit(1)).to.be.revertedWith("Not approved");
        });

        it("perform deposit, withdrawal", async () => {
            // enable RESERVEMANAGER role
            await oldTreasury.connect(manager).queue(3, allocator.address);
            // enable RESERVEDEPOSITOR role
            await oldTreasury.connect(manager).queue(0, allocator.address);

            await advance(13000);
            await oldTreasury.connect(manager).toggle(3, allocator.address, allocator.address);
            await oldTreasury.connect(manager).toggle(0, allocator.address, allocator.address);

            const treasuryBefore = await lusd.balanceOf(oldTreasury.address);
            expect(treasuryBefore).to.equal(TREASURY_BALANCE);

            const stabilityPoolBefore = await lusd.balanceOf(lusdStabilityPool.address);
            expect(stabilityPoolBefore).to.equal(STABILITY_POOL_BALANCE);

            await expect(allocator.connect(manager).deposit(DEPOSIT_AMOUNT))
                .to.emit(lusdStabilityPool, "G_Updated")
                .withArgs(ethers.BigNumber.from("350461943063989161432445055694169347038"), 0, 0)
                // .not.to.emit(lusdStabilityPool, "LQTYPaidToFrontEnd").withArgs(ZERO_ADDRESS, 0)          //How to get NOT emit to work??!
                .to.emit(lusdStabilityPool, "LQTYPaidToDepositor")
                .withArgs(allocator.address, 0)
                .to.emit(lusdStabilityPool, "FrontEndStakeChanged")
                .withArgs(
                    ZERO_ADDRESS,
                    ethers.BigNumber.from("45632567909241122202977270"),
                    allocator.address
                )
                .to.emit(lusdStabilityPool, "StabilityPoolLUSDBalanceUpdated")
                .withArgs(STABILITY_POOL_TOTAL_BALANCE)
                .to.emit(lusdStabilityPool, "DepositSnapshotUpdated")
                .withArgs(
                    allocator.address,
                    ethers.BigNumber.from("876920926160447076"),
                    ethers.BigNumber.from("58089263752322121983911170457988"),
                    ethers.BigNumber.from("350461943063989161432445055694169347038")
                )
                .to.emit(lusdStabilityPool, "UserDepositChanged")
                .withArgs(allocator.address, DEPOSIT_AMOUNT)
                .to.emit(lusdStabilityPool, "ETHGainWithdrawn")
                .withArgs(allocator.address, ZERO, ZERO)
                .to.emit(oldTreasury, "ReservesUpdated")
                .withArgs(ethers.BigNumber.from("168613073893284949"))
                .to.emit(oldTreasury, "ReservesManaged")
                .withArgs(LUSD_TOKEN_ADDRESS, DEPOSIT_AMOUNT);
            const treasuryAfter = await lusd.balanceOf(oldTreasury.address);
            expect(treasuryAfter).to.equal(TREASURY_BALANCE.sub(DEPOSIT_AMOUNT));

            const stabilityPoolAfter = await lusd.balanceOf(lusdStabilityPool.address);
            expect(stabilityPoolAfter).to.equal(STABILITY_POOL_BALANCE.add(DEPOSIT_AMOUNT));

            const deployedAfter = await allocator.totalAmountDeployed();
            expect(deployedAfter).to.equal(DEPOSIT_AMOUNT);

            await advance(1000);

            const ethRewards = await allocator.getETHRewards();
            const lqtyRewards = await allocator.getLQTYRewards();

            expect(ethRewards).to.equal(ZERO);
            expect(lqtyRewards).to.equal(ZERO);

            await expect(allocator.connect(manager).deposit(DEPOSIT_AMOUNT_2))
                .to.emit(lusdStabilityPool, "G_Updated")
                .withArgs(ethers.BigNumber.from("350461943753146787543868841926858937250"), 0, 0)
                .to.emit(lusdStabilityPool, "DepositSnapshotUpdated")
                .withArgs(
                    allocator.address,
                    ethers.BigNumber.from("876920926160447076"),
                    ethers.BigNumber.from("58089263752322121983911170457988"),
                    ethers.BigNumber.from("350461943753146787543868841926858937250")
                );
        });
    });
});
