const { config, getChainId, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const brickArtifact = await get('OlympusERC20Token');
  const treasuryArtifact = await get('OlympusTreasury');
  // TODO: Setting it to our Fantom multi-sig for now, not sure what to put yet.
  const daoAddress = config.contractAddresses[chainId].dao;
  const priceFeedAddress = config.contractAddresses[chainId].ftmPriceFeed;

  let wftmAddress;
  // TODO: move it to config
  switch(chainId) {
    case '250':
      wftmAddress = config.contractAddresses[chainId].wrappedToken;
      break;
    default:
      const wrappedToken = await get('WrappedToken');
      wftmAddress = wrappedToken.address;
      break;
  }

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/wETHBondDepository.sol:OlympusBondDepository';

  const deployment = await deploy('WftmBondDepository', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
      wftmAddress,
      treasuryArtifact.address,
      daoAddress,
      priceFeedAddress,
    ],
    log: true,
  });

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: Grant WFTM bond depositor a reserve depositor role
  await treasury.queue('0', deployment.address);

  const wftmBond = (await ethers.getContractFactory(contractPath)).attach(deployment.address);

  // // NOTE: Use staking helper.
  const stakingHelperArtifact = await get('StakingHelper');
  await wftmBond.setStaking(stakingHelperArtifact.address, true);

  // TODO: Just copying params from
  // https://etherscan.io/tx/0x89e196f369a21994d863a2f4aaa0ea7fb0970418b98435dcf5efa87c2d5f66b4 (OlympusDAO: ETH Bond V2 initializeBondTerms)
  // for now. Need to adjust at least wftmBondBCV bondVestingLength, minBondPrice, maxBondPayout.
  const wftmBondBCV = 2586;

  // 5 days
  const bondVestingLength = 432000;

  const minBondPrice = 1440;

  // 0.004% of BRICK supply
  const maxBondPayout = 4

  const maxBondDebt = ethers.utils.parseUnits('1000000000', 9);
  const initialBondDebt = 0;

  // NOTE: this needs to be set twice to avoid division by 0 error.
  await wftmBond.setBondTerms('0', bondVestingLength);

  await wftmBond.initializeBondTerms(
    wftmBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    maxBondDebt,
    initialBondDebt,
  );
};
module.exports.tags = ['BondDepository', 'AllEnvironments'];