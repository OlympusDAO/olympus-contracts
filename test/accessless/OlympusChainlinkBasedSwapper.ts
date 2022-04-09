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
    });

    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    it("should have correct params", async () => {
        console.log(await swapper.registry());
        console.log(await swapper.v3SwapRouter());
    });

    it.only("Should be able to swap treasury CRV to CVX via exact input", async () => {
        let dai = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.dai
            )
        ).connect(treasury);
        let cvx = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.cvx
            )
        ).connect(treasury);

        let rbal = (await dai.balanceOf(treasury.address)).div(100);
        let per3: BigNumber = bne(10, 16).mul(9).add(bne(10, 15).mul(7));

        await dai.approve(swapper.address, rbal);

        let input1: V3Params = {
            fees: [500, 10000],
            path: [
                helpers.checksum(coins.dai),
                helpers.checksum(coins.weth),
                helpers.checksum(coins.cvx),
            ],
            denomination: helpers.constants.addressZero,
            recipient: treasury.address,
            deadline: bnn(0),
            amount: rbal,
            slippage: per3,
        };

        console.log(input1);

        await swapper.v3ExactInput(input1);

        expect(await dai.balanceOf(treasury.address)).to.equal(0);

        console.log(
            `Received ${(await cvx.balanceOf(treasury.address)).div(bne(10, 17)).toNumber()} CVX`
        );
    });

    it("Should be able to swap treasury CRV to CVX via exact input", async () => {
        let crv = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.crv
            )
        ).connect(treasury);
        let cvx = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.cvx
            )
        ).connect(treasury);

        let rbal = (await crv.balanceOf(treasury.address)).div(3);
        let per3: BigNumber = bne(10, 16).mul(9).add(bne(10, 15).mul(7));

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

        console.log(input1);

        await swapper.v3ExactInput(input1);

        expect(await crv.balanceOf(treasury.address)).to.equal(0);

        console.log(
            `Received ${(await cvx.balanceOf(treasury.address)).div(bne(10, 17)).toNumber()} CVX`
        );
    });

    it("Should be able to swap treasury CRV to CVX via exact output", async () => {
        let crv = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.crv
            )
        ).connect(treasury);
        let cvx = (
            await helpers.summon<ERC20>(
                "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
                coins.cvx
            )
        ).connect(treasury);

        let rbal = await crv.balanceOf(treasury.address);
        let per3: BigNumber = bne(10, 16).mul(9).add(bne(10, 15).mul(7));

        await crv.approve(swapper.address, rbal);

        let input1: V3Params = {
            fees: [10000, 10000],
            path: [coins.crv, coins.weth, coins.cvx],
            denomination: helpers.constants.addressZero,
            recipient: treasury.address,
            deadline: bnn(0),
            amount: rbal,
            slippage: per3,
        };

        await swapper.v3ExactOutput(input1);

        expect(await crv.balanceOf(treasury.address)).to.equal(0);

        console.log(
            `Received ${(await cvx.balanceOf(treasury.address)).div(bne(10, 17)).toNumber()} CVX`
        );
    });
});
