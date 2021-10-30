export const enum Contracts {
    OHM = "OlympusERC20Token",
    DAI = "DAI",
    FRAX = "FRAX",
    TREASURY = "OlympusTreasury",
    OHM_BONDING_CALCULATOR = "OlympusBondingCalculator",
    DISTRIBUTOR = "Distributor",
    SOHM = "sOlympus",
    OHM_STAKING = "OlympusStaking",
    BOND_DEPOSITORY = "OlympusBondDepository",
}

// Initial mint for Frax and DAI (10,000,000)
export const initialMint = "10000000000000000000000000";

// Initial staking index
export const initialIndex = "7675210820";

// First block epoch occurs
export const firstEpochBlock = "8961000";

// What epoch will be first epoch
export const firstEpochNumber = "338";

// How many blocks are in each epoch
export const epochLengthInBlocks = "2200";

// Initial reward rate for epoch
export const initialRewardRate = "3000";

// Ethereum 0 address, used when toggling changes in treasury
export const zeroAddress = "0x0000000000000000000000000000000000000000";

// Large number for approval for Frax and DAI
export const largeApproval = "100000000000000000000000000000000";

// DAI bond BCV
export const daiBondBCV = "369";

// Frax bond BCV
export const fraxBondBCV = "690";

// Bond vesting length in blocks. 33110 ~ 5 days
export const bondVestingLength = "33110";

// Min bond price
export const minBondPrice = "50000";

// Max bond payout
export const maxBondPayout = "50";

// DAO fee for bond
export const bondFee = "10000";

// Max debt bond can take on
export const maxBondDebt = "1000000000000000";

// Initial Bond debt
export const intialBondDebt = "0";
