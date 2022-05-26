const { ethers } = require("hardhat");
const { epochLength, firstBlockNumber } = require("./constants");

async function main() {
  const [deployer] = await ethers.getSigners();

  const treasuryV1 = "0xd2D1be4AfeBb2aa1af67F173216552fBC1FD3D13";
  const ohmV1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";

  const DistributorV1 = await ethers.getContractFactory("TestnetDistributorV1");
  const distributorV1 = await DistributorV1.deploy(
    treasuryV1,
    ohmV1,
    epochLength,
    firstBlockNumber
);

  console.log("Distributor V1: " + distributorV1.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
