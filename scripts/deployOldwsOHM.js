const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const oldsOHM = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";

    const WSOHM = await ethers.getContractFactory("wOHM");
    const wsOHM = await WSOHM.deploy(oldsOHM);

    console.log("old wsOHM: " + wsOHM.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
