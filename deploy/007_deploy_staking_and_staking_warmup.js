const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');
  const sBrickArtifact = await get('sOlympus');
  const distributorArtifact = await get('Distributor');
  const epochLengthInBlocks = 32000;

  const distributor = (
    await ethers.getContractFactory('Distributor')
  ).attach(distributorArtifact.address);
  const firstEpochBlock = await distributor.nextEpochBlock();
  // TODO: What should firstEpochNumber be?
  // I guess it doesn't matter what it is as it is only used for tracking warmup period.
  const firstEpochNumber = 0;

  const stakingDeployment = await deploy('OlympusStaking', {
    from: deployer,
    args: [
      brickArtifact.address,
      sBrickArtifact.address,
      epochLengthInBlocks,
      firstEpochNumber,
      firstEpochBlock,

    ],
    log: true,
  });

  const stakingWarmupDeployment = await deploy('StakingWarmup', {
    from: deployer,
    args: [
      stakingDeployment.address,
      sBrickArtifact.address,
    ],
    log: true,
  });

  const staking = (
    await ethers.getContractFactory('OlympusStaking')
  ).attach(stakingDeployment.address);

  await staking.setContract('0', distributorArtifact.address);
  await staking.setContract('1', stakingWarmupDeployment.address);
};
module.exports.tags = ['Staking', 'AllEnvironments'];