const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    /// Addresses
    const ohm = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
    const feAuctioneer = "0x007FEA2a31644F20b0fE18f69643890b6F878AA6";
    const feTeller = "0x007FE7c498A2Cf30971ad8f2cbC36bd14Ac51156";
    const gnosisAuction = "0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101";
    const authority = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";

    const ohmBondManagerFactory = await ethers.getContractFactory("OhmBondManager");
    const ohmBondManager = await ohmBondManagerFactory.deploy(
        ohm,
        treasury,
        feAuctioneer,
        feTeller,
        gnosisAuction,
        authority
    );

    console.log("OHM Bond Manager deployed at: ", ohmBondManager.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
