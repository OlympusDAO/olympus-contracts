const { ethers } = require("hardhat");

async function main() {
    // v1 sOHM contract
    const sOhmMainnet = '0x73CFE79A66D7Ca687081A489A269e22974B7e3E2';

    // Initialize sOHM to index of 1 and rebase percentage of 1%
    const mockSOhmFactory = await ethers.getContractFactory("MockSOHM");
    const mockSOhm = await mockSOhmFactory.deploy("1000000000", "10000000");

	const yieldDirectorFactory = await ethers.getContractFactory('YieldDirector');
    const yieldDirector = await yieldDirectorFactory.deploy(mockSOhm.address);
    //const yieldDirector = await yieldDirectorFactory.deploy(sOhmMainnet);

    console.log("SOHM DEPLOYED AT", mockSOhm.address);
	console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})