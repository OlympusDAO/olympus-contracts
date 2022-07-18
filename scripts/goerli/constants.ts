const { ethers } = require("hardhat");

/// Establish config values

/// Zero Address
export const zeroAddress = "0x0000000000000000000000000000000000000000";

/// Approval Value
export const largeApproval = ethers.utils.parseEther("1000000000000000000000000000");

/// Initialize staking index
export const initialIndex = "7675210820";

/// What epoch will be first epoch
export const firstEpochNumber = "550";

/// First block epoch occurs
export const firstBlockNumber = "7500000";

/// How many blocks per epoch
export const epochLength = "2200";

/// Initial staking reward rate
export const initialRewardRate = "3000";

/// Initial mint for DAI (20,000,000)
export const initialMint = "20000000000000000000000000";

/// DAI bond BCV
export const daiBondBCV = "369";

/// Bond vesting length in blox (~5 days)
export const bondVestingLength = "33110";

/// Minimum bond price
export const minBondPrice = "50000";

/// Maximum bond payout
export const maxBondPayout = "50";

/// DAO fee for bond
export const bondFee = "10000";

/// Max debt bond can take on
export const maxBondDebt = "1000000000000000";

/// Initial Bond Debt
export const initialBondDebt = "0";

/// Establish external addresses
export const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
export const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
