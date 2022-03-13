// libraries, functionality...
import { ethers } from "hardhat";

// types
import { LobiAllocator, LobiAllocator__factory } from "../../types";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";

async function main() {
    const factory: LobiAllocator__factory = (await ethers.getContractFactory(
        "LobiAllocator"
    )) as LobiAllocator__factory;

    const staking = "0x3818eff63418e0a0BA3980ABA5fF388b029b6d90";
    const stakingHelper = "0x644D94dA13af3ac88a9a0dcaaA108E474B9a9B5F";

    const allocator: LobiAllocator = (await factory.deploy(
        {
            authority: olympus.authority,
            tokens: [coins.lobi],
            extender: olympus.extender,
        },
        olympus.treasury,
        coins.slobi,
        staking,
        stakingHelper
    )) as LobiAllocator;

    console.log("LobiAllocator deployed at: ", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
