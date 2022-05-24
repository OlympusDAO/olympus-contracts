import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
    TestnetGohm,
    TestnetOhm,
    TestnetOhmV1,
    TestnetSohm,
    TestnetSohmV1,
    TestnetStakingV1,
    TestnetTreasuryV1,
    TestnetTreasury,
    TestnetWsohmV1,
    TestnetBondDepoV1,
    TestnetStaking,
    TestnetStakingHelperV1,
    TestnetStakingWarmupV1,
    TestnetDistributorV1,
    TestnetDistributor,
    OlympusTokenMigrator,
    TestnetOPBondDepo,
    TestnetOhmV1__factory,
    TestnetSohmV1__factory,
    TestnetWsohmV1__factory,
    TestnetStakingV1__factory,
    OlympusAuthority,
    OlympusAuthority__factory,
    TestnetTreasuryV1__factory,
    TestnetStakingWarmupV1__factory,
    TestnetStakingHelperV1__factory,
    TestnetDistributorV1__factory,
    TestnetBondDepoV1__factory,
    OlympusTokenMigrator__factory,
    TestnetOhm__factory,
    TestnetSohm__factory,
    TestnetGohm__factory,
    TestnetTreasury__factory,
    TestnetStaking__factory,
    TestnetDistributor__factory,
    TestnetOPBondDepo__factory,
    DAI,
    TestnetDAI,
    TestnetDAI__factory,
    DevFaucet,
    DevFaucet__factory,
} from "../../types";

describe("FullDeployment", async () => {
    const advanceTime = async (seconds: number) => {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine", []);
    };

    const addEth = async (address: string, value: BigNumber) => {
        await ethers.provider.send("hardhat_setBalance", [address, value._hex]);
    };

    let deployer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let dai: TestnetDAI;
    let authority: OlympusAuthority;
    let ohmv1: TestnetOhmV1;
    let ohmv2: TestnetOhm;
    let sohmv1: TestnetSohmV1;
    let sohmv2: TestnetSohm;
    let wsohm: TestnetWsohmV1;
    let gohm: TestnetGohm;
    let treasuryV1: TestnetTreasuryV1;
    let treasuryV2: TestnetTreasury;
    let daiBond: TestnetBondDepoV1;
    let stakingV1: TestnetStakingV1;
    let stakingV2: TestnetStaking;
    let stakingWarmup: TestnetStakingWarmupV1;
    let stakingHelper: TestnetStakingHelperV1;
    let distributorV1: TestnetDistributorV1;
    let distributorV2: TestnetDistributor;
    let migrator: OlympusTokenMigrator;
    let inverseBonds: TestnetOPBondDepo;
    let devFaucet: DevFaucet;

    before(async () => {
        /// Zero Address
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        /// Approval Value
        const largeApproval = ethers.utils.parseEther("1000000000000000000000000000");

        /// Initialize staking index
        const initialIndex = "7675210820";

        /// What epoch will be first epoch
        const firstEpochNumber = "550";

        /// First block epoch occurs
        const firstBlockNumber = "3307707710";

        /// How many blocks per epoch
        const epochLength = "2200";

        /// Initial staking reward rate
        const initialRewardRate = "3000";

        /// Initial mint for DAI (20,000,000)
        const initialMint = "20000000000000000000000000";

        /// DAI bond BCV
        const daiBondBCV = "369";

        /// Bond vesting length in blox (~5 days)
        const bondVestingLength = "33110";

        /// Minimum bond price
        const minBondPrice = "50000";

        /// Maximum bond payout
        const maxBondPayout = "50";

        /// DAO fee for bond
        const bondFee = "10000";

        /// Max debt bond can take on
        const maxBondDebt = "1000000000000000";

        /// Initial Bond Debt
        const initialBondDebt = "0";

        /// Establish deployer, alice, and bob
        [deployer, alice, bob] = await ethers.getSigners();
        await addEth(deployer.address, ethers.utils.parseEther("10"));
        console.log("Deploying contracts with the account: " + deployer.address);

        /// Establish external addresses
        const DAI = (await ethers.getContractFactory("TestnetDAI")) as TestnetDAI__factory;
        dai = await DAI.deploy(5);
        const sushiRouter = "0x0000000000000000000000000000000000000001"; // Need to find or replace
        const uniRouter = "0x0000000000000000000000000000000000000001"; // Need to find

        /// Mint 10,000,000 DAI to deployer
        await dai.mint(deployer.address, initialMint);

        /// Deploy Authority
        const Authority = (await ethers.getContractFactory(
            "OlympusAuthority"
        )) as OlympusAuthority__factory;
        authority = await Authority.deploy(
            deployer.address,
            deployer.address,
            deployer.address,
            deployer.address
        );

        /// V1 DEPLOYMENTS

        /// Deploy OHM v1
        const OHMv1 = (await ethers.getContractFactory("TestnetOhmV1")) as TestnetOhmV1__factory;
        ohmv1 = await OHMv1.deploy();

        /// Deploy sOHM v1
        const SOHMv1 = (await ethers.getContractFactory("TestnetSohmV1")) as TestnetSohmV1__factory;
        sohmv1 = await SOHMv1.deploy();

        /// Deploy Treasury V1
        const OlympusTreasuryV1 = (await ethers.getContractFactory(
            "TestnetTreasuryV1"
        )) as TestnetTreasuryV1__factory;
        treasuryV1 = await OlympusTreasuryV1.deploy(ohmv1.address, dai.address, 0);

        /// Deploy Staking V1
        const StakingV1 = (await ethers.getContractFactory(
            "TestnetStakingV1"
        )) as TestnetStakingV1__factory;
        stakingV1 = await StakingV1.deploy(
            ohmv1.address,
            sohmv1.address,
            epochLength,
            firstEpochNumber,
            firstBlockNumber
        );

        /// Deploy wsOHM v1
        const WSOHM = (await ethers.getContractFactory(
            "TestnetWsohmV1"
        )) as TestnetWsohmV1__factory;
        wsohm = await WSOHM.deploy(stakingV1.address, ohmv1.address, sohmv1.address);

        /// Deploy Staking V1 Warmup
        const StakingWarmupV1 = (await ethers.getContractFactory(
            "TestnetStakingWarmupV1"
        )) as TestnetStakingWarmupV1__factory;
        stakingWarmup = await StakingWarmupV1.deploy(stakingV1.address, sohmv1.address);

        /// Deploy Staking V1 Helper
        const StakingHelperV1 = (await ethers.getContractFactory(
            "TestnetStakingHelperV1"
        )) as TestnetStakingHelperV1__factory;
        stakingHelper = await StakingHelperV1.deploy(stakingV1.address, ohmv1.address);

        const DistributorV1 = (await ethers.getContractFactory(
            "TestnetDistributorV1"
        )) as TestnetDistributorV1__factory;
        distributorV1 = await DistributorV1.deploy(
            treasuryV1.address,
            ohmv1.address,
            epochLength,
            firstEpochNumber
        );

        /// Deploy Bond Depository for DAI
        const DAIBond = (await ethers.getContractFactory(
            "TestnetBondDepoV1"
        )) as TestnetBondDepoV1__factory;
        daiBond = await DAIBond.deploy(
            ohmv1.address,
            dai.address,
            treasuryV1.address,
            deployer.address,
            zeroAddress
        );

        /// Initialize DAI bond
        await treasuryV1.queue("0", daiBond.address);
        await treasuryV1.toggle("0", daiBond.address, zeroAddress);
        await daiBond.initializeBondTerms(
            daiBondBCV,
            bondVestingLength,
            minBondPrice,
            maxBondPayout,
            bondFee,
            maxBondDebt,
            initialBondDebt
        );

        /// Set treasury for OHM
        await ohmv1.setVault(treasuryV1.address);

        /// Initialize sOHM v1
        await sohmv1.setIndex(initialIndex);
        await sohmv1.initialize(stakingV1.address);

        /// Initialize Staking v1 with Distributor and Warmup
        await stakingV1.setContract("0", distributorV1.address);
        await stakingV1.setContract("1", stakingWarmup.address);

        /// Initialize Distributor with Staking as recipient
        await distributorV1.addRecipient(stakingV1.address, initialRewardRate);

        /// Initialize Distributor as Treasury reward manager
        await treasuryV1.queue("8", distributorV1.address);
        await treasuryV1.toggle("8", distributorV1.address, zeroAddress);

        /// Initialize deployer as reserve depositor
        await treasuryV1.queue("0", deployer.address);
        await treasuryV1.toggle("0", deployer.address, zeroAddress);

        /// Initialize deployer as liquidity depositor
        await treasuryV1.queue("4", deployer.address);
        await treasuryV1.toggle("4", deployer.address, zeroAddress);

        /// Approve the treasury to spend deployer's DAI
        await dai.approve(treasuryV1.address, largeApproval);

        /// Approve DAI bond to spend deployer's DAI
        await dai.approve(daiBond.address, largeApproval);

        /// Approve staking and staking helper to spend deployer's OHM
        await ohmv1.approve(stakingV1.address, largeApproval);
        await ohmv1.approve(stakingHelper.address, largeApproval);

        /// Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excess reserves
        await treasuryV1.deposit("9000000000000000000000000", dai.address, "8400000000000000");

        /// Stake OHM through helper
        await stakingHelper.stake("100000000000");

        /// Bond 1,000 DAI in its bond
        await daiBond.deposit("1000000000000000000000", "60000", deployer.address);

        /// V2 DEPLOYMENTS

        /// Deploy Migrator
        const Migrator = (await ethers.getContractFactory(
            "OlympusTokenMigrator"
        )) as OlympusTokenMigrator__factory;
        migrator = await Migrator.deploy(
            ohmv1.address,
            sohmv1.address,
            treasuryV1.address,
            stakingV1.address,
            wsohm.address,
            sushiRouter,
            uniRouter,
            "0",
            authority.address
        );

        /// Deploy OHM v2
        const OHMv2 = (await ethers.getContractFactory("TestnetOhm")) as TestnetOhm__factory;
        ohmv2 = await OHMv2.deploy(authority.address);

        /// Deploy sOHM v2
        const SOHMv2 = (await ethers.getContractFactory("TestnetSohm")) as TestnetSohm__factory;
        sohmv2 = await SOHMv2.deploy();

        /// Deploy gOHM
        const GOHM = (await ethers.getContractFactory("TestnetGohm")) as TestnetGohm__factory;
        gohm = await GOHM.deploy(migrator.address, sohmv2.address);

        /// Set gOHM in Migrator
        await migrator.setgOHM(gohm.address);

        /// Deploy Treasury V2
        const OlympusTreasuryV2 = (await ethers.getContractFactory(
            "TestnetTreasury"
        )) as TestnetTreasury__factory;
        treasuryV2 = await OlympusTreasuryV2.deploy(ohmv2.address, "0", authority.address);

        /// Initialize Treasury V2
        await treasuryV2.enable("0", migrator.address, zeroAddress);
        await treasuryV2.enable("1", migrator.address, zeroAddress);
        await treasuryV2.enable("3", migrator.address, zeroAddress);
        await treasuryV2.enable("6", migrator.address, zeroAddress);
        await treasuryV2.enable("8", migrator.address, zeroAddress);
        await treasuryV2.enable("2", dai.address, zeroAddress);
        await treasuryV2.enable("0", daiBond.address, zeroAddress);
        await treasuryV2.enable("0", deployer.address, zeroAddress);
        await treasuryV2.enable("4", deployer.address, zeroAddress);

        /// Initialize migrator perms
        await treasuryV1.queue("0", migrator.address);
        await treasuryV1.toggle("0", migrator.address, zeroAddress);
        await treasuryV1.queue("1", migrator.address);
        await treasuryV1.toggle("1", migrator.address, zeroAddress);
        await treasuryV1.queue("3", migrator.address);
        await treasuryV1.toggle("3", migrator.address, zeroAddress);
        await treasuryV1.queue("6", migrator.address);
        await treasuryV1.toggle("6", migrator.address, zeroAddress);
        await treasuryV1.queue("8", migrator.address);
        await treasuryV1.toggle("8", migrator.address, zeroAddress);

        /// Replaces ohm.setVault(olympusTreasuryV2.address)
        await authority.pushVault(treasuryV2.address, true);

        /// Approve the treasury to spend deployer's DAI
        await dai.approve(treasuryV2.address, largeApproval);

        /// Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excess reserves
        await treasuryV2.deposit("9000000000000000000000000", dai.address, "8400000000000000");

        /// Deploy Staking V2
        const StakingV2 = (await ethers.getContractFactory(
            "TestnetStaking"
        )) as TestnetStaking__factory;
        stakingV2 = await StakingV2.deploy(
            ohmv2.address,
            sohmv2.address,
            gohm.address,
            epochLength,
            firstEpochNumber,
            firstBlockNumber,
            authority.address
        );

        /// Deploy Distributor V2
        const DistributorV2 = (await ethers.getContractFactory(
            "TestnetDistributor"
        )) as TestnetDistributor__factory;
        distributorV2 = await DistributorV2.deploy(
            treasuryV2.address,
            ohmv2.address,
            stakingV2.address,
            authority.address,
            initialRewardRate
        );

        await treasuryV2.enable("8", distributorV2.address, zeroAddress);

        /// Deploy Inverse Bonds
        const InverseBonds = (await ethers.getContractFactory(
            "TestnetOPBondDepo"
        )) as TestnetOPBondDepo__factory;
        inverseBonds = await InverseBonds.deploy(authority.address);

        /// Initialize sOHM V2
        await sohmv2.setIndex(initialIndex);
        await sohmv2.setgOHM(gohm.address);
        await sohmv2.initialize(stakingV2.address, treasuryV2.address);

        /// Initialize Staking V2 with Distributor V2
        await stakingV2.setDistributor(distributorV2.address);

        /// Deploy Faucet
        const Faucet = (await ethers.getContractFactory("DevFaucet")) as DevFaucet__factory;
        devFaucet = await Faucet.deploy(
            dai.address,
            ohmv1.address,
            ohmv2.address,
            wsohm.address,
            stakingV1.address,
            stakingV2.address,
            authority.address
        );

        await migrator.migrateContracts(
            treasuryV2.address,
            stakingV2.address,
            ohmv2.address,
            sohmv2.address,
            dai.address
        );
    });

    describe("addresses", () => {
        it("should have addresses defined", () => {
            expect(ohmv1.address).to.not.be.undefined;
            expect(ohmv2.address).to.not.be.undefined;
            expect(sohmv1.address).to.not.be.undefined;
            expect(sohmv2.address).to.not.be.undefined;
            expect(wsohm.address).to.not.be.undefined;
            expect(gohm.address).to.not.be.undefined;
            expect(treasuryV1.address).to.not.be.undefined;
            expect(treasuryV2.address).to.not.be.undefined;
            expect(daiBond.address).to.not.be.undefined;
            expect(stakingV1.address).to.not.be.undefined;
            expect(stakingV2.address).to.not.be.undefined;
            expect(stakingWarmup.address).to.not.be.undefined;
            expect(stakingHelper.address).to.not.be.undefined;
            expect(distributorV1.address).to.not.be.undefined;
            expect(distributorV2.address).to.not.be.undefined;
            expect(migrator.address).to.not.be.undefined;
            expect(inverseBonds.address).to.not.be.undefined;
        });
    });

    describe("balances", () => {
        it("should have a deployer balance", async () => {
            const ohmv1Bal = await ohmv1.balanceOf(deployer.address);
            const daiBal = await dai.balanceOf(deployer.address);

            console.log(ohmv1Bal);
            console.log(daiBal);

            expect(ohmv1Bal).to.be.gt("0");
            expect(daiBal).to.be.gt("0");
        });
    });

    describe("faucet", () => {
        before(async () => {
            await ohmv1.connect(deployer).transfer(devFaucet.address, "100000000000");
            await dai.connect(deployer).transfer(devFaucet.address, "1000000000000000000000");
            await addEth(devFaucet.address, ethers.utils.parseEther("5"));
        });

        beforeEach(async () => {
            await advanceTime(86401);
        });

        it("should dispense OHMv1", async () => {
            const aliceOhmBal = await ohmv1.balanceOf(alice.address);
            expect(aliceOhmBal).to.equal("0");

            await devFaucet.connect(alice).mintOHM(0);

            const aliceOhmBal2 = await ohmv1.balanceOf(alice.address);
            expect(aliceOhmBal2).to.equal("10000000000");
        });

        it("should dispense sOHMv1", async () => {
            const aliceSohmBal = await sohmv1.balanceOf(alice.address);
            expect(aliceSohmBal).to.equal("0");

            await devFaucet.connect(alice).mintSOHM(0);

            const aliceSohmBal2 = await sohmv1.balanceOf(alice.address);
            expect(aliceSohmBal2).to.equal("10000000000");
        });

        it("should dispense wsOHM", async () => {
            const aliceWsohmBal = await wsohm.balanceOf(alice.address);
            expect(aliceWsohmBal).to.equal("0");

            await devFaucet.connect(alice).mintWSOHM();

            const aliceWsohmBal2 = await wsohm.balanceOf(alice.address);
            console.log(aliceWsohmBal2);
            expect(aliceWsohmBal2).to.be.gt("0");
        });

        it("should dispense OHMv2", async () => {
            const aliceOhmBal = await ohmv2.balanceOf(alice.address);
            expect(aliceOhmBal).to.equal("0");

            await devFaucet.connect(alice).mintOHM(1);

            const aliceOhmBal2 = await ohmv2.balanceOf(alice.address);
            expect(aliceOhmBal2).to.equal("10000000000");
        });

        it("should dispense sOHMv2", async () => {
            advanceTime(600);

            const aliceSohmBal = await sohmv2.balanceOf(alice.address);
            expect(aliceSohmBal).to.equal("0");

            await devFaucet.connect(alice).mintSOHM(1);

            const aliceSohmBal2 = await sohmv2.balanceOf(alice.address);
            expect(aliceSohmBal2).to.equal("10000000000");
        });

        it("should dispense gOHM", async () => {
            advanceTime(600);
            const aliceGohmBal = await gohm.balanceOf(alice.address);
            expect(aliceGohmBal).to.equal("0");

            await devFaucet.connect(alice).mintGOHM();

            const aliceGohmBal2 = await gohm.balanceOf(alice.address);
            console.log(aliceGohmBal2);
            expect(aliceGohmBal2).to.be.gt("0");
        });

        it("should dispense DAI", async () => {
            advanceTime(600);
            const aliceDaiBal = await dai.balanceOf(alice.address);
            expect(aliceDaiBal).to.equal("0");

            await devFaucet.connect(alice).mintDAI();

            const aliceDaiBal2 = await dai.balanceOf(alice.address);
            expect(aliceDaiBal2).to.equal("100000000000000000000");
        });

        it("should dispense ETH", async () => {
            advanceTime(600);
            const aliceEthBal = await ethers.provider.getBalance(alice.address);

            await devFaucet.connect(alice).mintETH("100000000000000000");

            const aliceEthBal2 = await ethers.provider.getBalance(alice.address);
            console.log(aliceEthBal2);
            expect(aliceEthBal2.sub(aliceEthBal)).to.be.gt("0");
        });

        it("should not dispnese twice in a row", async () => {
            await devFaucet.connect(alice).mintOHM(0);
            expect(devFaucet.connect(alice).mintOHM(0)).to.be.revertedWith("CanOnlyMintOnceADay()");
            expect(devFaucet.connect(alice).mintSOHM(0)).to.be.revertedWith(
                "CanOnlyMintOnceADay()"
            );

            expect(devFaucet.connect(bob).mintSOHM(0)).to.not.be.reverted;
        });
    });
});
