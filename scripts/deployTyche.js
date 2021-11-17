const { ethers } = require("hardhat");

async function main() {
    // v1 sOHM contract
    const sOhmMainnet = '0x73CFE79A66D7Ca687081A489A269e22974B7e3E2';

    const mockSohmDeployment = "0xD12Ca288c54453684645EeaA079cB328B8eA2DD5";

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