const {ethers} = require("hardhat");
const nftxInventoryStakingAddr = "0x05aD54B40e3be8252CB257f77d9301E9CB1A9470";
const nftxLiquidityStakingAddr = "0xcd0dfb870A60C30D957b0DF1D180a236a55b5740";
const weth = "0x4F2645F3D8e2542076A49De3F505016DC0a496B0";

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
  await floorTreasury.enable("2", "0x4F2645F3D8e2542076A49De3F505016DC0a496B0", "0x0000000000000000000000000000000000000000"); // WEETH
  await floorTreasury.enable("2", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000"); // PUNK as reserve asset
  await floorTreasury.enable("8", "0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "0x0000000000000000000000000000000000000000"); // PUNK as risk asset
  await floorTreasury.enable("2", "0x1a8818eabe7f88f9c2a2dd39f2e7a9b55354f87a", "0x0000000000000000000000000000000000000000"); // PUNKWETH SLP
  await floorTreasury.enable("0", "0x6ce798Bc8C8C93F3C312644DcbdD2ad6698622C5", "0x0000000000000000000000000000000000000000"); // Governor multi-sig
  await floorTreasury.setRiskOffValuation("0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D", "20000000000000");
  await floorTreasury.enable("0", authority.governor(), "0x0000000000000000000000000000000000000000"); // Reserve Depositor
  await floorTreasury.enable("0", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reserve Depositor
  await floorTreasury.enable("9", bondDepo.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
  await floorTreasury.enable("9", distributor.address, "0x0000000000000000000000000000000000000000"); // Reward Manager
  await floorTreasury.enable("12", nftxAllocator.address, "0x0000000000000000000000000000000000000000"); // Allocator
  await floorTreasury.enable("0", nftxAllocator.address, "0x0000000000000000000000000000000000000000"); // Reserve Depositor

  console.log('Setting vault authority as', floorTreasury.address);
  await authority.pushVault(floorTreasury.address, true);

  console.log('Deploying aFLOOR and pFLOOR');
  const AFLOOR = await ethers.getContractFactory("AlphaFLOOR");
  const aFLOOR = await AFLOOR.deploy();

  const AFLOORMigration = await ethers.getContractFactory("AlphaFloorMigration");
  const aFloorMigration = await AFLOORMigration.deploy();

  const PFLOOR = await ethers.getContractFactory("VestingClaim");
  const pFLOOR = await PFLOOR.deploy(floor.address, weth, gFLOOR.address, floorTreasury.address, staking.address, authority.address);
  await pFLOOR.approve();

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
  // console.log("BondingCalc:", bondingCalculator.address);

  console.log("Initializing Treasury to use timelock");
  await floorTreasury.initialize();
  console.log('Deployment complete');
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
