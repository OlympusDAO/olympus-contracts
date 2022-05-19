const { ethers } = require("hardhat");

async function main() {
    /// Establish deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    /// Establish external addresses
    const DAI = ""; // Need to find or create
    const FRAX = ""; // Need to find or create
    const LUSD = ""; // Need to find or create
    const sushiRouter = ""; // Need to find or replace
    const uniRouter = ""; // Need to find

    /// Establish static values
    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    /// Deploy Authority
    const Authority = await ethers.getContractFactory("OlympusAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    /// Deploy OHM v1
    const OHMv1 = await ethers.getContractFactory("TestnetOhmV1");
    const ohmv1 = await OHMv1.deploy(authority.address);

    /// Deploy sOHM v1
    const SOHMv1 = await ethers.getContractFactory("TestnetSohmV1");
    const sOHMv1 = await SOHMv1.deploy();

    /// Deploy wsOHM v1
    const WSOHM = await ethers.getContractFactory('TestnetwsOhmV1');
    const wsOHM = await wsOHM.deploy();

    /// Deploy Treasury V1
    const OlympusTreasury = await ethers.getContractFactory("TestnetTreasuryV1");
    const olympusTreasuryV1 = await OlympusTreasury.deploy();

    /// Deploy Staking V1
    /// Need to find a contract that's acutally the V1 so it doesn't need gOHM
    const StakingV1 = await ethers.getContractFactory("TestnetStakingV1");
    const stakingV1 = await StakingV1.deploy(
        ohmv1.address,
        sOHMv1.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
    );

    const DistributorV1 = await ethers.getContractFactory("TestnetDistributorV1");
    const distributorV1 = await DistributorV1.deploy(
        olympusTreasuryV1.address,
        ohmv1.address,
        "2200",
        firstEpochNumber,
    );

    /// Initialize sOHM v1
    await sOHMv1.setIndex("7675210820");
    await sOHMv1.initialize(stakingV1.address);

    await stakingV1.setContract('0', distributorV1.address);
}
