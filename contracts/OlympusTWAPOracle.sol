// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "hardhat/console.sol";

// import '../../../dependencies/holyzeppelin/contracts/math/FixedPoint.sol';
import '../../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/core/interfaces/IUniswapV2Pair.sol';
import '../../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/periphery/libraries/UniswapV2OracleLibrary.sol';

//import '../../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/core/interfaces/IUniswapV2Factory.sol';
// import '../../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/periphery/libraries/UniswapV2Library.sol';
// import '../../../dependencies/holyzeppelin/contracts/datatypes/collections/EnumerableSet.sol';
/**
 * @dev Intended to update the TWAP for a token based on accepting an update call from that token.
 *  expectation is to have this happen in the _beforeTokenTransfer function of ERC20.
 *  Provides a method for a token to register its price sourve adaptor.
 *  Provides a function for a token to register its TWAP updater. Defaults to token itself.
 *  Provides a function a tokent to set its TWAP epoch.
 *  Implements automatic closeing and opening up a TWAP epoch when epoch ends.
 *  Provides a function to report the TWAP from the last epoch when passed a token address.
 */

contract OlympusTWAPOracle {

  using FixedPoint for *;

  mapping( address => uint32 ) public uniV2CompPairAddressForLastEpochUpdateBlockTimstamp;

  struct EpochTWAP {
    uint token0LastTWAP;
    uint token1LastTWAP;
  }

  mapping( address => mapping( address => mapping( uint => uint ) ) ) public pricedTokenForPricingTokenForEpochPeriodForPrice;

  function update( address uniV2CompatPairAddressToUpdate_, uint eopchPeriodToUpdate_ ) external {

    // We must retrieve thne entire tuple as UniswapV2Pair does not expose the blockTimestamp directly.
    (uint price0Cumulative_, uint price1Cumulative_, uint32 uniV2PairLastBlockTimestamp_) =
            UniswapV2OracleLibrary.currentCumulativePrices(address(uniV2CompatPairAddressToUpdate_));

    // address token0_ = IUniswapV2Pair(uniV2CompatPairAddressToUpdate_).token0();
    // address token1_ = IUniswapV2Pair(uniV2CompatPairAddressToUpdate_).token1();

    uint32 timeElapsed_ = _calculateElapsedTimeSinceLastUpdate( uniV2PairLastBlockTimestamp_, uniV2CompPairAddressForLastEpochUpdateBlockTimstamp[uniV2CompatPairAddressToUpdate_] );

    if( timeElapsed_ >= eopchPeriodToUpdate_ ) {

      address token0_ = IUniswapV2Pair(uniV2CompatPairAddressToUpdate_).token0();
      address token1_ = IUniswapV2Pair(uniV2CompatPairAddressToUpdate_).token1();

      uint token0LastTWAP_ = pricedTokenForPricingTokenForEpochPeriodForPrice
        [token0_]
        [token1_]
        [eopchPeriodToUpdate_];

      uint token0EpochTWAP_ = _calculateTWAP( price0Cumulative_, token0LastTWAP_, timeElapsed_ );

      pricedTokenForPricingTokenForEpochPeriodForPrice
        [token0_]
        [token1_]
        [eopchPeriodToUpdate_] = token0EpochTWAP_;

      uint token1LastTWAP_ = pricedTokenForPricingTokenForEpochPeriodForPrice
        [token1_]
        [token0_]
        [eopchPeriodToUpdate_];

      uint token1EpochTWAP_ = _calculateTWAP( price1Cumulative_, token1LastTWAP_, timeElapsed_ );

      pricedTokenForPricingTokenForEpochPeriodForPrice
        [token1_]
        [token0_]
        [eopchPeriodToUpdate_] = token1EpochTWAP_;
    }

  }

  function _calculateElapsedTimeSinceLastUpdate( uint32 uniV2PairLastBlockTimestamp_, uint32 epochLastTimestamp_ ) internal returns ( uint32 ) {
    return uniV2PairLastBlockTimestamp_ - epochLastTimestamp_; // overflow is desired
  }

  function _calculateTWAP( uint currentCumulativePrice_, uint lastCumulativePrice_, uint32 timeElapsed_ ) internal returns ( uint ) {
    return FixedPoint.uq112x112( uint224( ( currentCumulativePrice_ - lastCumulativePrice_) / timeElapsed_) ).decode144();
  }

// // note this will always return 0 before update has been called successfully for the first time.
// function quote( address tokenToBuy, address tokenToSell, uint twapEpochPeriod, uint amountIn ) external view returns ( uint amountOut ) {

//   if (token == token0) {
//     amountOut = price0Average.mul(amountIn).decode144();
//   } else {
//     require(token == token1, 'ExampleOracleSimple: INVALID_TOKEN');
//     amountOut = price1Average.mul(amountIn).decode144();
//   }
// }
}
