import { ethers, network } from "hardhat";
import { BigNumber, BaseContract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20 } from "../../types";

// CONSTANTS

const addressZero = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

const uint256Max = bne(2, 255).sub(1);

const constants = { addressZero, uint256Max };

// FUNCTIONS

/// utils for helpers

function trim(slot: BigNumber): string {
    return slot.eq(0) ? "0x0" : "0x" + slot._hex.slice(2).replace(/^0+/, "");
}

function strim(addr: string): string {
    return "0x" + addr.slice(2).replace(/^0+/, "");
}

function checksum(address: string): string {
    return ethers.utils.getAddress(address);
}

function addressify(bytes32: string): string {
    return checksum("0x" + bytes32.slice(26));
}

function isBigNumber(type: any): type is BigNumber {
    return typeof type.from == "undefined" ? false : type.from(5) instanceof BigNumber;
}

/// helpers

//// numbers

function bnn(num: number): BigNumber {
    return BigNumber.from(num);
}

function bne(base: number, expo: number): BigNumber {
    let bn: BigNumber = bnn(base);
    for (expo; expo > 0; expo--) bn = bn.mul(base);
    return bn;
}

//// accounts + contracts

async function impersonate(address: string): Promise<SignerWithAddress> {
    await network.provider.send("hardhat_impersonateAccount", [address]);
    return await ethers.getSigner(address);
}

async function getCoin(address: string): Promise<ERC20> {
    return (await ethers.getContractAt("contracts/types/ERC20.sol:ERC20", address)) as ERC20;
}

async function getCoins(addresses: string[]): Promise<ERC20[]> {
    const result: ERC20[] = [];

    for (const address of addresses) {
        result.push(await getCoin(address));
    }

    return result;
}

//// storage modding

async function setStorage(address: string, slot: BigNumber, value: BigNumber): Promise<void> {
    await network.provider.send("hardhat_setStorageAt", [
        address,
        trim(slot),
        "0x" + value._hex.slice(2).padStart(64, "0"),
    ]);
}

async function sload(address: string, slot: BigNumber, type: any): Promise<string | BigNumber> {
    const result: string = await network.provider.send("eth_getStorageAt", [
        address,
        trim(slot),
        "latest",
    ]);
    return isBigNumber(type) ? BigNumber.from(result) : result;
}

async function addEth(address: string, value: BigNumber): Promise<void> {
    await network.provider.send("hardhat_setBalance", [address, value._hex]);
}

//// timestamps + blocks

async function snapshot(): Promise<number> {
    return await network.provider.send("evm_snapshot", []);
}

async function revert(moment: number): Promise<void> {
    await network.provider.send("evm_revert", [moment]);
}

async function pinBlock(bnum: number, url: string): Promise<void> {
    await network.provider.send("hardhat_reset", [
        { forking: { jsonRpcUrl: url, blockNumber: bnum } },
    ]);
}

async function tmine(elapsed: number): Promise<void> {
    await network.provider.send("evm_increaseTime", [elapsed]);
    await network.provider.send("evm_mine");
}

// EXPORT

export const helpers = {
    trim,
    strim,
    checksum,
    addressify,
    bnn,
    bne,
    impersonate,
    getCoin,
    getCoins,
    setStorage,
    sload,
    addEth,
    snapshot,
    revert,
    pinBlock,
    tmine,
    constants,
};
