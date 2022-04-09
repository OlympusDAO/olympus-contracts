// libraries, functionality...
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

/// TYPES
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20 } from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { protocols } from "../utils/protocols";

const bne = helpers.bne;
const bnn = helpers.bnn;

import { OlympusChainlinkBasedSwapper } from "../../types";

const CN: string = "OlympusChainlinkBasedSwapper";
const NAME20: string = "types/ERC20.sol:ERC20";
type CT = OlympusChainlinkBasedSwapper;

interface V3Params {
    fees: number[];
    path: string[];
    denomination: string;
    recipient: string;
    deadline: BigNumber;
    amount: BigNumber;
    slippage: BigNumber;
}

interface V2Params {
    router: string;
    path: string[];
    denomination: string;
    recipient: string;
    deadline: BigNumber;
    amount: BigNumber;
    slippage: BigNumber;
}

describe(CN, () => {
    let first: SignerWithAddress;
    let url: string = config.networks.hardhat.forking!.url;
    let snapshotId: number = 0;

    let treasury: SignerWithAddress;
    const pinBlockNumber: number = 14547352;

    let swapper: CT;

    let cvx: ERC20;
    let crv: ERC20;
    let weth: ERC20;
    let usdt: ERC20;

    before(async () => {
        await helpers.pinBlock(pinBlockNumber, url);

        treasury = await helpers.impersonate(olympus.treasury);

        first = (await ethers.getSigners())[0];

        swapper = await helpers.spawn<CT>(
            CN,
            protocols.chainlink.feedRegistry,
            protocols.uniswap.v3SwapRouter
        );

        swapper = swapper.connect(treasury);

        await helpers.addEth(treasury.address, bne(10, 18));

        crv = (await helpers.getCoin(coins.crv)).connect(treasury);

        cvx = (await helpers.getCoin(coins.cvx)).connect(treasury);

        weth = (await helpers.getCoin(coins.weth)).connect(treasury);

        usdt = (await helpers.getCoin(coins.usdt)).connect(treasury);
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    it("Should be able to swap treasury CRV to CVX via exact input", async () => {
        let rbal = await crv.balanceOf(treasury.address);
        let per3: BigNumber = bne(10, 16).mul(9).add(bne(10, 15).mul(1));

        await crv.approve(swapper.address, rbal);

        let input1: V3Params = {
            fees: [10000, 10000],
            path: [
                helpers.checksum(coins.crv),
                helpers.checksum(coins.weth),
                helpers.checksum(coins.cvx),
            ],
            denomination: helpers.constants.addressZero,
            recipient: treasury.address,
            deadline: bnn(0),
            amount: rbal,
            slippage: per3,
        };

        await swapper.v3ExactInput(input1);

        expect(await crv.balanceOf(treasury.address)).to.equal(0);

        console.log(
            `Paid ${rbal
                .sub(await crv.balanceOf(treasury.address))
                .div(bne(10, 17))
                .toNumber()} CRV`
        );

        console.log(
            `Received ${(await cvx.balanceOf(treasury.address)).div(bne(10, 17)).toNumber()} CVX`
        );
    });

    it("Should be able to swap treasury CRV to CVX via exact output", async () => {
        let rbal = await crv.balanceOf(treasury.address);
        let per3: BigNumber = bne(10, 16).mul(9).add(bne(10, 15).mul(1));

        await crv.approve(swapper.address, rbal);

        let input1: V3Params = {
            fees: [10000, 10000],
            path: [coins.cvx, coins.weth, coins.crv],
            denomination: helpers.constants.addressZero,
            recipient: treasury.address,
            deadline: bnn(0),
            amount: rbal,
            slippage: per3,
        };

        await swapper.v3ExactOutput(input1);

        console.log(
            `Paid ${rbal
                .sub(await crv.balanceOf(treasury.address))
                .div(bne(10, 17))
                .toNumber()} CRV`
        );

        console.log(
            `Received ${(await cvx.balanceOf(treasury.address)).div(bne(10, 17)).toNumber()} CVX`
        );
    });

    it("Should be able to swap treasury WETH to USDT via v2Swap", async () => {
        let rbal = await weth.balanceOf(treasury.address);
        // bad liquidity here
        let per3: BigNumber = bne(10, 16).mul(3).add(bne(10, 15).mul(7));

        await weth.approve(swapper.address, rbal);

        let input2: V2Params = {
            router: protocols.uniswap.v2SwapRouter,
            path: [coins.weth, coins.dai, coins.usdt],
            denomination: helpers.constants.addressZero,
            recipient: treasury.address,
            deadline: bnn(0),
            amount: rbal,
            slippage: bnn(0),
        };

        await swapper.v2Swap(input2);

        console.log(
            `Paid ${rbal
                .sub(await weth.balanceOf(treasury.address))
                .div(bne(10, 17))
                .toNumber()} WETH`
        );

        console.log(
            `Received ${(await usdt.balanceOf(treasury.address)).div(bne(10, 5)).toNumber()} USDT`
        );

        expect(await weth.balanceOf(treasury.address)).to.equal(0);
    });
});
