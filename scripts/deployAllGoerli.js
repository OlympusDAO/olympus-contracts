const { ethers } = require("hardhat");

async function main() {
    /// Establish config values

    /// Zero Address
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    /// Approval Value
    const largeApproval = ethers.utils.parseEther("1000000000000000000000000000");

    /// Initialize staking index
    const initialIndex = "7675210820";

    /// What epoch will be first epoch
    const firstEpochNumber = "550";

    /// First block epoch occurs
    const firstBlockNumber = "7500000";

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

    /// Establish deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    /// Establish external addresses
    const DAI = await ethers.getContractFactory("TestnetDAI");
    const dai = await DAI.deploy(5);
    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    /// Deploy Authority
    const Authority = await ethers.getContractFactory("OlympusAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    /// V1 DEPLOYMENTS

    /// Deploy OHM v1
    const OHMv1 = await ethers.getContractFactory("TestnetOhmV1");
    const ohmv1 = await OHMv1.deploy();

    /// Deploy sOHM v1
    const SOHMv1 = await ethers.getContractFactory("TestnetSohmV1");
    const sOHMv1 = await SOHMv1.deploy();

    /// Deploy Treasury V1
    const OlympusTreasuryV1 = await ethers.getContractFactory("TestnetTreasuryV1");
    const olympusTreasuryV1 = await OlympusTreasuryV1.deploy(ohmv1.address, dai.address, 0);

    /// Deploy Staking V1
    const StakingV1 = await ethers.getContractFactory("TestnetStakingV1");
    const stakingV1 = await StakingV1.deploy(
        ohmv1.address,
        sOHMv1.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber
    );

    /// Deploy wsOHM v1
    const WSOHM = await ethers.getContractFactory("TestnetWsohmV1");
    const wsOHM = await WSOHM.deploy(stakingV1.address, ohmv1.address, sOHMv1.address);

    /// Deploy Staking V1 Warmup
    const StakingWarmupV1 = await ethers.getContractFactory("TestnetStakingWarmupV1");
    const stakingWarmupV1 = await StakingWarmupV1.deploy(stakingV1.address, sOHMv1.address);

    /// Deploy Staking V1 Helper
    const StakingHelperV1 = await ethers.getContractFactory("TestnetStakingHelperV1");
    const stakingHelperV1 = await StakingHelperV1.deploy(stakingV1.address, ohmv1.address);

    /// Deploy Distributor V1
    const DistributorV1 = await ethers.getContractFactory("TestnetDistributorV1");
    const distributorV1 = await DistributorV1.deploy(
        olympusTreasuryV1.address,
        ohmv1.address,
        epochLength,
        firstEpochNumber
    );

    /// Deploy Bond Depository for DAI
    const DAIBond = await ethers.getContractFactory("TestnetBondDepoV1");
    const daiBond = await DAIBond.deploy(
        ohmv1.address,
        dai.address,
        olympusTreasuryV1.address,
        deployer.address,
        zeroAddress
    );

    /// Initialize DAI bond
    await olympusTreasuryV1.queue("0", daiBond.address);
    await olympusTreasuryV1.toggle("0", daiBond.address, zeroAddress);
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
    await ohmv1.setVault(olympusTreasuryV1.address);

    /// Initialize sOHM v1
    await sOHMv1.setIndex(initialIndex);
    await sOHMv1.initialize(stakingV1.address);

    /// Initialize Staking V1 with Distributor and Warmup
    await stakingV1.setContract("0", distributorV1.address);
    await stakingV1.setContract("1", stakingWarmupV1.address);

    /// Initialize Distributor with Staking as recipient
    await distributorV1.addRecipient(stakingV1.address, initialRewardRate);

    /// Initialize Distributor as Treasury reward manager
    await olympusTreasuryV1.queue("8", distributorV1.address);
    await olympusTreasuryV1.toggle("8", distributorV1.address, zeroAddress);

    /// Initialize deployer as reserve depositor
    await olympusTreasuryV1.queue("0", deployer.address);
    await olympusTreasuryV1.toggle("0", deployer.address, zeroAddress);

    /// Initialize deployer as liquidity depositor
    await olympusTreasuryV1.queue("4", deployer.address);
    await olympusTreasuryV1.toggle("4", deployer.address, zeroAddress);

    /// Approve the treasury to spend deployer's DAI
    await dai.approve(olympusTreasuryV1.address, largeApproval);

    /// Approve DAI bond to spend deployer's DAI
    await dai.approve(daiBond.address, largeApproval);

    /// Approve staking and staking helper to spend deployer's OHM
    await ohmv1.approve(stakingV1.address, largeApproval);
    await ohmv1.approve(stakingHelperV1.address, largeApproval);

    /// Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excess reserves
    await olympusTreasuryV1.deposit("9000000000000000000000000", dai.address, "8400000000000000");

    /// Stake OHM through helper
    await stakingHelperV1.stake("100000000000");

    /// Bond 1,000 DAI in its bond
    await daiBond.deposit("1000000000000000000000", "60000", deployer.address);

    /// V2 DEPLOYMENTS

    /// Deploy Migrator
    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        ohmv1.address,
        sOHMv1.address,
        olympusTreasuryV1.address,
        stakingV1.address,
        wsOHM.address,
        sushiRouter,
        uniRouter,
        "0",
        authority.address
    );

    /// Deploy OHM v2
    const OHMv2 = await ethers.getContractFactory("TestnetOhm");
    const ohmv2 = await OHMv2.deploy(authority.address);

    /// Deploy sOHM v2
    const SOHMv2 = await ethers.getContractFactory("TestnetSohm");
    const sOHMv2 = await SOHMv2.deploy();

    /// Deploy gOHM
    const GOHM = await ethers.getContractFactory("TestnetGohm");
    const gOHM = await GOHM.deploy(migrator.address, sOHMv2.address);

    /// Set gOHM in Migrator
    await migrator.setgOHM(gOHM.address);

    /// Deploy Treasury V2
    const OlympusTreasuryV2 = await ethers.getContractFactory("TestnetTreasury");
    const olympusTreasuryV2 = await OlympusTreasuryV2.deploy(ohmv2.address, "0", authority.address);

    /// Initialize Treasury V2
    await olympusTreasuryV2.enable("0", migrator.address, zeroAddress);
    await olympusTreasuryV2.enable("1", migrator.address, zeroAddress);
    await olympusTreasuryV2.enable("3", migrator.address, zeroAddress);
    await olympusTreasuryV2.enable("6", migrator.address, zeroAddress);
    await olympusTreasuryV2.enable("8", migrator.address, zeroAddress);
    await olympusTreasuryV2.enable("2", dai.address, zeroAddress);
    await olympusTreasuryV2.enable("0", daiBond.address, zeroAddress);
    await olympusTreasuryV2.enable("0", deployer.address, zeroAddress);
    await olympusTreasuryV2.enable("4", deployer.address, zeroAddress);

    /// Set Migrator perms on Treasury V1
    await olympusTreasuryV1.queue("0", migrator.address);
    await olympusTreasuryV1.toggle("0", migrator.address, zeroAddress);
    await olympusTreasuryV1.queue("1", migrator.address);
    await olympusTreasuryV1.toggle("1", migrator.address, zeroAddress);
    await olympusTreasuryV1.queue("3", migrator.address);
    await olympusTreasuryV1.toggle("3", migrator.address, zeroAddress);
    await olympusTreasuryV1.queue("6", migrator.address);
    await olympusTreasuryV1.toggle("6", migrator.address, zeroAddress);
    await olympusTreasuryV1.queue("8", migrator.address);
    await olympusTreasuryV1.toggle("8", migrator.address, zeroAddress);

    /// Replaces ohm.setVault(olympusTreasuryV2.address)
    await authority.pushVault(olympusTreasuryV2.address, true);

    /// Approve the treasury to spend deployer's DAI
    await dai.approve(olympusTreasuryV2.address, largeApproval);

    /// Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excess reserves
    await olympusTreasuryV2.deposit("9000000000000000000000000", dai.address, "8400000000000000");

    /// Deploy Staking V2
    const StakingV2 = await ethers.getContractFactory("TestnetStaking");
    const stakingV2 = await StakingV2.deploy(
        ohmv2.address,
        sOHMv2.address,
        gOHM.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber,
        authority.address
    );

    /// Deploy Distributor V2
    const DistributorV2 = await ethers.getContractFactory("TestnetDistributor");
    const distributorV2 = await DistributorV2.deploy(
        olympusTreasuryV2.address,
        ohmv2.address,
        stakingV2.address,
        authority.address,
        initialRewardRate
    );

    /// Set Distributor V2 Treasury Perms
    await olympusTreasuryV2.enable("8", distributorV2.address, zeroAddress);

    /// Deploy Inverse Bonds
    const InverseBonds = await ethers.getContractFactory("TestnetOPBondDepo");
    const inverseBonds = await InverseBonds.deploy(authority.address);

    /// Initialize sOHM V2
    await sOHMv2.setIndex(initialIndex);
    await sOHMv2.setgOHM(gOHM.address);
    await sOHMv2.initialize(stakingV2.address, olympusTreasuryV2.address);

    /// Initialize Staking V2 with Distributor V2
    await stakingV2.setDistributor(distributorV2.address);

    /// Migrate contracts so Staking V2 can mint gOHM
    await migrator.migrateContracts(
        olympusTreasuryV2.address,
        stakingV2.address,
        ohmv2.address,
        sOHMv2.address,
        dai.address
    );

    /// Deploy Tyche
    const YieldDirector = await ethers.getContractFactory("YieldDirector");
    const yieldDirector = await YieldDirector.deploy(
        sOHMv2.address,
        gOHM.address,
        stakingV2.address,
        authority.address
    );

    /// Deploy Faucet
    const Faucet = await ethers.getContractFactory("DevFaucet");
    const faucet = await Faucet.deploy(
        dai.address,
        ohmv1.address,
        ohmv2.address,
        wsOHM.address,
        stakingV1.address,
        stakingV2.address,
        authority.address
    );

    /// Fund Faucet
    /// Deposit 100,000 DAI
    await dai.connect(deployer).transfer(faucet.address, "100000000000000000000000");

    /// Deposit 100,000 OHMv1
    await ohmv1.connect(deployer).transfer(faucet.address, "100000000000000");

    /// Deposit 100,000 OHMv2
    await ohmv2.connect(deployer).transfer(faucet.address, "100000000000000");

    /// Contract Addresses
    console.log("OHMv1: " + ohmv1.address);
    console.log("OHMv2: " + ohmv2.address);
    console.log("sOHMv1: " + sOHMv1.address);
    console.log("sOHMv2: " + sOHMv2.address);
    console.log("wsOHM: " + wsOHM.address);
    console.log("gOHM: " + gOHM.address);
    console.log("DAI: " + DAI);
    console.log("TreasuryV1: " + olympusTreasuryV1.address);
    console.log("TreasuryV2: " + olympusTreasuryV2.address);
    console.log("DAI Bond: " + daiBond.address);
    console.log("StakingV1: " + stakingV1.address);
    console.log("StakingV2: " + stakingV2.address);
    console.log("StakingWarmupV1: " + stakingWarmupV1.address);
    console.log("StakingHelperV1: " + stakingHelperV1.address);
    console.log("DistributorV1: " + distributorV1.address);
    console.log("DistributorV2: " + distributorV2.address);
    console.log("Migrator: " + migrator.address);
    console.log("Inverse Bonds: " + inverseBonds.address);
    console.log("Yield Director: " + yieldDirector.address);
    console.log("Faucet: " + faucet.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
