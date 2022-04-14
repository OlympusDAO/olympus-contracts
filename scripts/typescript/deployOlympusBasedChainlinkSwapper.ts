// libraries, functionality...
import { run, ethers } from "hardhat";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";
import { protocols } from "../../test/utils/protocols";
import { allocators } from "../../test/utils/allocators";
import { helpers } from "../../test/utils/helpers";

const bnn = helpers.bnn;

// types
import { OlympusChainlinkBasedSwapper } from "../../types";
import { BigNumber } from "ethers";

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const CN: string = "OlympusChainlinkBasedSwapper";
type CT = OlympusChainlinkBasedSwapper;

async function main(): Promise<void> {
    const thing = await helpers.spawn<CT>(
        CN,
        protocols.chainlink.feedRegistry,
        protocols.uniswap.v3SwapRouter
    );

    console.log(`${CN} deployed at:`, thing.address);

    await delay(70000);

    await run("verify:verify", {
        address: thing.address,
        constructorArguments: [protocols.chainlink.feedRegistry, protocols.uniswap.v3SwapRouter],
    });
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
