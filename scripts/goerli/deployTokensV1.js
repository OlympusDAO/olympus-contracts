const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const DAI = await ethers.getContractFactory("TestnetDAI");
  const dai = await DAI.deploy(5);

  console.log("DAI: " + dai.address);

  const OHMv1 = await ethers.getContractFactory("TestnetOhmV1");
  const ohmv1 = await OHMv1.deploy();

  console.log("OHMv1: " + ohmv1.address);

  const SOHMv1 = await ethers.getContractFactory("TestnetSohmV1");
  const sOHMv1 = await SOHMv1.deploy();

  console.log("sOHMv1: " + sOHMv1.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });