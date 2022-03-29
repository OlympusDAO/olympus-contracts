pragma solidity ^0.8.10;

interface IStrategy {
    function addLiquidity(bytes memory data) external returns (uint256 liquidity);

    function removeLiquidity(bytes memory data) external returns (uint256 amountA, uint256 amountB);
}
