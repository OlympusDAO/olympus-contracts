module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('OlympusERC20Token', {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ['Brick', 'AllEnvironments'];