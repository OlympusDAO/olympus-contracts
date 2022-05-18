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
    const SOHMv1 = await ethers.getContractFactory("TestnetSohm");
    const sOHMv1 = await SOHMv1.deploy();

    /// Deploy wsOHM v1
    const wsOHM = ""; // Need to find or create

    /// Deploy Treasury V1
    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasuryV1 = await OlympusTreasury.deploy();

    /// Deploy Staking V1
    /// Need to find a contract that's acutally the V1 so it doesn't need gOHM
    const OlympusStaking = await ethers.getContractFactory("OlympusStaking");
    const stakingV1 = await OlympusStaking.deploy(
        ohmv1.address,
        sOHMv1.address,
        wsOHM,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
        authority.address
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributorV1 = await Distributor.deploy(
        olympusTreasuryV1.address,
        ohmv1.address,
        stakingV1.address,
        authority.address
    );

    /// Initialize sOHM v1
    await sOHMv1.setIndex("7675210820");
    await sOHMv1.initialize(stakingV1.address);
}
