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
    string public constant override description = "Oracle wrapper that uses two oracles to return price in a differen denomination";
    uint256 public constant override version = 0;


    constructor(address _basePriceOracleAddress, address _quotePriceOracleAddress, uint8 decimals_) {
        basePriceOracle = AggregatorV3Interface(_basePriceOracleAddress);
        quotePriceOracle = AggregatorV3Interface(_quotePriceOracleAddress);
        decimals = decimals_;
    }

    function latestRoundData() external view returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
        ( , int256 basePrice, , , ) = AggregatorV3Interface(basePriceOracle).latestRoundData();
        uint8 baseDecimals = AggregatorV3Interface(basePriceOracle).decimals();
        basePrice = scalePrice(basePrice, baseDecimals, decimals);

        ( , int256 quotePrice, , , ) = AggregatorV3Interface(quotePriceOracle).latestRoundData();
        uint8 quoteDecimals = AggregatorV3Interface(quotePriceOracle).decimals();
        quotePrice = scalePrice(quotePrice, quoteDecimals, decimals);

        answer = basePrice * int256(10 ** uint256(decimals)) / quotePrice;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
    }

    function getRoundData(uint80 _roundId) external view returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {

    }

    function scalePrice(int256 _price, uint8 _priceDecimals, uint8 _decimals)
        internal
        pure
        returns (int256)
    {
        if (_priceDecimals < _decimals) {
            return _price * int256(10 ** uint256(_decimals - _priceDecimals));
        } else if (_priceDecimals > _decimals) {
            return _price / int256(10 ** uint256(_priceDecimals - _decimals));
        }
        return _price;
    }
}