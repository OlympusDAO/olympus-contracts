const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  // NOTE: If it is hardhat or Fantom testnet
  if (chainId === '31337' || chainId === '4002') {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy('WrappedFtm', {
      from: deployer,
      args: ["Wrapped Fantom", "WFTM"],
      log: true,
    });
  }
};
module.exports.tags = ['WrappedFtm', 'TestingOnly'];