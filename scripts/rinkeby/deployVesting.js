const {ethers} = require("hardhat");

const floor = '0x128e771f137Dd7F088082a27Ba748a7b543325a5';
const weth = '0x4F2645F3D8e2542076A49De3F505016DC0a496B0';
const gFloor = '0x842E819AfB58c3EbD9583bD5ad970a25d3279936';
const treasury = '0x8dd21297393c5A21973BcA4E11F826F60c48828d';
const staking = '0x721D652481FA62221236614441Ff98d72D9edB72';
const authority = '0x38AFE493B59eb500368aFcA243CB119EB28FDd12';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: " + deployer.address);

  console.log("Deploying Vesting...");

  const Vesting = await ethers.getContractFactory("VestingClaim");
  const vesting = await Vesting.deploy(
    floor,
    weth,
    gFloor,
    treasury,
    staking,
    authority
  );

  console.log("");
  console.log("Vesting:", vesting.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
