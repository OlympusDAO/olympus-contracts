const hre = require("hardhat");
const { ethers, upgrades } = hre;

async function main() {
  console.log("deploying");
  // For Liquity addresses:
  // mainnet: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt
  // rinkeby: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/rinkebyDeploymentOutput.json

  //mainnet
  const constructorArgs = [
      "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7", // v1 treasury address
      "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", // LUSD token
      "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D", // LQTY token
      "0x66017D22b0f8556afDd19FC67041899Eb65a21bb", // Liquity stability pool
      "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d", // LQTY Staking pool 
      "0x", // Front end address,
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // weth
    ];
    const LUSDAllocator = await ethers.getContractFactory("LUSDAllocator");
    const instance = await upgrades.deployProxy(LUSDAllocator, constructorArgs);
    await instance.deployed();

    await instance.transferOwnership("0x245cc372C84B3645Bf0Ffe6538620B04a217988B"); // OlympusDAO Multisig

    const address = await upgrades.erc1967.getImplementationAddress(instance.address);

    console.log("Deployed LUSDAllocator to", instance.address)
    console.log("implementation at", address);

    await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
    });


    console.log("Transferred ownership to multisig");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });