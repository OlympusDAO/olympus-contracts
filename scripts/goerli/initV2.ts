import { initialIndex, largeApproval, zeroAddress } from "./constants";

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const treasuryV1 = await ethers.getContractAt("TestnetTreasuryV1", "0xd2D1be4AfeBb2aa1af67F173216552fBC1FD3D13");
  console.log("1");
  const treasuryV2 = await ethers.getContractAt("TestnetTreasury", "0x0C6E0643Ed22E046dd1A2fB3250bbE5261D0DDD7");
  console.log("2");
  const migrator = await ethers.getContractAt("OlympusTokenMigrator", "0xb82E0EA1b7E5cdF636aa4ee5F09b1b0D4dBDBa14");
  console.log("3");
  const authority = await ethers.getContractAt("OlympusAuthority", "0x571CB39Ce761A60992494Ed5a90db545Cb5739aB");
  console.log("4");
  const dai = await ethers.getContractAt("DAI", "0x26Ea52226a108ba48b9343017A5D0dB1456D4474");
  console.log("5");
  const sohmV2 = await ethers.getContractAt("TestnetSohm", "0x32AAB42931B170629E81996453F38e7e717CF475");
  console.log("6");
  const stakingV2 = await ethers.getContractAt("TestnetStaking", "0x7Ce6F1C558dBA1Eacc7a8805bc73Bf178C613d1E");
  console.log("7");
  const ohmV1 = await ethers.getContractAt("TestnetOhmV1", "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2");
  console.log("8");
  const ohmV2 = await ethers.getContractAt("TestnetOhm", "0x6a3ac556233eF72e62Fa977d951F1D0ADF69d0D0");
  console.log("9");
  const gohm = await ethers.getContractAt("TestnetGohm", "0xfD09738Db60f2d62A1C7E3754112C48F36eb788a");
  console.log("10");
  const daiBond = await ethers.getContractAt("TestnetBondDepoV1", "0x12aFfE67F879E6ed04D044F3885AC8D320EcC604");
  console.log("11");
  const distributorV2 = await ethers.getContractAt("TestnetDistributor", "0x8EE1C4F6e8A3aB60A011100192B3265c47C6b01b");
  console.log("12");
  const faucet = await ethers.getContractAt("DevFaucet", "0x73d65545441a3d086314083085824a4ef8AD215a");

  /// Set gOHM in Migrator
  const setGohm = await migrator.setgOHM(gohm.address);
  await setGohm.wait();

  /// Initialize Treasury V2
  const enable0Mig = await treasuryV2.enable("0", migrator.address, zeroAddress);
  await enable0Mig.wait();
  const enable1Mig = await treasuryV2.enable("1", migrator.address, zeroAddress);
  await enable1Mig.wait();
  const enable3Mig = await treasuryV2.enable("3", migrator.address, zeroAddress);
  await enable3Mig.wait();
  const enable6Mig = await treasuryV2.enable("6", migrator.address, zeroAddress);
  await enable6Mig.wait();
  const enable8Mig = await treasuryV2.enable("8", migrator.address, zeroAddress);
  await enable8Mig.wait();

  const enable2Dai = await treasuryV2.enable("2", dai.address, zeroAddress);
  await enable2Dai.wait();

  const enable0DaiBond = await treasuryV2.enable("0", daiBond.address, zeroAddress);
  await enable0DaiBond.wait();

  const enable0Deployer = await treasuryV2.enable("0", deployer.address, zeroAddress);
  await enable0Deployer.wait();
  const enable4Deployer = await treasuryV2.enable("4", deployer.address, zeroAddress);
  await enable4Deployer.wait();

  const enable8Distributor = await treasuryV2.enable("8", distributorV2.address, zeroAddress);
  await enable8Distributor.wait();

  /// Set Migrator perms on Treasury V1
  const queue0Mig = await treasuryV1.queue("0", migrator.address);
  await queue0Mig.wait();
  const toggle0Mig = await treasuryV1.toggle("0", migrator.address, zeroAddress);
  await toggle0Mig.wait();
  
  const queue1Mig = await treasuryV1.queue("1", migrator.address);
  await queue1Mig.wait();
  const toggle1Mig = await treasuryV1.toggle("1", migrator.address, zeroAddress);
  await toggle1Mig.wait();

  const queue3Mig = await treasuryV1.queue("3", migrator.address);
  await queue3Mig.wait();
  const toggle3Mig = await treasuryV1.toggle("3", migrator.address, zeroAddress);
  await toggle3Mig.wait();

  const queue6Mig = await treasuryV1.queue("6", migrator.address);
  await queue6Mig.wait();
  const toggle6Mig = await treasuryV1.toggle("6", migrator.address, zeroAddress);
  await toggle6Mig.wait();

  const queue8Mig = await treasuryV1.queue("8", migrator.address);
  await queue8Mig.wait();
  const toggle8Mig = await treasuryV1.toggle("8", migrator.address, zeroAddress);
  await toggle8Mig.wait();

  /// Set Treasury V2 as OHMv2 Vault
  const setVault = await authority.pushVault(treasuryV2.address, true);
  await setVault.wait();

  /// Approve Treasury V2 to spend deployer's DAI
  const daiApproval = await dai.approve(treasuryV2.address, largeApproval);
  await daiApproval.wait();

  /// Deposit 9,000,000 DAI to Treasury V2, 600,000 OHMv2 gets minted to deployer and 8,400,000 are in treasury as excess reserves
  const depositDai = await treasuryV2.deposit("9000000000000000000000000", dai.address, "8400000000000000");
  await depositDai.wait();

  /// Initialize sOHM V2
  const setIndex = await sohmV2.setIndex(initialIndex);
  await setIndex.wait();

  const setGohmSohm = await sohmV2.setgOHM(gohm.address);
  await setGohmSohm.wait();

  const initializeSohm = await sohmV2.initialize(stakingV2.address, treasuryV2.address);
  await initializeSohm.wait();

  /// Initialize Staking V2
  const setDistributor = await stakingV2.setDistributor(distributorV2.address);
  await setDistributor.wait();

  /// Migrate contracts so Staking V2 can mint gOHM
  const migrateContracts = await migrator.migrateContracts(
    treasuryV2.address,
    stakingV2.address,
    ohmV2.address,
    sohmV2.address,
    dai.address
  );
  await migrateContracts.wait();

  /// Fund Faucet
  const fundDai = await dai.transfer(faucet.address, "100000000000000000000000");
  await fundDai.wait();

  const fundOhmV1 = await ohmV1.transfer(faucet.address, "100000000000000");
  await fundOhmV1.wait();

  const fundOhmV2 = await ohmV2.transfer(faucet.address, "100000000000000");
  await fundOhmV2.wait();
}

main()
  .then(() => {
    console.log("Init complete");
    process.exit();
  })
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
