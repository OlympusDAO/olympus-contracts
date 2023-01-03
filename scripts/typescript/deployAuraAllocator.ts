import { ethers } from "hardhat";
import { AuraAllocator, AuraAllocator__factory } from "../../types";
import { olympus } from "../../test/utils/olympus";

async function main() {
    const auraAllocatorFactory: AuraAllocator__factory = (await ethers.getContractFactory(
        "AuraAllocator"
    )) as AuraAllocator__factory;

    const auraAllocator: AuraAllocator = (await auraAllocatorFactory.deploy(
        {
            authority: olympus.authority,
            tokens: [],
            extender: olympus.extender,
        },
        olympus.treasury
    )) as AuraAllocator;

    console.log("Aura Allocator deployed at: ", auraAllocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
