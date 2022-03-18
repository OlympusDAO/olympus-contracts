/// LIBS
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

/// TYPES
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

/// DATA
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { protocols } from "../utils/protocols";
import { allocators } from "../utils/allocators";

import { LUSDAllocatorV2, TreasuryExtender, OlympusTreasury } from "../../types";

const bne = helpers.bne;
const bnn = helpers.bnn;

describe("test recent investment process", () => {
    let multisig: SignerWithAddress;
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let allocator: LUSDAllocatorV2;

    before(async () => {
        multisig = await helpers.impersonate(olympus.multisig);
        extender = (await ethers.getContractAt(
            "TreasuryExtender",
            olympus.extender
        )) as TreasuryExtender;
        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;
        allocator = (await ethers.getContractAt(
            "LUSDAllocatorV2",
            allocators.LUSDAllocatorV2
        )) as LUSDAllocatorV2;

        extender = extender.connect(multisig);
        treasury = treasury.connect(multisig);
        allocator = allocator.connect(multisig);
    });

    it("should be able to enable treasury", async () => {
        await treasury.enable(0, extender.address, helpers.constants.addressZero);
        await treasury.enable(3, extender.address, helpers.constants.addressZero);
    });

    it("should be to register deposit", async () => {
        await extender.registerDeposit(allocator.address);
        expect(await extender.getAllocatorByID(1)).to.equal(allocator.address);
    });

    it("should be able to set params", async () => {
        await allocator.setEthToLUSDRatio(1000000);
        await allocator.setMinETHLUSDRate(2670);
    });

    it("limits", async () => {
        await extender.setAllocatorLimits(1, {
            allocated: bne(10, 20).mul(5),
            loss: bne(10, 18),
        });
        const limits = await extender.getAllocatorLimits(1);
        expect(limits[0]).to.equal(bne(10, 20).mul(5));
        expect(limits[1]).to.equal(bne(10, 18));
    });

    it("activate", async () => {
        await allocator.activate();
    });

    it("request funds", async () => {
        await expect(() => extender.requestFundsFromTreasury(1, bne(10, 20))).to.changeTokenBalance(
            await helpers.getCoin(coins.lusd),
            allocator,
            bne(10, 20)
        );
    });

    it("update", async () => {
        await expect(() => allocator.update(1)).to.changeTokenBalance(
            await helpers.getCoin(coins.lusd),
            allocator,
            bnn(0).sub(bne(10, 20))
        );
    });
});
