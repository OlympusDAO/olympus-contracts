const { ethers } = require("hardhat");

async function main() {
    // v1 sOHM contract
    const sOhmMainnet = '0x73CFE79A66D7Ca687081A489A269e22974B7e3E2';

    const mockSohmDeployment = "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727";

    const yieldDirectorFactory = await ethers.getContractFactory('YieldDirector');
    //const yieldDirector = await yieldDirectorFactory.deploy(mockSOhm.address);
    const yieldDirector = await yieldDirectorFactory.deploy(mockSohmDeployment);

    //console.log("SOHM DEPLOYED AT", mockSOhm.address);
	console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})