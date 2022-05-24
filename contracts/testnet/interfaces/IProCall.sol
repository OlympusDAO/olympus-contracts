// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

interface IProCall {
    function call(
        uint256 id,
        uint256 amountIn,
        uint256 amountOut
    ) external;
}
