module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');
  await deploy('OlympusBondingCalculator', {
    from: deployer,
    args: [
      brickArtifact.address,
    ],
    log: true,
  });
};
module.exports.tags = ['BondingCalculator', 'AllEnvironments'];