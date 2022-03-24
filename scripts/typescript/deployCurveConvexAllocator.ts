// libraries, functionality...
import { ethers } from "hardhat";

// types
import { CurveConvexAllocator, CurveConvexAllocator__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";

async function main() {
    const factory: CurveConvexAllocator__factory = (await ethers.getContractFactory(
        "CurveConvexAllocator"
    )) as CurveConvexAllocator__factory;

    const allocator: CurveConvexAllocator = (await factory.deploy(
        {
            authority: olympus.authority,
            tokens: [],
            extender: olympus.extender,
        },
        olympus.treasury
    )) as CurveConvexAllocator;

    console.log("CurveConvexAllocator deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
