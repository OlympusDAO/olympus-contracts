const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const stakingV1 = "0x1c18053B3FD90FC5C4Af7267D3B4D49Aa63396C1";
    const ohmV1 = "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2";

    const StakingHelperV1 = await ethers.getContractFactory("TestnetStakingHelperV1");
    const stakingHelperV1 = await StakingHelperV1.deploy(stakingV1, ohmV1);

    console.log("Staking Helper: " + stakingHelperV1.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
