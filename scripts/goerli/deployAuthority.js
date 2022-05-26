const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Authority = await ethers.getContractFactory("OlympusAuthority");
  const authority = await Authority.deploy(
      deployer.address,
      deployer.address,
      deployer.address,
      deployer.address
  );

  console.log("Authority: " + authority.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
