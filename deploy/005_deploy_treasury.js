const { config, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');

  let fraxAddress, wrappedTokenAddress;
  // TODO: move it to config
  switch(chainId) {
    case '250':
      fraxAddress = config.contractAddresses[chainId].frax;
      wrappedTokenAddress = config.contractAddresses[chainId].wrappedToken;
      break;
    default:
      const frax = await get('FRAX');
      fraxAddress = frax.address;
      const wrappedToken = await get('WrappedToken');
      wrappedTokenAddress = wrappedToken.address;
      break;
  }

  // NOTE: Average block time in Ethereum is ~13 seconds and
  // Olympus's treasury's blocksNeededForQueue is 6,000.
  // Fantom's average block time is ~0.9 seconds so I make it
  // 6,000 / 0.9 which is approximately 6,600 blocks.
  const blocksNeededForQueue = 6600;

  const deployment = await deploy('OlympusTreasury', {
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      wrappedTokenAddress,
      blocksNeededForQueue
    ],
    log: true,
  });

  const brick = (
    await ethers.getContractFactory('OlympusERC20Token')
  ).attach(brickArtifact.address);
  await brick.setVault(deployment.address);

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(deployment.address);

  // NOTE: make deployer address an approved reserve and liquidity token depositor
  await treasury.queue('0', deployer);
  await treasury.queue('4', deployer);
};
module.exports.tags = ['Treasury', 'AllEnvironments'];