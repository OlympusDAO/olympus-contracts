const { ethers } = require("hardhat");

async function main() {

    // this deployer must be same with monoswap-core (vCASH) deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const firstEpochNumber = "";
    const firstBlockNumber = "";
    const gOHM = "";
    const authority = "";

    const vcashAddress = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";

    const VCASH = await ethers.getContractFactory('VCASH');
    //const vcash = await VCASH.deploy(authority);
    const vcash = await VCASH.attach(vcashAddress);

    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(vcash.address, '0', authority);

    const SOHM = await ethers.getContractFactory('sOlympus');
    const sOHM = await SOHM.deploy();

    const OlympusStaking = await ethers.getContractFactory('OlympusStaking');
    const staking = await OlympusStaking.deploy(vcash.address, sOHM.address, gOHM, '2200', firstEpochNumber, firstBlockNumber, authority);

    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(olympusTreasury.address, vcash.address, staking.address, authority );

    //await vcash.deployed()
    await olympusTreasury.deployed()
    await sOHM.deployed()
    await distributor.deployed()

    await sOHM.setIndex('');
    await sOHM.setgOHM(gOHM);
    await sOHM.initialize(staking.address, olympusTreasury.address);

    await vcash.setMinter(olympusTreasury.address)

    console.log("VCASH: " + vcash.address);
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