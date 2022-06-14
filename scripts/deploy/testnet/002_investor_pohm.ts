import { ethers } from "hardhat";

/**
 * This deploy script will deploy a simple, isolated Investor contract.
 * It would be less code if the additional deployments required for Investor used
 * the hre, but... I think it's simpler on the dev to use this isolated deployment
 * where previous hre deployments are immaterial.
 */
async function main () {
  const [owner] = await ethers.getSigners();
  
  // deploy Authority
  const Authority = await ethers.getContractFactory('OlympusAuthority');
  console.log('Deploying Authority...');
  const authority = await Authority.deploy(owner.address, owner.address, owner.address, owner.address);
  await authority.deployed();
  console.log('authority deployed to:', authority.address);

  // deploy OHM
  const OHM = await ethers.getContractFactory('OlympusERC20Token');
  console.log('Deploying OHM...');
  const ohm = await OHM.deploy(authority.address);
  await ohm.deployed();
  console.log('ohm deployed to:', ohm.address);

  // sohm
  const SOHM = await ethers.getContractFactory("sOlympus");
  const sOHM = await SOHM.deploy();
  console.log('sOHM deployed to:', sOHM.address);

  // gohm
  const GOHM = await ethers.getContractFactory("gOHM");
  const gOHM = await GOHM.deploy(owner.address, sOHM.address);
  console.log('gOHM deployed to:', gOHM.address);

  // // deploy Staking
  const firstEpochNumber = "550";
  const firstBlockNumber = "9505000";
  const Staking = await ethers.getContractFactory('OlympusStaking');
  console.log('Deploying Staking...');
  const staking = await Staking.deploy(
    ohm.address,
    sOHM.address,
    gOHM.address,
    "2200",
    firstEpochNumber,
    firstBlockNumber,
    authority.address
  );
  await staking.deployed();
  console.log('staking deployed to:', staking.address);

  // migrate gOHM
  await gOHM.migrate(staking.address, sOHM.address);

  // deploy DAI
  const DAI = await ethers.getContractFactory('DAI');
  console.log('Deploying DAI...');
  const dai = await DAI.deploy(1337);
  await dai.deployed();
  console.log('dai deployed to:', dai.address);

  // deploy Treasury
  const Treasury = await ethers.getContractFactory('OlympusTreasury');
  console.log('Deploying Treasury...');
  const treasury = await Treasury.deploy(ohm.address, 0, authority.address);
  await treasury.deployed();
  console.log('treasury deployed to:', treasury.address);

  await authority.pushVault(treasury.address, true);
  // // dao
  const daoAddress = owner.address;
  
  // // claim
  const claimAddress = owner.address;

  // // deploy Investor
  const Investor = await ethers.getContractFactory('InvestorClaimV2');
  console.log('Deploying OHM...');
  const investor = await Investor.deploy(
    ohm.address,
    dai.address,
    treasury.address,
    staking.address,
    daoAddress,
    gOHM.address,
    claimAddress
  );
  await investor.deployed();
  console.log('investor deployed to:', investor.address);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
