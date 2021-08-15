const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const Frax = '0x853d955acef822db058eb8505911ed77f175b99e';
    const Booster = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';
    const rewardPool = '0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e';
    const curvePool = '0xA79828DF1850E8a3A3064576f380D90aECDD3359';
    const time = '6600';
    const fraxIndex = '0';
    const olympusTreasury = '0x31F8Cc382c9898b273eff4e0b7626a6987C846E8';

    const crv = '0xd533a949740bb3306d119cc777fa900ba034cd52';
    const cvx = '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b';
    const fxs = '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0';

    const policyAddress = '0x0cf30dc0d48604A301dF8010cdc028C055336b2E';

    const curveToken = '0xd632f22692fac7611d2aa1c0d552930d43caed3b';
    const max = '334000000000000000000000';
    const pid = '32';

    const ConvexAllocator = await ethers.getContractFactory('ConvexAllocator');
    const convexAllocator = await ConvexAllocator.deploy(olympusTreasury, Booster, rewardPool, curvePool, time );

    await convexAllocator.addToken(Frax, curveToken, fraxIndex, max, pid );

    await convexAllocator.addRewardToken(crv);
    await convexAllocator.addRewardToken(cvx);
    await convexAllocator.addRewardToken(fxs);

    await convexAllocator.pushManagement(policyAddress);

    console.log( "Convex Allocator: " + convexAllocator.address ); 
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})