// I am experimenting with a test framework or something for allocators, where you
// follow the prompt kinda to set up tests to make it easier. I am typing lots of stuff
// to make it clear what we are using for tsserver.
// Stuff is categorized into preset or custom, so yeah you can just fill out stuff and add what
// you need.

//// PRESET

/// LIBS
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

/// TYPES
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, OlympusTreasury, TreasuryExtender, OlympusAuthority } from "../../types";

/// DATA
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { protocols } from "../utils/protocols";
import { AllocatorInitData, AllocatorStatus } from "../utils/allocators.ts";

const bne: Promise<BigNumber> = helpers.bne;
const bnn: Promise<BigNumber> = helpers.bnn;

/////////////////// CUSTOM

/// TYPES - IMPORT HERE
import { RariFuseAllocator, RariFuseAllocator__factory } from "../../types";

/// SET TYPES HERE, VARIABLES ARE PRESET
const ALLOCATORN: string = "RariFuseAllocator";
const ALLOCATORT: any = RariFuseAllocator;
const FACTORYT: any = RariFuseAllocator__factory;

/// INTERFACES
interface fData {
    idTroller: BigNumber;
    token: string;
}

interface fDataExpanded {
    f: fData;
    base: string;
    rT: string;
}

interface ProtocolSpecificData {
    treasury: string;
    rewards: string;
}

interface FuseAllocatorInitData {
    base: AllocatorInitData;
    spec: ProtocolSpecificData;
}

/// DATA

/// OTHER

/////////////////// DESCRIBE BLOCK

describe(ALLOCATORN, () => {
    //// PRESET

    /// SIGNERS
    let owner: SignerWithAddress; // this is simply 1st signer
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    /// CONTRACTS
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;

    let allocator: ALLOCATORT;
    let factory: FACTORYT;

    /// NETWORK
    const pinBlockNumber: number = 14393415;
    let url: string = config.networks.hardhat.forking!.url;

    /// TOKENS
    let underlying: MockERC20[];
    let utility: MockERC20[];
    let reward: MockERC20[];

    //// CUSTOM

    /// VARS
    const tetrasLockerId: number = 6;
    let snapshotId: number = 0;

    before(async () => {
        //////////////////// PRESET

        /// NETWORK
        await helpers.pinBlock(pinBlockNumber, url);

        /// OLYMPUS

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        extender = (await ethers.getContractAt(
            "TreasuryExtender",
            olympus.treasury
        )) as TreasuryExtender;

        /// ALLOCATOR

        factory = (await ethers.getContractFactory(ALLOCATORN)) as FACTORYT;

        factory = factory.connect(guardian);

        /// ACCOUNTS + CONNECTIONS

        owner = (await ethers.getSigners())[0];

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        extender = extender.connect(guardian);
        treasury = treasury.connect(governor);

        /// INTERACTIONS (THIS WILL BE REMOVED ONCE EXTENDER IS ENABLED BY TREASURY)

        treasury.enable(3, extender.address, helpers.constants.addressZero);
        treasury.enable(0, extender.address, helpers.constants.addressZero);

        //////////////////// CUSTOM

        underlying = await helpers.getCoins([coins.dai, coins.lusd, coins.frax, coins.weth]);
    });

    /// TESTS
    // If a test is preset then don't change the logic or only add to the logic, otherwise
    // fill out the logic for the test. All fields are obligatory for safety purposes.
    // PRESET and CUSTOM will be tagged.

    describe("initialization procedure", () => {
        beforeEach(async () => {
            snapshotId = await helpers.snapshot();
        });

        it("passing: should initialize all values properly", async () => {});

        afterEach(async () => {
            await helpers.revert(snapshotId);
        });
    });

    // Now define a basic version so it can be repeatedly called.

    async function initialize(): Promise<void> {}

    // Now start all other tests.

    context("with initialization", () => {
        ///// TEST ISOLATION /////
        beforeEach(async () => {
            //// PRESET
            snapshotId = await helpers.snapshot();

            //// CUSTOM

            //// PRESET
            await initialize();

            //// CUSTOM
        });

        afterEach(async () => {
            //// CUSTOM

            //// PRESET
            await helpers.revert(snapshotId);
        });

        describe("utility + rewards", () => {
            beforeEach(async () => {
                //// CUSTOM
            });

            for (let i = 0; i < utility.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of utility token under index ${i}`, async () => {});

                it(`passing: extender should be able to withdraw some of utility token under index ${i}`, async () => {});

                it(`passing: extender should be able to withdraw all of utility token under index ${i}`, async () => {});
            }

            for (let i = 0; i < rewards.length; i++) {
                it(`revert: a foreign address should not be able to withdraw some of reward token under index ${i}`, async () => {});

                it(`passing: extender should be able to withdraw some of reward token under index ${i}`, async () => {});

                it(`passing: extender should be able to withdraw all of reward token under index ${i}`, async () => {});
            }
        });

        describe("update()", () => {
            beforeEach(async () => {
                //// CUSTOM
            });
        });

        describe("deallocate()", () => {
            beforeEach(async () => {
                //// CUSTOM
            });

            for (let i = 0; i < underlying.length; i++) {
                it(`passing: should be able to deallocate some of token under index ${i}`, async () => {});
            }

            context("with deallocated tokens", () => {
                beforeEach(async () => {});

                for (let i = 0; i < underlying.length; i++) {
                    it(`revert: a foreign address should not be able to withdraw some of token under index ${i}`, async () => {});

                    it(`passing: should be able to return some of token under index ${i} to treasury`, async () => {});

                    it(`passing: should be able to return all of token under index ${i} to treasury`, async () => {});
                }
            });
        });

        describe("prepareMigration()", () => {
            beforeEach(async () => {
                //// CUSTOM
            });
        });

        describe("migrate()", () => {
            beforeEach(async () => {
                //// CUSTOM
            });
        });
    });
});
