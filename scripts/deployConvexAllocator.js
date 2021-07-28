const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const Frax = '0x853d955acef822db058eb8505911ed77f175b99e';
    const Booster = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';
    const rewardPool = '0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e';
    const curvePool = '0xA79828DF1850E8a3A3064576f380D90aECDD3359';
    const time = '0';

    const curveToken = '0xd632f22692fac7611d2aa1c0d552930d43caed3b';
    const max = '100000000000000000000000';
    const pid = '32';

    // Deploy treasury
    const Treasury = await ethers.getContractFactory('TestTreasury'); 
    const treasury = await Treasury.deploy();

    const ConvexAllocator = await ethers.getContractFactory('ConvexAllocator');
    const convexAllocator = await ConvexAllocator.deploy(treasury.address, Booster, rewardPool, curvePool, time );

    await convexAllocator.addToken(Frax, curveToken, max, pid );

    await treasury.toggle('0', deployer.address);
    await treasury.toggle('0', convexAllocator.address);
    await treasury.toggle('1', deployer.address);
    await treasury.toggle('2', Frax);
    await treasury.toggle('3', convexAllocator.address);

    console.log( "Treasury: " + treasury.address ); 
    console.log( "Convex Allocator: " + convexAllocator.address ); 
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})