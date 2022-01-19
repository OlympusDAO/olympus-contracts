const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const authority = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";
    const ohm = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    const gohm = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
    const staking = "0xB63cac384247597756545b500253ff8E607a8020";
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";

    const depoFactory = await ethers.getContractFactory("OlympusBondDepositoryV2");

    const depo = await depoFactory.deploy(authority, ohm, gohm, staking, treasury);

    console.log("Bond Depo: " + depo.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
