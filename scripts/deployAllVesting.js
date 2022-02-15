const {ethers} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: " + deployer.address);


  console.log("Deploying aFLOOR...");

  const AFLOOR = await ethers.getContractFactory("AlphaFLOOR");
  const aFLOOR = await AFLOOR.deploy();

  console.log("Deploying aFLOOR Migration...");

  const AlphaFloorMigration = await ethers.getContractFactory("AlphaFloorMigration");
  const alphaFloorMigration = await AlphaFloorMigration.deploy();

  console.log("Deploying Vesting...");

  const Vesting = await ethers.getContractFactory("VestingClaim");
  const vesting = await Vesting.deploy();

  console.log("");
  console.log("aFLOOR:", aFLOOR.address);
  console.log("aFLOOR Migration:", alphaFloorMigration.address);
  console.log("Vesting:", vesting.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
