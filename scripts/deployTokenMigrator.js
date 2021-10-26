const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
    const oldOHM = "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932";
    const oldsOHM = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";
    const oldStaking = "0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2";
    const oldwsOHM = "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad";
    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const oldTreasury = "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7";

    const Migrator = await ethers.getContractFactory('Migrator');
    const migrator = await Migrator.deploy(oldOHM, oldsOHM, oldTreasury, oldStaking, oldwsOHM, DAI, sushiRouter, uniRouter, '0');

    const GOHM = await ethers.getContractFactory('gOHM');
    const gOHM = await GOHM.deploy(migrator.address);

    await migrator.setgOHM(gOHM.address);


  console.log("Migrator: " + migrator.address);
  console.log("gOHM: " + gOHM.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})