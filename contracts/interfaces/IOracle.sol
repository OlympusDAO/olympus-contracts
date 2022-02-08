// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface IOracle {
    function getPrice(address _pool) external returns (uint256);
}
