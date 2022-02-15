const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const floorTokenAddr = "0x46A5f5d91F02a5250e83ebE6bb8B0bDF0669b809";

    console.log("Deploying FloorBondingCalculator...");

    const BondingCalculator = await ethers.getContractFactory("FloorBondingCalculator");
    const bondingCalculator = await BondingCalculator.deploy(floorTokenAddr);

    console.log("BondingCalculator:", bondingCalculator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
