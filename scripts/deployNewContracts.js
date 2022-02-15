const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    // const firstEpochNumber = "";
    // const firstBlockNumber = "";
    // const gFLOOR = "";
    // const authority = "";

    const firstEpochNumber = "0"; // NOTE: "550" taken from deployAll.js
    const blockNumber = await ethers.provider.getBlockNumber();
    const firstBlockNumber = blockNumber + 2200; // NOTE: "9505000" taken from deployAll.js // this ended up being 3 blocks behind on rinkeby

    console.log("Deploying FloorAuthority...");

    const Authority = await ethers.getContractFactory("FloorAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    console.log("Deploying FloorERC20Token...");

    const FLOOR = await ethers.getContractFactory("FloorERC20Token");
    const floor = await FLOOR.deploy(authority.address);

    console.log("Deploying sFLOOR...");

    const SFLOOR = await ethers.getContractFactory("sFLOOR");
    const sFLOOR = await SFLOOR.deploy();

    console.log("Deploying gFLOOR...");

    const GFLOOR = await ethers.getContractFactory("gFLOOR");
    // NOTE: removed migrator.address
    const gFLOOR = await GFLOOR.deploy(sFLOOR.address);

    console.log("Deploying FloorTreasury...");

    const FloorTreasury = await ethers.getContractFactory("FloorTreasury");
    const floorTreasury = await FloorTreasury.deploy(floor.address, "0", authority.address);

    console.log("Deploying FloorStaking...");

    const FloorStaking = await ethers.getContractFactory("FloorStaking");
    const staking = await FloorStaking.deploy(
        floor.address,
        sFLOOR.address,
        gFLOOR.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
        authority.address
    );

    console.log("Deploying Distributor...");

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        floorTreasury.address,
        floor.address,
        staking.address,
        authority.address
    );

    console.log("Deploying FloorBondDepository...");

    const BondDepo = await ethers.getContractFactory("FloorBondDepository");
    const bondDepo = await BondDepo.deploy(authority.address, floor.address, gFLOOR.address, staking.address, floorTreasury.address);

    /* console.log("Deploying FloorBondingCalculator...");

    const BondingCalculator = await ethers.getContractFactory("FloorBondingCalculator");
    const bondingCalculator = await BondingCalculator.deploy(floor.address); */

    console.log("Setting index...");
    // NOTE: bignum string "0" taken from deployAll.js
    await sFLOOR.setIndex("1000000000");
    console.log("Setting gFLOOR on sFLOOR...");
    await sFLOOR.setgFLOOR(gFLOOR.address);
    console.log("Initializing staking...");
    await sFLOOR.initialize(staking.address, floorTreasury.address);
    console.log("Initializing gFLOOR...");
    await gFLOOR.initialize(staking.address);

    console.log("");
    console.log("FLOOR:", floor.address);
    console.log("gFLOOR:", gFLOOR.address);
    console.log("sFLOOR:", sFLOOR.address);
    console.log("Authority:", authority.address);
    console.log("Treasury:", floorTreasury.address);
    console.log("Staking:", staking.address);
    console.log("Distributor:", distributor.address);
    console.log("BondDepo:", bondDepo.address);
    // console.log("BondingCalc:", bondingCalculator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
