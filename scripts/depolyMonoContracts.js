const { ethers } = require("hardhat");

async function main() {

    // this deployer must be same with monoswap-core (vCASH) deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const firstEpochNumber = '0';
    const firstBlockNumber = '0';
    
    const authority = deployer.address;
    const migrator = deployer.address;

    const VCASH = await ethers.getContractFactory('VCASH');
    const vcash = await VCASH.deploy(authority);

    const SOHM = await ethers.getContractFactory('sOlympus');
    const sOHM = await SOHM.deploy();

    const GOHM = await ethers.getContractFactory('gOHM');
    const gOHM = await GOHM.deploy(migrator, sOHM.address);

    const OlympusBondingCalculator = await ethers.getContractFactory('OlympusBondingCalculator');
    const bondingCalculator = await OlympusBondingCalculator.deploy(vcash.address);

    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(vcash.address, '0', authority);

    const OlympusStaking = await ethers.getContractFactory('OlympusStaking');
    const staking = await OlympusStaking.deploy(vcash.address, sOHM.address, gOHM.address, '2200', firstEpochNumber, firstBlockNumber, authority);

    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(olympusTreasury.address, vcash.address, staking.address, authority );

    await vcash.deployed()
    await olympusTreasury.deployed()
    await sOHM.deployed()
    await distributor.deployed()
    await bondingCalculator.deployed()

    await sOHM.setIndex('0');
    await sOHM.setgOHM(gOHM.address);
    await sOHM.initialize(staking.address, olympusTreasury.address);

    await vcash.setMinter(olympusTreasury.address)

    console.log("VCASH: " + vcash.address);
    console.log("sOHM: " + sOHM.address);
    console.log("gOHM: " + gOHM.address);
    console.log("BondingCalculator: " + bondingCalculator.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);    // await sOHM.setIndex('');
    console.log("Staked Olympus: " + sOHM.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);

    try {
        await hre.run("verify:verify", {
            address: vcash.address,
            constructorArguments: [
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: sOHM.address,
            constructorArguments: [
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: gOHM.address,
            constructorArguments: [
                migrator,
                sOHM.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: bondingCalculator.address,
            constructorArguments: [
                vcash.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: olympusTreasury.address,
            constructorArguments: [
                vcash.address,
                '0',
                authority
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [
            vcash.address,
            sOHM.address,
            gOHM.address,
            '2200',
            firstEpochNumber,
            firstBlockNumber,
            authority
        ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
        address: distributor.address,
        constructorArguments: [
            olympusTreasury.address,
            vcash.address,
            staking.address,
            authority 
        ],
        })
    } catch(e) {
        console.log(e)
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})