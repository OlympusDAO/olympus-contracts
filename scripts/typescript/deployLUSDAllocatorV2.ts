// libraries, functionality...
import { ethers } from "hardhat";

// types
import { LUSDAllocatorV2, LUSDAllocatorV2__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";

async function main() {
    const factory: LUSDAllocatorV2__factory = (await ethers.getContractFactory(
        "LUSDAllocatorV2"
    )) as LUSDAllocatorV2__factory;

    const allocator: LUSDAllocatorV2 = (await factory.deploy(
        {
            authority: olympus.authority,
            tokens: [coins.lusd],
            extender: olympus.extender,
        },
        olympus.treasury,
        330000
    )) as LUSDAllocatorV2;

    console.log("LUSDAllocatorV2 deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
