const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);


    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";
    const gOHM = "0x025d3EBB9d7a3f3De5c8868CfAC82209774e084D";

    const OHM = await ethers.getContractFactory('OlympusERC20Token');
    const ohm = await OHM.deploy();

    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(ohm.address, '0');

    const SOHM = await ethers.getContractFactory('sOlympus');
    const sOHM = await SOHM.deploy();

    const OlympusStaking = await ethers.getContractFactory('OlympusStaking');
    const staking = await OlympusStaking.deploy(ohm.address, sOHM.address, '2200', firstEpochNumber, firstBlockNumber);

    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(olympusTreasury.address, ohm.address, staking.address );

    //await sOHM.setIndex('7675210820');
    await sOHM.setgOHM(gOHM);
    //await sOHM.initialize(staking.address);
    
    //await staking.setContract('0', distributor.address);
    await staking.setContract('1', gOHM);


    console.log("OHM: " + ohm.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
    console.log("Staked Olympus: " + sOHM.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})