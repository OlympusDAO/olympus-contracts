const { ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('sOlympus', {
    from: deployer,
    args: [],
    log: true,
  });

  // TODO: initialize and setIndex
};
module.exports.tags = ['sBRICK', 'AllEnvironments'];