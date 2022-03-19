// libraries, functionality...
import { ethers } from "hardhat";

// types
import { RariFuseAllocator, RariFuseAllocator__factory } from "../../types";
import {
    fData,
    ProtocolSpecificData,
    FuseAllocatorInitData,
} from "../../test/allocators/RariFuseAllocator.test.ts";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";
import { coins } from "../../test/utils/protocols";

async function main() {
    const AID: AllocatorInitData = {
        authority: olympus.authority,
        extender: olympus.extender,
        tokens: [],
    };

    const PSD: ProtocolSpecificData = {
        treasury: olympus.treasury,
        rewards: protocols.rari.fuse.tribeRewards,
    };

    const FAID: FuseAllocatorInitData = {
        base: AID,
        spec: PSD,
    };

    const factory: RariFuseAllocator__factory = (await ethers.getContractFactory(
        "RariFuseAllocator"
    )) as RariFuseAllocator__factory;

    const allocator: RariFuseAllocator = (await factory.deploy(FAID)) as RariFuseAllocator;

    console.log("RariFuseAllocator deployed at:", allocator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
