const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const sOHM = '0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084';
    const blocksCanClaim = '6500';
    const amountDrip = '10000000000';


    // Deploy Staking
    const SOHMFaucet = await ethers.getContractFactory('SOHMFaucet');
    const sOHMFaucet = await SOHMFaucet.deploy(sOHM, blocksCanClaim, amountDrip);

    console.log( "sOHM faucet: " + sOHMFaucet.address );
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})