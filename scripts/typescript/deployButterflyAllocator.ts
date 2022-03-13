// libraries, functionality...
import { ethers } from "hardhat";

// types
import { BtrflyAllocator, BtrflyAllocator__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";

async function main() {
    const factory: BtrflyAllocator__factory = (await ethers.getContractFactory(
        "BtrflyAllocator"
    )) as BtrflyAllocator__factory;

    const staking = "0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487";
    const stakingHelper = "0xC0840Ec5527d3e70d66AE6575642916F3Fd18aDf";

    const allocator: BtrflyAllocator = (await factory.deploy(
        {
            authority: olympus.authority,
            tokens: [coins.btrfly],
            extender: olympus.extender,
        },
        olympus.treasury,
        coins.xbtrfly,
        staking,
        stakingHelper
    )) as BtrflyAllocator;

    console.log("BtrflyAllocator deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
