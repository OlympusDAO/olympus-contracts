const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const authority = "0x9fC6e7Fe7C32F0Fb827756dF37B6A150A17BA67e";
    const floor = "0x632FF73a687E40145fd30CA572992116F21c4B58";
    const gfloor = "0x34eE222586eefb6Af4C1BB8a524A471A1c7B912d";
    const staking = "0xC8eE78587c44BEef450b279c82241955C14e9c78";
    const treasury = "0x8E8485A783b6660a9651e097B369B5Cd8F443F0F";

    const depoFactory = await ethers.getContractFactory("FloorBondDepository");

    const depo = await depoFactory.deploy(
        authority,
        floor,
        gfloor,
        staking,
        treasury
    );

    console.log("Bond Depo: " + depo.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
}) 