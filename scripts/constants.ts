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
    DAI: "DAI",
    lusdAllocator: "LUSDAllocator",
};

// Constructor Arguments
export const TREASURY_TIMELOCK = 0;

// Constants
export const LARGE_APPROVAL = "100000000000000000000000000000000";
export const EPOCH_LENGTH_IN_BLOCKS = "1000";
export const FIRST_EPOCH_NUMBER = "767";
export const FIRST_EPOCH_TIME = "1639430907";
export const INITIAL_REWARD_RATE = "4000";
export const INITIAL_INDEX = "45000000000";
export const INITIAL_MINT = "60000" + "0".repeat(18); // 60K deposit.
export const BOUNTY_AMOUNT = "100000000";
export const INITIAL_MINT_PROFIT = "1000000000000";
