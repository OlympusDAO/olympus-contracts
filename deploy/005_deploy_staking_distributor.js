const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const treasuryArtifact = await get('OlympusTreasury');
  const brickArtifact = await get('OlympusERC20Token');
  // 28,800 seconds = 8 hours
  const epochLength = 28800;
  // TODO: nextEpochTime is TBD. For now I will just set it to
  // the current block timestamp + epoch length.
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
  const nextEpochTime = currentBlock.timestamp + epochLength;

  const deployment = await deploy('Distributor', {
    from: deployer,
    args: [
      treasuryArtifact.address,
      brickArtifact.address,
      epochLength,
      nextEpochTime,
    ],
    log: true,
  });

  // TODO: need to transfer policy role to another address.
  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: 8 is REWARDMANAGER
  await treasury.queue('8', deployment.address);
};
module.exports.tags = ['StakingDistributor', 'AllEnvironments'];