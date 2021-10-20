const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);


    const firstEpochNumber = "";
    const firstBlockNumber = "";
    const gOHM = "0x025d3EBB9d7a3f3De5c8868CfAC82209774e084D";

    const OHM = await ethers.getContractFactory('OlympusERC20Token');
    const ohm = await OHM.deploy();

    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(ohm.address, '0');

    const SOHM = await ethers.getContractFactory('sOlympus');
    const sOHM = await SOHM.deploy();

    const OlympusStaking = await ethers.getContractFactory('OlympusStaking');
    const staking = await OlympusStaking.deploy(ohm.address, sOHM.address, '2200', firstEpochNumber, firstBlockNumber);

    await sOHM.setIndex()
    await sOHM.setgOHM(gOHM);
    await sOHM.initialize(staking.address);
    
    await migrator.setgOHM(gOHM.address);


    console.log("OHM: " + ohm.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
    console.log("Staked Olympus: " + sOHM.address);
    console.log("Staking Contract: " + staking.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})