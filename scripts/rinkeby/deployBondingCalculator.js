const {ethers} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);

  const weeth = "0x4F2645F3D8e2542076A49De3F505016DC0a496B0";
  const punk = "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D";

  console.log("Deploying FloorBondingCalculator...");

  const BondingCalculator = await ethers.getContractFactory("TokenWethCalculator");
  const bondingCalculator = await BondingCalculator.deploy(punk, weeth, 40000);

  console.log("TokenWethCalculator:", bondingCalculator.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
