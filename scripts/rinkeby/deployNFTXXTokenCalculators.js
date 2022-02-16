const {ethers} = require("hardhat");
const nftxInventoryStakingAddr = "0x05aD54B40e3be8252CB257f77d9301E9CB1A9470";
const nftxLiquidityStakingAddr = "0xcd0dfb870A60C30D957b0DF1D180a236a55b5740";
const treasuryAddr = "0x90A2c593116Ba04B99E395438bc3DC0c55aAd240";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to Rinkeby with the account: " + deployer.address);

  const NFTXXTokenCalculator = await ethers.getContractFactory("NFTXXTokenCalculator");
  const nftxXTokenCalculator = await NFTXXTokenCalculator.deploy(
    nftxInventoryStakingAddr,
    treasuryAddr
  );

  const NFTXXTokenWethCalculator = await ethers.getContractFactory("NFTXXTokenWethCalculator");
  const nftxXTokenWethCalculator = await NFTXXTokenWethCalculator.deploy(
    nftxLiquidityStakingAddr,
    treasuryAddr
  );

  console.log("NFTXXTokenCalculator:", nftxXTokenCalculator.address);
  console.log("NFTXXTokenWethCalculator:", nftxXTokenWethCalculator.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
