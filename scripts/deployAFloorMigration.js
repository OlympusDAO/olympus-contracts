const {ethers} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: " + deployer.address);

  console.log("Deploying aFLOOR Migration...");

  const AlphaFloorMigration = await ethers.getContractFactory("AlphaFloorMigration");
  const alphaFloorMigration = await AlphaFloorMigration.deploy();

  console.log("");
  console.log("aFLOOR Migration:", alphaFloorMigration.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
