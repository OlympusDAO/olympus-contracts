const { ethers } = require("hardhat");

async function main() {
	const yieldDirectorFactory = await ethers.getContractFactory('YieldDirector');
    const yieldDirector = await yieldDirectorFactory.deploy('0x73CFE79A66D7Ca687081A489A269e22974B7e3E2');

	await yieldDirector.deployed();
	console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})