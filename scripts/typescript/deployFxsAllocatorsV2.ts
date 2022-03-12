// libraries, functionality...
import { ethers } from "hardhat";

// types
import { FxsAllocatorV2, FxsAllocatorV2__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";

async function main() {
    const factory: FxsAllocatorV2__factory = (await ethers.getContractFactory(
        "FxsAllocatorV2"
    )) as FxsAllocatorV2__factory;

    // mainnet addresses
    const veFxs = "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0";
    const veFxsYieldDistributor = "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872";

    const allocator: FxsAllocatorV2 = (await factory.deploy({
        authority: olympus.authority,
        tokens: [coins.fxs],
        extender: olympus.extender
    },
        olympus.treasury,
        veFxs,
        veFxsYieldDistributor
    )) as FxsAllocatorV2;

    console.log("FxsAllocatorV2 deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
