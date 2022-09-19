const { ethers } = require("hardhat");

async function main() {
    const authority = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";
    const extender = "0xb32Ad041f23eAfd682F57fCe31d3eA4fd92D17af";
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";

    const auraAllocatorFactory = await ethers.getContractFactory("AuraAllocator");

    const auraAllocator = await auraAllocatorFactory.deploy(
        {
            authority: authority,
            tokens: [],
            extender: extender,
        },
        treasury
    );

    console.log("Aura Allocator deployed at: ", auraAllocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });