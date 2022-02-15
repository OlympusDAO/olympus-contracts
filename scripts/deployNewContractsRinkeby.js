const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts to Rinkeby with the account: " + deployer.address);

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
    console.log("Setting Treasury as vault authority");
    await authority.pushVault(floorTreasury.address, true);
    console.log("Enabling reserve and liquidity tokens");
    await floorTreasury.enable("2", "0x4F2645F3D8e2542076A49De3F505016DC0a496B0", "0x0000000000000000000000000000000000000000"); // WEETH
    await floorTreasury.enable("2", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000"); // PUNK
    await floorTreasury.enable("2", "0x1a8818eabe7f88f9c2a2dd39f2e7a9b55354f87a", "0x0000000000000000000000000000000000000000"); // PUNKWETH SLP
    console.log("Setting governance as reserve depositor");
    await floorTreasury.enable("0", "0x6ce798Bc8C8C93F3C312644DcbdD2ad6698622C5", "0x0000000000000000000000000000000000000000");
    console.log("Setting PUNK risk off valuation")
    await floorTreasury.enable("8", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000");
    await floorTreasury.setRiskOffValuation("0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "20000000000000");
    console.log("Setting up Bond Depo and Staking Distrubtor permissions");
    await floorTreasury.enable("0", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reserve Depositor
    await floorTreasury.enable("9", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
    await floorTreasury.enable("9", distributor.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
    console.log("Initializing Treasury to use timelock");
    await floorTreasury.initialize();
    // Set Governor/Policy/Guardian Authority addresses
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
