// libraries, functionality...
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

// types
import { RariFuseAllocator, RariFuseAllocator__factory } from "../../types";
import {
    fData,
    ProtocolSpecificData,
    FuseAllocatorInitData,
} from "../../test/allocators/RariFuseAllocator.test";

// data
import { olympus } from "../../test/utils/olympus";
import { coins } from "../../test/utils/coins";
import { protocols } from "../../test/utils/protocols";
import { allocators } from "../../test/utils/allocators";
import { AllocatorInitData } from "../../test/utils/allocators";

const allocatorName: string = "RariFuseAllocator";

task("deployRariFuseAllocator", "deploys the RariFuseAllocator")
    .addPositionalParam(
        "onlyVerify",
        "whether the contract should only verify",
        true,
        types.boolean
    )
    .setAction(async (taskArgs: TaskArguments, { ethers, run }) => {
        let addr: string;

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

        if (!taskArgs.onlyVerify) {
            const factory: RariFuseAllocator__factory = (await ethers.getContractFactory(
                allocatorName
            )) as RariFuseAllocator__factory;

            const allocator: RariFuseAllocator = (await factory.deploy(FAID)) as RariFuseAllocator;

            console.log(`${allocatorName} deployed at:`, allocator.address);

            addr = allocator.address;
        } else {
            addr = allocators.RariFuseAllocator;
        }

        await run("verify:verify", {
            address: addr,
            constructorArguments: [FAID],
        });
    });
