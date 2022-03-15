const { ethers, waffle, network } = require("hardhat");
const { BigNumber } = require("ethers");
const { expect } = require("chai");
//const { FakeContract, smock } = require("@defi-wonderland/smock");

const { utils } = require("ethers");

const e9 = "000000000";
const e18 = "000000000000000000";

describe("YieldDirector", async () => {
    const LARGE_APPROVAL = "100000000000000000000000000000000";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = "10000000000000000000000000";
    // Reward rate of .1%
    const initialRewardRate = "1000";

    const advanceEpoch = async () => {
        await advanceTime(8 * 60 * 60);
    };

    const advanceTime = async (seconds) => {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine", []);
    };

    // Calculate index after some number of epochs. Takes principal and rebase rate.
    // TODO verify this works
    const calcIndex = (principal, rate, epochs) => principal * (1 + rate) ** epochs;

    // TODO needs cleanup. use Bignumber.
    // Mine block and rebase. Returns the new index.
    const triggerRebase = async () => {
        advanceEpoch(); // 8 hours per rebase
        await staking.rebase();
        return await sOhm.index();
    };

    let deployer, alice, bob, carol;
    let erc20Factory;
    let stakingFactory;
    let ohmFactory;
    let sOhmFactory;
    let gOhmFactory;
    let treasuryFactory;
    let distributorFactory;
    let authFactory;
    let mockSOhmFactory;
    let tycheFactory;

    let auth;
    let dai;
    let lpToken;
    let ohm;
    let sOhm;
    let staking;
    let gOhm;
    let treasury;
    let distributor;
    let tyche;

    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();

        //owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")

        //erc20Factory = await ethers.getContractFactory('MockERC20');
        // TODO use dai as erc20 for now
        authFactory = await ethers.getContractFactory("OlympusAuthority");
        erc20Factory = await ethers.getContractFactory("DAI");

        stakingFactory = await ethers.getContractFactory("OlympusStaking");
        ohmFactory = await ethers.getContractFactory("OlympusERC20Token");
        sOhmFactory = await ethers.getContractFactory("sOlympus");
        gOhmFactory = await ethers.getContractFactory("gOHM");
        treasuryFactory = await ethers.getContractFactory("OlympusTreasury");
        distributorFactory = await ethers.getContractFactory("Distributor");
        tycheFactory = await ethers.getContractFactory("YieldDirector");
    });

    beforeEach(async () => {
        dai = await erc20Factory.deploy(0);
        auth = await authFactory.deploy(
            deployer.address,
            deployer.address,
            deployer.address,
            deployer.address
        );
        ohm = await ohmFactory.deploy(auth.address);
        sOhm = await sOhmFactory.deploy();
        gOhm = await gOhmFactory.deploy(deployer.address, sOhm.address);
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        staking = await stakingFactory.deploy(
            ohm.address,
            sOhm.address,
            gOhm.address,
            "28800", // 1 epoch = 8 hours
            "1",
            blockBefore.timestamp + 28800, // First epoch in 8 hours. Avoids first deposit to set epoch.distribute wrong
            auth.address
        );
        await gOhm.migrate(staking.address, sOhm.address);
        treasury = await treasuryFactory.deploy(ohm.address, "0", auth.address);
        distributor = await distributorFactory.deploy(
            treasury.address,
            ohm.address,
            staking.address,
            auth.address
        );
        tyche = await tycheFactory.deploy(
            sOhm.address,
            gOhm.address,
            staking.address,
            auth.address
        );

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
        await treasury
            .connect(deployer)
            .deposit("10000000000000000000000", dai.address, "9000000000000");

        // Add staking as recipient of distributor with a test reward rate
        await distributor.addRecipient(staking.address, initialRewardRate);

        // Get sOHM in deployer wallet
        const sohmAmount = "1000000000000";
        await ohm.approve(staking.address, sohmAmount);
        await staking.stake(deployer.address, sohmAmount, true, true);
        await triggerRebase(); // Trigger first rebase to set initial distribute amount. This rebase shouldn't update index.

        // Transfer 100 sOHM to alice for testing
        await sOhm.transfer(alice.address, "100000000000");

        // Alice should wrap ohm to gOhm. Should have 10gOhm
        await sOhm.approve(staking.address, LARGE_APPROVAL);
        await staking.wrap(deployer.address, "500000000000");
        await sOhm.connect(alice).approve(staking.address, LARGE_APPROVAL);
        await staking.connect(alice).wrap(alice.address, "100000000000");

        await sOhm.approve(tyche.address, LARGE_APPROVAL);
        await sOhm.connect(alice).approve(tyche.address, LARGE_APPROVAL);
        await gOhm.approve(tyche.address, LARGE_APPROVAL);
        await gOhm.connect(alice).approve(tyche.address, LARGE_APPROVAL);
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

    it("should set token addresses correctly", async () => {
        await tyche.deployed();

        expect(await tyche.gOHM()).to.equal(gOhm.address);
    });

    it("should deposit gOHM tokens to recipient correctly", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.depositor).is.equal(deployer.address);
        await expect(donationInfo.principalAmount).is.equal(`10${e9}`);
        await expect(donationInfo.agnosticAmount).is.equal(principal);
    });

    it("should deposit sOHM tokens to recipient correctly", async () => {
        // Deposit 10 sOHM into Tyche and donate to Bob
        const principal = `10${e9}`;
        await tyche.depositSohm(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.depositor).is.equal(deployer.address);
        await expect(donationInfo.principalAmount).is.equal(principal);
        await expect(donationInfo.agnosticAmount).is.equal(`1${e18}`);
    });

    it("should add deposits", async () => {
        const principal = `1${e18}`;
        const sohmPrincipal = `1${e9}`;

        await tyche.deposit(principal, bob.address);
        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.depositor).is.equal(deployer.address);
        await expect(donationInfo.principalAmount).is.equal(`10${e9}`);
        await expect(donationInfo.agnosticAmount).is.equal(principal);

        await tyche.addToDeposit("0", principal);
        const donationInfo1 = await tyche.depositInfo("0");
        await expect(donationInfo1.depositor).is.equal(deployer.address);
        await expect(donationInfo1.principalAmount).is.equal(`20${e9}`);
        await expect(donationInfo1.agnosticAmount).is.equal(`2${e18}`);

        await tyche.addToSohmDeposit("0", sohmPrincipal);
        const donationInfo2 = await tyche.depositInfo("0");
        await expect(donationInfo2.depositor).is.equal(deployer.address);
        await expect(donationInfo2.principalAmount).is.equal(`21${e9}`);
        await expect(donationInfo2.agnosticAmount).is.equal("2100000000000000000");

        await triggerRebase();

        await tyche.connect(bob).redeemAllYield();

        const donationInfo3 = await tyche.depositInfo("0");
        const withdrawableBalance = await gOhm.balanceTo(donationInfo3.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);
    });

    it("can't access all deposits per recipient", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        // Since entries in depositInfo are siloed by depositor, funds can't be exploited like this
        await tyche.connect(alice).deposit(BigNumber.from("1"), bob.address);

        const balanceBefore = await gOhm.balanceOf(alice.address);

        await tyche.connect(alice).withdrawPrincipal("1", principal);

        const balanceAfter = await gOhm.balanceOf(alice.address);

        await expect(balanceAfter.sub(balanceBefore)).is.equal("0");
    });

    it("can't steal another deposit", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await expect(tyche.connect(alice).withdrawPrincipal("0", principal)).to.be.reverted;
        await expect(tyche.connect(alice).withdrawPrincipalAsSohm("0", principal)).to.be.reverted;
    });

    it("should withdraw tokens", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.depositor).is.equal(deployer.address);
        await expect(donationInfo.principalAmount).is.equal(`10${e9}`);
        await expect(donationInfo.agnosticAmount).is.equal(principal);

        await expect(await tyche.redeemableBalance("0")).is.equal("0");

        // First rebase
        await triggerRebase();

        const donatedAmount = "10000000";
        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo(donatedAmount)).add("1")
        );

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);

        // Verify donor and recipient data is properly updated
        const donationInfo1 = await tyche.depositInfo("0");
        // Precision errors leading to losing 1e-18
        await expect(donationInfo1.principalAmount).is.equal("0");

        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo(donatedAmount)).add(1)
        );
    });

    it("should max withdraw", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.depositor).is.equal(deployer.address);
        await expect(donationInfo.principalAmount).is.equal(`10${e9}`);
        await expect(donationInfo.agnosticAmount).is.equal(principal);

        await expect(await tyche.redeemableBalance("0")).is.equal("0");

        // First rebase
        await triggerRebase();

        const donatedAmount = "10000000";
        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo(donatedAmount)).add("1")
        );

        await tyche.withdrawPrincipal("0", principal);

        // Verify donor and recipient data is properly updated
        const donationInfo1 = await tyche.depositInfo("0");
        // Precision errors leading to losing 1e-18
        await expect(donationInfo1.principalAmount).is.equal("0");

        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo(donatedAmount)).add(1)
        );
    });

    it("should withdraw to sOHM", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donationInfo = await tyche.depositInfo("0");

        const balanceBefore = await sOhm.balanceOf(deployer.address);

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipalAsSohm("0", withdrawableBalance);

        const balanceAfter = await sOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal(
            donationInfo.principalAmount.sub("1")
        );

        const donationInfo1 = await tyche.depositInfo("0");
        await expect(donationInfo1.principalAmount).is.equal("0");
    });

    it("should partial withdraw and full withdraw", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const balanceBefore = await gOhm.balanceOf(deployer.address);

        const withdrawalAmount = await gOhm.balanceTo("1000000000");
        await tyche.withdrawPrincipal("0", withdrawalAmount);
        await tyche.withdrawPrincipal("0", withdrawalAmount);

        const balanceAfter = await gOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal(
            BigNumber.from("2").mul(withdrawalAmount)
        );

        const donationInfo = await tyche.depositInfo("0");

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);

        const balanceAfter1 = await gOhm.balanceOf(deployer.address);
        await expect(balanceAfter1.sub(balanceBefore)).is.equal("999000999200799200"); // this seems to be a bit larger than the usual precision error

        const redeemable = await tyche.redeemableBalance("0");
        await tyche.connect(bob).redeemYield("0");

        await expect(tyche.recipientIds(bob.address, "0")).to.be.reverted;
        await expect(tyche.depositorIds(deployer.address, "0")).to.be.reverted;
        const newDeposit = await tyche.depositInfo("0");
        await expect(newDeposit.depositor).is.equal("0x0000000000000000000000000000000000000000");
        await expect(newDeposit.principalAmount).is.equal("0");
        await expect(newDeposit.agnosticAmount).is.equal("0");
    });

    it("should partial withdraw and full withdraw to sOHM", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const balanceBefore = await sOhm.balanceOf(deployer.address);

        const withdrawalAmount = await gOhm.balanceTo("1000000000");
        await tyche.withdrawPrincipalAsSohm("0", withdrawalAmount);
        await tyche.withdrawPrincipalAsSohm("0", withdrawalAmount);

        const balanceAfter = await sOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal("1999999998");

        const donationInfo = await tyche.depositInfo("0");

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipalAsSohm("0", withdrawableBalance);

        const balanceAfter1 = await sOhm.balanceOf(deployer.address);
        await expect(balanceAfter1.sub(balanceBefore)).is.equal("9999999999");
    });

    it("should mix withdrawal types without breaking", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const sohmBalanceBefore = await sOhm.balanceOf(deployer.address);
        const gohmBalanceBefore = await gOhm.balanceOf(deployer.address);

        const withdrawalAmount = await gOhm.balanceTo("1000000000");
        await tyche.withdrawPrincipalAsSohm("0", withdrawalAmount);
        await tyche.withdrawPrincipal("0", withdrawalAmount);

        const sohmBalanceAfter = await sOhm.balanceOf(deployer.address);
        const gohmBalanceAfter = await gOhm.balanceOf(deployer.address);
        await expect(sohmBalanceAfter.sub(sohmBalanceBefore)).is.equal("999999999");
        await expect(gohmBalanceAfter.sub(gohmBalanceBefore)).is.equal(withdrawalAmount);

        const donationInfo = await tyche.depositInfo("0");
        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);
    });

    it("should not revert on second withdraw", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        const donationInfo = await tyche.depositInfo("0");

        await triggerRebase();

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);

        await tyche.addToDeposit("0", principal);
        const donationInfo1 = await tyche.depositInfo("0");
        const withdrawableBalance2 = await gOhm.balanceTo(donationInfo1.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance2);

        const donationInfo2 = await tyche.depositInfo("0");
        await expect(donationInfo2.principalAmount).is.equal("0");
    });

    it("should redeem tokens", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        await tyche.connect(bob).redeemYield("0");

        const donatedAmount = await gOhm.balanceTo("10000000");
        const bobBalance = await gOhm.balanceOf(bob.address);
        await expect(bobBalance).is.equal(donatedAmount.add("1"));
    });

    it("should redeem tokens as sOHM", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const balanceBefore = await sOhm.balanceOf(bob.address);

        await tyche.connect(bob).redeemYieldAsSohm("0");

        const balanceAfter = await sOhm.balanceOf(bob.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal("10000000");
    });

    it("should redeem all tokens", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        await tyche.connect(alice).deposit(principal, bob.address);

        await triggerRebase();

        await tyche.connect(bob).redeemAllYield();

        const donatedAmount = await gOhm.balanceTo("20000000");
        const bobBalance = await gOhm.balanceOf(bob.address);
        await expect(bobBalance).is.equal(donatedAmount.add("2"));
    });

    it("should redeem all tokens as sOHM", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        await tyche.connect(alice).deposit(principal, bob.address);

        await triggerRebase();

        const balanceBefore = await sOhm.balanceOf(bob.address);

        await tyche.connect(bob).redeemAllYieldAsSohm();

        const balanceAfter = await sOhm.balanceOf(bob.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal("20000000");
    });

    it("can't redeem another user's tokens", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        await expect(tyche.connect(alice).redeemYield("0")).to.be.reverted;
    });

    it("should withdraw tokens before recipient redeems", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donatedAmount = await gOhm.balanceTo("10000000");
        await expect(await tyche.redeemableBalance("0")).is.equal(donatedAmount.add("1"));

        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.agnosticAmount).is.equal(principal);

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);

        // Redeemable amount should be unchanged
        await expect(await tyche.redeemableBalance("0")).is.equal(donatedAmount.add("1"));

        // Trigger a few rebases
        await triggerRebase();
        await triggerRebase();
        await triggerRebase();
        await expect(await tyche.redeemableBalance("0")).is.equal(donatedAmount.add("1"));

        await tyche.connect(bob).redeemAllYield();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");
    });

    it("withdawable balance plus redeemable balance should equal deposited gOHM", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donationInfo = await tyche.depositInfo("0");

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        const redeemable = await tyche.redeemableBalance("0");
        await expect(withdrawableBalance.add(redeemable).toString()).is.equal(principal);
    });

    it("should withdraw tokens after recipient redeems", async () => {
        // Deposit 1 gOHM into Tyche and donate to Bob
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        const donationInfo = await tyche.depositInfo("0");
        await expect(donationInfo.agnosticAmount).is.equal(principal);

        await triggerRebase();

        const donationInfo1 = await tyche.depositInfo("0");
        await expect(donationInfo1.agnosticAmount).is.equal(principal);

        const redeemablePerRebase = await tyche.redeemableBalance("0");

        await tyche.connect(bob).redeemYield("0");

        await expect(await gOhm.balanceOf(bob.address)).is.equal(redeemablePerRebase);

        const donationInfo2 = await tyche.depositInfo("0");
        await expect(donationInfo2.agnosticAmount).is.equal("999000999000999000"); // 9.990~

        await expect(await tyche.redeemableBalance("0")).is.equal("0");

        // Second rebase
        await triggerRebase();

        await expect(await tyche.redeemableBalance("0")).is.equal(await gOhm.balanceTo("10000000"));

        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        const balanceBefore = await gOhm.balanceOf(deployer.address);
        await tyche.withdrawPrincipal("0", `10000${e18}`);
        const balanceAfter = await gOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal(withdrawableBalance);

        // This amount should be the exact same as before withdrawal.
        await expect(await tyche.redeemableBalance("0")).is.equal(await gOhm.balanceTo("10000000"));

        // Redeem and make sure correct amount is present
        const prevBalance = await gOhm.balanceOf(bob.address);
        await tyche.connect(bob).redeemYield("0");
        await expect(await gOhm.balanceOf(bob.address)).is.equal(
            prevBalance.add(await gOhm.balanceTo("10000000"))
        );
    });

    it("should deposit from multiple sources", async () => {
        // Both deployer and alice deposit 1 gOHM and donate to Bob
        const principal = `1${e18}`;

        // Deposit from 2 accounts at different indexes
        await tyche.deposit(principal, bob.address);
        await expect(await tyche.redeemableBalance("0")).is.equal("0");

        await triggerRebase();

        await tyche.connect(alice).deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.depositInfo("0");
        const aliceDonationInfo = await tyche.depositInfo("1");

        await expect(donationInfo.principalAmount).is.equal(`10${e9}`);
        await expect(aliceDonationInfo.principalAmount).is.equal(await gOhm.balanceFrom(principal));
        await expect(donationInfo.agnosticAmount).is.equal(principal);
        await expect(aliceDonationInfo.agnosticAmount).is.equal(principal);

        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );
        await expect(await tyche.redeemableBalance("1")).is.equal("0");
    });

    it("should withdraw to multiple sources", async () => {
        // Both deployer and alice deposit 1 gOHM and donate to Bob
        const principal = `1${e18}`;

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.connect(alice).deposit(principal, bob.address);

        // Wait for some rebases
        await triggerRebase();
        const index = await sOhm.index();

        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );
        await expect(await tyche.redeemableBalance("1")).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );

        // Verify withdrawal
        const bobDonationInfo = await tyche.depositInfo("0");

        const withdrawableBalance = await gOhm.balanceTo(bobDonationInfo.principalAmount);
        const balanceBefore = await gOhm.balanceOf(deployer.address);
        await expect(await tyche.withdrawPrincipal("0", withdrawableBalance));

        const balanceAfter = await gOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal(
            await gOhm.balanceTo(bobDonationInfo.principalAmount)
        );

        await triggerRebase();

        // Verify withdrawal
        const balanceBefore1 = await gOhm.balanceOf(alice.address);

        const aliceDonationInfo = await tyche.depositInfo("1");
        const aliceWithdrawableBalance = await gOhm.balanceTo(aliceDonationInfo.principalAmount);

        const index1 = await sOhm.index();
        await tyche.connect(alice).withdrawPrincipal("1", aliceWithdrawableBalance);

        const balanceAfter1 = await gOhm.balanceOf(alice.address);
        await expect(balanceAfter1.sub(balanceBefore1)).is.equal(
            await gOhm.balanceTo(aliceDonationInfo.principalAmount)
        );
    });

    it("should withdrawAll after donating to multiple sources", async () => {
        // Both deployer and alice deposit 1 gOHM and donate to Bob
        const principal = `1${e18}`;

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);

        // Wait for some rebases
        await triggerRebase();

        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );
        await expect(await tyche.redeemableBalance("1")).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );

        // Verify withdrawal
        const balanceBefore = await gOhm.balanceOf(deployer.address);
        await expect(await tyche.withdrawAll());
        const balanceAfter = await gOhm.balanceOf(deployer.address);

        await expect(balanceAfter.sub(balanceBefore)).is.equal(await gOhm.balanceTo(`20${e9}`));
    });

    it("should allow redeem only once per epoch", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donated = "10000000";
        await expect(await tyche.redeemableBalance("0")).is.equal(
            (await gOhm.balanceTo(donated)).add("1")
        );
        await tyche.connect(bob).redeemAllYield();
        await expect(await gOhm.balanceOf(bob.address)).is.equal(
            (await gOhm.balanceTo(donated)).add("1")
        );

        const balanceBefore = await gOhm.balanceOf(deployer.address);
        await tyche.connect(bob).redeemAllYield();
        const balanceAfter = await gOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal("0");
    });

    it("should display total donated to recipient", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        await triggerRebase();

        await expect(await tyche.donatedTo(deployer.address, bob.address)).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );
        await expect(await tyche.totalDonated(deployer.address)).is.equal(
            (await gOhm.balanceTo("10000000")).add("1")
        );
    });

    it("should display total deposited to all recipients", async () => {
        const principal = `1${e18}`;

        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);
        await triggerRebase();

        await expect(await tyche.depositsTo(deployer.address, bob.address)).is.equal(
            await gOhm.balanceTo(`10${e9}`)
        );
        await expect(await tyche.depositsTo(deployer.address, alice.address)).is.equal(
            await gOhm.balanceTo(`10${e9}`)
        );

        await expect(await tyche.depositsTo(bob.address, alice.address)).is.equal("0");

        await expect(await tyche.totalDeposits(deployer.address)).is.equal(
            await gOhm.balanceTo(`20${e9}`)
        );
    });

    it("should display donated amounts across multiple recipients", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);

        await triggerRebase();

        const totalDonation = await gOhm.balanceTo("20000000");
        await expect(await tyche.totalDonated(deployer.address)).is.equal(totalDonation.add("1"));

        const donationInfo = await tyche.depositInfo("0");
        const withdrawableBalance = await gOhm.balanceTo(donationInfo.principalAmount);
        await tyche.withdrawPrincipal("0", withdrawableBalance);
        await tyche.withdrawPrincipal("1", withdrawableBalance);
        await expect(await tyche.totalDonated(deployer.address)).is.equal(totalDonation.add("2"));

        await triggerRebase();
        await expect(await tyche.totalDonated(deployer.address)).is.equal(totalDonation.add("2"));

        await expect(await tyche.totalDonated(deployer.address)).is.equal(totalDonation.add("2"));
    });

    it("should get all deposited positions", async () => {
        const principal = `1${e18}`;
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);

        await triggerRebase();

        const allDeposits = await tyche.getAllDeposits(deployer.address);
        await expect(allDeposits[0].length).is.equal(2);
        await expect(allDeposits[0][0]).is.equal(bob.address);
        await expect(allDeposits[1][0]).is.equal(await gOhm.balanceTo(`10${e9}`));
    });
});
