// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface ICauldron {
    function liquidate(
        address[] calldata users,
        uint256[] calldata maxBorrowParts,
        address to,
        ISwapper swapper
    ) external;
}