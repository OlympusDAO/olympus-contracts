// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { config, ethers } from "hardhat";
// import {
//     BalancerAuraAllocator,
//     BalancerAuraAllocator__factory,
//     ERC20,
//     OlympusAuthority,
//     OlympusTreasury,
//     TreasuryExtender,
// } from "../../types";
// import { auraBoosterABI } from "../utils/auraAllocatorAbis";
// import { helpers } from "../utils/helpers";
// import { olympus } from "../utils/olympus";

// const bne = helpers.bne;
// const bnn = helpers.bnn;

// describe("BalancerAuraAllocator", () => {
//     // Signers
//     let governor: SignerWithAddress;
//     let guardian: SignerWithAddress;

//     // Contracts
//     let treasury: OlympusTreasury;
//     let extender: TreasuryExtender;
//     let authority: OlympusAuthority;
//     let allocator: BalancerAuraAllocator;
//     let factory: BalancerAuraAllocator__factory;
//     let booster: any;
//     let auraPool: any;

//     // Tokens
//     let bpt: ERC20;
//     let aura: ERC20;
//     let bal: ERC20;

//     // Network
//     let url: string = config.networks.hardhat.forking!.url;
//     let snapshotId: number = 0;

//     before(async () => {
//         await helpers.pinBlock(16400012, url);

//         // Already deployed contracts
//         treasury = (await ethers.getContractAt(
//             "OlympusTreasury",
//             olympus.treasury
//         )) as OlympusTreasury;

//         extender = (await ethers.getContractAt(
//             "TreasuryExtender",
//             olympus.extender
//         )) as TreasuryExtender;

//         authority = (await ethers.getContractAt(
//             "OlympusAuthority",
//             olympus.authority
//         )) as OlympusAuthority;

//         booster = await ethers.getContractAt(
//             auraBoosterABI,
//             "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"
//         );
//     });
// });
