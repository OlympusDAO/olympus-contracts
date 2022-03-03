import { ethers, waffle, network, config } from "hardhat";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber, BaseContract, ContractFactory, Contract} from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract, MockContract, MockContractFactory } from "@defi-wonderland/smock";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    OlympusAuthority,
    MockERC20,
    FxsAllocatorV2,
    FxsAllocatorV2__factory,
} from "../../types";

import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import {
    impersonate,
    snapshot,
    revert,
    getCoin,
    bne,
    bnn,
    pinBlock,
    addressZero,
    setStorage,
    addEth,
    tmine,
} from "../utils/scripts";
import { ExecFileException } from "child_process";
import { Sign } from "crypto";

describe("FxsAllocatorV2", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let wlOwner: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: FxsAllocatorV2;
    let factory: FxsAllocatorV2__factory;

    // tokens
    let fxs: MockERC20;
    let vefxs: MockERC20;
    let tokens: MockERC20[];
    let utilTokens: MockERC20[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;
    let localSnapId: number = 0;

    before(async () => {
        await pinBlock(14314860, url);

        fxs = await getCoin(coins.fxs);
        tokens = [fxs];

        vefxs = await getCoin(coins.vefxs);
        utilTokens = [vefxs];

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        const extenderFactory: TreasuryExtender__factory = (await ethers.getContractFactory(
            "TreasuryExtender"
        )) as TreasuryExtender__factory;

        extender = await extenderFactory.deploy(treasury.address, authority.address);

        owner = (await ethers.getSigners())[0];

        guardian = await impersonate(await authority.guardian());
        governor = await impersonate(await authority.governor());
        wlOwner = await impersonate("0xb1748c79709f4ba2dd82834b8c82d4a505003f27");

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, addressZero);
        treasury.enable(0, extender.address, addressZero);

        factory = (await ethers.getContractFactory("FxsAllocatorV2")) as FxsAllocatorV2__factory;

        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [fxs.address],
                extender: extender.address,
            },
            olympus.treasury,
            vefxs.address,
            "0x62C4cf364078C98fA08AfDB4D3d8D87e780Ebd45",
        );
    });

    beforeEach(async () => {
        snapshotId = await snapshot();
    });

    afterEach(async () => {
        await revert(snapshotId);
    });

    describe("initialization", () => {
        it("should deploy single token allocator with correct info", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0x62C4cf364078C98fA08AfDB4D3d8D87e780Ebd45",
            );
            
            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.veFXS()).to.equal("0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0");
            expect(await allocator.veFXSYieldDistributorV4()).to.equal("0x62C4cf364078C98fA08AfDB4D3d8D87e780Ebd45");

            expect(await allocator.lockEnd()).to.equal("0");
        });

        it("should registerDeposit()", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0x62C4cf364078C98fA08AfDB4D3d8D87e780Ebd45",
            );

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("updates correctly", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0x62C4cf364078C98fA08AfDB4D3d8D87e780Ebd45",
            );

            let walletWhitelist = (await ethers.getContractAt(
                [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"ApproveWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerNominated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"RevokeWallet","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"applySetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"approveWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"check","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_checker","type":"address"}],"name":"commitSetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"future_checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"nominateNewOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nominatedOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"revokeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}],
                "0x53c13BA8834a1567474b19822aAD85c6F90D9f9F",
            ));

            walletWhitelist = walletWhitelist.connect(wlOwner);

            walletWhitelist.approveWallet(allocator.address);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 20);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                fxs,
                allocator,
                amount
            );
        });

        it("should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.reverted;
        });

        it("should update", async () => {
            const amount: BigNumber = bne(10, 20);

            expect(await utilTokens[0].balanceOf(allocator.address)).to.be.equal("0");
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount),
            );

            expect(await utilTokens[0].balanceOf(allocator.address)).to.be.gt("0");
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
        });
    });
});