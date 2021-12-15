const { ethers } = require("hardhat");

async function main() {
    // v1 sOHM contract
    const sOhmMainnet = '0x73CFE79A66D7Ca687081A489A269e22974B7e3E2';

    //const mockSohmDeployment = "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727";
    const mockSohmDeployment = "0x424426FB5E93A4E039CD79E0Cba4Fa220cE945C3";
    const authorityDeployment = "0x52a3a2A45D837247B4Eca824583bAdaFfD4151dd"

    const yieldDirectorFactory = await ethers.getContractFactory('YieldDirector');
    //const yieldDirector = await yieldDirectorFactory.deploy(mockSOhm.address);
    const yieldDirector = await yieldDirectorFactory.deploy(mockSohmDeployment, authorityDeployment);

    //console.log("SOHM DEPLOYED AT", mockSOhm.address);
	console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})