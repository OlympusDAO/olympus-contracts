const { config, getChainId } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const brickArtifact = await get('OlympusERC20Token');
  const treasuryArtifact = await get('OlympusTreasury');
  // TODO: Setting it to our Fantom multi-sig for now, not sure what to put yet.
  const daoAddress = "0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8";
  // NOTE: Only LP bond requires bond calculator
  const bondCalculatorAddress = config.contractAddresses.zero;

  let fraxAddress;
  // TODO: move it to config
  switch(chainId) {
    case '250':
      fraxAddress = config.contractAddresses[chainId].frax;
      break;
    default:
      const frax = await get('FRAX');
      fraxAddress = frax.address;
      break;
  }

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  await deploy('contracts/BondDepository.sol:OlympusBondDepository', {
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      treasuryArtifact.address,
      daoAddress,
      bondCalculatorAddress,
    ],
    log: true,
  });
};
module.exports.tags = ['Staking', 'AllEnvironments'];