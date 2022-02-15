const {ethers} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: " + deployer.address);

  console.log("Deploying Vesting...");

  const Vesting = await ethers.getContractFactory("VestingClaim");
  const vesting = await Vesting.deploy();

  console.log("");
  console.log("Vesting:", vesting.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
