const {ethers} = require("hardhat");
const punk = '0x286AaF440879dBeAF6AFec6df1f9bfC907101f9D';
const punkWeeth = '0xE21724BCa797be59FF477431026602e12200023D';
const weeth = '0x4F2645F3D8e2542076A49De3F505016DC0a496B0';
const aFloor = '0x4E512a1e0E1B31c6e21Eb717fc931F5C4E2a97f2';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to Rinkeby with the account: " + deployer.address);

  // Faucet contract for Rinkeby only
  const Drip = await ethers.getContractFactory("Drip");
  const drip = await Drip.deploy(punk, punkWeeth, aFloor, weeth);

  console.log("Drip:", drip.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
