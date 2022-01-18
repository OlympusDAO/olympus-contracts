import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai, { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
    IERC20,
    ITreasury,
    IveFXSYieldDistributorV4,
    IveFXS,
    FraxSharesAllocator,
    OlympusTreasury,
    ERC20,
} from "../../types";
const { fork_network, fork_reset } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const { advanceBlock, duration, increase } = require("../utils/advancement");
const fxsAbi = require("../../abis/fxs.json");
const vefxsAbi = require("../../abis/vefxs.json");
const oldTreasuryAbi = require("../../abis/old_treasury_abi.json");
const vefxsYieldDistV4Abi = require("../../abis/vefxs_yield_distributor_v4.json");
const smartWalletCheckerAbi = require("../../abis/vefxs_smart_wallet_checker.json");

chai.use(smock.matchers);

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
const MAX_TIME = 4 * 365 * 86400 + 1;

describe("FraxSharesAllocator", () => {
    describe("unit tests", () => {
        let owner: SignerWithAddress;
        let other: SignerWithAddress;
        let alice: SignerWithAddress;
        let bob: SignerWithAddress;
        let treasuryFake: FakeContract<ITreasury>;
        let veFXSYieldDistributorFake: FakeContract<IveFXSYieldDistributorV4>;
        let veFXSFake: FakeContract<IveFXS>;
        let fxsFake: FakeContract<IERC20>;

        beforeEach(async () => {
            [owner, other, alice, bob] = await ethers.getSigners();
            treasuryFake = await smock.fake<ITreasury>("ITreasury");
            veFXSYieldDistributorFake = await smock.fake<IveFXSYieldDistributorV4>(
                "IveFXSYieldDistributorV4"
            );
            veFXSFake = await smock.fake<IveFXS>("IveFXS");
            fxsFake = await smock.fake<IERC20>("contracts/interfaces/IERC20.sol:IERC20");
        });

        describe("initilize", () => {
            it("can initialize", async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                const allocator = (await upgrades.deployProxy(contract, [
                    treasuryFake.address,
                    fxsFake.address,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                ])) as FraxSharesAllocator;
            });

            it("reverts on zero treasury address", async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                await expect(
                    upgrades.deployProxy(contract, [
                        ZERO_ADDRESS,
                        fxsFake.address,
                        veFXSFake.address,
                        veFXSYieldDistributorFake.address,
                    ])
                ).to.be.revertedWith("zero treasury address");
            });

            it("reverts on zero FXS address", async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                await expect(
                    upgrades.deployProxy(contract, [
                        treasuryFake.address,
                        ZERO_ADDRESS,
                        veFXSFake.address,
                        veFXSYieldDistributorFake.address,
                    ])
                ).to.be.revertedWith("zero FXS address");
            });

            it("reverts on zero veFXS address", async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                await expect(
                    upgrades.deployProxy(contract, [
                        treasuryFake.address,
                        fxsFake.address,
                        ZERO_ADDRESS,
                        veFXSYieldDistributorFake.address,
                    ])
                ).to.be.revertedWith("zero veFXS address");
            });

            it("reverts on zero veFXSYieldDistributorV4 address", async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                await expect(
                    upgrades.deployProxy(contract, [
                        treasuryFake.address,
                        fxsFake.address,
                        veFXSFake.address,
                        ZERO_ADDRESS,
                    ])
                ).to.be.revertedWith("zero veFXSYieldDistributorV4 address");
            });
        });

        describe("post-initialization", () => {
            let allocator: FraxSharesAllocator;

            beforeEach(async () => {
                const contract = await ethers.getContractFactory("FraxSharesAllocator");
                allocator = (await upgrades.deployProxy(contract, [
                    treasuryFake.address,
                    fxsFake.address,
                    veFXSFake.address,
                    veFXSYieldDistributorFake.address,
                ])) as FraxSharesAllocator;
            });

            describe("deposit", () => {
                it("can only be called by the owner", async () => {
                    await expect(allocator.connect(alice).deposit(1000)).to.be.reverted;
                });

                it("requests funds from the treasury and tracks the deployed amount", async () => {
                    const AMOUNT = 100;

                    fxsFake.approve.whenCalledWith(veFXSFake.address, AMOUNT).returns(true);

                    await allocator.deposit(AMOUNT);

                    expect(treasuryFake.manage).to.be.calledWith(fxsFake.address, AMOUNT);
                    expect(await allocator.totalAmountDeployed()).to.equal(AMOUNT);
                });

                it("creates a new lock on first call", async () => {
                    const AMOUNT = 100;
                    fxsFake.approve.whenCalledWith(veFXSFake.address, AMOUNT).returns(true);
                    const receipt = await allocator.deposit(AMOUNT);
                    const block = await ethers.provider.getBlock(receipt.blockNumber as number);

                    expect(veFXSFake.create_lock).to.be.calledWith(
                        AMOUNT,
                        block.timestamp + MAX_TIME
                    );
                });

                it("doesn't increase time when called within 1 week", async () => {
                    const AMOUNT = 100;
                    fxsFake.approve.whenCalledWith(veFXSFake.address, AMOUNT).returns(true);
                    await allocator.deposit(AMOUNT);
                    await allocator.deposit(AMOUNT);

                    expect(veFXSFake.increase_amount).to.be.calledWith(AMOUNT);
                    expect(veFXSFake.increase_unlock_time).to.not.be.called;
                });

                it("increases amounts and unlock time on subsequent calls", async () => {
                    const AMOUNT = 100;
                    fxsFake.approve.whenCalledWith(veFXSFake.address, AMOUNT).returns(true);
                    await allocator.deposit(AMOUNT);
                    increase(duration.days(8));
                    const receipt = await allocator.deposit(AMOUNT);
                    const block = await ethers.provider.getBlock(receipt.blockNumber as number);

                    expect(veFXSFake.increase_amount).to.be.calledWith(AMOUNT);
                    expect(veFXSFake.increase_unlock_time).to.be.calledWith(
                        block.timestamp + MAX_TIME
                    );
                });
            });

            describe("harvest", () => {
                it("increases total amount deployed by the yield", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.getYield.returns(YIELD);
                    fxsFake.approve.whenCalledWith(veFXSFake.address, YIELD).returns(true);

                    await allocator.harvest();

                    expect(await allocator.totalAmountDeployed()).to.equal(YIELD);
                });

                it("increases veFXS by amount and extends lock", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.getYield.returns(YIELD);
                    fxsFake.approve.whenCalledWith(veFXSFake.address, YIELD).returns(true);

                    const receipt = await allocator.harvest();
                    const block = await ethers.provider.getBlock(receipt.blockNumber as number);

                    expect(veFXSFake.increase_amount).to.be.calledWith(YIELD);
                    expect(veFXSFake.increase_unlock_time).to.be.calledWith(
                        block.timestamp + MAX_TIME
                    );
                });
            });

            describe("getPendingRewards", () => {
                it("delegates to veFXSYieldDistributorV4", async () => {
                    const YIELD = 1000;
                    veFXSYieldDistributorFake.earned
                        .whenCalledWith(allocator.address)
                        .returns(YIELD);

                    expect(await allocator.getPendingRewards()).to.equal(YIELD);
                });
            });

            describe("setTreasury", () => {
                it("can set the treasury", async () => {
                    await allocator.setTreasury(other.address);
                    expect(await allocator.treasury()).to.equal(other.address);
                });

                it("cannot set the treasury to zero address", async () => {
                    await expect(allocator.setTreasury(ZERO_ADDRESS)).to.be.revertedWith(
                        "zero treasury address"
                    );
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

    interface ISmartWalletChecker {
        approveWallet: any;
        connect: any;
        address: string;
    }

    async function advance(count: number) {
        for (let i = 0; i < count; i++) {
            await advanceBlock();
        }
    }

    describe("integration tests", () => {
        let owner: SignerWithAddress;
        let manager: SignerWithAddress;
        let smartWalletOwner: SignerWithAddress;
        let fxsHolder: SignerWithAddress;
        let allocator: FraxSharesAllocator;
        let oldTreasury: IOldTreasury;
        let fxs: IERC20;
        let vefxs: IveFXS;
        let smartWalletChecker: ISmartWalletChecker;
        let vefxsYieldDistV4: IveFXSYieldDistributorV4;

        before(async () => {
            await fork_network(13810795);

            const TREASURY_ADDRESS = "0x31f8cc382c9898b273eff4e0b7626a6987c846e8";
            const FXS_ADDRESS = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
            const VEFXS_ADDRESS = "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0";
            const VEFXS_YIELD_DIST_ADDRESS = "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872";
            const TREASURY_MANAGER = "0x245cc372c84b3645bf0ffe6538620b04a217988b";
            const FXS_SMART_WALLET_CHECKER = "0x53c13ba8834a1567474b19822aad85c6f90d9f9f";
            const FXS_SMART_WALLET_CHECKER_OWNER = "0xb1748c79709f4ba2dd82834b8c82d4a505003f27";
            const FXS_HOLDER = "0x9aa7db8e488ee3ffcc9cdfd4f2eaecc8abedcb48";

            [owner] = await ethers.getSigners();
            const allocatorContract = await ethers.getContractFactory("FraxSharesAllocator");
            allocator = (await upgrades.deployProxy(allocatorContract, [
                TREASURY_ADDRESS, // old treasury address
                FXS_ADDRESS,
                VEFXS_ADDRESS,
                VEFXS_YIELD_DIST_ADDRESS,
            ])) as FraxSharesAllocator;

            // new treasury
            // const TreasuryContract = await ethers.getContractFactory("OlympusTreasury");
            // treasury = await TreasuryContract.attach(TREASURY_ADDRESS) as ITreasuryAdmin;

            oldTreasury = new ethers.Contract(
                TREASURY_ADDRESS,
                oldTreasuryAbi,
                ethers.provider
            ) as unknown as IOldTreasury;
            fxs = new ethers.Contract(FXS_ADDRESS, fxsAbi, ethers.provider) as IERC20;
            vefxs = new ethers.Contract(VEFXS_ADDRESS, vefxsAbi, ethers.provider) as IveFXS;
            vefxsYieldDistV4 = new ethers.Contract(
                VEFXS_YIELD_DIST_ADDRESS,
                vefxsYieldDistV4Abi,
                ethers.provider
            ) as IveFXSYieldDistributorV4;

            smartWalletChecker = new ethers.Contract(
                FXS_SMART_WALLET_CHECKER,
                smartWalletCheckerAbi,
                ethers.provider
            ) as unknown as ISmartWalletChecker;

            await impersonateAccount(TREASURY_MANAGER);
            manager = await ethers.getSigner(TREASURY_MANAGER);

            await impersonateAccount(FXS_SMART_WALLET_CHECKER_OWNER);
            smartWalletOwner = await ethers.getSigner(FXS_SMART_WALLET_CHECKER_OWNER);

            await impersonateAccount(FXS_HOLDER);
            fxsHolder = await ethers.getSigner(FXS_HOLDER);
        });

        after(async () => {
            await fork_reset();
        });

        // these tests are not independent
        const TREASURY_BALANCE = ethers.BigNumber.from("166811323944565489588901");
        const FIRST_DEPOSIT = ethers.BigNumber.from("6811323944565489588901");
        const SECOND_DEPOSIT = ethers.BigNumber.from("60000000000000000000000");
        const THIRD_DEPOSIT = ethers.BigNumber.from("60000000000000000000000");

        it("cannot deposit without RESERVE_MANAGER role", async () => {
            await expect(allocator.connect(owner).deposit(1)).to.be.revertedWith("Not approved");
        });

        it("cannot deposit without veFXS whitelist", async () => {
            // enable RESERVEMANAGER role
            await oldTreasury.connect(manager).queue(3, allocator.address);
            await advance(13000);
            await oldTreasury.connect(manager).toggle(3, allocator.address, allocator.address);

            await expect(allocator.connect(owner).deposit(1)).to.be.revertedWith(
                "Smart contract depositors not allowed"
            );
        });

        it("can perform initial deposit", async () => {
            // whitelist allocator as not a "smart contract"
            await smartWalletChecker.connect(smartWalletOwner).approveWallet(allocator.address);

            const treasuryBefore = await fxs.balanceOf(oldTreasury.address);
            expect(treasuryBefore).to.equal(TREASURY_BALANCE);

            await allocator.connect(owner).deposit(FIRST_DEPOSIT);

            const treasuryAfter = await fxs.balanceOf(oldTreasury.address);
            // small margin of error (some tests are off by 1 / 1e18)
            expect(Number(treasuryAfter)).to.lessThanOrEqual(
                Number(TREASURY_BALANCE.sub(FIRST_DEPOSIT))
            );
            expect(Number(treasuryAfter)).to.greaterThanOrEqual(
                Number(TREASURY_BALANCE.sub(FIRST_DEPOSIT)) * 0.9999999
            );

            const deployedAfter = await allocator.totalAmountDeployed();
            expect(deployedAfter).to.equal(FIRST_DEPOSIT);
        });

        it("has created a veFXS balance", async () => {
            const veFXSBalance = await (vefxs as any)["balanceOf(address)"](allocator.address);
            // this is a little shy of 4x and I'm not quite sure why
            // it also isn't quite stable because of how veFXS rounds the lock end
            // to the nearest week
            expect(veFXSBalance.toString()).to.match(/^2719158\d{16}/);
        });

        it("can perform an additional deposit without extending lock", async () => {
            const treasuryBefore = await fxs.balanceOf(oldTreasury.address);
            expect(treasuryBefore).to.equal(TREASURY_BALANCE.sub(FIRST_DEPOSIT));

            const oldLockEnd = await vefxs.locked__end(allocator.address);

            await allocator.connect(owner).deposit(SECOND_DEPOSIT);

            const treasuryAfter = await fxs.balanceOf(oldTreasury.address);
            expect(treasuryAfter).to.equal(TREASURY_BALANCE.sub(FIRST_DEPOSIT).sub(SECOND_DEPOSIT));

            const deployedAfter = await allocator.totalAmountDeployed();
            expect(deployedAfter).to.equal(FIRST_DEPOSIT.add(SECOND_DEPOSIT));

            expect(oldLockEnd).to.equal(await vefxs.locked__end(allocator.address));
        });

        it("will extend the lock when possible", async function () {
            const treasuryBefore = await fxs.balanceOf(oldTreasury.address);
            expect(treasuryBefore).to.equal(
                TREASURY_BALANCE.sub(FIRST_DEPOSIT).sub(SECOND_DEPOSIT)
            );

            const oldLockEnd = await vefxs.locked__end(allocator.address);

            await increase(duration.days(8));

            await allocator.connect(owner).deposit(THIRD_DEPOSIT);

            const treasuryAfter = await fxs.balanceOf(oldTreasury.address);
            // small margin of error (some tests are off by 1 / 1e18)
            expect(Number(treasuryAfter)).to.lessThanOrEqual(
                Number(TREASURY_BALANCE.sub(FIRST_DEPOSIT).sub(SECOND_DEPOSIT).sub(THIRD_DEPOSIT))
            );
            expect(Number(treasuryAfter)).to.greaterThanOrEqual(
                Number(TREASURY_BALANCE.sub(FIRST_DEPOSIT).sub(SECOND_DEPOSIT).sub(THIRD_DEPOSIT)) *
                    0.9999999
            );

            const deployedAfter = await allocator.totalAmountDeployed();
            expect(deployedAfter).to.equal(FIRST_DEPOSIT.add(SECOND_DEPOSIT).add(THIRD_DEPOSIT));

            const NEW_LOCK_END = 1766016000; // the next week
            expect(await vefxs.locked__end(allocator.address)).to.equal(NEW_LOCK_END);
        });

        it("can harvest when there are no rewards", async () => {
            const deployedBefore = await allocator.totalAmountDeployed();
            const pendingRewards = await allocator.connect(owner).getPendingRewards();
            expect(pendingRewards).to.equal(0);

            await allocator.connect(owner).harvest();

            const deployedAfter = await allocator.totalAmountDeployed();
            expect(deployedAfter).to.equal(deployedBefore);
        });

        it("stage some rewards to be harvested", async () => {
            await vefxsYieldDistV4.connect(owner).checkpointOtherUser(allocator.address);
            const REWARD_AMOUNT = "100000000000000000000";
            vefxsYieldDistV4.connect(smartWalletOwner).toggleRewardNotifier(fxsHolder.address);
            await fxs.connect(fxsHolder).approve(vefxsYieldDistV4.address, REWARD_AMOUNT);
            // send 100 FXS as rewards for the next period from some random wallet
            await vefxsYieldDistV4.connect(fxsHolder).notifyRewardAmount(REWARD_AMOUNT);

            // advance time until rewards available
            const timeUntilYield = await vefxsYieldDistV4.connect(fxsHolder).yieldDuration();
            await increase((timeUntilYield as any).toNumber());

            // view the pending rewards, which varies a bit because of how we advance time
            const pendingRewards = await allocator.connect(owner).getPendingRewards();
            expect(pendingRewards.toString()).to.match(/^869583\d{12}/);
        });

        it("can harvest and re-lock FXS", async () => {
            const deployedBefore = await allocator.totalAmountDeployed();
            const pendingRewards = await allocator.connect(owner).getPendingRewards();
            await allocator.connect(owner).harvest();

            const deployedAfter = await allocator.totalAmountDeployed();
            const diff = deployedAfter.sub(deployedBefore).sub(pendingRewards);
            expect(diff.toNumber()).to.be.lessThan(1410742941);
        });

        it("keeps veFXS after a contract upgrade", async () => {
            const NewContract = await ethers.getContractFactory("FraxSharesAllocatorVNext");
            const newAllocator = await upgrades.upgradeProxy(allocator.address, NewContract);

            const veFXSAfter = await (vefxs as any)["balanceOf(address)"](newAllocator.address);

            expect(await newAllocator.didUpgrade()).to.be.true;

            // we lose some after a few blocks pass
            expect(veFXSAfter.toString()).to.match(/^505988\d{18}/);
        });
    });
});
