const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  // NOTE: If it is hardhat or Fantom testnet
  if (chainId === '31337' || chainId === '4002') {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy('FRAX', {
      from: deployer,
      args: [Number(chainId)],
      log: true,
    });

    const fraxFactory = await ethers.getContractFactory('FRAX');
    const frax = fraxFactory.attach(deployment.address);
    const initialMint = ethers.utils.parseEther('10000000');
    await frax.mint(deployer, initialMint);
  }
};
module.exports.tags = ['Frax', 'TestingOnly'];