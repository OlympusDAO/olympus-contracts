// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20.sol";

interface IProMarketCreator {
    // Info about each type of market
    struct Market {
        address creator; // market creator. sends base tokens, receives quote tokens
        IERC20 baseToken; // token to pay depositors with
        IERC20 quoteToken; // token to accept as payment
        bool call; // perform custom call for payout
        bool capacityInQuote; // capacity limit is in payment token (true) or in OHM (false, default)
        uint256 capacity; // capacity remaining
        uint256 totalDebt; // total base token debt from market
        uint256 minPrice; // minimum price (debt will stop decaying to maintain this)
        uint256 maxPayout; // max base tokens out in one order
        uint256 sold; // base tokens out
        uint256 purchased; // quote tokens in
    }

    // Info for creating new markets
    struct Terms {
        uint256 controlVariable; // scaling variable for price
        uint256 maxDebt; // max base token debt accrued
        bool fixedTerm; // fixed term or fixed expiration
        uint48 vesting; // length of time from deposit to maturity if fixed-term
        uint48 conclusion; // timestamp when market no longer offered (doubles as time when market matures if fixed-expiry)
    }

    // Additional info about market.
    struct Metadata {
        uint48 lastTune; // last timestamp when control variable was tuned
        uint48 lastDecay; // last timestamp when market was created and debt was decayed
        uint48 length; // time from creation to conclusion. used as speed to decay debt.
        uint48 depositInterval; // target frequency of deposits
        uint48 tuneInterval; // frequency of tuning
        uint8 baseDecimals; // decimals of base token
        uint8 quoteDecimals; // decimals of quote token
    }

    // Control variable adjustment data
    struct Adjustment {
        uint128 change;
        uint48 lastAdjustment;
        uint48 timeToAdjusted;
        bool active;
    }

    function create(
        IERC20[2] memory _tokens, // [base token, quote token]
        uint256[4] memory _market, // [capacity, initial price, minimum price, debt buffer]
        bool[2] memory _booleans, // [capacity in quote, fixed term]
        uint256[2] memory _terms, // [vesting, conclusion]
        uint32[2] memory _intervals // [deposit interval, tune interval]
    ) external returns (uint256 id_);

    function close(uint256 _id) external;
}
