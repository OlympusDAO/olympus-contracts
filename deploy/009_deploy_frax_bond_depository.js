const { config, getChainId, ethers } = require("hardhat");

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
  const deployment = await deploy('FraxBondDepository', {
    contract: 'contracts/BondDepository.sol:OlympusBondDepository',
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

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: Grant FRAX bond depositor a reserve depositor role
  await treasury.queue('0', deployment.address);
  // TODO: this can only be done after blocksNeededForQueue has passed.
  // await treasury.toggle('0', deployment.address, config.contractAddresses.zero);

  const fraxBond = (
    await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
  ).attach(deployment.address);

  // NOTE: Use staking helper.
  const stakingHelperArtifact = await get('StakingHelper');
  await fraxBond.setStaking(stakingHelperArtifact.address, true);

  // TODO: Just copying params from
  // https://etherscan.io/tx/0xc83d9c015dcc177284a919d7ac5a53e3bf8788ff9e940b294b58150c53674e17 (Frax V1 bonds initializeBondTerms)
  // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
  const fraxBondBCV = 300;

  // TODO: this number doesn't matter, we will update the bond depository
  // contracts to use timestamps instead of block numbers.
  // Will just get this contract deployed for now.
  const bondVestingLength = 33110;

  const minBondPrice = 29000;

  // 0.05% of BRICK supply
  const maxBondPayout = 50

  // bonding fee given to the DAO (100%)
  const bondFee = 10000;

  const maxBondDebt = ethers.utils.parseUnits('700000', 9);
  const initialBondDebt = 0;

  await fraxBond.initializeBondTerms(
    fraxBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    initialBondDebt,
  );
};
module.exports.tags = ['Staking', 'AllEnvironments'];