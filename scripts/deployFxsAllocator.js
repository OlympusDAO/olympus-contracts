const hre = require("hardhat");
const { ethers, upgrades } = hre;

async function main() {
    console.log("deploying");
    const constructorArgs = [
        "0x31f8cc382c9898b273eff4e0b7626a6987c846e8", // v1 treasury address
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", // FXS address
        "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0", // veFXS address
        "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872", // FXS Yield Distributor
    ];
    const FraxSharesAllocator = await ethers.getContractFactory("FraxSharesAllocator");
    const instance = await upgrades.deployProxy(FraxSharesAllocator, constructorArgs);
    await instance.deployed();

    await instance.transferOwnership("0x245cc372C84B3645Bf0Ffe6538620B04a217988B"); // OlympusDAO Multisig

    const address = await upgrades.erc1967.getImplementationAddress(instance.address);

    console.log("Deployed FraxSharesAllocator to", instance.address);
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
