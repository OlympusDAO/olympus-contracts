// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {AggregatorV3Interface} from "../interfaces/IAggregatorV3.sol";

/**
    @title Oracle wrapper
    @notice Oracle wrapper that uses two oracles to return price in a differen denomination
 */
contract PriceConverterOracleWrapper is AggregatorV3Interface {
    AggregatorV3Interface public immutable basePriceOracle;
    AggregatorV3Interface public immutable quotePriceOracle;
    uint8 public immutable override decimals;
    string public constant override description =
        "Oracle wrapper that uses two oracles to return price in a different denomination";
    uint256 public constant override version = 0;

    constructor(
        address _basePriceOracleAddress,
        address _quotePriceOracleAddress,
        uint8 decimals_
    ) {
        basePriceOracle = AggregatorV3Interface(_basePriceOracleAddress);
        quotePriceOracle = AggregatorV3Interface(_quotePriceOracleAddress);
        decimals = decimals_;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (, int256 basePrice, uint256 baseStartedAt, uint256 baseUpdatedAt, ) = AggregatorV3Interface(basePriceOracle)
            .latestRoundData();
        uint8 baseDecimals = AggregatorV3Interface(basePriceOracle).decimals();

        (, int256 quotePrice, uint256 quoteStartedAt, uint256 quoteUpdatedAt, ) = AggregatorV3Interface(
            quotePriceOracle
        ).latestRoundData();
        uint8 quoteDecimals = AggregatorV3Interface(quotePriceOracle).decimals();

        int256 unscaledAnswer = (basePrice * int256(10**uint256(decimals)) * int256(10**uint256(quoteDecimals))) /
            quotePrice;
        answer = _adjustDecimals(unscaledAnswer, baseDecimals);

        startedAt = baseStartedAt > quoteStartedAt ? baseStartedAt : quoteStartedAt;
        updatedAt = baseUpdatedAt > quoteUpdatedAt ? baseUpdatedAt : quoteUpdatedAt;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {}

    function _adjustDecimals(int256 _unscaledAnswer, uint8 _baseDecimals) internal pure returns (int256) {
        return _unscaledAnswer / int256(10**uint256(_baseDecimals));
    }
}
