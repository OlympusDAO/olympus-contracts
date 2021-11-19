import { DeployFunction } from "hardhat-deploy/types";
export const CONTRACTS: Record<string, string> = {
    ohm: "OlympusERC20Token",
    sOhm: "sOlympus",
    gOhm: "gOHM",
    staking: "OlympusStaking",
    distributor: "Distributor",
    treasury: "OlympusTreasury",
    bondDepo: "OlympusBondDepository",
    teller: "BondTeller",
    bondingCalculator: "OlympusBondingCalculator",
    authority: "OlympusAuthority",
    migrator: "OlympusTokenMigrator",
    FRAX: "Frax",
    DAI: "dai",
};

// Constructor Arguments
export const TREASURY_TIMELOCK = 0;

// Constants
export const LARGE_APPROVAL = "100000000000000000000000000000000";
export const EPOCH_LENGTH_IN_BLOCKS = 0;
export const FIRST_EPOCH_BLOCK = 0;
export const FIRST_EPOCH_NUMBER = 0;
export const INITIAL_REWARD_RATE = 0;
export const INITIAL_INDEX = 0;
export const INITIAL_MINT = 69;

const func: DeployFunction = async () => {};

export default func;
func.skip = async () => {
    return true;
};
