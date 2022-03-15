const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    // Mainnet sOHM contract
    const sOhmMainnet = "0x04906695D6D12CF5459975d7C3C03356E4Ccd460";
    const authorityMainnet = "0x1c21f8ea7e39e2ba00bc12d2968d63f4acb38b7a";

    // Testnet
    //const mockSohmDeployment = "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727";
    const sohmDeployment = "0xebED323CEbe4FfF65F7D7612Ea04313F718E5A75";
    const gohmDeployment = "0xcF2D6893A1CB459fD6B48dC9C41c6110B968611E";
    const stakingDeployment = "0x06984c3A9EB8e3A8df02A4C09770D5886185792D";
    const authorityDeployment = "0x4208befd8f546282ab43a30085774513227b656c";

    const yieldDirectorFactory = await ethers.getContractFactory("YieldDirector");
    //const yieldDirector = await yieldDirectorFactory.deploy(mockSOhm.address);

    const yieldDirector = await yieldDirectorFactory.deploy(
        sohmDeployment,
        gohmDeployment,
        stakingDeployment,
        authorityDeployment
    );

    //console.log("SOHM DEPLOYED AT", mockSOhm.address);
    console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
