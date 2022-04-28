const { ethers } = require("hardhat");

async function main() {
    // Mainnet
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
    const ohm = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    const staking = "0xB63cac384247597756545b500253ff8E607a8020";
    const authority = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";

    const distFactory = await ethers.getContractFactory("Distributor");
    const distributor = await distFactory.deploy(
        treasury,
        ohm,
        staking,
        authority,
        1587
    );

    console.log("Mint&Sync Distributor deployed at: ", distributor.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
