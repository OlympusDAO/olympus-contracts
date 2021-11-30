// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface ICrvDepositor {
    function deposit(uint256, bool) external;
}