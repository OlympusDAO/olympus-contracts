const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const olympusMS = "0x245cc372C84B3645Bf0Ffe6538620B04a217988B";
    const tradePartnerMS = "0x5A21f270492E55Fec2CC78C627618cAE42295695";

    const olympusToken = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
    const externalToken = "0x0391D2021f89DC339F60Fff84546EA23E337750f";

    const olympusAmount = "193550000000000000000";
    const externalAmount = "82372320000000000000000";

    const otcEscrowFactory = await ethers.getContractFactory("OTCEscrow");
    const otcEscrow = await otcEscrowFactory.deploy(
        olympusMS,
        tradePartnerMS,
        olympusToken,
        externalToken,
        olympusAmount,
        externalAmount
    )

    console.log("OTC Escrow deployed at: ", otcEscrow.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
