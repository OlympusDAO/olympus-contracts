const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const treasuryArtifact = await get('OlympusTreasury');
  const brickArtifact = await get('OlympusERC20Token');
  // NOTE: ~0.9 seconds per block, 8 hours is 28,800 seconds
  // 28,800 / 0.90 is approximately 32,000
  const epochLength = 32000;
  // TODO: nextEpochBlock is TBD. For now I will just set it to
  // the current block + epoch length.
  const nextEpochBlock = (await ethers.provider.getBlockNumber()) + epochLength;

  const deployment = await deploy('Distributor', {
    from: deployer,
    args: [
      treasuryArtifact.address,
      brickArtifact.address,
      epochLength,
      nextEpochBlock,
    ],
    log: true,
  });

  // TODO: need to transfer policy role to another address.
  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: 8 is REWARDMANAGER
  await treasury.queue('8', deployment.address);
  // TODO: do this after blocksNeededForQueue elapsed
  // await treasury.toggle('8', deployment.address, '0x0000000000000000000000000000000000000000');
};
module.exports.tags = ['StakingDistributor', 'AllEnvironments'];