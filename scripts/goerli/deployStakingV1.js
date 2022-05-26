const { ethers } = require("hardhat");
const { epochLength, firstEpochNumber, firstBlockNumber } = require("./constants");

async function main() {
  const [deployer] = await ethers.getSigners();

  const ohmV1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";
  const sohmV1 = "0x6BfbD5A8B09dd27fDDE73B014c664A5330C23Bfa";
  
  const StakingV1 = await ethers.getContractFactory("TestnetStakingV1");
  const stakingV1 = await StakingV1.deploy(
    ohmV1,
    sohmV1,
    epochLength,
    firstEpochNumber,
    firstBlockNumber
);

  console.log("Staking V1: " + stakingV1.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
