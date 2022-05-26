const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const stakingV1 = "0x1c18053B3FD90FC5C4Af7267D3B4D49Aa63396C1";
  const sohmV1 = "0x6BfbD5A8B09dd27fDDE73B014c664A5330C23Bfa";

  const StakingWarmupV1 = await ethers.getContractFactory("TestnetStakingWarmupV1");
  const stakingWarmupV1 = await StakingWarmupV1.deploy(stakingV1, sohmV1);

  console.log("Staking Warmup: " + stakingWarmupV1.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
