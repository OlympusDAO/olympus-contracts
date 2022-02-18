const {ethers} = require("hardhat");
const nftxInventoryStakingAddr = "0x05aD54B40e3be8252CB257f77d9301E9CB1A9470";
const nftxLiquidityStakingAddr = "0xcd0dfb870A60C30D957b0DF1D180a236a55b5740";
const punk = '0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D';
const punkWeeth = '0xE21724BCa797be59FF477431026602e12200023D';
const weeth = '0x4F2645F3D8e2542076A49De3F505016DC0a496B0';

// @note deploy calculators first and add to this script

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to Rinkeby with the account: " + deployer.address);

  const firstEpochNumber = "0";
  const nowInSeconds = parseInt(new Date().getTime() / 1000);
  const firstEpochTime = nowInSeconds + 28800;
  console.log("First epoch time:", firstEpochTime);

  const Authority = await ethers.getContractFactory("FloorAuthority");
  const authority = await Authority.deploy(
    deployer.address,
    deployer.address,
    deployer.address,
    deployer.address
  );

  const FLOOR = await ethers.getContractFactory("FloorERC20Token");
  const floor = await FLOOR.deploy(authority.address);

  const SFLOOR = await ethers.getContractFactory("sFLOOR");
  const sFLOOR = await SFLOOR.deploy();

  const FloorTreasury = await ethers.getContractFactory("FloorTreasury");
  const floorTreasury = await FloorTreasury.deploy(floor.address, "0", authority.address);

  const NftxAllocator = await ethers.getContractFactory("NFTXAllocator");
  const nftxAllocator = await NftxAllocator.deploy(authority.address, nftxInventoryStakingAddr, nftxLiquidityStakingAddr, floorTreasury.address);

  const GFLOOR = await ethers.getContractFactory("gFLOOR");
  const gFLOOR = await GFLOOR.deploy(sFLOOR.address);

  const FloorStaking = await ethers.getContractFactory("FloorStaking");
  const staking = await FloorStaking.deploy(
    floor.address,
    sFLOOR.address,
    gFLOOR.address,
    "28800",
    firstEpochNumber,
    firstEpochTime,
    authority.address
  );

  await gFLOOR.initialize(staking.address);

  const Distributor = await ethers.getContractFactory("Distributor");
  const distributor = await Distributor.deploy(
    floorTreasury.address,
    floor.address,
    staking.address,
    authority.address
  );

  await staking.setDistributor(distributor.address);

  // Initialize sFloor
  await sFLOOR.setIndex("1000000000");
  await sFLOOR.setgFLOOR(gFLOOR.address);
  await sFLOOR.initialize(staking.address, floorTreasury.address);

  const BondDepo = await ethers.getContractFactory("FloorBondDepository");
  const bondDepo = await BondDepo.deploy(authority.address, floor.address, gFLOOR.address, staking.address, floorTreasury.address);

  // Enable Treasury permissions
  console.log("Setting treasury permissions");
  await floorTreasury.enable("2", "0x4F2645F3D8e2542076A49De3F505016DC0a496B0", "0x0000000000000000000000000000000000000000"); // WEETH as reserve asset
  await floorTreasury.enable("2", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000"); // PUNK as reserve asset
  await floorTreasury.enable("8", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000"); // PUNK as risk asset
  await floorTreasury.enable("12", "0xeaeA4134D1fA90cdF506f669033Ecd24ec941F3a", "0xe7e0eED2511E9fa055b8923a0CE38e979e99435e"); // xPUNK as xToken
  await floorTreasury.enable("12", "0x9120BcE55a8D8038DD45C033C0573389fC255bc4", "0xf0a8251AC171b76B2aE5D316C2353506D69c64dd"); // xPUNKWETH as xToken
  await floorTreasury.enable("5", "0x1a8818eabe7f88f9c2a2dd39f2e7a9b55354f87a", "0x374488353cd9F438D2A11a78B5B0E91abF215Af2"); // PUNKWETH SLP as liquidity asset
  await floorTreasury.enable("5", punkWeeth, "0x53cC90aDEC82d143Ea0f7a9E150c977FE6a96012"); // PUNKWEETH SLP  as liquidity asset
  await floorTreasury.enable("0", "0x6ce798Bc8C8C93F3C312644DcbdD2ad6698622C5", "0x0000000000000000000000000000000000000000"); // Governor multi-sig
  await floorTreasury.setRiskOffValuation("0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "20000000000000");

  await floorTreasury.enable("0", authority.governor(), "0x0000000000000000000000000000000000000000"); // Reserve Depositor
  await floorTreasury.enable("0", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reserve Depositor
  await floorTreasury.enable("9", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
  await floorTreasury.enable("9", distributor.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
  await floorTreasury.enable("13", nftxAllocator.address, "0x0000000000000000000000000000000000000000"); // Allocator
  await floorTreasury.enable("0", nftxAllocator.address, "0x0000000000000000000000000000000000000000"); // Reserve Depositor

  // @TODO set xtokens as reserve tokens

  console.log('Setting vault authority as', floorTreasury.address);
  await authority.pushVault(floorTreasury.address, true);

  console.log('Deploying aFLOOR and pFLOOR');
  const AFLOOR = await ethers.getContractFactory("AlphaFLOOR");
  const aFLOOR = await AFLOOR.deploy(deployer.address);

  const AFLOORMigration = await ethers.getContractFactory("AlphaFloorMigration");
  const aFloorMigration = await AFLOORMigration.deploy();

  const PFLOOR = await ethers.getContractFactory("VestingClaim");
  const pFLOOR = await PFLOOR.deploy(floor.address, weeth, gFLOOR.address, floorTreasury.address, staking.address, authority.address);

  // Faucet contract for Rinkeby only
  const Drip = await ethers.getContractFactory("Drip");
  const drip = await Drip.deploy(punk, punkWeeth, aFLOOR.address, weeth);

  console.log("FLOOR:", floor.address);
  console.log("gFLOOR:", gFLOOR.address);
  console.log("sFLOOR:", sFLOOR.address);
  console.log("Authority:", authority.address);
  console.log("Treasury:", floorTreasury.address);
  console.log("Staking:", staking.address);
  console.log("Distributor:", distributor.address);
  console.log("BondDepo:", bondDepo.address);

  console.log("aFLOOR:", aFLOOR.address);
  console.log("aFLOORMigration:", aFloorMigration.address);
  console.log("pFLOOR:", pFLOOR.address);

  console.log("NFTXAllocator:", nftxAllocator.address);

  console.log("Drip:", drip.address);

  console.log('Deployment complete');

  // @note Post deployment setup Allocator staking and dividend info
  // @note and initialize the treasury to implement the timelock
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
