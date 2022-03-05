const { ethers } = require("hardhat");

async function main() {
    // Mainnet
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
    const authority = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";

    const teFactory = await ethers.getContractFactory("TreasuryExtender");
    const treasuryExtender = await teFactory.deploy(treasury, authority);

    console.log("Treasury Extender deployed at: ", treasuryExtender.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
