// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../libraries/SafeMath.sol";
import "../libraries/FixedPoint.sol";
import "../libraries/Address.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/IBondingCalculator.sol";
import "../interfaces/IUniswapV2Pair.sol";

contract TokenWethCalculator is IBondingCalculator {

    using FixedPoint for *;
    using SafeMath for uint256;

    IERC20 public token;  // Ensure this is public to be quried
    IERC20 internal immutable WETH;
    uint256 public immutable percent;

    constructor(address _token, address _WETH, uint256 _percent) {
        require(_token != address(0), "Zero address: _token");
        require(_WETH != address(0), "Zero address: _WETH");

        token = IERC20(_token);
        WETH = IERC20(_WETH);

        percent = _percent;
    }

    function valuation(address _pair, uint256 amount_) external view override returns (uint256 _value) {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(_pair).getReserves();

        uint256 reserve;

        if (IUniswapV2Pair(_pair).token0() == address(token)) {
            require(IUniswapV2Pair(_pair).token1() == address(WETH), "Invalid pair");
            reserve = reserve1;
        } else if (IUniswapV2Pair(_pair).token1() == address(token)) {
            require(IUniswapV2Pair(_pair).token0() == address(WETH), "Invalid pair");
            reserve = reserve0;
        } else {
            revert("Invalid pair");
        }

        // Always dealing with SLP (18 decimals)
        uint256 totalValue = reserve.mul(2).mul(percent).div(1e5);
        uint256 totalSupply = IUniswapV2Pair(_pair).totalSupply();
        uint256 share = amount_.mul(1e18).div(totalSupply);
        _value = totalValue.mul(share).div(1e18);
    }

}
