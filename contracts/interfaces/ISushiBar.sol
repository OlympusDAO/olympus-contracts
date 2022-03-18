// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface ISushiBar {
    function enter(uint256 _amount) external;

    function leave(uint256 _share) external;
}