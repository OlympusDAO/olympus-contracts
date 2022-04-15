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
import { CVXAllocatorV2, CVXAllocatorV2__factory } from "../../types";
import { BigNumber } from "ethers";

interface OperationData {
    cvxLocker: string;
    spendRatio: BigNumber;
    relock: boolean;
    crvDeposit: string;
    ccStaking: string;
}

const allocatorName: string = "CVXAllocatorV2";

async function main(): Promise<void> {
    let addr: string;

    const AID: AllocatorInitData = {
        authority: olympus.authority,
        extender: olympus.extender,
        tokens: [coins.cvx, coins.crv, coins.cvxcrv],
    };

    const OD: OperationData = {
        cvxLocker: protocols.convex.cvxLocker,
        spendRatio: bnn(0),
        relock: true,
        crvDeposit: protocols.convex.crvDeposit,
        ccStaking: protocols.convex.ccStaking,
    };

    if (!(allocators.CVXAllocatorV2.length > 1)) {
        const allocator = await helpers.spawn<CVXAllocatorV2>(allocatorName, OD, AID);

        console.log(`${allocatorName} deployed at:`, allocator.address);

        addr = allocator.address;
    } else {
        addr = allocators.CVXAllocatorV2;
    }

    await run("verify:verify", {
        address: addr,
        constructorArguments: [OD, AID],
    });
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
