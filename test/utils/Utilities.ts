import { BigNumber } from "ethers";
import { ethers } from "hardhat";

// 18 decimals conversion
export const fromDecimals = (bigNumber: BigNumber): number => {
    return Number(ethers.utils.formatEther(bigNumber));
};

// 18 decimals conversion
export const toDecimals = (amount: number): BigNumber => {
    return ethers.utils.parseEther(amount.toString());
};

// 9 decimals conversion
export const fromOhm = (bigNumber: BigNumber): number => {
    return Number(ethers.utils.formatUnits(bigNumber, 9));
};

// 9 decimals conversion
export const toOhm = (amount: number): BigNumber => {
    return ethers.utils.parseUnits(amount.toString(), 9);
};

// 8 hours
export const advanceEpoch = async (): Promise<void> => {
    await advanceTime(8 * 60 * 60);
};

export const advanceTime = async (seconds: number): Promise<void> => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
};
