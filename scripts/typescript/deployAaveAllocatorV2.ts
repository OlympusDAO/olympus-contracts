// libraries, functionality...
import { ethers } from "hardhat";

// types
import { AaveAllocatorV2, AaveAllocatorV2__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";

async function main() {
    const factory: AaveAllocatorV2__factory = (await ethers.getContractFactory(
        "AaveAllocatorV2"
    )) as AaveAllocatorV2__factory;

    const allocator: AaveAllocatorV2 = (await factory.deploy({
        authority: olympus.authority,
        tokens: [],
        extender: olympus.extender,
    })) as AaveAllocatorV2;

    console.log("AaveAllocatorV2 deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
