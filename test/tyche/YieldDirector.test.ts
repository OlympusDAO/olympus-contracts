import { BigNumber, ContractFactory } from "ethers";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import {
    OlympusStaking,
    OlympusERC20Token,
    GOHM,
    OlympusAuthority,
    DAI,
    SOlympus,
    OlympusTreasury,
    Distributor,
    YieldDirector,
} from "../../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
//const { FakeContract, smock } = require("@defi-wonderland/smock");

describe("YieldDirector", async () => {
    const LARGE_APPROVAL = "100000000000000000000000000000000";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = "10000000000000000000000000";
    // Reward rate of .1%
    const initialRewardRate = "1000";

    // Calculate index after some number of epochs. Takes principal and rebase rate.
    // TODO verify this works
    // const calcIndex = (principal: BigNumber, rate: number, epochs: number) =>
    //     principal * (1 + rate) ** epochs;

    const triggerRebase = async () => {
        await network.provider.send("evm_increaseTime", [28800]); // 8 hours per rebase
        await network.provider.send("evm_mine", []);
        await staking.rebase();
        return await sOhm.index();
    };

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
    let tycheFactory: ContractFactory;
    // let mockSOhmFactory: MockSOHM__factory;

    let auth: OlympusAuthority;
    let dai: DAI;
    let ohm: OlympusERC20Token;
    let sOhm: SOlympus;
    let staking: OlympusStaking;
    let gOhm: GOHM;
    let treasury: OlympusTreasury;
    let distributor: Distributor;
    let tyche: YieldDirector;

    before(async () => {
        [deployer, alice, bob] = await ethers.getSigners();

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
        //dai = await smock.fake(erc20Factory);
        //lpToken = await smock.fake(erc20Factory);
        dai = (await erc20Factory.deploy(0)) as DAI;
        // lpToken = await erc20Factory.deploy(0);

        // TODO use promise.all
        auth = (await authFactory.deploy(
            deployer.address,
            deployer.address,
            deployer.address,
            deployer.address
        )) as OlympusAuthority; // TODO
        ohm = (await ohmFactory.deploy(auth.address)) as OlympusERC20Token;
        sOhm = (await sOhmFactory.deploy()) as SOlympus;
        gOhm = (await gOhmFactory.deploy(sOhm.address, sOhm.address)) as GOHM; // Call migrate immediately
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
        tyche = (await tycheFactory.deploy(sOhm.address, auth.address)) as YieldDirector;

        // Setup for each component

        // Needed for treasury deposit
        //await gOhm.migrate(staking.address, sOhm.address);
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

        // Approve sOHM to be deposited to Tyche
        await sOhm.approve(tyche.address, LARGE_APPROVAL);
        await sOhm.connect(alice).approve(tyche.address, LARGE_APPROVAL);
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

        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it("should deposit tokens to recipient correctly", async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = BigNumber.from("100000000000");
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.deposit).is.equal(principal); // 10 * 10 ** 9
        //await expect(donationInfo.amount).is.equal(principal);

        // Verify recipient data
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal(principal);

        const index = await sOhm.index();
        await expect(recipientInfo.agnosticDebt).is.equal(principal.div(index).mul(10 ** 9));
        await expect(recipientInfo.indexAtLastChange).is.equal("10000000000");

        //const newIndex = await triggerRebase();
        //await expect(recipientInfo.agnosticDebt).is.equal((principal / newIndex) * 10 ** 9 );
    });

    it("should withdraw tokens", async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = BigNumber.from("100000000000"); // 100
        await tyche.deposit(principal, bob.address);

        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.deposit).is.equal(principal); // 100 * 10 ** 9

        const index0 = await sOhm.index();
        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        const originalAgnosticAmount = principal.div(index0).mul(10 ** 9);

        await expect(recipientInfo0.agnosticDebt).is.equal(originalAgnosticAmount);
        await expect(recipientInfo0.indexAtLastChange).is.equal("10000000000");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");

        // First rebase
        await triggerRebase();

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo1.agnosticDebt).is.equal(originalAgnosticAmount);
        await expect(recipientInfo1.totalDebt).is.equal(principal);
        await expect(recipientInfo1.indexAtLastChange).is.equal("10000000000");

        const donatedAmount = "100000000"; // .1
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        await tyche.withdraw(principal, bob.address);

        // Verify donor and recipient data is properly updated
        const donationInfo1 = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo1.deposit).is.equal("0");

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo2.agnosticDebt).is.equal("9990009"); // .009~
        await expect(recipientInfo2.carry).is.equal(donatedAmount);
        await expect(recipientInfo2.totalDebt).is.equal("0");
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);
    });

    // TODO
    it("should redeem tokens", async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);
        await triggerRebase();
        await tyche.connect(bob).redeem();
    });

    it("should withdraw tokens before recipient redeems", async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);
        await triggerRebase();

        const donatedAmount = "100000000"; // .1
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        await expect(await recipientInfo0.agnosticDebt).is.equal("10000000000"); // 10

        await tyche.withdraw(principal, bob.address);

        // Redeemable amount should be unchanged
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        //await expect(await recipientInfo1.agnosticDebt).is.equal("9990010");
        await expect(await recipientInfo1.agnosticDebt).is.equal("9990009");

        // Second rebase
        await triggerRebase();

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        //await expect(await recipientInfo2.agnosticDebt).is.equal("9990010"); // .009~
        await expect(await recipientInfo2.agnosticDebt).is.equal("9990009"); // .009~
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100100000"); // .1001

        // Trigger a few rebases
        await triggerRebase();
        await triggerRebase();
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100400600"); // .1004~

        await tyche.connect(bob).redeem();

        //await expect(await sOhm.balanceOf(bob.address)).is.equal(redeemable);
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");
    });

    it("should withdraw tokens after recipient redeems", async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = BigNumber.from("100000000000"); // 100
        await tyche.deposit(principal, bob.address);

        const index0 = await sOhm.index();
        const originalAgnosticAmount = principal.div(index0).mul(10 ** 9);

        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo0.agnosticDebt).is.equal(originalAgnosticAmount);

        await triggerRebase();

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo1.agnosticDebt).is.equal(originalAgnosticAmount);
        await expect(recipientInfo1.totalDebt).is.equal(principal);

        const redeemablePerRebase = await tyche.redeemableBalance(bob.address);

        await tyche.connect(bob).redeem();

        await expect(await sOhm.balanceOf(bob.address)).is.equal(redeemablePerRebase);

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo2.agnosticDebt).is.equal("9990009990"); // 9.990~
        await expect(recipientInfo2.totalDebt).is.equal(principal);

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");

        // Second rebase
        await triggerRebase();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal(redeemablePerRebase);

        await tyche.withdraw(principal, bob.address);

        // This amount should be the exact same as before withdrawal.
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(redeemablePerRebase);

        // Redeem and make sure correct amount is present
        const prevBalance = await sOhm.balanceOf(bob.address);
        await tyche.connect(bob).redeem();
        await expect(await sOhm.balanceOf(bob.address)).is.equal(
            prevBalance.add(redeemablePerRebase)
        );
    });

    it("should deposit from multiple sources", async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts at different indexes
        await tyche.deposit(principal, bob.address);
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");
        await triggerRebase();
        await tyche.connect(alice).deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.deposit).is.equal(principal); // 100
        //await expect(donationInfo.amount).is.equal(principal);

        const donationInfoAlice = await tyche.donationInfo(alice.address, "0");
        await expect(donationInfoAlice.recipient).is.equal(bob.address);
        await expect(donationInfoAlice.deposit).is.equal(principal); // 100

        // Verify recipient data
        const donated = "200000000000";
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal(donated);
        await expect(recipientInfo.agnosticDebt).is.equal("19990009990");
        await expect(recipientInfo.indexAtLastChange).is.equal("10010000000");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100000000");
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("300100000");
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("500400100");
    });

    it("should withdraw to multiple sources", async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.connect(alice).deposit(principal, bob.address);

        // Wait for some rebases
        await triggerRebase();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("200000000");

        // Verify withdrawal
        const balanceBefore = await sOhm.balanceOf(deployer.address);
        await expect(await tyche.withdraw(principal, bob.address));
        const balanceAfter = await sOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal(principal);

        await triggerRebase();

        const donated = "300200000";
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);

        // Verify withdrawal
        const balanceBefore1 = await sOhm.balanceOf(alice.address);
        await expect(await tyche.connect(alice).withdraw(principal, bob.address));
        const balanceAfter1 = await sOhm.balanceOf(alice.address);
        await expect(balanceAfter1.sub(balanceBefore1)).is.equal(principal);

        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);
    });

    it("should withdrawAll after donating to multiple sources", async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);

        // Wait for some rebases
        await triggerRebase();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100000000");
        await expect(await tyche.redeemableBalance(alice.address)).is.equal("100000000");

        // Verify withdrawal
        const balanceBefore = await sOhm.balanceOf(deployer.address);
        await expect(await tyche.withdrawAll());
        const balanceAfter = await sOhm.balanceOf(deployer.address);

        await expect(balanceAfter.sub(balanceBefore)).is.equal("200000000000");
    });

    it("should allow redeem only once per epoch", async () => {
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donated = "100000000";
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);
        await tyche.connect(bob).redeem();
        await expect(await sOhm.balanceOf(bob.address)).is.equal(donated);

        //await expect(await tyche.connect(bob).redeem()).to.be.reverted(); // TODO revert check doesnt work
    });

    it("should display total donated to recipient", async () => {
        const principal = BigNumber.from(100 * 10 ** 9);
        await tyche.deposit(principal, bob.address);
        await triggerRebase();

        await expect(await tyche.donatedTo(deployer.address, bob.address)).is.equal("100000000");
        await expect(await tyche.totalDonated(deployer.address)).is.equal("100000000");
    });

    it("should display total deposited to all recipients", async () => {
        const principal = "100000000000";

        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);
        await triggerRebase();

        await expect(await tyche.depositsTo(deployer.address, bob.address)).is.equal(principal);
        await expect(await tyche.depositsTo(deployer.address, alice.address)).is.equal(principal);

        await expect(tyche.depositsTo(bob.address, alice.address)).to.be.revertedWith(
            "No deposits"
        );

        await expect(await tyche.totalDeposits(deployer.address)).is.equal("200000000000");
    });

    it("should display donated amounts across multiple recipients", async () => {
        const principal = "100000000000";
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);
        await triggerRebase();

        const totalDonation = "200000000";
        await expect(await tyche.totalDonated(deployer.address)).is.equal(totalDonation);

        await tyche.withdraw(principal, bob.address);
        await tyche.withdraw(principal, alice.address);
        await expect(await tyche.totalDonated(deployer.address)).is.equal(0);

        await triggerRebase();
        await expect(await tyche.totalDonated(deployer.address)).is.equal(0);

        // Deposit again only to bob
        await tyche.deposit(principal, bob.address);
        await expect(await tyche.totalDonated(deployer.address)).is.equal(0);

        // This is when it should increment
        const principal2 = "100000000";
        await triggerRebase();
        await expect(await tyche.totalDonated(deployer.address)).is.equal(principal2);

        await tyche.withdraw(principal, bob.address);
        await expect(await tyche.totalDonated(deployer.address)).is.equal(0);

        await triggerRebase();
        await expect(await tyche.totalDonated(deployer.address)).is.equal(0);
    });

    it("should get all deposited positions", async () => {
        const principal = "100000000000";
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);
        await triggerRebase();

        const allDeposits = await tyche.getAllDeposits(deployer.address);
        await expect(allDeposits.length).is.equal(2);
        await expect(allDeposits[0][0]).is.equal(bob.address);
        await expect(allDeposits[1][0]).is.equal(principal);
    });
});
