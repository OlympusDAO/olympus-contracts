// libraries, functionality...
import { run, ethers } from "hardhat";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";
import { protocols } from "../../test/utils/protocols";
import { allocators } from "../../test/utils/allocators";
import { helpers } from "../../test/utils/helpers";
import { AllocatorInitData } from "../../test/utils/allocators";

const bnn = helpers.bnn;

// types
import { FraxSharesAllocatorVoting, FraxSharesAllocatorVoting__factory } from "../../types";
import { BigNumber } from "ethers";

const allocatorName: string = "FraxSharesAllocatorVoting";

async function main(): Promise<void> {
    let addr: string;

    if (!(allocators.FXSImplUpgrade.length > 1)) {
        const allocator = await helpers.spawn<FraxSharesAllocatorVoting>(allocatorName);

        console.log(`${allocatorName} deployed at:`, allocator.address);

        addr = allocator.address;
    } else {
        addr = allocators.FXSImplUpgrade;
    }

    await run("verify:verify", {
        address: addr,
    });
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
