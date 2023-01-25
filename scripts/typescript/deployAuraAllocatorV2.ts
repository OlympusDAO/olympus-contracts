import { ethers } from "hardhat";
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";
import { AuraAllocatorV2, AuraAllocatorV2__factory } from "../../types";

async function main() {
    const auraAllocatorV2Factory: AuraAllocatorV2__factory = (await ethers.getContractFactory(
        "AuraAllocatorV2"
    )) as AuraAllocatorV2__factory;

    const auraAllocatorV2: AuraAllocatorV2 = (await auraAllocatorV2Factory.deploy(
        {
            authority: olympus.authority,
            tokens: [coins.aura],
            extender: olympus.extender
        },
        olympus.treasury,
        coins.aura,
        coins.auraBal,
        "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC", // Aura Locker
        "0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2" // auraBal staking
    )) as AuraAllocatorV2;

    console.log("Aura Allocator V2 deployed at: ", auraAllocatorV2.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
