// libraries, functionality...
import { ethers } from "hardhat";

// types
import { AlchemixAllocatorV2, AlchemixAllocatorV2__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";
import { protocols } from "../../test/utils/protocols";
import { coins } from "../../test/utils/coins";

async function main() {
    const factory: AlchemixAllocatorV2__factory = (await ethers.getContractFactory(
        "AlchemixAllocatorV2"
    )) as AlchemixAllocatorV2__factory;

    const allocator: AlchemixAllocatorV2 = (await factory.deploy(
        protocols.tokemak.talcx,
        protocols.alchemix.talcx_staking,
        olympus.treasury,
        protocols.tokemak.manager,
        {
            authority: olympus.authority,
            tokens: [coins.alcx],
            extender: olympus.extender,
        }
    )) as AlchemixAllocatorV2;

    console.log("AlchemixAllocatorV2 deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
