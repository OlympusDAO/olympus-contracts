module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('OlympusERC20Token', {
    from: deployer,
    args: [],
    log: true,
  });

  // TODO: setVault (Treasury)
};
module.exports.tags = ['Brick', 'AllEnvironments'];