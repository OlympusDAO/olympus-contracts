const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const floorAuthorityAddr = "0x38AFE493B59eb500368aFcA243CB119EB28FDd12";
    const floorTreasuryAddr = "0x8dd21297393c5A21973BcA4E11F826F60c48828d";

    const nftxInventoryStakingAddr = "0x05aD54B40e3be8252CB257f77d9301E9CB1A9470";
    const nftxLiquidityStakingAddr = "0xcd0dfb870A60C30D957b0DF1D180a236a55b5740";

    console.log("Deploying NFTXAllocator...");

    const nftxAllocatorContract = await ethers.getContractFactory("NFTXAllocator");
    const nftxAllocatorDepo = await nftxAllocatorContract.deploy(
        floorAuthorityAddr,
        nftxInventoryStakingAddr,
        nftxLiquidityStakingAddr,
        floorTreasuryAddr
    );

    console.log("NFTXAllocator:", nftxAllocatorDepo.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
