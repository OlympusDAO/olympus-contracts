const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    // Mainnet sOHM contract
    const sOhmMainnet = "0x04906695D6D12CF5459975d7C3C03356E4Ccd460";
    const authorityMainnet = "0x1c21f8ea7e39e2ba00bc12d2968d63f4acb38b7a";

    // Testnet
    //const mockSohmDeployment = "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727";
    const sohmDeployment = "0x0fa861D68db468A477415445fBCA71995d8Ed591";
    const gohmDeployment = "0xB4Aaf6857411248A79B95bcb1C13E86140fE9C29";
    const stakingDeployment = "0x9Aca02ceBD184624DCc1869B33aeD9f8c9670462";
    const authorityDeployment = "0x4208befD8f546282aB43A30085774513227B656C";

    const yieldDirectorFactory = await ethers.getContractFactory("YieldDirectorV2");
    //const yieldDirector = await yieldDirectorFactory.deploy(mockSOhm.address);

    const yieldDirector = await yieldDirectorFactory.deploy(sohmDeployment, gohmDeployment, stakingDeployment, authorityDeployment);

    //console.log("SOHM DEPLOYED AT", mockSOhm.address);
    console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
