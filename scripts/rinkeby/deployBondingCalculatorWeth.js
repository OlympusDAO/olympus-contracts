const {ethers} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);

  const weth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const punk = "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D";

  console.log("Deploying FloorBondingCalculator...");

  const BondingCalculator = await ethers.getContractFactory("TokenWethCalculator");
  const bondingCalculator = await BondingCalculator.deploy(punk, weth, 40000);

  console.log("BondingCalculator:", bondingCalculator.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
