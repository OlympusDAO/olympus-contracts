const { ethers } = require("hardhat");

/// define future variables
let dai;
let authority;
let ohmv1;
let sOHMv1;
let olympusTreasuryV1;
let stakingV1;
let wsOHM;
let stakingWarmupV1;
let stakingHelperV1;
let distributorV1;
let daiBond;
let migrator;
let ohmv2;
let sOHMv2;
let gOHM;
let olympusTreasuryV2;
let stakingV2;
let distributorV2;
let inverseBonds;
let yieldDirector;
let faucet;

async function deploy() {
    /// Establish deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    /// Establish external addresses
    const DAI = await ethers.getContractFactory("TestnetDAI");
    dai = await DAI.deploy(5);

    /// Deploy Authority
    const Authority = await ethers.getContractFactory("OlympusAuthority");
    authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    /// V1 DEPLOYMENTS

    /// Deploy OHM v1
    const OHMv1 = await ethers.getContractFactory("TestnetOhmV1");
    ohmv1 = await OHMv1.deploy();

    /// Deploy sOHM v1
    const SOHMv1 = await ethers.getContractFactory("TestnetSohmV1");
    sOHMv1 = await SOHMv1.deploy();

    /// Deploy Treasury V1
    const OlympusTreasuryV1 = await ethers.getContractFactory("TestnetTreasuryV1");
    olympusTreasuryV1 = await OlympusTreasuryV1.deploy(ohmv1.address, dai.address, 0);

    /// Deploy Staking V1
    const StakingV1 = await ethers.getContractFactory("TestnetStakingV1");
    stakingV1 = await StakingV1.deploy(
        ohmv1.address,
        sOHMv1.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber
    );

    /// Deploy wsOHM v1
    const WSOHM = await ethers.getContractFactory("TestnetWsohmV1");
    wsOHM = await WSOHM.deploy(stakingV1.address, ohmv1.address, sOHMv1.address);

    /// Deploy Staking V1 Warmup
    const StakingWarmupV1 = await ethers.getContractFactory("TestnetStakingWarmupV1");
    stakingWarmupV1 = await StakingWarmupV1.deploy(stakingV1.address, sOHMv1.address);

    /// Deploy Staking V1 Helper
    const StakingHelperV1 = await ethers.getContractFactory("TestnetStakingHelperV1");
    stakingHelperV1 = await StakingHelperV1.deploy(stakingV1.address, ohmv1.address);

    /// Deploy Distributor V1
    const DistributorV1 = await ethers.getContractFactory("TestnetDistributorV1");
    distributorV1 = await DistributorV1.deploy(
        olympusTreasuryV1.address,
        ohmv1.address,
        epochLength,
        firstEpochNumber
    );

    /// Deploy Bond Depository for DAI
    const DAIBond = await ethers.getContractFactory("TestnetBondDepoV1");
    daiBond = await DAIBond.deploy(
        ohmv1.address,
        dai.address,
        olympusTreasuryV1.address,
        deployer.address,
        zeroAddress
    );

    /// V2 DEPLOYMENTS

    /// Deploy Migrator
    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    migrator = await Migrator.deploy(
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
    ohmv2 = await OHMv2.deploy(authority.address);

    /// Deploy sOHM v2
    const SOHMv2 = await ethers.getContractFactory("TestnetSohm");
    sOHMv2 = await SOHMv2.deploy();

    /// Deploy gOHM
    const GOHM = await ethers.getContractFactory("TestnetGohm");
    gOHM = await GOHM.deploy(migrator.address, sOHMv2.address);

    /// Deploy Treasury V2
    const OlympusTreasuryV2 = await ethers.getContractFactory("TestnetTreasury");
    olympusTreasuryV2 = await OlympusTreasuryV2.deploy(ohmv2.address, "0", authority.address);

    /// Deploy Staking V2
    const StakingV2 = await ethers.getContractFactory("TestnetStaking");
    stakingV2 = await StakingV2.deploy(
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
    distributorV2 = await DistributorV2.deploy(
        olympusTreasuryV2.address,
        ohmv2.address,
        stakingV2.address,
        authority.address,
        initialRewardRate
    );

    /// Deploy Inverse Bonds
    const InverseBonds = await ethers.getContractFactory("TestnetOPBondDepo");
    inverseBonds = await InverseBonds.deploy(authority.address);

    /// Deploy Tyche
    const YieldDirector = await ethers.getContractFactory("YieldDirector");
    yieldDirector = await YieldDirector.deploy(
        sOHMv2.address,
        gOHM.address,
        stakingV2.address,
        authority.address
    );

    /// Deploy Faucet
    const Faucet = await ethers.getContractFactory("DevFaucet");
    faucet = await Faucet.deploy(
        dai.address,
        ohmv1.address,
        ohmv2.address,
        wsOHM.address,
        stakingV1.address,
        stakingV2.address,
        authority.address
    );
}

async function initV1() {
    /// Establish deployer
    const [deployer] = await ethers.getSigners();

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
}

async function initV2() {
    /// Establish deployer
    const [deployer] = await ethers.getSigners();

    /// Set gOHM in Migrator
    await migrator.setgOHM(gOHM.address);

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

    /// Set Distributor V2 Treasury Perms
    await olympusTreasuryV2.enable("8", distributorV2.address, zeroAddress);

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

    /// Fund Faucet
    /// Deposit 100,000 DAI
    await dai.connect(deployer).transfer(faucet.address, "100000000000000000000000");

    /// Deposit 100,000 OHMv1
    await ohmv1.connect(deployer).transfer(faucet.address, "100000000000000");

    /// Deposit 100,000 OHMv2
    await ohmv2.connect(deployer).transfer(faucet.address, "100000000000000");
}

deploy()
    .then(() => {
        console.log("Deployment Complete");

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
    })
    .catch(error => console.log(error));
