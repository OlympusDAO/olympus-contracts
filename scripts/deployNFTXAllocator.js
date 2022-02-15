const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const floorAuthorityAddr = "0xb1D93002842f166BDb575b09bfd6b064eA0B75A2";
    const floorTreasuryAddr  = "0x661dbf7fe6DE157A02A41f9B8839FBe7586C4e2D";

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
