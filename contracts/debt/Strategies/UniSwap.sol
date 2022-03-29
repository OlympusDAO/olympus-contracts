// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IUniswapV2Router.sol";

contract UniSwapStrategy {
    IUniswapV2Router router;
    address incurDebtAddress;

    constructor(address _router, address _incurDebtAddress) {
        router = IUniswapV2Router(_router);
        incurDebtAddress = _incurDebtAddress;
    }

    function addLiquidity(bytes memory _data) external returns (uint256 liquidity) {
        (
            address tokenA,
            address tokenB,
            uint256 amountADesired,
            uint256 amountBDesired,
            uint256 amountAMin,
            uint256 amountBMin,
            address to,
            uint256 deadline,
            uint256 slippage
        ) = abi.decode(_data, (address, address, uint256, uint256, uint256, uint256, address, uint256, uint256));

        (, , liquidity) = router.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            (amountAMin * slippage) / 1000,
            (amountBMin * slippage) / 1000,
            to,
            deadline
        );
    }

    function removeLiquidity(bytes memory _data) external {
        (
            address tokenA,
            address tokenB,
            uint256 liquidity,
            uint256 amountAMin,
            uint256 amountBMin,
            address to,
            uint256 deadline,
            uint256 slippage
        ) = abi.decode(_data, (address, address, uint256, uint256, uint256, address, uint256, uint256));

        require(to == incurDebtAddress);

        router.removeLiquidity(
            tokenA,
            tokenB,
            liquidity,
            (amountAMin * slippage) / 1000,
            (amountBMin * slippage) / 1000,
            to,
            deadline
        );
    }
}
