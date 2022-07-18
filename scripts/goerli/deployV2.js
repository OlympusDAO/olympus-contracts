const { ethers } = require("hardhat");
const { mainModule } = require("process");
const {
    sushiRouter,
    uniRouter,
    epochLength,
    firstEpochNumber,
    firstBlockNumber,
    initialRewardRate,
} = require("./constants");

async function deploy() {
    /// Establish deployer
    const [deployer] = await ethers.getSigners();

    /// Establish already deployed contracts
    const authority = "0x571CB39Ce761A60992494Ed5a90db545Cb5739aB";
    const dai = "0x26Ea52226a108ba48b9343017A5D0dB1456D4474";
    const ohmv1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";
    const sohmv1 = "0x6BfbD5A8B09dd27fDDE73B014c664A5330C23Bfa";
    const wsohm = "0x284BBa240a149D2D0aB97d84D62038a58A7Fe7C1";
    const treasuryv1 = "0xd2D1be4AfeBb2aa1af67F173216552fBC1FD3D13";
    const stakingv1 = "0x1c18053B3FD90FC5C4Af7267D3B4D49Aa63396C1";

    /// Deploy Migrator
    const Migrator = await ethers.getContractFactory("OlympusTokenMigrator");
    const migrator = await Migrator.deploy(
        ohmv1,
        sohmv1,
        treasuryv1,
        stakingv1,
        wsohm,
        sushiRouter,
        uniRouter,
        "0",
        authority
    );
    await migrator.deployTransaction.wait();

    /// Deploy OHM v2
    const OHMv2 = await ethers.getContractFactory("TestnetOhm");
    const ohmv2 = await OHMv2.deploy(authority);
    await ohmv2.deployTransaction.wait();

    /// Deploy sOHM v2
    const SOHMv2 = await ethers.getContractFactory("TestnetSohm");
    const sOHMv2 = await SOHMv2.deploy();
    await sOHMv2.deployTransaction.wait();

    /// Deploy gOHM
    const GOHM = await ethers.getContractFactory("TestnetGohm");
    const gOHM = await GOHM.deploy(migrator.address, sOHMv2.address);
    await gOHM.deployTransaction.wait();

    /// Deploy Treasury V2
    const OlympusTreasuryV2 = await ethers.getContractFactory("TestnetTreasury");
    const olympusTreasuryV2 = await OlympusTreasuryV2.deploy(ohmv2.address, "0", authority);
    await olympusTreasuryV2.deployTransaction.wait();

    /// Deploy Staking V2
    const StakingV2 = await ethers.getContractFactory("TestnetStaking");
    const stakingV2 = await StakingV2.deploy(
        ohmv2.address,
        sOHMv2.address,
        gOHM.address,
        epochLength,
        firstEpochNumber,
        firstBlockNumber,
        authority
    );
    await stakingV2.deployTransaction.wait();

    /// Deploy Distributor V2
    const DistributorV2 = await ethers.getContractFactory("TestnetDistributor");
    const distributorV2 = await DistributorV2.deploy(
        olympusTreasuryV2.address,
        ohmv2.address,
        stakingV2.address,
        authority,
        initialRewardRate
    );
    await distributorV2.deployTransaction.wait();

    /// Deploy Inverse Bonds
    const InverseBonds = await ethers.getContractFactory("TestnetOPBondDepo");
    const inverseBonds = await InverseBonds.deploy(authority);
    await inverseBonds.deployTransaction.wait();

    /// Deploy Tyche
    const YieldDirector = await ethers.getContractFactory("YieldDirector");
    const yieldDirector = await YieldDirector.deploy(
        sOHMv2.address,
        gOHM.address,
        stakingV2.address,
        authority
    );
    await yieldDirector.deployTransaction.wait();

    /// Deploy Faucet
    const Faucet = await ethers.getContractFactory("DevFaucet");
    const faucet = await Faucet.deploy(
        dai,
        ohmv1,
        ohmv2.address,
        wsohm,
        stakingv1,
        stakingV2.address,
        authority
    );
    await faucet.deployTransaction.wait();

    console.log("Migrator: " + migrator.address);
    console.log("OHM v2: " + ohmv2.address);
    console.log("sOHM v2: " + sOHMv2.address);
    console.log("gOHM: " + gOHM.address);
    console.log("Treasury V2: " + olympusTreasuryV2.address);
    console.log("Staking V2: " + stakingV2.address);
    console.log("Distributor V2: " + distributorV2.address);
    console.log("Inverse Bonds: " + inverseBonds.address);
    console.log("Yield Director: " + yieldDirector.address);
    console.log("Faucet: " + faucet.address);
}

deploy()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
