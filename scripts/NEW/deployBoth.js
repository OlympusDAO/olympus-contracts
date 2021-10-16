const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);


    const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
    const FRAX = "0x2F7249cb599139e560f0c81c269Ab9b04799E453";
    const DAO = "0xCd68119bac4e5D2Fb1C4723e62165a536Ed7A69B";
    const oldOHM = "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932";
    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const oldOHMDAISLP = "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2";
    const oldTreasury = "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7";
    const wETH = "0x458821d1ebcafc3f185a359c1bf2d27f8421ac14";
    const pendle = "0xe3a5dcdc1da0f3add25e013f9d70a189a333ffc4";

    // Deplopy new OHM token
    const OlympusERC20Token = await ethers.getContractFactory('OlympusERC20Token');
    const olympusERC20Token = await OlympusERC20Token.deploy();

    // Deploy new Olympus Treasury
    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(olympusERC20Token.address, '0');

    await olympusERC20Token.setVault(olympusTreasury.address);

    await olympusTreasury.queueTimelock('2', DAI, DAI);
    await olympusTreasury.queueTimelock('2', FRAX, FRAX);

    // Deplopy token migration
    const OlympusTokenMigration = await ethers.getContractFactory('OlympusTokenMigration');
    const olympusTokenMigration = await OlympusTokenMigration.deploy(deployer.address, DAI, oldOHM, olympusERC20Token.address, sushiRouter, oldOHMDAISLP, oldTreasury, olympusTreasury.address);

    await olympusTreasury.queueTimelock('0', olympusTokenMigration.address, olympusTokenMigration.address);
    await olympusTreasury.queueTimelock('4', olympusTokenMigration.address, olympusTokenMigration.address);

    //await olympusTokenMigration.addTokens([pendle, wETH, FRAX, DAI], ['0', '0', '1', '1']);

    // await olympusTreasury.execute('0');
    // await olympusTreasury.execute('1');
    // await olympusTreasury.execute('2');
    // await olympusTreasury.execute('3');

    console.log("OHM Token: " + olympusERC20Token.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
    console.log("Migration: " + olympusTokenMigration.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})