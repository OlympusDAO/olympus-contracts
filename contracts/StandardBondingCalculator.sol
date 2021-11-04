// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;


//import "./libraries/FixedPoint.sol";
import "./libraries/Math.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IBondingCalculator.sol";
import "./interfaces/IUniswapV2ERC20.sol";
import "./interfaces/IUniswapV2Pair.sol";

contract OlympusBondingCalculator is IBondingCalculator {
    IERC20 immutable OHM;

    constructor( address _OHM ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
    }

    function getKValue( address _pair ) public view override returns ( uint256 ) {
        uint256 token0 = IERC20( IUniswapV2Pair( _pair ).token0() ).decimals();
        uint256 token1 = IERC20( IUniswapV2Pair( _pair ).token1() ).decimals();
        uint256 decimals = ( token0 + token1 ) - ( IERC20( _pair ).decimals() );

        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair( _pair ).getReserves();
        return ( reserve0 * reserve1 ) / ( 10 ** decimals );
    }

    function getTotalValue( address _pair ) public view override returns ( uint256 ) {
        return Math.sqrt(getKValue( _pair )) * 2;
    }

    function valuation( address _pair, uint256 _amount ) external view override returns ( uint256 ) {
        uint256 totalValue = getTotalValue( _pair );
        uint256 shares = _amount / IUniswapV2Pair( _pair ).totalSupply();

        return totalValue * shares / 1e18;
    }

    function markdown( address _pair ) external view override returns ( uint256 ) {
        ( uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair( _pair ).getReserves();
        uint256 reserve;
        if ( IUniswapV2Pair( _pair ).token0() == address( OHM ) ) {
            reserve = reserve1;
        } else {
            reserve = reserve0;
        }
        return reserve * 2 * 10 ** OHM.decimals()  /  getTotalValue( _pair );
    }
}
