const { ethers, getChainId, config } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');
  const sBrickArtifact = await get('sOlympus');
  const distributorArtifact = await get('Distributor');
  const chainId = await getChainId();
  const epochLength = config.protocolParameters[chainId].epochLength;

  const distributor = (
    await ethers.getContractFactory('Distributor')
  ).attach(distributorArtifact.address);
  // TODO: Fix this.
  const firstEpochTime = await distributor.nextEpochTime();
  // TODO: What should firstEpochNumber be?
  // I guess it doesn't matter what it is as it is only used for tracking warmup period.
  const firstEpochNumber = 0;

  const stakingDeployment = await deploy('OlympusStaking', {
    from: deployer,
    args: [
      brickArtifact.address,
      sBrickArtifact.address,
      epochLength,
      firstEpochNumber,
      firstEpochTime,

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

  // TODO: confirm with the team, this is 0.3% per epoch
  const initialRewardRate = 3000;
  await distributor.addRecipient(stakingDeployment.address, initialRewardRate);
};
module.exports.tags = ['Staking', 'AllEnvironments'];