import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
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
    YieldSplitterImpl,
} from "../../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { toDecimals, toOhm, advanceEpoch } from "../utils/Utilities";

describe("YieldSplitter", async () => {
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
    let yieldSplitterFactory: ContractFactory;

    let auth: OlympusAuthority;
    let dai: DAI;
    let ohm: OlympusERC20Token;
    let sOhm: SOlympus;
    let staking: OlympusStaking;
    let gOhm: GOHM;
    let treasury: OlympusTreasury;
    let distributor: Distributor;
    let yieldSplitter: YieldSplitterImpl;

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
        yieldSplitterFactory = await ethers.getContractFactory("YieldSplitterImpl");
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
        yieldSplitter = (await yieldSplitterFactory.deploy(sOhm.address)) as YieldSplitterImpl;

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

        await gOhm.connect(alice).approve(yieldSplitter.address, LARGE_APPROVAL);
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

    it("creating multiple deposits should update depositors arrays", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10));
        await yieldSplitter.deposit(deployer.address, toDecimals(10));
        await yieldSplitter.deposit(alice.address, toDecimals(5));
        await yieldSplitter.deposit(alice.address, toDecimals(5));

        await expect(await yieldSplitter.idCount()).is.equal("4");
        await expect(await yieldSplitter.depositorIds(deployer.address, 0)).is.equal("0");
        await expect(await yieldSplitter.depositorIds(deployer.address, 1)).is.equal("1");
        await expect(await yieldSplitter.depositorIds(alice.address, 0)).is.equal("2");
        await expect(await yieldSplitter.depositorIds(alice.address, 1)).is.equal("3");
        await expect((await yieldSplitter.depositInfo(0)).principalAmount).is.equal(toOhm(100));
        await expect((await yieldSplitter.depositInfo(3)).principalAmount).is.equal(toOhm(50));
    });

    it("adding to deposit should calculate agostic with changing index", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10)); //10 gOhm, 100 sOhm
        await triggerRebase();
        await expect((await yieldSplitter.depositInfo(0)).principalAmount).is.equal(toOhm(100)); // still should be 100sOhm but less gOhm
        await expect((await yieldSplitter.depositInfo(0)).agnosticAmount).is.equal(toDecimals(10)); // still should be 10gOhm. But its more than 100 sOhm
        await yieldSplitter.addToDeposit(0, toDecimals(10)); // add another 10gOhm or 100.1 sOhm since index change
        await expect((await yieldSplitter.depositInfo(0)).principalAmount).is.equal(toOhm(200.1)); // total sOhm should be 200.1
        await expect((await yieldSplitter.depositInfo(0)).agnosticAmount).is.equal(toDecimals(20)); // agnostic should be 20 gOhm or 200.2 sOhm.
        const expectedYield = await gOhm.balanceTo(toOhm(0.1)); // yield is 0.1sOhm convert this to gOhm
        const actualYield = await yieldSplitter.getOutstandingYield(
            (
                await yieldSplitter.depositInfo(0)
            ).principalAmount,
            (
                await yieldSplitter.depositInfo(0)
            ).agnosticAmount
        );
        await expect(actualYield).is.closeTo(expectedYield, 1); // 1 digit off due to precision issues of converting gOhm to sOhm and back to gOhm.
    });

    it("withdrawing principal only reduces principal amount", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10)); //10 gOhm, 100 sOhm
        await yieldSplitter.withdrawPrincipal(0, toDecimals(5));
        await triggerRebase();
        const principalAfter = (await yieldSplitter.depositInfo(0)).principalAmount;
        await expect(principalAfter).is.equal(toOhm(50)); // should be 50 sOhm
    });

    it("cannot withdraw more principal than there already is", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10)); //10 gOhm, 100 sOhm
        await expect(yieldSplitter.withdrawPrincipal(0, toDecimals(100))).to.be.reverted;
    });

    it("withdraws all principal", async () => {
        await yieldSplitter.connect(alice).deposit(deployer.address, toDecimals(10)); //10 gOhm, 100 sOhm
        await yieldSplitter.withdrawAllPrincipal(0);
        expect((await yieldSplitter.depositInfo(0)).agnosticAmount).is.equal(0);
    });

    it("cannot withdraw someone elses deposit", async () => {
        await yieldSplitter.connect(alice).deposit(alice.address, toDecimals(10)); //10 gOhm, 100 sOhm
        await expect(yieldSplitter.connect(deployer).withdrawPrincipal(0, toDecimals(10))).to.be
            .reverted;
        await expect(yieldSplitter.connect(deployer).withdrawAllPrincipal(0)).to.be.reverted;
        await yieldSplitter.connect(alice).withdrawAllPrincipal(0);
    });

    it("closing a deposit deletes the item from mapping and depositor", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10));
        await expect(await yieldSplitter.depositorIds(deployer.address, 0)).is.equal("0");
        await yieldSplitter.closeDeposit(0);
        await expect(yieldSplitter.depositorIds(deployer.address, 0)).to.be.reverted;
    });

    it("redeeming yield makes getOutstandingYield return 0", async () => {
        await yieldSplitter.deposit(deployer.address, toDecimals(10));
        await triggerRebase();
        const yieldBefore = await yieldSplitter.getOutstandingYield(
            (
                await yieldSplitter.depositInfo(0)
            ).principalAmount,
            (
                await yieldSplitter.depositInfo(0)
            ).agnosticAmount
        );
        await expect(yieldBefore).to.equal("9990009990009991");
        await yieldSplitter.redeemYield(0);
        const yieldAfter = await yieldSplitter.getOutstandingYield(
            (
                await yieldSplitter.depositInfo(0)
            ).principalAmount,
            (
                await yieldSplitter.depositInfo(0)
            ).agnosticAmount
        );
        await expect(yieldAfter).to.equal(0);
    });

    it("precision issue with gOHM conversion should not allow users to withdraw more than they have", async () => {
        await gOhm.connect(deployer).transfer(bob.address, toDecimals(10));
        await yieldSplitter.deposit(bob.address, toDecimals(10));
        await triggerRebase();

        let harvestedYield = await yieldSplitter.getOutstandingYield(
            (
                await yieldSplitter.depositInfo(0)
            ).principalAmount,
            (
                await yieldSplitter.depositInfo(0)
            ).agnosticAmount
        );
        await gOhm.connect(bob).transfer(deployer.address, harvestedYield);

        let principal = (await yieldSplitter.depositInfo(0)).principalAmount;
        let principalInGOHM = await gOhm.balanceTo(principal);
        await gOhm.connect(bob).transfer(deployer.address, principalInGOHM);
        await expect(await gOhm.balanceOf(bob.address)).is.equal(0);
    });
});
