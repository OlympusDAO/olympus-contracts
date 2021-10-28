const { ethers } = require("hardhat");

async function main() {
	const yieldDirectorFactory = await ethers.getContractFactory('YieldDirector');
    const yieldDirector = await yieldDirectorFactory.deploy('0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932', '0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084');

	await yieldDirector.deployed();
	console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})