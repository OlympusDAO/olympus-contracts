const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const floorAuthorityAddr = "0x667f44F1Dd002e33500046B2AC460F6BC508f4e8";
    const floorTreasuryAddr = "0xE1bCb3d265b2a2C8E856537b4614af84Bf7C90BB";

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
