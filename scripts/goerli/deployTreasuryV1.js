const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const ohmV1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";
  const dai = "0x26Ea52226a108ba48b9343017A5D0dB1456D4474";

  const OlympusTreasuryV1 = await ethers.getContractFactory("TestnetTreasuryV1");
  const olympusTreasuryV1 = await OlympusTreasuryV1.deploy(ohmV1, dai, 0);

  console.log("Treasury V1: " + olympusTreasuryV1.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
