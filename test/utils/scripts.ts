import { ethers, network } from "hardhat";
import { BigNumber, BaseContract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20 } from "../../types";

export async function impersonate(address: string): Promise<SignerWithAddress> {
    await network.provider.send("hardhat_impersonateAccount", [address]);
    return await ethers.getSigner(address);
}

export async function snapshot(): Promise<number> {
    return await network.provider.send("evm_snapshot", []);
}

export async function revert(moment: number): Promise<void> {
    await network.provider.send("evm_revert", [moment]);
}

export async function getCoin(address: string): Promise<MockERC20> {
    return (await ethers.getContractAt("MockERC20", address)) as MockERC20;
}

export async function getCoins(addresses: string[]): Promise<MockERC20[]> {
    const result: MockERC20[] = [];

    for (const address of addresses) {
        result.push(await getCoin(address));
    }

    return result;
}

export function bnn(num: number): BigNumber {
    return BigNumber.from(num);
}

export function bne(base: number, expo: number): BigNumber {
    let bn: BigNumber = bnn(base);
    for (expo; expo > 0; expo--) bn = bn.mul(base);
    return bn;
}

export async function pinBlock(bnum: number, url: string): Promise<void> {
    await network.provider.send("hardhat_reset", [
        { forking: { jsonRpcUrl: url, blockNumber: bnum } },
    ]);
}

export async function setStorage(
    address: string,
    slot: BigNumber,
    value: BigNumber
): Promise<void> {
    await network.provider.send("hardhat_setStorageAt", [
        address,
        "0x" + slot._hex.slice(2).replace(/^0+/, ""),
        "0x" + value._hex.slice(2).padStart(64, "0"),
    ]);
}

export async function addEth(address: string, value: BigNumber): Promise<void> {
    await network.provider.send("hardhat_setBalance", [address, value._hex]);
}

export const addressZero = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
