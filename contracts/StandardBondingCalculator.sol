// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


import "./libraries/SafeMath.sol";
import "./libraries/FixedPoint.sol";
import "./libraries/Address.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20Metadata.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IBondingCalculator.sol";
import "./interfaces/IUniswapV2ERC20.sol";
import "./interfaces/IUniswapV2Pair.sol";


contract OlympusBondingCalculator is IBondingCalculator {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    IERC20 immutable OHM;

    constructor( address _OHM ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
    }

    function getKValue( address _pair ) public view returns( uint k_ ) {
        uint token0 = IERC20Metadata( IUniswapV2Pair( _pair ).token0() ).decimals();
        uint token1 = IERC20Metadata( IUniswapV2Pair( _pair ).token1() ).decimals();
        uint decimals = token0.add( token1 ).sub( IERC20Metadata( _pair ).decimals() );

        (uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();
        k_ = reserve0.mul(reserve1).div( 10 ** decimals );
    }

    function getTotalValue( address _pair ) public view returns ( uint _value ) {
        _value = getKValue( _pair ).sqrrt().mul(2);
    }

    function valuation( address _pair, uint amount_ ) external view override returns ( uint _value ) {
        uint totalValue = getTotalValue( _pair );
        uint totalSupply = IUniswapV2Pair( _pair ).totalSupply();

        _value = totalValue.mul( FixedPoint.fraction( amount_, totalSupply ).decode112with18() ).div( 1e18 );
    }

    function markdown( address _pair ) external view override returns ( uint ) {
        ( uint reserve0, uint reserve1, ) = IUniswapV2Pair( _pair ).getReserves();

        uint reserve;
        if ( IUniswapV2Pair( _pair ).token0() == address( OHM ) ) {
            reserve = reserve1;
        } else {
            reserve = reserve0;
        }
        return reserve.mul( 2 * ( 10 ** IERC20Metadata(address(OHM)).decimals() ) ).div( getTotalValue( _pair ) );
    }
}
