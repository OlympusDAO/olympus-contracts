const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
    const FRAX = "0x2F7249cb599139e560f0c81c269Ab9b04799E453";

    // Deplopy new OHM token
    const OlympusERC20Token = await ethers.getContractFactory('OlympusERC20Token');
    const olympusERC20Token = await OlympusERC20Token.deploy();

    // Deploy new Olympus Treasury
    const OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
    const olympusTreasury = await OlympusTreasury.deploy(olympusERC20Token.address, '0');

    await olympusERC20Token.setVault(olympusTreasury.address);

    await olympusTreasury.queueTimelock('2', DAI, DAI);
    await olympusTreasury.queueTimelock('2', FRAX, FRAX);

    //await olympusTreasury.execute('0');
    //await olympusTreasury.execute('1');

    console.log("OHM Token: " + olympusERC20Token.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})