const { ethers } = require("hardhat");
const { zeroAddress } = require("./constants");

async function main() {
    const [deployer] = await ethers.getSigners();

    const treasuryV1 = "0xd2D1be4AfeBb2aa1af67F173216552fBC1FD3D13";
    const ohmV1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";
    const dai = "0x26Ea52226a108ba48b9343017A5D0dB1456D4474";

    const DAIBond = await ethers.getContractFactory("TestnetBondDepoV1");
    const daiBond = await DAIBond.deploy(ohmV1, dai, treasuryV1, deployer.address, zeroAddress);

    console.log("DAI Bond: " + daiBond.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
