// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function addLiquidity(
        address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB, uint liquidity);
        
    function removeLiquidity(
        address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB);
}