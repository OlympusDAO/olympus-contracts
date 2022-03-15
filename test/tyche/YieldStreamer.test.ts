import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import chai, { expect } from "chai";
import {
    OlympusStaking,
    OlympusERC20Token,
    GOHM,
    OlympusAuthority,
    DAI,
    SOlympus,
    OlympusTreasury,
    Distributor,
    YieldStreamer,
    IUniswapV2Router,
} from "../../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { toDecimals, toOhm, advanceEpoch, fromDecimals } from "../utils/Utilities";
import { FakeContract, smock } from "@defi-wonderland/smock";

describe("YieldStreamer", async () => {
    const LARGE_APPROVAL = "100000000000000000000000000000000";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = toDecimals(10000000);
    // Reward rate of .1%
    const initialRewardRate = "1000";

    const triggerRebase = async () => {
        advanceEpoch(); // 8 hours per rebase
        await staking.rebase();
        return await sOhm.index();
    };

    chai.use(smock.matchers);

    let deployer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let erc20Factory: ContractFactory;
    let stakingFactory: ContractFactory;
    let ohmFactory: ContractFactory;
    let sOhmFactory: ContractFactory;
    let gOhmFactory: ContractFactory;
    let treasuryFactory: ContractFactory;
    let distributorFactory: ContractFactory;
    let authFactory: ContractFactory;
    let yieldStreamerFactory: ContractFactory;

    let auth: OlympusAuthority;
    let dai: DAI;
    let ohm: OlympusERC20Token;
    let sOhm: SOlympus;
    let staking: OlympusStaking;
    let gOhm: GOHM;
    let treasury: OlympusTreasury;
    let distributor: Distributor;
    let yieldStreamer: YieldStreamer;
    let sushiRouter: FakeContract<IUniswapV2Router>;

    before(async () => {
        [deployer, alice, bob] = await ethers.getSigners();
        authFactory = await ethers.getContractFactory("OlympusAuthority");
        erc20Factory = await ethers.getContractFactory("DAI");
        stakingFactory = await ethers.getContractFactory("OlympusStaking");
        ohmFactory = await ethers.getContractFactory("OlympusERC20Token");
        sOhmFactory = await ethers.getContractFactory("sOlympus");
        gOhmFactory = await ethers.getContractFactory("gOHM");
        treasuryFactory = await ethers.getContractFactory("OlympusTreasury");
        distributorFactory = await ethers.getContractFactory("Distributor");
        yieldStreamerFactory = await ethers.getContractFactory("YieldStreamer");
        sushiRouter = await smock.fake<IUniswapV2Router>("IUniswapV2Router");
    });

    beforeEach(async () => {
        dai = (await erc20Factory.deploy(0)) as DAI;
        auth = (await authFactory.deploy(
            deployer.address,
            deployer.address,
            deployer.address,
            deployer.address
        )) as OlympusAuthority;
        ohm = (await ohmFactory.deploy(auth.address)) as OlympusERC20Token;
        sOhm = (await sOhmFactory.deploy()) as SOlympus;
        gOhm = (await gOhmFactory.deploy(deployer.address, sOhm.address)) as GOHM;
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        staking = (await stakingFactory.deploy(
            ohm.address,
            sOhm.address,
            gOhm.address,
            "28800", // 1 epoch = 8 hours
            "1",
            blockBefore.timestamp + 28800, // First epoch in 8 hours. Avoids first deposit to set epoch.distribute wrong
            auth.address
        )) as OlympusStaking;
        await gOhm.migrate(staking.address, sOhm.address);
        treasury = (await treasuryFactory.deploy(
            ohm.address,
            "0",
            auth.address
        )) as OlympusTreasury;
        distributor = (await distributorFactory.deploy(
            treasury.address,
            ohm.address,
            staking.address,
            auth.address
        )) as Distributor;
        yieldStreamer = (await yieldStreamerFactory.deploy(
            gOhm.address,
            sOhm.address,
            ohm.address,
            dai.address,
            sushiRouter.address,
            staking.address,
            auth.address,
            1000,
            1000,
            toDecimals(1)
        )) as YieldStreamer;

        // Setup for each component

        // Needed for treasury deposit
        await dai.mint(deployer.address, initialMint);
        await dai.approve(treasury.address, LARGE_APPROVAL);

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, LARGE_APPROVAL);

        // To get past OHM contract guards
        await auth.pushVault(treasury.address, true);

        // Initialization for sOHM contract.
        // Set index to 10
        await sOhm.setIndex("10000000000");
        await sOhm.setgOHM(gOhm.address);
        await sOhm.initialize(staking.address, treasury.address);

        // Set distributor staking contract
        await staking.setDistributor(distributor.address);

        // queue and toggle reward manager
        await treasury.enable("8", distributor.address, ZERO_ADDRESS);
        // queue and toggle deployer reserve depositor
        await treasury.enable("0", deployer.address, ZERO_ADDRESS);
        // queue and toggle liquidity depositor
        await treasury.enable("4", deployer.address, ZERO_ADDRESS);
        // queue and toggle DAI as reserve token
        await treasury.enable("2", dai.address, ZERO_ADDRESS);

        // Deposit 10,000 DAI to treasury, 1,000 OHM gets minted to deployer with 9000 as excess reserves (ready to be minted)
        await treasury.connect(deployer).deposit(toDecimals(10000), dai.address, toOhm(9000));

        // Add staking as recipient of distributor with a test reward rate
        await distributor.addRecipient(staking.address, initialRewardRate);

        // Get sOHM in deployer wallet
        const sohmAmount = toOhm(1000);
        await ohm.approve(staking.address, sohmAmount);
        await staking.stake(deployer.address, sohmAmount, true, true);
        await triggerRebase(); // Trigger first rebase to set initial distribute amount. This rebase shouldn't update index.

        // Transfer 100 sOHM to alice for testing
        await sOhm.transfer(alice.address, toOhm(100));

        // Alice should wrap ohm to gOhm. Should have 10gOhm
        await sOhm.approve(staking.address, LARGE_APPROVAL);
        await staking.wrap(deployer.address, toOhm(500));
        await sOhm.connect(alice).approve(staking.address, LARGE_APPROVAL);
        await staking.connect(alice).wrap(alice.address, toOhm(100));

        await gOhm.connect(alice).approve(yieldStreamer.address, LARGE_APPROVAL);
        await gOhm.connect(deployer).approve(yieldStreamer.address, LARGE_APPROVAL);
        await dai.connect(deployer).transfer(yieldStreamer.address, toDecimals(1000000)); // Give dai to yieldstreamer so it has dai to pay out. Mocking the ohm dai swap with smock.
    });

    it("should rebase properly", async () => {
        await expect(await sOhm.index()).is.equal("10000000000");
        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10010000000");
        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10020010000");
        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10030030010");
    });

    it("Upkeep sends correct amount of dai to recipients. Deposit and Upkeep info updated correctly.", async () => {
        await yieldStreamer
            .connect(deployer)
            .deposit(toDecimals(10), bob.address, 1, toDecimals(5));
        await expect(
            await yieldStreamer
                .connect(alice)
                .deposit(toDecimals(10), alice.address, 1, toDecimals(5))
        ).to.emit(yieldStreamer, "Deposited");

        await expect(await yieldStreamer.idCount()).is.equal("2");
        await expect((await yieldStreamer.depositInfo(0)).principalAmount).is.equal(toOhm(100));
        await expect((await yieldStreamer.recipientInfo(0)).recipientAddress).is.equal(bob.address);
        await expect((await yieldStreamer.recipientInfo(0)).paymentInterval).is.equal(1);
        await expect((await yieldStreamer.recipientInfo(0)).userMinimumAmountThreshold).is.equal(
            toDecimals(5)
        );
        await expect(await yieldStreamer.activeDepositIds(1)).is.equal(1);

        await triggerRebase();

        const expectedYield = await gOhm.balanceTo(toOhm(0.1)); // yield is 0.1sOhm convert this to gOhm
        const actualYield = await yieldStreamer.getOutstandingYield(0);
        await expect(actualYield).is.closeTo(expectedYield, 1); // 1 digit off due to precision issues of converting gOhm to sOhm and back to gOhm.

        const amountOfDai = toOhm(0.2).mul(100).mul(1000000000).mul(999).div(1000); // Mock the amount of Dai coming out of swap.
        sushiRouter.getAmountsOut.returns([BigNumber.from("0"), amountOfDai]);
        sushiRouter.swapExactTokensForTokens.returns([BigNumber.from("0"), amountOfDai]);

        await yieldStreamer.upkeep();

        await expect(await dai.balanceOf(bob.address)).is.equal(amountOfDai.div(2));
        await expect(await dai.balanceOf(alice.address)).is.equal(amountOfDai.div(2));
    });

    it("Adding to deposit calculates agnostic with changing index. Withdrawing does not withdraw more gOhm than there is.", async () => {
        await yieldStreamer.connect(alice).deposit(toDecimals(5), alice.address, 1, toDecimals(5)); //5 gOhm deposited, 50 sOhm principal
        await triggerRebase();

        await expect((await yieldStreamer.depositInfo(0)).principalAmount).is.equal(toOhm(50)); // still should be 100sOhm but less gOhm
        await expect((await yieldStreamer.depositInfo(0)).agnosticAmount).is.equal(toDecimals(5)); // still should be 10gOhm. But its more than 100 sOhm

        await yieldStreamer.connect(alice).addToDeposit(0, toDecimals(5)); // add another 5gOhm or 50.05 sOhm since index change
        await expect((await yieldStreamer.depositInfo(0)).principalAmount).is.equal(toOhm(100.05)); // total sOhm should be 100.05
        await expect((await yieldStreamer.depositInfo(0)).agnosticAmount).is.equal(toDecimals(10)); // agnostic should be 20 gOhm or 200.2 sOhm.

        const expectedYield = await gOhm.balanceTo(toOhm(0.05)); // yield is 0.05sOhm convert this to gOhm
        const actualYield = await yieldStreamer.getOutstandingYield(0);
        await expect(actualYield).is.closeTo(expectedYield, 1); // 1 digit off due to precision issues of converting gOhm to sOhm and back to gOhm.

        await yieldStreamer.connect(alice).withdrawYield(0);
        await expect(await gOhm.balanceOf(alice.address)).is.equal(actualYield);

        let principalInGOHM = await yieldStreamer.getPrincipalInGOHM(0);
        await yieldStreamer.connect(alice).withdrawPrincipal(0, toDecimals(10));
        await expect(await gOhm.balanceOf(alice.address)).is.equal(
            principalInGOHM.add(actualYield)
        );
    });

    it("withdrawing all yield does it for all deposits recipient is liable for", async () => {
        await yieldStreamer
            .connect(deployer)
            .deposit(toDecimals(10), alice.address, 1, toDecimals(5));
        await yieldStreamer.connect(alice).deposit(toDecimals(10), alice.address, 1, toDecimals(5));
        await triggerRebase();
        await expect(await gOhm.balanceOf(alice.address)).is.equal("0");

        let expectedYield = await yieldStreamer.getOutstandingYield(0);

        await yieldStreamer.connect(alice).withdrawAllYield();
        await expect(await yieldStreamer.getOutstandingYield(0)).is.equal(0);
        await expect(await yieldStreamer.getOutstandingYield(1)).is.equal(0);
        await expect(await gOhm.balanceOf(alice.address)).is.equal(expectedYield.mul(2));
    });

    it("withdrawing part of principal", async () => {
        await yieldStreamer.connect(alice).deposit(toDecimals(10), alice.address, 1, toDecimals(5)); //10gOhm deposited. 100sOhm principal
        await triggerRebase();
        await expect(await gOhm.balanceOf(alice.address)).is.equal("0");

        await expect(
            await yieldStreamer.connect(alice).withdrawPrincipal(0, toDecimals(5))
        ).to.emit(yieldStreamer, "Withdrawn"); // withdraw 5 gOhm principal should be a bit less than 100sOhm since rebase happened
        await expect(await gOhm.balanceOf(alice.address)).is.equal(toDecimals(5));
        await expect((await yieldStreamer.depositInfo(0)).principalAmount).is.equal(toOhm(49.95));
    });

    it("harvest unclaimed dai premature", async () => {
        await yieldStreamer
            .connect(alice)
            .deposit(toDecimals(10), alice.address, 1, toDecimals(1000));
        await triggerRebase();

        const amountOfDai = toOhm(0.1).mul(100).mul(1000000000); // Mock the amount of Dai coming out of swap. 0.1 Ohm should give roughly 10 DAi. Assuming Ohm=100DAI
        sushiRouter.getAmountsOut.returns([BigNumber.from("0"), amountOfDai]);
        sushiRouter.swapExactTokensForTokens.returns([BigNumber.from("0"), amountOfDai]);

        await expect(await yieldStreamer.upkeep()).to.emit(yieldStreamer, "UpkeepComplete");

        await expect((await yieldStreamer.recipientInfo(0)).unclaimedStreamTokens).is.equals(
            toDecimals(10)
        );
        await yieldStreamer.connect(alice).harvestStreamTokens(0);
        await expect(await dai.balanceOf(alice.address)).is.equals(toDecimals(10));
    });

    it("Disabled functions revert", async () => {
        await yieldStreamer.disableDeposits(true);
        await expect(
            yieldStreamer.deposit(toDecimals(5), alice.address, 1, toDecimals(5))
        ).to.be.revertedWith("DepositDisabled");
        await expect(yieldStreamer.addToDeposit(0, toDecimals(5))).to.be.revertedWith(
            "DepositDisabled"
        );
        await yieldStreamer.disableDeposits(false);
        await yieldStreamer.connect(alice).deposit(toDecimals(10), alice.address, 1, toDecimals(5));

        await triggerRebase();
        await yieldStreamer.disableUpkeep(true);
        await expect(yieldStreamer.upkeep()).to.be.revertedWith("UpkeepDisabled");

        await yieldStreamer.disableWithdrawals(true);
        await expect(yieldStreamer.withdrawPrincipal(0, toDecimals(10))).to.be.revertedWith(
            "WithdrawDisabled"
        );
        await expect(yieldStreamer.withdrawYield(0)).to.be.revertedWith("WithdrawDisabled");
        await expect(yieldStreamer.withdrawYieldInStreamTokens(0)).to.be.revertedWith(
            "WithdrawDisabled"
        );
        await expect(yieldStreamer.harvestStreamTokens(0)).to.be.revertedWith("WithdrawDisabled");
    });

    it("User can update user settings", async () => {
        await yieldStreamer
            .connect(alice)
            .deposit(toDecimals(10), alice.address, 604800, toDecimals(1000));

        await yieldStreamer.connect(alice).updatePaymentInterval(0, 2419200);
        await yieldStreamer.connect(alice).updateUserMinDaiThreshold(0, toDecimals(2000));

        await expect((await yieldStreamer.recipientInfo(0)).paymentInterval).is.equal(2419200);
        await expect((await yieldStreamer.recipientInfo(0)).userMinimumAmountThreshold).is.equal(
            toDecimals(2000)
        );
    });

    it("Governor can update contract settins", async () => {
        await expect(await yieldStreamer.maxSwapSlippagePercent()).is.equal(1000);
        await expect(await yieldStreamer.feeToDaoPercent()).is.equal(1000);
        await expect(await yieldStreamer.minimumTokenThreshold()).is.equal(toDecimals(1));

        await yieldStreamer.setMaxSwapSlippagePercent(10);
        await yieldStreamer.setFeeToDaoPercent(10);
        await yieldStreamer.setminimumTokenThreshold(toDecimals(1000));

        await expect(await yieldStreamer.maxSwapSlippagePercent()).is.equal(10);
        await expect(await yieldStreamer.feeToDaoPercent()).is.equal(10);
        await expect(await yieldStreamer.minimumTokenThreshold()).is.equal(toDecimals(1000));
    });

    it("Upkeep Eligibility returns correct values", async () => {
        await yieldStreamer
            .connect(deployer)
            .deposit(toDecimals(10), bob.address, 1, toDecimals(5));
        await yieldStreamer.connect(alice).deposit(toDecimals(10), alice.address, 1, toDecimals(5));

        await triggerRebase();

        let yieldPerDeposit = await yieldStreamer.getOutstandingYield(0);
        let upkeepEligibility = await yieldStreamer.upkeepEligibility();
        await expect(upkeepEligibility[0]).is.equals("2");
        await expect(upkeepEligibility[1]).is.equals(yieldPerDeposit.mul(2));
    });

    it("Returns recipients total yield with multiple deposits", async () => {
        await yieldStreamer
            .connect(deployer)
            .deposit(toDecimals(10), bob.address, 1, toDecimals(5));
        await yieldStreamer.connect(alice).deposit(toDecimals(10), bob.address, 1, toDecimals(5));

        await triggerRebase();

        let yieldPerDeposit = await yieldStreamer.getOutstandingYield(0);
        await expect(await yieldStreamer.getTotalHarvestableYieldGOHM(bob.address)).is.equals(
            yieldPerDeposit.mul(2)
        );
    });
});
