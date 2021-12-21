module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const stakingArtifact = await get('OlympusStaking');
  const brickArtifact = await get('OlympusERC20Token');

  await deploy('StakingHelper', {
    from: deployer,
    args: [
      stakingArtifact.address,
      brickArtifact.address
    ],
    log: true,
  });
};
module.exports.tags = ['Staking', 'AllEnvironments'];